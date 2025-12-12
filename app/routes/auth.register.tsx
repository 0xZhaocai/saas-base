// app/routes/auth.register.tsx
// 注册页面

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { signUp } from "@/lib/auth.client";
import { useTranslation } from "@/lib/app-context";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_CONFIG } from "@/lib/config";
import { toast } from "sonner";

export function meta() {
    return [
        { title: `Register | ${APP_CONFIG.name}` },
        { name: "description", content: "Create your account" },
    ];
}

export default function RegisterPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

    // Dynamic document title based on language
    useEffect(() => {
        document.title = `${t.pageTitles.register} | ${APP_CONFIG.name}`;
    }, [t]);

    // 密码验证状态
    const passwordValidation = {
        minLength: password.length >= 8 && password.length <= 20,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        passwordsMatch: password === confirmPassword && confirmPassword.length > 0,
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // 验证密码匹配
        if (password !== confirmPassword) {
            setError(t.errors.passwordMismatch);
            return;
        }

        // 验证密码长度
        if (password.length < 8) {
            setError(t.errors.passwordTooShort);
            return;
        }

        // 验证密码强度
        if (!/[A-Z]/.test(password)) {
            setError(t.passwordRequirements.hasUppercase);
            return;
        }

        if (!/[a-z]/.test(password)) {
            setError(t.passwordRequirements.hasLowercase);
            return;
        }

        if (!/[0-9]/.test(password)) {
            setError(t.passwordRequirements.hasNumber);
            return;
        }

        setLoading(true);

        try {
            const result = await signUp.email({
                email,
                password,
                name,
            });

            if (result.error) {
                // 翻译 Better-Auth 的错误
                const errorMessage = result.error.message || "";
                if (errorMessage.includes("already exists") || errorMessage.includes("User already exists")) {
                    setError(t.errors.userExists);
                } else if (errorMessage.includes("Invalid")) {
                    setError(t.errors.invalidCredentials);
                } else {
                    setError(t.errors.unknownError);
                }
            } else {
                // 注册成功，提示去邮箱完成验证
                setRegistrationSuccess(true);
                toast.success(t.verifyEmail.verificationSent);
            }
        } catch (err) {
            console.error("Registration error:", err);
            setError(t.errors.networkError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
            <Navbar />

            <div className="flex items-center justify-center px-4 py-16 sm:py-24">
                <Card className="w-full max-w-md shadow-xl border-border">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            {t.auth.createAccount}
                        </CardTitle>
                        <CardDescription>
                            {t.auth.fillInfo}
                        </CardDescription>
                    </CardHeader>

                    {registrationSuccess && (
                        <CardContent className="space-y-4">
                            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-foreground">
                                <p className="font-semibold mb-1">{t.verifyEmail.verificationSent}</p>
                                <p className="text-muted-foreground">
                                    {t.verifyEmail.checkInbox}
                                </p>
                            </div>
                        </CardContent>
                    )}

                    {!registrationSuccess && (
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4">
                                {error && (
                                    <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="name">{t.auth.name}</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder={t.auth.namePlaceholder}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        autoComplete="name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">{t.auth.email}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder={t.auth.emailPlaceholder}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">{t.auth.password}</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder={t.auth.passwordPlaceholder}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="new-password"
                                    />
                                    {password.length > 0 && (
                                        <div className="space-y-1 text-xs">
                                            <div className={passwordValidation.minLength ? "text-green-600" : "text-muted-foreground"}>
                                                {passwordValidation.minLength ? "✓" : "○"} {t.passwordRequirements.minLength}
                                            </div>
                                            <div className={passwordValidation.hasUppercase ? "text-green-600" : "text-muted-foreground"}>
                                                {passwordValidation.hasUppercase ? "✓" : "○"} {t.passwordRequirements.hasUppercase}
                                            </div>
                                            <div className={passwordValidation.hasLowercase ? "text-green-600" : "text-muted-foreground"}>
                                                {passwordValidation.hasLowercase ? "✓" : "○"} {t.passwordRequirements.hasLowercase}
                                            </div>
                                            <div className={passwordValidation.hasNumber ? "text-green-600" : "text-muted-foreground"}>
                                                {passwordValidation.hasNumber ? "✓" : "○"} {t.passwordRequirements.hasNumber}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">{t.auth.confirmPassword}</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder={t.auth.confirmPasswordPlaceholder}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        autoComplete="new-password"
                                    />
                                    {confirmPassword.length > 0 && (
                                        <div className={`text-xs ${passwordValidation.passwordsMatch ? "text-green-600" : "text-destructive"}`}>
                                            {passwordValidation.passwordsMatch ? "✓ " + t.errors.passwordMatch : "○ " + t.errors.passwordMismatch}
                                        </div>
                                    )}
                                </div>
                            </CardContent>

                            <CardFooter className="flex flex-col space-y-4 mt-6">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={loading}
                                >
                                    {loading ? t.common.loading : t.auth.registerBtn}
                                </Button>

                                <p className="text-sm text-center text-muted-foreground">
                                    {t.auth.hasAccount}{" "}
                                    <Link
                                        to="/login"
                                        className="text-primary font-medium hover:underline"
                                    >
                                        {t.auth.login}
                                    </Link>
                                </p>
                            </CardFooter>
                        </form>
                    )}
                </Card>
            </div>
        </div>
    );
}
