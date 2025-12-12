import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 获取用户头像 URL
 * 如果用户有自定义头像，使用自定义头像
 * 否则使用 Dicebear 生成的默认头像
 * 
 * @param user - 用户对象，包含 name、email 和可选的 image
 * @returns 头像 URL
 */
export function getUserAvatarUrl(user: {
  name: string;
  email: string;
  image?: string | null
}): string {
  // 如果有自定义头像且不是空字符串，使用自定义头像
  if (user.image && user.image.trim() !== '') {
    return user.image;
  }

  // 生成 Dicebear 默认头像 URL（avataaars 卡通人物风格）
  const seed = user.name || user.email || 'user';
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}
