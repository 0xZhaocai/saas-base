# 开发指南

本指南帮助开发者在 SaaS 底座上高效、规范地开发新功能。

> [!IMPORTANT]
> **开发前必读**：请仔细阅读本指南，遵循规范可避免 90% 的常见错误。

---

## 🧱 新项目启动（含数据库）

> [!TIP]
> 本底座基于 Cloudflare Workers + D1 + Drizzle。首次拉起新项目时，务必先初始化 D1 并应用迁移，
> 否则会出现 `no such table: verification` 等登录/鉴权错误。

1) 安装依赖
```bash
npm install
```

2) 配置本地环境变量
```bash
cp .dev.vars.example .dev.vars
# 编辑 .dev.vars，确保 BETTER_AUTH_URL 与 dev 实际端口一致
```

3) 创建并绑定 D1（每个新项目只需一次）
```bash
npx wrangler d1 create <db-name> --config wrangler.jsonc
# 把返回的 database_name / database_id 填入 wrangler.jsonc 的 d1_databases（binding 保持为 DB）
```

4) 应用数据库迁移
```bash
# 本地开发：初始化本地 D1
npm run db:local:push

# 部署前：同步迁移到远端 D1
npm run db:remote:push
```

5) 启动开发服务器
```bash
npm run dev
```

---

## 📋 开发检查清单

### 每次提交前必查

- [ ] **多语言**: 所有用户可见文本使用 `t.xxx` 翻译键
- [ ] **类型安全**: 运行 `npm run typecheck` 无错误
- [ ] **配置统一**: 品牌名、链接等从 `config/app.ts` 读取
- [ ] **无硬编码**: 无中文/英文字符串直接写在 JSX 中
- [ ] **图标存在**: 导航使用的图标在 `icons.tsx` 中已定义

---

## 🚀 常见开发场景

### 1. 新增业务页面

```bash
# 1. 创建页面文件
touch app/routes/analytics.tsx
```

```typescript
// 页面基本模板 (含 SEO meta)
import { useTranslation } from "@/lib/app-context";
import { APP_CONFIG } from "@config";
import type { Route } from "./+types/analytics";

export const meta: Route.MetaFunction = () => [
    { title: `Analytics${APP_CONFIG.seo.titleSuffix}` },
];

export default function AnalyticsPage() {
    const { t } = useTranslation();
    return <h1>{t.nav.analytics}</h1>;
}
```

```typescript
// 2. 添加路由 - 编辑 app/routes/config/business.ts
export const businessRoutes = [
    route("analytics", "routes/analytics.tsx"),
];
```

```typescript
// 3. 添加导航菜单 - 编辑 config/navigation.ts
{
    to: "/analytics",
    icon: "BarChart",  // ⚠️ 必须确认图标存在
    label: "nav.analytics",  // ⚠️ 必须添加翻译键
}
```

> [!NOTE]
> **图标检查**: 确保 `icon` 值在 `app/components/icons.tsx` 中已定义。
> 如需新图标，先在 `icons.tsx` 添加后再使用。

```typescript
// 4. 添加翻译 - 所有语言文件都要改！
// app/lib/i18n/en.ts
nav: {
    analytics: 'Analytics',  // 新增
}
// app/lib/i18n/zh-CN.ts
nav: {
    analytics: '数据分析',  // 新增
}
// ... 其他语言文件
```

---

### 2. 新增文本内容

> [!CAUTION]
> **绝对禁止**在 JSX 中直接写文本字符串！

❌ **错误做法**:
```tsx
<Button>提交</Button>
<span>Loading...</span>
```

✅ **正确做法**:
```tsx
// 1. 先在 i18n/types.ts 添加类型
common: {
    submit: string;
    loading: string;
}

// 2. 在所有语言文件添加翻译
// en.ts
submit: 'Submit',
loading: 'Loading...',

// zh-CN.ts  
submit: '提交',
loading: '加载中...',

// 3. 在组件中使用
<Button>{t.common.submit}</Button>
<span>{t.common.loading}</span>
```

---

### 3. 新增语言支持

```bash
# 1. 复制模板
cp app/lib/i18n/en.ts app/lib/i18n/ko.ts
```

```typescript
// 2. 添加类型 - app/lib/i18n/types.ts
export type Language = 'en' | 'zh-CN' | 'zh-TW' | 'ja' | 'ko';
```

