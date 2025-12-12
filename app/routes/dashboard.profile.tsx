// app/routes/dashboard.profile.tsx
// 用户个人资料页面

import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { useTranslation, useUser } from "@/lib/app-context";
import { APP_CONFIG } from "@/lib/config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth.client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserAvatarUrl } from "@/lib/utils";
import { Camera, Check, X, AlertCircle } from "lucide-react";
import { Icons } from "@/components/icons";

// Context type from layout
interface DashboardContext {
    user: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
        emailVerified?: boolean;
    };
}

interface ProfileData {
    user: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
        emailVerified: boolean;
        createdAt: string;
    };
    accounts: {
        hasPassword: boolean;
        google: boolean;
        github: boolean;
    };
}

export function meta() {
    return [
        { title: `Profile | ${APP_CONFIG.name}` },
        { name: "description", content: "Manage your profile settings" },
    ];
}

export default function ProfilePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user: contextUser } = useOutletContext<DashboardContext>();
    const { updateUser, setUser } = useUser(); // 获取全局 Context 更新函数

    // Dynamic document title based on language
    useEffect(() => {
        document.title = `${t.pageTitles.profile} | ${APP_CONFIG.name}`;
    }, [t]);

    // Profile state
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    // Basic info form
    const [name, setName] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);
    const [profileError, setProfileError] = useState("");
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarError, setAvatarError] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Password form
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // Verification
    const [sendingVerification, setSendingVerification] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);

    // Delete account
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Ref for file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Password validation (same as register page)
    const passwordValidation = useMemo(() => ({
        minLength: newPassword.length >= 8 && newPassword.length <= 20,
        hasUppercase: /[A-Z]/.test(newPassword),
        hasLowercase: /[a-z]/.test(newPassword),
        hasNumber: /[0-9]/.test(newPassword),
        passwordsMatch: newPassword === confirmNewPassword && confirmNewPassword.length > 0,
    }), [newPassword, confirmNewPassword]);

    const isPasswordValid = useMemo(() => {
        return passwordValidation.minLength &&
            passwordValidation.hasUppercase &&
            passwordValidation.hasLowercase &&
            passwordValidation.hasNumber &&
            passwordValidation.passwordsMatch;
    }, [passwordValidation]);

    // 计算当前显示的头像 URL（使用 useMemo 避免重复计算）
    // 优先级：上传的预览 > 用户自定义头像 > Dicebear 默认头像
    const currentAvatar = useMemo(() => {
        if (avatarPreview) {
            return avatarPreview;
        }
        if (contextUser) {
            return getUserAvatarUrl(contextUser);
        }
        return null; // 如果都不存在，返回 null 以显示 Fallback
    }, [avatarPreview, contextUser]);

    // Google account linking
    const [linkingGoogle, setLinkingGoogle] = useState(false);
    const [unlinkingGoogle, setUnlinkingGoogle] = useState(false);

    // Handle linking Google account
    const handleLinkGoogle = async () => {
        setLinkingGoogle(true);
        try {
            // Better-Auth's linkSocial API
            await authClient.linkSocial({
                provider: "google",
                callbackURL: "/profile"
            });
            // Will redirect to Google OAuth, then return to /profile
        } catch (error) {
            console.error('Failed to link Google:', error);
            alert(t.profile.linkFailed);
            setLinkingGoogle(false);
        }
    };

    // Handle unlinking Google account
    const handleUnlinkGoogle = async () => {
        // Check if user has password
        const hasPassword = profileData?.accounts?.hasPassword;

        if (!hasPassword) {
            alert(t.profile.setPasswordFirst);
            return;
        }

        // Confirm before unlinking
        if (!confirm(t.profile.unlinkConfirm)) {
            return;
        }

        setUnlinkingGoogle(true);
        try {
            const res = await fetch('/api/user/unlink-google', {
                method: 'POST'
            });

            if (res.ok) {
                // Refresh page to update UI
                window.location.reload();
            } else {
                const data = await res.json() as { error?: string };
                alert(data.error || t.profile.unlinkFailed);
            }
        } catch (error) {
            console.error('Failed to unlink Google:', error);
            alert(t.profile.unlinkFailed);
        } finally {
            setUnlinkingGoogle(false);
        }
    };

    // Handle setting password for Google users
    const handleSetPassword = async () => {
        setPasswordError("");
        setPasswordSuccess(false);

        // Validate passwords
        if (!newPassword || !confirmNewPassword) {
            setPasswordError(t.profile.passwordRequired);
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setPasswordError(t.errors.passwordMismatch);
            return;
        }

        setSavingPassword(true);
        try {
            const res = await fetch('/api/user/set-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: newPassword,
                    confirmPassword: confirmNewPassword
                })
            });

            const data = await res.json() as { error?: string };

            if (res.ok) {
                setPasswordSuccess(true);
                setNewPassword("");
                setConfirmNewPassword("");
                // Refresh profile data to update hasPassword status
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                setPasswordError(data.error || t.profile.setPasswordFailed);
            }
        } catch (error) {
            console.error('Failed to set password:', error);
            setPasswordError(t.profile.setPasswordFailed);
        } finally {
            setSavingPassword(false);
        }
    };

    // 压缩图片到指定尺寸/质量
    const compressImage = async (file: File, maxSize = 1024, quality = 0.7): Promise<Blob> => {
        const img = document.createElement("img");
        const objectUrl = URL.createObjectURL(file);
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = objectUrl;
        });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas not supported");

        const { width, height } = img;
        const scale = Math.min(1, maxSize / Math.max(width, height));
        const targetW = Math.round(width * scale);
        const targetH = Math.round(height * scale);
        canvas.width = targetW;
        canvas.height = targetH;
        ctx.drawImage(img, 0, 0, targetW, targetH);

        const type = file.type === "image/png" ? "image/png" : "image/jpeg";
        const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), type, quality));
        URL.revokeObjectURL(objectUrl);
        return blob;
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarError("");
        setAvatarUploading(true);

        try {
            const compressed = await compressImage(file);
            const form = new FormData();
            form.append("file", compressed, file.name);

            const res = await fetch("/api/user/avatar-upload", {
                method: "POST",
                body: form,
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({})) as { error?: string };
                setAvatarError(data.error || t.profile.updateFailed);
                return;
            }

            const data = await res.json() as { url: string };

            // 保存到用户资料
            const saveRes = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: data.url }),
            });

            if (saveRes.ok) {
                setAvatarPreview(data.url);
                updateUser({ image: data.url });
            } else {
                setAvatarError(t.profile.updateFailed);
            }
        } catch (error) {
            console.error("Avatar upload error", error);
            setAvatarError(t.profile.updateFailed);
        } finally {
            setAvatarUploading(false);
            e.target.value = ""; // reset input
        }
    };

    // Load profile data
    useEffect(() => {
        async function loadProfile() {
            try {
                const res = await fetch("/api/user/profile");
                if (res.ok) {
                    const data = await res.json() as ProfileData;
                    console.log("Profile API Response:", data); // Debug log
                    setProfileData(data);
                    setName(data.user.name);
                    setAvatarPreview(data.user.image || null);
                }
            } catch (error) {
                console.error("Failed to load profile:", error);
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, []);

    // Handle save profile
    const handleSaveProfile = async () => {
        setSavingProfile(true);
        setProfileError("");
        setProfileSaved(false);

        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });

            if (res.ok) {
                // Re-fetch profile data to get latest from database
                const profileRes = await fetch("/api/user/profile");
                if (profileRes.ok) {
                    const data = await profileRes.json() as ProfileData;
                    setProfileData(data);
                    setName(data.user.name);
                    setAvatarPreview(data.user.image || null);

                    // 更新全局 Context - 所有组件会自动更新
                    updateUser({ name: data.user.name, image: data.user.image });
                }

                setProfileSaved(true);
                setTimeout(() => setProfileSaved(false), 3000);
                // 不再需要刷新页面！
            } else {
                setProfileError(t.profile.updateFailed);
            }
        } catch {
            setProfileError(t.profile.updateFailed);
        } finally {
            setSavingProfile(false);
        }
    };

    // Handle change password
    const handleChangePassword = async () => {
        if (newPassword !== confirmNewPassword) {
            setPasswordError(t.profile.passwordMismatch);
            return;
        }

        setSavingPassword(true);
        setPasswordError("");
        setPasswordSuccess(false);

        try {
            const res = await fetch("/api/user/password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            if (res.ok) {
                setPasswordSuccess(true);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
                setTimeout(() => setPasswordSuccess(false), 3000);
            } else {
                const data = await res.json() as { error?: string };
                if (data.error?.includes("incorrect")) {
                    setPasswordError(t.profile.currentPasswordWrong);
                } else {
                    setPasswordError(t.profile.updateFailed);
                }
            }
        } catch {
            setPasswordError(t.profile.updateFailed);
        } finally {
            setSavingPassword(false);
        }
    };

    // Handle resend verification
    const handleResendVerification = async () => {
        setSendingVerification(true);
        try {
            const res = await fetch("/api/user/resend-verification", {
                method: "POST",
            });
            if (res.ok) {
                setVerificationSent(true);
            }
        } catch (error) {
            console.error("Failed to send verification:", error);
        } finally {
            setSendingVerification(false);
        }
    };

    // Handle delete account
    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            const res = await fetch("/api/user/delete", {
                method: "DELETE",
            });
            if (res.ok) {
                // 先清除客户端会话
                await authClient.signOut();

                // 清除全局状态
                setUser(null);

                // 强制刷新页面，确保状态完全清除
                window.location.href = "/";
            }
        } catch (error) {
            console.error("Failed to delete account:", error);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">{t.common.loading}</p>
            </div>
        );
    }

    const showEmailVerification = APP_CONFIG.features.emailVerification;
    const isEmailVerified = profileData?.user.emailVerified;
    const hasPassword = profileData?.accounts.hasPassword;

    return (
        <div className="space-y-6">
            {/* Page Title */}
            <div>
                <h1 className="text-2xl font-bold">{t.profile.title}</h1>
            </div>

            {/* Basic Info Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Icons.User className="h-5 w-5 text-primary" />
                        <CardTitle>{t.profile.basicInfo}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Avatar section with edit button */}
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex flex-col items-center gap-3">
                            {/* Avatar container with edit button */}
                            <div className="relative group">
                                {currentAvatar ? (
                                    <img
                                        src={currentAvatar}
                                        alt="Avatar"
                                        className="h-20 w-20 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Icons.User className="h-8 w-8" />
                                    </div>
                                )}

                                {/* Edit button - bottom right corner */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={avatarUploading}
                                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Change avatar"
                                >
                                    <Camera className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="text-sm text-muted-foreground text-center">
                                {t.profile.avatar}
                            </div>

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/avif"
                                onChange={handleAvatarChange}
                                disabled={avatarUploading}
                                className="hidden"
                            />

                            {/* Upload status */}
                            {avatarUploading && (
                                <div className="text-xs text-muted-foreground">{t.common.loading}</div>
                            )}
                            {avatarError && (
                                <div className="text-xs text-destructive flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    {avatarError}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-4">
                            {/* Nickname field with save button */}
                            <div className="space-y-2">
                                <Label htmlFor="nickname">{t.profile.nickname}</Label>
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <Input
                                        id="nickname"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder={t.auth.namePlaceholder}
                                        className="sm:w-1/2"
                                    />
                                    <Button
                                        onClick={handleSaveProfile}
                                        disabled={savingProfile}
                                        size="default"
                                    >
                                        {savingProfile ? t.profile.saving : t.profile.saveNickname}
                                    </Button>
                                </div>
                                {profileError && (
                                    <p className="text-sm text-destructive">{profileError}</p>
                                )}
                                {profileSaved && (
                                    <p className="text-sm text-green-600">{t.profile.saved}</p>
                                )}
                            </div>

                            {/* Email field (read-only) */}
                            <div className="space-y-2">
                                <Label>{t.profile.email}</Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        value={profileData?.user.email || ""}
                                        disabled
                                        className="bg-muted sm:w-1/2"
                                    />
                                    {showEmailVerification && (
                                        isEmailVerified ? (
                                            <span className="flex items-center gap-1 text-sm text-green-600 whitespace-nowrap">
                                                <Icons.Check className="h-4 w-4" />
                                                {t.profile.emailVerified}
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-sm text-yellow-600 whitespace-nowrap">
                                                <Icons.X className="h-4 w-4" />
                                                {t.profile.emailNotVerified}
                                            </span>
                                        )
                                    )}
                                </div>

                                {/* Resend verification button */}
                                {showEmailVerification && !isEmailVerified && (
                                    <div className="mt-2">
                                        {verificationSent ? (
                                            <p className="text-sm text-green-600">{t.profile.verificationSent}</p>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleResendVerification}
                                                disabled={sendingVerification}
                                            >
                                                {sendingVerification ? t.common.loading : t.profile.resendVerification}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security Card - Password Management */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Icons.Shield className="h-5 w-5 text-primary" />
                        <CardTitle>{t.profile.security}</CardTitle>
                    </div>
                    <CardDescription>
                        {hasPassword ? t.profile.changePassword : t.profile.setPasswordHint}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {hasPassword ? (
                        // Modify Password Form (for users with password)
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">{t.profile.currentPassword}</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">{t.profile.newPassword}</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />

                                {/* Password strength indicators */}
                                {newPassword.length > 0 && (
                                    <div className="text-xs space-y-1 mt-2">
                                        <div className={`flex items-center gap-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-muted-foreground'}`}>
                                            {passwordValidation.minLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                            <span>{t.passwordRequirements.minLength}</span>
                                        </div>
                                        <div className={`flex items-center gap-2 ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                                            {passwordValidation.hasUppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                            <span>{t.passwordRequirements.hasUppercase}</span>
                                        </div>
                                        <div className={`flex items-center gap-2 ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                                            {passwordValidation.hasLowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                            <span>{t.passwordRequirements.hasLowercase}</span>
                                        </div>
                                        <div className={`flex items-center gap-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-muted-foreground'}`}>
                                            {passwordValidation.hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                            <span>{t.passwordRequirements.hasNumber}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmNewPassword">{t.profile.confirmNewPassword}</Label>
                                <Input
                                    id="confirmNewPassword"
                                    type="password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                />

                                {/* Password match indicator */}
                                {confirmNewPassword.length > 0 && (
                                    <div className={`text-xs flex items-center gap-2 ${passwordValidation.passwordsMatch ? 'text-green-600' : 'text-destructive'}`}>
                                        {passwordValidation.passwordsMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                        <span>{passwordValidation.passwordsMatch ? t.errors.passwordMatch : t.errors.passwordMismatch}</span>
                                    </div>
                                )}
                            </div>

                            {/* Error message with icon */}
                            {passwordError && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span className="text-sm">{passwordError}</span>
                                </div>
                            )}

                            {/* Success message */}
                            {passwordSuccess && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                    <Check className="h-4 w-4 flex-shrink-0" />
                                    <span className="text-sm">{t.profile.passwordUpdated}</span>
                                </div>
                            )}

                            <Button
                                onClick={handleChangePassword}
                                disabled={savingPassword || !currentPassword || !newPassword || !confirmNewPassword || !isPasswordValid}
                            >
                                {savingPassword ? t.common.loading : t.profile.updatePassword}
                            </Button>
                        </>
                    ) : (
                        // Set Password Form (for Google users without password)
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">{t.profile.newPasswordLabel}</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder={t.profile.newPasswordPlaceholder}
                                />

                                {/* Password strength indicators */}
                                {newPassword.length > 0 && (
                                    <div className="text-xs space-y-1 mt-2">
                                        <div className={`flex items-center gap-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-muted-foreground'}`}>
                                            {passwordValidation.minLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                            <span>{t.passwordRequirements.minLength}</span>
                                        </div>
                                        <div className={`flex items-center gap-2 ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                                            {passwordValidation.hasUppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                            <span>{t.passwordRequirements.hasUppercase}</span>
                                        </div>
                                        <div className={`flex items-center gap-2 ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-muted-foreground'}`}>
                                            {passwordValidation.hasLowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                            <span>{t.passwordRequirements.hasLowercase}</span>
                                        </div>
                                        <div className={`flex items-center gap-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-muted-foreground'}`}>
                                            {passwordValidation.hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                            <span>{t.passwordRequirements.hasNumber}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmNewPassword">{t.profile.confirmPasswordLabel}</Label>
                                <Input
                                    id="confirmNewPassword"
                                    type="password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    placeholder={t.profile.confirmPasswordPlaceholder}
                                />

                                {/* Password match indicator */}
                                {confirmNewPassword.length > 0 && (
                                    <div className={`text-xs flex items-center gap-2 ${passwordValidation.passwordsMatch ? 'text-green-600' : 'text-destructive'}`}>
                                        {passwordValidation.passwordsMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                        <span>{passwordValidation.passwordsMatch ? t.errors.passwordMatch : t.errors.passwordMismatch}</span>
                                    </div>
                                )}
                            </div>

                            {/* Error message with icon */}
                            {passwordError && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span className="text-sm">{passwordError}</span>
                                </div>
                            )}

                            {/* Success message */}
                            {passwordSuccess && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                    <Check className="h-4 w-4 flex-shrink-0" />
                                    <span className="text-sm">{t.profile.passwordUpdated}</span>
                                </div>
                            )}

                            <Button
                                onClick={handleSetPassword}
                                disabled={savingPassword || !newPassword || !confirmNewPassword || !isPasswordValid}
                            >
                                {savingPassword ? t.common.loading : t.profile.setPasswordBtn}
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Linked Accounts Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Icons.Link className="h-5 w-5 text-primary" />
                        <CardTitle>{t.profile.linkedAccounts}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Google - Unified layout: left (status) + right (hint) */}
                    {profileData?.accounts.google ? (
                        // Google is linked
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                            {/* Left: Status */}
                            <div className="flex items-center gap-3">
                                <Icons.Google className="h-5 w-5" />
                                <div>
                                    <div className="font-medium flex items-center gap-2">
                                        Google
                                        <span className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                                            <Check className="h-3 w-3" />
                                            {t.profile.linked}
                                        </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-0.5">
                                        {profileData.accounts.google}
                                    </div>
                                </div>
                            </div>
                            {/* Right: Hint text (different based on hasPassword) */}
                            <div className="text-sm text-muted-foreground text-right">
                                {hasPassword ? (
                                    // Situation 2 & 4: Has password (email registered or set password after Google login)
                                    <span>{t.profile.securityHigh}</span>
                                ) : (
                                    // Situation 1: Google login, no password yet
                                    <span>{t.profile.securityHint}</span>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Google is not linked (Situation 3: email registered, not linked)
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                            {/* Left: Status */}
                            <div className="flex items-center gap-3">
                                <Icons.Google className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <div className="font-medium flex items-center gap-2">
                                        Google
                                        <span className="text-xs text-muted-foreground">
                                            未关联
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* Right: Hint text */}
                            <div className="text-sm text-muted-foreground text-right">
                                👉 该邮箱支持 Google 登录。下次使用 Google 登录即可自动绑定。
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Danger Zone Card */}
            <Card className="border-destructive/50">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Icons.AlertTriangle className="h-5 w-5 text-destructive" />
                        <CardTitle className="text-destructive">{t.profile.dangerZone}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium">{t.profile.deleteAccount}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                {t.profile.deleteAccountDesc}
                            </p>
                        </div>

                        {!showDeleteConfirm ? (
                            <Button
                                variant="destructive"
                                onClick={() => setShowDeleteConfirm(true)}
                            >
                                {t.profile.deleteAccount}
                            </Button>
                        ) : (
                            <div className="space-y-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                                <p className="font-medium text-destructive">
                                    {t.profile.deleteAccountConfirm}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {t.profile.deleteAccountWarning}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="destructive"
                                        onClick={handleDeleteAccount}
                                        disabled={deleting}
                                    >
                                        {deleting ? t.common.loading : t.profile.confirmDelete}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowDeleteConfirm(false)}
                                    >
                                        {t.profile.cancel}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Sessions Card - Reserved for future */}
            {/* 
            <Card>
                <CardHeader>
                    <CardTitle>{t.profile.sessions}</CardTitle>
                    <CardDescription>{t.profile.sessionsDesc}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Coming soon...</p>
                </CardContent>
            </Card>
            */}
        </div>
    );
}
