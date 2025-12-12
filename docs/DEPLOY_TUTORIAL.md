# SaaS 底座部署教程（示例配置，勿直接使用示例值）

面向非技术同事的简明指引，所有敏感值请使用自己的真实值，本文仅给出示例占位符。

## 一、前置准备
- Cloudflare 账号，已开 Workers、D1、R2。
- Node.js 18+ 与 npm 已安装。
- 终端进入项目根目录（例如 `/Users/you/base-saas`）。

## 二、一次性初始化
1) 安装依赖  
   ```bash
   npm install
   ```
2) 登录 Cloudflare（浏览器授权）  
   ```bash
   npx wrangler login
   ```
3) 创建资源（如未创建过）  
   ```bash
   npx wrangler d1 create <db-name>              # 得到 database_id，填入 wrangler.jsonc
   npx wrangler r2 bucket create <bucket-name>   # 桶名需与 wrangler.jsonc 一致
   ```
4) 本地构建检查  
   ```bash
   npm run build
   ```

## 三、配置环境变量 / Secrets（生产）
敏感值一律用 secret 写入，示例占位符请替换：
```bash
npx wrangler secret put BETTER_AUTH_SECRET --config wrangler.jsonc      # 例如 openssl rand -base64 32 生成
npx wrangler secret put GOOGLE_CLIENT_ID --config wrangler.jsonc        # 例如 12345-abc.apps.googleusercontent.com
npx wrangler secret put GOOGLE_CLIENT_SECRET --config wrangler.jsonc    # 例如 GOCSPX-xxxxxxxx
npx wrangler secret put RESEND_API_KEY --config wrangler.jsonc          # 例如 re_xxxxxxxxx
npx wrangler secret put RESEND_FROM_EMAIL --config wrangler.jsonc       # 例如 "SaaS App <noreply@example.com>"
```
纯文本变量 `BETTER_AUTH_URL` 在 `wrangler.jsonc` 内配置。若改域名，记得同步修改并重新部署。

## 四、Google 登录配置（避免 redirect_uri_mismatch）
在 Google Cloud Console 的 OAuth 2.0 Client 中：
- Authorized redirect URI（示例）：  
  `https://your-app.example.workers.dev/api/auth/callback/google`
- Authorized JavaScript origin（示例）：  
  `https://your-app.example.workers.dev`
- 两项都必填，域名/协议/路径必须与实际访问域完全一致（路径固定为 `/api/auth/callback/google`，必须使用 https）。
如使用自定义域，将域名部分替换为你的实际域名，并保持上述两条与实际访问地址完全一致。

## 五、数据库迁移（首次部署必须）
首次部署或新增数据库表后，需要将 schema 同步到远端 D1：
```bash
npm run db:remote:push
```

## 六、部署到生产
根目录执行：
```bash
npm run deploy   # 等价于 react-router build && wrangler deploy
```
部署完成后访问示例域：`https://your-app.example.workers.dev`（请替换为实际域名）。
查看运行日志：`npx wrangler tail <worker-name>`

## 七、绑定自定义域（常见坑）
- 只能绑定当前 Cloudflare 账号中的“活动域”（已完成 NS 切换的域）。如果提示不可用，需要先把主域接入 Cloudflare（添加站点并在注册商修改 NS）。
- 绑定后同步更新：
  - `wrangler.jsonc` 中的 `BETTER_AUTH_URL`
  - Google OAuth 的 redirect URI / JS origin
  - 重新部署一次

## 八、常见问题速查
- 访问 404（*.pages.dev）：该域是 Pages 静态域，本项目是 Worker SSR，请使用 `*.workers.dev` 或已绑定的自定义域。
- BetterAuth 提示默认密钥：生产环境缺少或未更新 `BETTER_AUTH_SECRET`，用 `wrangler secret put BETTER_AUTH_SECRET` 重设并部署。
- Google 登录报 `redirect_uri_mismatch`：检查 Google 控制台的 redirect URI / JS origin 是否与当前域名完全一致（含 https、路径 `/api/auth/callback/google`）。
- 部署后变量丢失：`wrangler deploy` 会用本地 `wrangler.jsonc` 覆盖 Dashboard 的纯文本变量；未写在配置里的纯文本项会被清空。Secrets 不受影响，但未设置过的需要重新 `wrangler secret put`。

## 九、需要准备的资料清单
- 随机生成的 `BETTER_AUTH_SECRET`（示例：`openssl rand -base64 32` 得到的字符串）。
- Google OAuth 的 Client ID / Client Secret，并已配置正确的 redirect URI / JS origin。
- Resend 的 API Key 与发件人邮箱（邮箱域需在 Resend 验证通过）。
- （可选）自定义域：域名已接入 Cloudflare 并完成 NS 切换。