```typescript
// 3. 注册语言 - app/lib/i18n/index.ts
import { ko } from './ko';

export const TRANSLATIONS: Record<Language, I18nContent> = {
    en, 'zh-CN': zhCN, 'zh-TW': zhTW, ja, ko,
};
```

---

### 4. 新增数据库表

```typescript
// 在 app/db/schema/business.ts 添加表定义
import { nanoid } from 'nanoid';  // npm i nanoid

export const post = sqliteTable("post", {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),  // ⚠️ 自动生成 ID
    title: text("title").notNull(),
    authorId: text("author_id").references(() => user.id),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull().$defaultFn(() => new Date()),
});

export type Post = typeof post.$inferSelect;
```

```typescript
// 可选：添加表单验证 (Zod)
import { z } from 'zod';

export const postSchema = z.object({
    title: z.string().min(1).max(100),
    content: z.string().min(1),
});
```

```bash
# 运行迁移（把 schema 变更应用到 D1）
# 本地 D1：
npm run db:local:push

# 远端 D1（部署前）：
npm run db:remote:push

# 可选：也可以使用 drizzle-kit 直接推送（需确保 wrangler.jsonc 中 DB 已绑定）
# npx drizzle-kit push
```

---

### 5. 修改应用配置

只需修改 `config/app.ts`:

```typescript
export const APP_CONFIG = {
    name: "My SaaS",           // 应用名称
    description: "...",        // SEO 描述
    features: {
        googleLogin: true,     // 功能开关
    },
};
```

---

## ⚠️ 常见错误

### 1. 忘记添加多语言翻译

**症状**: 页面显示空白或 `undefined`

**检查**: 
- `app/lib/i18n/types.ts` 是否定义了类型
- 所有 4 个语言文件是否都添加了翻译

### 2. 使用错误的配置读取方式

**错误**:
```tsx
const appName = "Your SaaS Name";  // 硬编码
```

**正确**:
```tsx
import { APP_CONFIG } from "@config";
const appName = APP_CONFIG.name;
```

### 3. 修改了底座核心文件

**底座核心 (请勿修改)**:
- `app/db/schema/auth.ts`
- `app/routes/config/auth.ts`
- `app/routes/config/dashboard.ts`

**可修改文件**:
- `app/db/schema/business.ts`
- `app/routes/config/business.ts`
- `config/navigation.ts`

---

## 📁 目录结构速查

```
config/                 # ⚙️ 应用配置
├── app.ts              # 名称、品牌、功能开关
└── navigation.ts       # 导航菜单

app/lib/i18n/           # 🌍 多语言
├── types.ts            # 类型定义 (先改这里)
├── en.ts               # 英文
├── zh-CN.ts            # 简体中文
├── zh-TW.ts            # 繁体中文
└── ja.ts               # 日文

app/db/schema/          # 🗄️ 数据库
├── auth.ts             # 认证表 ❌ 不可改
└── business.ts         # 业务表 ✅ 可修改

app/routes/config/      # 🛣️ 路由
├── auth.ts             # 认证路由 ❌ 不可改
├── dashboard.ts        # 仪表盘路由 ❌ 不可改
└── business.ts         # 业务路由 ✅ 可修改
```

---

## 🔧 常用命令

```bash
# 类型检查 (必须通过)
npm run typecheck

# 本地开发
npm run dev

# 部署
npm run deploy

# 数据库迁移（参考“新项目启动/新增数据库表”）
# 本地：
npm run db:local:push
# 远端：
npm run db:remote:push
```

---

## ✨ 最佳实践清单

### 技术方案阶段

- [ ] **ID 生成**: 使用 `nanoid` 自动生成唯一 ID
- [ ] **表单验证**: 使用 Zod schema 验证用户输入
- [ ] **错误处理**: 定义统一的错误响应格式
- [ ] **SEO meta**: 每个页面导出 `meta` 函数

### i18n 结构

导航标签与页面文本分离：
```typescript
// 导航标签 (侧边栏菜单)
nav: {
    blog: 'Blog',
}

// 页面文本 (独立模块)
blog: {
    title: 'Blog',
    newPost: 'New Post',
    // ...
}
```

### API 响应格式

```typescript
// 成功响应
{ success: true, data: {...} }

// 错误响应
{ success: false, error: '错误信息', code: 'ERROR_CODE' }
```

---

## 📞 需要帮助?

1. 查看 `docs/` 目录下的其他文档
2. 检查 `config/app.ts` 中的功能开关
3. 运行 `npm run typecheck` 查看具体错误
4. 参考 `docs/blog/` 示例模块
