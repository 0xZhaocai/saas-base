// app/lib/email-i18n.ts
// 邮件多语言文案，集中管理，新增语言时只改此文件

import type { Language } from "./i18n";

export type EmailLanguage = Language;
export type EmailType = "welcome" | "verify" | "reset";

type WelcomeCopy = {
  subject: (appName: string) => string;
  greet: (userName: string) => string;
  intro: (appName: string) => string;
  cta: string;
  footer: string;
  features: string[];
  text: (appName: string, userName: string, dashboardUrl: string, year: string) => string;
};

type VerifyCopy = {
  subject: (appName: string) => string;
  title: string;
  greeting: (userName: string) => string;
  instruction: string;
  button: string;
  alt: string;
  expiry: (hours: number) => string;
  ignore: (appName: string) => string;
  text: (appName: string, userName: string, verificationUrl: string, hours: number, year: string) => string;
};

type ResetCopy = {
  subject: (appName: string) => string;
  title: string;
  greeting: (userName: string) => string;
  instruction: string;
  button: string;
  alt: string;
  expiry: (hours: number) => string;
  ignore: string;
  text: (appName: string, userName: string, resetUrl: string, hours: number, year: string) => string;
};

type EmailTranslations = {
  welcome: WelcomeCopy;
  verify: VerifyCopy;
  reset: ResetCopy;
};

export function resolveLanguage(lang?: string | null): EmailLanguage {
  if (!lang) return "en";
  const lower = lang.toLowerCase();
  if (lower.startsWith("zh-tw") || lower.includes("hant")) return "zh-TW";
  if (lower.startsWith("zh")) return "zh-CN";
  if (lower.startsWith("ja")) return "ja";
  return "en";
}

