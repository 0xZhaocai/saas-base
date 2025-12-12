# BaseSaaS

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com)

现代化的 **SaaS 应用底座**，为您的下一个项目提供坚实的基础架构。

## ✨ 核心特性

| 功能 | 技术方案 |
|------|---------|
| 🔐 **认证系统** | Better-Auth (邮箱密码 + Google OAuth) |
| 📧 **邮件服务** | Resend (验证邮件、密码重置) |
| 🗄️ **数据库** | Cloudflare D1 + Drizzle ORM |
| 🌍 **国际化** | 多语言支持 (EN/简/繁/日) |
| 🎨 **UI 组件** | shadcn/ui + Tailwind CSS |
| 🌙 **主题切换** | 明/暗/系统 三种模式 |
| 📱 **响应式** | 移动端抽屉 + 可收缩侧边栏 |
| ⚡ **边缘部署** | Cloudflare Workers |

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.dev.vars.example` 到 `.dev.vars` 并填写：

```bash
cp .dev.vars.example .dev.vars
```

### 3. 初始化数据库（Cloudflare D1）

```bash
npx wrangler d1 create <db-name> --config wrangler.jsonc
# 将输出的 database_name / database_id 填入 wrangler.jsonc 的 d1_databases

# 初始化本地 D1（首次本地开发必须做）
npm run db:local:push

# 部署前同步到远端 D1：
# npm run db:remote:push
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:5173](http://localhost:5173)

## 📁 项目结构

```
base-saas/
├── config/             # ⭐ 统一配置入口
│   ├── app.ts          # 应用配置 (名称、品牌、功能开关)
│   ├── navigation.ts   # 导航配置
│   └── index.ts        # 统一导出
│
├── app/
│   ├── components/     # UI 组件
│   │   ├── ui/         # shadcn/ui 基础组件
│   │   └── icons.tsx   # 统一图标库
│   ├── db/             # 数据库 Schema
│   ├── lib/            # 工具库
│   │   ├── auth.*      # 认证逻辑
│   │   ├── email*.ts   # 邮件服务
│   │   └── i18n.ts     # 国际化
│   └── routes/         # 页面路由
│
├── .dev.vars.example   # 环境变量模板 (Cloudflare Workers)
├── wrangler.jsonc      # Cloudflare 平台配置
└── README.md
```

## ⚙️ 配置指南

### 1. 应用配置
修改 `config/app.ts` 来自定义您的 SaaS 应用：

```typescript
export const APP_CONFIG = {
  name: "Your SaaS Name",       // 应用名称
  description: "Your tagline",  // 应用描述
  brandColors: { ... },         // 品牌颜色
  features: {
    emailVerification: true,    // 邮箱验证
    googleLogin: true,          // Google 登录
  },
  // ...更多配置
};
```

## 📦 部署

```bash
# 部署到生产环境
npm run deploy

# 预览部署
npx wrangler versions upload
```

## 📝 环境变量

参见 [.dev.vars.example](.dev.vars.example) 获取完整列表。

## 📚 文档

- [⭐ 开发指南](docs/DEVELOPMENT_GUIDE.md) - **必读**
- [部署教程](docs/DEPLOY_TUTORIAL.md)
- [Blog 示例模块](docs/blog/)

## 📄 License

MIT
