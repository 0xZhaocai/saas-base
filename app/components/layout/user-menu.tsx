// app/components/layout/user-menu.tsx
// 用户菜单组件 - 桌面端和移动端共享

import { useNavigate } from "react-router";
import { authClient } from "@/lib/auth.client";
import { getUserAvatarUrl } from "@/lib/utils";
import { Icons } from "@/components/icons";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
    user: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
    };
    t: any;
    /** 是否为移动端（简化样式） */
    isMobile?: boolean;
}

export function UserMenu({ user, t, isMobile = false }: UserMenuProps) {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await authClient.signOut();
        window.location.href = "/";
    };

    if (isMobile) {
        // 移动端：简化为按钮列表
        return (
            <div className="border-t border-border pt-4">
                <div className="px-3 py-2 flex items-center gap-3">
                    <img
                        src={getUserAvatarUrl(user)}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                            {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors mt-2"
                >
                    <Icons.LogOut className="w-5 h-5" />
                    {t.nav.logout}
                </button>
            </div>
        );
    }

    // 桌面端：下拉菜单
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors text-left">
                    <img
                        src={getUserAvatarUrl(user)}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                            {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                        </p>
                    </div>
                    <Icons.ChevronUp className="opacity-50" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                    <Icons.User className="w-4 h-4 mr-2" />
                    {t.common.profile}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <Icons.LogOut className="w-4 h-4 mr-2" />
                    {t.nav.logout}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
