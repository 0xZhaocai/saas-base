# Development Guide

This guide helps developers efficiently and consistently build new features on the SaaS base.

> [!IMPORTANT]
> **Read Before Development**: Please read this guide carefully. Following these conventions can prevent 90% of common errors.

---

## 🧱 New Project Setup (with Database)

> [!TIP]
> This base is built on Cloudflare Workers + D1 + Drizzle. When starting a new project, you must initialize D1 and apply migrations first,
> otherwise you'll encounter errors like `no such table: verification` during login/auth.

1) Install dependencies
```bash
npm install
```

2) Configure local environment variables
```bash
cp .dev.vars.example .dev.vars
# Edit .dev.vars, ensure BETTER_AUTH_URL matches your dev server port
```

3) Create and bind D1 (once per new project)
```bash
npx wrangler d1 create <db-name> --config wrangler.jsonc
# Add the returned database_name / database_id to wrangler.jsonc d1_databases (keep binding as DB)
```

4) Apply database migrations
```bash
# Local development: Initialize local D1
npm run db:local:push

# Before deployment: Sync migrations to remote D1
npm run db:remote:push
```

5) Start development server
```bash
npm run dev
```

---

## 📋 Development Checklist

### Before Each Commit

- [ ] **Internationalization**: All user-visible text uses `t.xxx` translation keys
- [ ] **Type Safety**: Run `npm run typecheck` with no errors
- [ ] **Unified Config**: Brand name, links, etc. read from `config/app.ts`
- [ ] **No Hardcoding**: No Chinese/English strings directly in JSX
- [ ] **Icon Exists**: Navigation icons are defined in `icons.tsx`

---

## 🚀 Common Development Scenarios

### 1. Adding a New Business Page

```bash
# 1. Create page file
touch app/routes/analytics.tsx
```

```typescript
// Basic page template (with SEO meta)
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
// 2. Add route - edit app/routes/config/business.ts
export const businessRoutes = [
    route("analytics", "routes/analytics.tsx"),
];
```

```typescript
// 3. Add navigation menu - edit config/navigation.ts
{
    to: "/analytics",
    icon: "BarChart",  // ⚠️ Must confirm icon exists
    label: "nav.analytics",  // ⚠️ Must add translation key
}
```

> [!NOTE]
> **Icon Check**: Ensure the `icon` value is defined in `app/components/icons.tsx`.
> If you need a new icon, add it to `icons.tsx` first before using.

```typescript
// 4. Add translations - All language files must be updated!
// app/lib/i18n/en.ts
nav: {
    analytics: 'Analytics',  // Add
}
// app/lib/i18n/zh-CN.ts
nav: {
    analytics: '数据分析',  // Add
}
// ... other language files (fr.ts, ko.ts, es.ts, etc.)
```

---

### 2. Adding New Text Content

> [!CAUTION]
> **Absolutely forbidden** to write text strings directly in JSX!

❌ **Wrong**:
```tsx
<Button>Submit</Button>
<span>Loading...</span>
```

✅ **Correct**:
```tsx
// 1. First add types in i18n/types.ts
common: {
    submit: string;
    loading: string;
}

// 2. Add translations in all language files
// en.ts
submit: 'Submit',
loading: 'Loading...',

// zh-CN.ts  
submit: '提交',
loading: '加载中...',

// 3. Use in component
<Button>{t.common.submit}</Button>
<span>{t.common.loading}</span>
```

---

### 3. Adding New Language Support

```bash
# 1. Copy template
cp app/lib/i18n/en.ts app/lib/i18n/ko.ts
```

```typescript
// 2. Add type - app/lib/i18n/types.ts
export type Language = 'en' | 'zh-CN' | 'zh-TW' | 'ja' | 'fr' | 'ko' | 'es';
```

```typescript
// 3. Register language - app/lib/i18n/index.ts
import { ko } from './ko';

export const TRANSLATIONS: Record<Language, I18nContent> = {
    en, 'zh-CN': zhCN, 'zh-TW': zhTW, ja, fr, ko, es,
};
```

---

### 4. Adding New Database Tables