const EMAIL_TRANSLATIONS: Record<EmailLanguage, EmailTranslations> = {
  en: {
    welcome: {
      subject: (appName) => `🎉 Welcome to ${appName}!`,
      greet: (userName) => `Hi ${userName}, welcome aboard!`,
      intro: (appName) => `Thanks for signing up for ${appName}. Here are a few things you can explore right away:`,
      cta: "Go to dashboard",
      footer: "If you have any questions, feel free to reach out to our support team.",
      features: [
        "🚀 Deploy your app quickly",
        "🎨 Modern UI",
        "🌍 Internationalization built-in",
        "🔐 Secure authentication",
      ],
      text: (appName, userName, dashboardUrl, year) => `Welcome to ${appName}, ${userName}!

Thanks for signing up. Explore the dashboard: ${dashboardUrl}

If you have any questions, reach out to support.

© ${year} ${appName}. All rights reserved.`,
    },
    verify: {
      subject: (appName) => `🔐 Verify your email - ${appName}`,
      title: "Verify your email address",
      greeting: (userName) => `Hi ${userName},`,
      instruction: "Click the button below to verify your email and complete your sign-up:",
      button: "Verify email",
      alt: "If the button doesn't work, copy this link into your browser:",
      expiry: (hours) => `⚠️ This link expires in ${hours} hours.`,
      ignore: (appName) => `If you didn't sign up for ${appName}, you can ignore this email.`,
      text: (appName, userName, verificationUrl, hours, year) => `Verify your email

Hi ${userName},
Please open this link to verify your email (expires in ${hours}h):
${verificationUrl}

If you didn't sign up for ${appName}, ignore this email.
© ${year} ${appName}`,
    },
    reset: {
      subject: (appName) => `🔑 Reset your password - ${appName}`,
      title: "Reset your password",
      greeting: (userName) => `Hi ${userName},`,
      instruction: "We received a request to reset your password. Click the button below to set a new one:",
      button: "Reset password",
      alt: "If the button doesn't work, copy this link into your browser:",
      expiry: (hours) => `⚠️ This link expires in ${hours} hours.`,
      ignore: "If you didn't request this, you can safely ignore this email.",
      text: (appName, userName, resetUrl, hours, year) => `Reset your password

Hi ${userName},
Reset your password here (expires in ${hours}h):
${resetUrl}

If you didn't request this, ignore this email.
© ${year} ${appName}`,
    },
  },
  "zh-CN": {
    welcome: {
      subject: (appName) => `🎉 欢迎加入 ${appName}！`,
      greet: (userName) => `欢迎加入，${userName}！`,
      intro: (appName) => `感谢您注册 ${appName}，现在就可以开始探索这些功能：`,
      cta: "进入仪表盘",
      footer: "如有任何问题，请随时联系我们的支持团队。",
      features: [
        "🚀 快速部署您的应用",
        "🎨 现代化的用户界面",
        "🌍 多语言国际化支持",
        "🔐 安全的用户认证系统",
      ],
      text: (appName, userName, dashboardUrl, year) => `欢迎加入 ${appName}，${userName}！

访问仪表盘：${dashboardUrl}
如有问题请联系支持。

© ${year} ${appName}. All rights reserved.`,
    },
    verify: {
      subject: (appName) => `🔐 验证您的邮箱地址 - ${appName}`,
      title: "验证您的邮箱地址",
      greeting: (userName) => `您好，${userName}！`,
      instruction: "请点击下方按钮验证您的邮箱地址，以完成注册：",
      button: "验证邮箱",
      alt: "如果按钮无法点击，请复制以下链接到浏览器：",
      expiry: (hours) => `⚠️ 此链接将在 ${hours} 小时后失效。`,
      ignore: (appName) => `如果您没有注册 ${appName}，请忽略此邮件。`,
      text: (appName, userName, verificationUrl, hours, year) => `验证您的邮箱地址

您好，${userName}！
请访问以下链接验证您的邮箱地址（${hours} 小时内有效）：
${verificationUrl}

如果您没有注册 ${appName}，请忽略此邮件。
© ${year} ${appName}`,
    },
    reset: {
      subject: (appName) => `🔑 重置您的密码 - ${appName}`,
      title: "重置您的密码",
      greeting: (userName) => `您好，${userName}！`,
      instruction: "我们收到了您的密码重置请求。点击下方按钮设置新密码：",
      button: "重置密码",
      alt: "如果按钮无法点击，请复制以下链接到浏览器：",
      expiry: (hours) => `⚠️ 此链接将在 ${hours} 小时后失效。`,
      ignore: "如果您没有请求重置密码，请忽略此邮件。",
      text: (appName, userName, resetUrl, hours, year) => `重置您的密码

您好，${userName}！
请访问以下链接设置新密码（${hours} 小时内有效）：
${resetUrl}

如果您没有请求重置密码，请忽略此邮件。
© ${year} ${appName}`,
    },
  },
  "zh-TW": {
    welcome: {
      subject: (appName) => `🎉 歡迎加入 ${appName}！`,
      greet: (userName) => `歡迎加入，${userName}！`,
      intro: (appName) => `感謝您註冊 ${appName}，現在就可以開始探索這些功能：`,
      cta: "進入儀表板",
      footer: "如有任何問題，請隨時聯繫我們的支援團隊。",
      features: [
        "🚀 快速部署您的應用",
        "🎨 現代化的用戶介面",
        "🌍 多語言國際化支持",
        "🔐 安全的用戶認證系統",
      ],
      text: (appName, userName, dashboardUrl, year) => `歡迎加入 ${appName}，${userName}！

造訪儀表板：${dashboardUrl}
如有問題請聯繫支援。

© ${year} ${appName}. All rights reserved.`,
    },
    verify: {
      subject: (appName) => `🔐 驗證您的郵箱地址 - ${appName}`,
      title: "驗證您的郵箱地址",
      greeting: (userName) => `您好，${userName}！`,
      instruction: "請點擊下方按鈕驗證您的郵箱地址，以完成註冊：",
      button: "驗證郵箱",
      alt: "如果按鈕無法點擊，請複製以下連結到瀏覽器：",
      expiry: (hours) => `⚠️ 此連結將在 ${hours} 小時後失效。`,
      ignore: (appName) => `如果您沒有註冊 ${appName}，請忽略此郵件。`,
      text: (appName, userName, verificationUrl, hours, year) => `驗證您的郵箱地址

您好，${userName}！
請訪問以下連結驗證您的郵箱地址（${hours} 小時內有效）：
${verificationUrl}

如果您沒有註冊 ${appName}，請忽略此郵件。
© ${year} ${appName}`,
    },
    reset: {
      subject: (appName) => `🔑 重置您的密碼 - ${appName}`,
      title: "重置您的密碼",
      greeting: (userName) => `您好，${userName}！`,
      instruction: "我們收到了您的密碼重置請求。點擊下方按鈕設定新密碼：",
      button: "重置密碼",
      alt: "如果按鈕無法點擊，請複製以下連結到瀏覽器：",
      expiry: (hours) => `⚠️ 此連結將在 ${hours} 小時後失效。`,
      ignore: "如果您沒有請求重置密碼，請忽略此郵件。",
      text: (appName, userName, resetUrl, hours, year) => `重置您的密碼

您好，${userName}！
請訪問以下連結設定新密碼（${hours} 小時內有效）：
${resetUrl}

如果您沒有請求重置密碼，請忽略此郵件。
© ${year} ${appName}`,
    },
  },
  ja: {
    welcome: {
      subject: (appName) => `🎉 ${appName} へようこそ！`,
      greet: (userName) => `${userName} さん、ようこそ！`,
      intro: (appName) => `${appName} にご登録いただきありがとうございます。まずは次の機能をお試しください：`,
      cta: "ダッシュボードへ",
      footer: "ご不明点があればサポートまでお気軽にご連絡ください。",
      features: [
        "🚀 すぐにデプロイ",
        "🎨 モダンな UI",
        "🌍 多言語対応",
        "🔐 安全な認証",
      ],
      text: (appName, userName, dashboardUrl, year) => `${appName} へようこそ、${userName} さん！

ダッシュボード: ${dashboardUrl}
ご不明点はサポートまで。

© ${year} ${appName}. All rights reserved.`,
    },
    verify: {
      subject: (appName) => `🔐 メールアドレスを確認してください - ${appName}`,
      title: "メールアドレスを確認してください",
      greeting: (userName) => `${userName} さん、こんにちは`,
      instruction: "以下のボタンをクリックしてメールアドレスを確認し、登録を完了してください。",
      button: "メールを確認する",
      alt: "ボタンが動作しない場合は、次のリンクをブラウザに貼り付けてください：",
      expiry: (hours) => `⚠️ このリンクは ${hours} 時間で失効します。`,
      ignore: (appName) => `${appName} に心当たりがない場合は、このメールは無視してください。`,
      text: (appName, userName, verificationUrl, hours, year) => `メールアドレスを確認してください

${userName} さん、
次のリンクからメールアドレスを確認してください（有効期限 ${hours} 時間）：
${verificationUrl}

${appName} に心当たりがない場合は、このメールを無視してください。
© ${year} ${appName}`,
    },
    reset: {
      subject: (appName) => `🔑 パスワードをリセット - ${appName}`,
      title: "パスワードをリセット",
      greeting: (userName) => `${userName} さん、こんにちは`,
      instruction: "パスワードリセットのリクエストを受け取りました。以下のボタンから新しいパスワードを設定してください。",
      button: "パスワードをリセット",
      alt: "ボタンが動作しない場合は、次のリンクをブラウザに貼り付けてください：",
      expiry: (hours) => `⚠️ このリンクは ${hours} 時間で失効します。`,
      ignore: "このメールに心当たりがない場合は、無視してください。",
      text: (appName, userName, resetUrl, hours, year) => `パスワードをリセット

${userName} さん、
次のリンクからパスワードをリセットしてください（有効期限 ${hours} 時間）：
${resetUrl}

このメールに心当たりがない場合は無視してください。
© ${year} ${appName}`,
    },
  },
};

// 导出类型供外部使用
export type { WelcomeCopy, VerifyCopy, ResetCopy };

// 函数重载 - 根据 type 参数返回正确的类型
export function getEmailCopy(lang: string | undefined | null, type: "welcome"): WelcomeCopy;
export function getEmailCopy(lang: string | undefined | null, type: "verify"): VerifyCopy;
export function getEmailCopy(lang: string | undefined | null, type: "reset"): ResetCopy;
export function getEmailCopy(lang: string | undefined | null, type: EmailType): WelcomeCopy | VerifyCopy | ResetCopy {
  const normalized = resolveLanguage(lang);
  const translations = EMAIL_TRANSLATIONS[normalized] || EMAIL_TRANSLATIONS.en;
  return translations[type];
}
