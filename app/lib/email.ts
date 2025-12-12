// app/lib/email.ts
// Resend 邮件服务封装

import { Resend } from "resend";
import { APP_CONFIG } from "./config";
import { getEmailCopy, resolveLanguage } from "./email-i18n";

/**
 * 邮件服务配置
 */
interface EmailConfig {
  apiKey: string;
  fromEmail: string;
}

/**
 * 发送邮件参数
 */
interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * 创建邮件服务实例
 */
export function createEmailService(config: EmailConfig) {
  const resend = new Resend(config.apiKey);
  const appName = APP_CONFIG.name;
  const copyrightYear = APP_CONFIG.copyrightYear;

  return {
    /**
     * 发送邮件
     */
    async send(params: SendEmailParams) {
      try {
        const { data, error } = await resend.emails.send({
          from: config.fromEmail,
          to: params.to,
          subject: params.subject,
          html: params.html,
          text: params.text,
          replyTo: params.replyTo,
        });

        if (error) {
          console.error("邮件发送失败:", error);
          throw new Error(`邮件发送失败: ${error.message}`);
        }

        console.log("邮件发送成功:", data?.id);
        return { success: true, id: data?.id };
      } catch (error) {
        console.error("邮件发送异常:", error);
        throw error;
      }
    },

    /**
     * 发送欢迎邮件
     */
    async sendWelcomeEmail(to: string, userName: string, language?: string) {
      const lang = resolveLanguage(language);
      const copy = getEmailCopy(lang, "welcome");
      const subject = copy.subject(appName);

      const html = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">${appName}</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                ${copy.greet(userName)}
              </h2>
              
              <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                ${copy.intro(appName)}
              </p>
              
              <ul style="margin: 0 0 24px; padding-left: 20px; color: #4a5568; font-size: 16px; line-height: 1.8;">
                ${copy.features.map((f) => `<li>${f}</li>`).join("")}
              </ul>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${APP_CONFIG.links.website}/dashboard" 
                   style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  ${copy.cta}
                </a>
              </div>
              
              <p style="margin: 24px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                ${copy.footer}
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 24px 40px; background-color: #f7fafc; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                © ${copyrightYear} ${appName}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      return this.send({
        to,
        subject,
        html,
        text: copy.text(appName, userName, `${APP_CONFIG.links.website}/dashboard`, copyrightYear),
      });
    },

    /**
     * 发送邮箱验证邮件
     */
    async sendVerificationEmail(to: string, userName: string, verificationUrl: string, language?: string) {
      const expiryHours = APP_CONFIG.email.verificationExpiry;
      const lang = resolveLanguage(language);
      const copy = getEmailCopy(lang, "verify");
      const subject = copy.subject(appName);

      const html = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">${appName}</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                ${copy.title}
              </h2>
              
              <p style="margin: 0 0 16px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                ${copy.greeting(userName)}
              </p>
              
              <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                ${copy.instruction}
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${verificationUrl}" 
                   style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  ${copy.button}
                </a>
              </div>
              
              <p style="margin: 24px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                ${copy.alt}<br>
                <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
              </p>
              
              <p style="margin: 24px 0 0; color: #e53e3e; font-size: 14px; line-height: 1.6;">
                ${copy.expiry(expiryHours)}
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 24px 40px; background-color: #f7fafc; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                ${copy.ignore(appName)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      return this.send({
        to,
        subject,
        html,
        text: copy.text(appName, userName, verificationUrl, expiryHours, copyrightYear),
      });
    },

    /**
     * 发送密码重置邮件
     */
    async sendPasswordResetEmail(to: string, userName: string, resetUrl: string, language?: string) {
      const expiryHours = APP_CONFIG.email.resetPasswordExpiry;
      const lang = resolveLanguage(language);
      const copy = getEmailCopy(lang, "reset");
      const subject = copy.subject(appName);

      const html = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">${appName}</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                ${copy.title}
              </h2>
              
              <p style="margin: 0 0 16px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                ${copy.greeting(userName)}
              </p>
              
              <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                ${copy.instruction}
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                  ${copy.button}
                </a>
              </div>
              
              <p style="margin: 24px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                ${copy.alt}<br>
                <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
              </p>
              
              <p style="margin: 24px 0 0; color: #e53e3e; font-size: 14px; line-height: 1.6;">
                ${copy.expiry(expiryHours)}
              </p>
              
              <p style="margin: 24px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                ${copy.ignore}
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 24px 40px; background-color: #f7fafc; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                © ${copyrightYear} ${appName}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      return this.send({
        to,
        subject,
        html,
        text: copy.text(appName, userName, resetUrl, expiryHours, copyrightYear),
      });
    },
  };
}

/**
 * 从环境变量创建邮件服务
 */
export function createEmailServiceFromEnv(env: {
  RESEND_API_KEY: string;
  RESEND_FROM_EMAIL: string;
}) {
  return createEmailService({
    apiKey: env.RESEND_API_KEY,
    fromEmail: env.RESEND_FROM_EMAIL,
  });
}