```typescript
// Add table definition in app/db/schema/business.ts
import { nanoid } from 'nanoid';  // npm i nanoid

export const post = sqliteTable("post", {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),  // ⚠️ Auto-generate ID
    title: text("title").notNull(),
    authorId: text("author_id").references(() => user.id),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull().$defaultFn(() => new Date()),
});

export type Post = typeof post.$inferSelect;
```

```typescript
// Optional: Add form validation (Zod)
import { z } from 'zod';

export const postSchema = z.object({
    title: z.string().min(1).max(100),
    content: z.string().min(1),
});
```

```bash
# Run migrations (apply schema changes to D1)
# Local D1:
npm run db:local:push

# Remote D1 (before deployment):
npm run db:remote:push

# Optional: Use drizzle-kit directly (requires DB binding in wrangler.jsonc)
# npx drizzle-kit push
```

---

### 5. Modifying App Configuration

Just modify `config/app.ts`:

```typescript
export const APP_CONFIG = {
    name: "My SaaS",           // App name
    description: "...",        // SEO description
    features: {
        googleLogin: true,     // Feature toggles
    },
};
```

---

## ⚠️ Common Errors

### 1. Forgot to Add Translations

**Symptom**: Page shows blank or `undefined`

**Check**: 
- Is the type defined in `app/lib/i18n/types.ts`?
- Have all 7 language files been updated with the translation?

### 2. Wrong Configuration Reading

**Wrong**:
```tsx
const appName = "Your SaaS Name";  // Hardcoded
```

**Correct**:
```tsx
import { APP_CONFIG } from "@config";
const appName = APP_CONFIG.name;
```

### 3. Modified Base Core Files

**Base Core (Do Not Modify)**:
- `app/db/schema/auth.ts`
- `app/routes/config/auth.ts`
- `app/routes/config/dashboard.ts`

**Modifiable Files**:
- `app/db/schema/business.ts`
- `app/routes/config/business.ts`
- `config/navigation.ts`

---

## 📁 Directory Structure Reference

```
config/                 # ⚙️ App configuration
├── app.ts              # Name, brand, feature toggles
└── navigation.ts       # Navigation menu

app/lib/i18n/           # 🌍 Internationalization
├── types.ts            # Type definitions (edit first)
├── en.ts               # English
├── zh-CN.ts            # Simplified Chinese
├── zh-TW.ts            # Traditional Chinese
├── ja.ts               # Japanese
├── fr.ts               # French
├── ko.ts               # Korean
└── es.ts               # Spanish

app/db/schema/          # 🗄️ Database
├── auth.ts             # Auth tables ❌ Do not modify
└── business.ts         # Business tables ✅ Modifiable

app/routes/config/      # 🛣️ Routes
├── auth.ts             # Auth routes ❌ Do not modify
├── dashboard.ts        # Dashboard routes ❌ Do not modify
└── business.ts         # Business routes ✅ Modifiable
```

---

## 🔧 Common Commands

```bash
# Type check (must pass)
npm run typecheck

# Local development
npm run dev

# Deploy
npm run deploy

# Database migrations (see "New Project Setup/Adding Database Tables")
# Local:
npm run db:local:push
# Remote:
npm run db:remote:push
```

---

## ✨ Best Practices Checklist

### Technical Design Phase

- [ ] **ID Generation**: Use `nanoid` to auto-generate unique IDs
- [ ] **Form Validation**: Use Zod schemas to validate user input
- [ ] **Error Handling**: Define unified error response format
- [ ] **SEO meta**: Export `meta` function for each page

### i18n Structure

Separate navigation labels from page text:
```typescript
// Navigation labels (sidebar menu)
nav: {
    blog: 'Blog',
}

// Page text (standalone module)
blog: {
    title: 'Blog',
    newPost: 'New Post',
    // ...
}
```

### API Response Format

```typescript
// Success response
{ success: true, data: {...} }

// Error response
{ success: false, error: 'Error message', code: 'ERROR_CODE' }
```

---

## 📞 Need Help?

1. Check other documents in the `docs/` directory
2. Check feature toggles in `config/app.ts`
3. Run `npm run typecheck` to see specific errors
4. Refer to the `docs/blog/` example module
