# 极简 Blog - 技术设计方案

> 基于 [PRD.md](./PRD.md) 的技术实现方案

---

## 1. 架构概览

```
┌─────────────────────────────────────────────────────────┐
│                      前端 (React)                        │
├─────────────────────────────────────────────────────────┤
│  blog.index.tsx  │  blog.$id.tsx  │  blog.new/edit.tsx  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    API 路由层                            │
├─────────────────────────────────────────────────────────┤
│          api.blog.tsx (CRUD 操作)                        │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 数据库 (Cloudflare D1)                   │
├─────────────────────────────────────────────────────────┤
│                    post 表                               │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 数据库设计

### 2.1 post 表

**文件**: `app/db/schema/business.ts`

```typescript
import { nanoid } from 'nanoid';  // 需安装: npm i nanoid

export const post = sqliteTable("post", {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    title: text("title").notNull(),
    content: text("content").notNull(),
    authorId: text("author_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .notNull().$defaultFn(() => new Date()),
});

export type Post = typeof post.$inferSelect;
export type NewPost = typeof post.$inferInsert;
```

### 2.2 表单验证 (Zod Schema)

```typescript
import { z } from 'zod';

export const postSchema = z.object({
    title: z.string().min(1, '标题不能为空').max(100),
    content: z.string().min(1, '内容不能为空'),
});

export type PostInput = z.infer<typeof postSchema>;
```

---

## 3. API 设计

### 3.1 接口列表

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/blog` | 获取文章列表 |
| GET | `/api/blog?id=xxx` | 获取单篇文章 |
| POST | `/api/blog` | 创建文章 |
| PUT | `/api/blog` | 更新文章 |
| DELETE | `/api/blog` | 删除文章 |

### 3.2 请求/响应格式

#### 创建文章 POST /api/blog
```json
// Request
{ "title": "标题", "content": "内容" }

// Response
{ "success": true, "data": { "id": "xxx", ... } }
```

#### 更新文章 PUT /api/blog
```json
// Request
{ "id": "xxx", "title": "新标题", "content": "新内容" }
```

#### 删除文章 DELETE /api/blog
```json
// Request
{ "id": "xxx" }
```

### 3.3 统一错误响应

```json
{ 
    "success": false, 
    "error": "错误信息",
    "code": "ERROR_CODE"  // 可选
}
```

**常见错误码:**
- `NOT_FOUND` - 文章不存在
- `FORBIDDEN` - 无权限操作
- `VALIDATION_ERROR` - 验证失败

---

## 4. 路由配置

**文件**: `app/routes/config/business.ts`

```typescript
export const businessRoutes = [
    route("blog", "routes/blog.index.tsx"),
    route("blog/new", "routes/blog.new.tsx"),
    route("blog/:id", "routes/blog.$id.tsx"),
    route("blog/:id/edit", "routes/blog.edit.$id.tsx"),
];
```

---

## 5. 导航配置

**文件**: `config/navigation.ts`

```typescript
{
    to: "/blog",
    icon: "FileText",  // ⚠️ 需先在 icons.tsx 添加此图标
    label: "nav.blog",
}
```

> **注意**: `FileText` 图标需在开发阶段添加到 `app/components/icons.tsx`

---

## 6. 多语言键

**文件**: `app/lib/i18n/types.ts` 及各语言文件

### 6.1 导航标签 (在 `nav` 对象中)

```typescript
nav: {
    // ... 现有键
    blog: string;  // 新增：侧边栏菜单显示
}
```

### 6.2 页面文本 (新增 `blog` 对象)

```typescript
blog: {
    title: string;
    newPost: string;
    editPost: string;
    deletePost: string;
    deleteConfirm: string;
    titleLabel: string;
    contentLabel: string;
    titlePlaceholder: string;
    contentPlaceholder: string;
    save: string;
    cancel: string;
    noContent: string;
    by: string;
};
```

---

## 7. 页面组件

> **SEO 要求**: 每个页面必须导出 `meta` 函数设置页面标题和描述

### 7.1 文章列表页 `blog.index.tsx`
- loader: 获取所有文章
- meta: `{ title: t.blog.title + APP_CONFIG.seo.titleSuffix }`
- 显示文章卡片列表
- "新建文章"按钮

### 7.2 文章详情页 `blog.$id.tsx`
- loader: 获取单篇文章
- meta: `{ title: post.title + APP_CONFIG.seo.titleSuffix }`
- 显示完整内容
- 作者可见编辑/删除按钮

### 7.3 新建文章页 `blog.new.tsx`
- meta: `{ title: t.blog.newPost + APP_CONFIG.seo.titleSuffix }`
- 表单: 标题 + 内容
- action: 调用创建 API

### 7.4 编辑文章页 `blog.edit.$id.tsx`
- loader: 获取文章数据
- meta: `{ title: t.blog.editPost + APP_CONFIG.seo.titleSuffix }`
- 表单: 预填充数据
- action: 调用更新 API

---

## 8. 需要修改的文件清单

### 8.1 底座扩展点 (预期修改 ✅)

| 文件 | 修改内容 |
|------|---------|
| `app/db/schema/business.ts` | 添加 post 表 |
| `app/routes/config/business.ts` | 添加 blog 路由 |
| `config/navigation.ts` | 添加 blog 菜单项 |
| `app/lib/i18n/types.ts` | 添加 blog 类型 |
| `app/lib/i18n/en.ts` | 添加英文翻译 |
| `app/lib/i18n/zh-CN.ts` | 添加中文翻译 |
| `app/lib/i18n/zh-TW.ts` | 添加繁中翻译 |
| `app/lib/i18n/ja.ts` | 添加日文翻译 |

### 8.2 新建文件 (预期新增 ✅)

| 文件 | 说明 |
|------|------|
| `app/routes/blog.index.tsx` | 列表页 |
| `app/routes/blog.$id.tsx` | 详情页 |
| `app/routes/blog.new.tsx` | 新建页 |
| `app/routes/blog.edit.$id.tsx` | 编辑页 |
| `app/routes/api.blog.tsx` | API 路由 |

### 8.3 底座核心 (禁止修改 ❌)

| 文件 | 原因 |
|------|------|
| `app/db/schema/auth.ts` | 认证核心 |
| `app/routes/config/auth.ts` | 认证路由 |
| `app/routes/config/dashboard.ts` | 仪表盘路由 |
| `app/lib/auth.*.ts` | 认证逻辑 |

---

## 9. 依赖分析

**需要的现有资源:**
- `user` 表 (作者关联)
- `useUser()` hook (获取当前用户)
- `useTranslation()` hook (多语言)
- shadcn/ui 组件 (Card, Button, Input, Textarea)
