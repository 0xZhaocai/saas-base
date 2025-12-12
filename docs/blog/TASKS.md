# 极简 Blog - 任务拆解

> 基于 [TECH_DESIGN.md](./TECH_DESIGN.md) 的开发任务清单

---

## 任务清单

### 阶段 1: 基础设施 (预计 5min)

| # | 任务 | 修改文件 | 状态 |
|---|------|---------|------|
| 1.1 | 添加 post 表定义 | `app/db/schema/business.ts` | [x] |
| 1.2 | 导出 post 表 | `app/db/schema/index.ts` | [x] |
| 1.3 | 添加 blog 路由配置 | `app/routes/config/business.ts` | [x] |
| 1.4 | 添加 blog 导航菜单 | `config/navigation.ts` | [x] |

### 阶段 2: 多语言 (预计 10min)

| # | 任务 | 修改文件 | 状态 |
|---|------|---------|------|
| 2.1 | 添加 blog 类型定义 | `app/lib/i18n/types.ts` | [x] |
| 2.2 | 添加英文翻译 | `app/lib/i18n/en.ts` | [x] |
| 2.3 | 添加简中翻译 | `app/lib/i18n/zh-CN.ts` | [x] |
| 2.4 | 添加繁中翻译 | `app/lib/i18n/zh-TW.ts` | [x] |
| 2.5 | 添加日文翻译 | `app/lib/i18n/ja.ts` | [x] |

### 阶段 3: API 开发 (预计 10min)

| # | 任务 | 新建文件 | 状态 |
|---|------|---------|------|
| 3.1 | 创建 Blog API | `app/routes/api.blog.tsx` | [x] |

### 阶段 4: 页面开发 (预计 20min)

| # | 任务 | 新建文件 | 状态 |
|---|------|---------|------|
| 4.1 | 创建文章列表页 | `app/routes/blog.index.tsx` | [x] |
| 4.2 | 创建文章详情页 | `app/routes/blog.$id.tsx` | [x] |
| 4.3 | 创建新建文章页 | `app/routes/blog.new.tsx` | [x] |
| 4.4 | 创建编辑文章页 | `app/routes/blog.edit.$id.tsx` | [x] |

### 阶段 5: 验证 (预计 5min)

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 5.1 | 运行数据库迁移 | `npx drizzle-kit push` | [x] |
| 5.2 | 类型检查 | `npm run typecheck` | [x] |
| 5.3 | 功能测试 | 手动测试 CRUD | [x] |

### 阶段 6: 架构验证 (预计 5min)

| # | 任务 | 说明 | 状态 |
|---|------|------|------|
| 6.1 | 统计修改的底座文件 | 预期: 仅扩展点 | [x] |
| 6.2 | 评估开发体验 | 参照开发指南 | [x] |
| 6.3 | 创建总结报告 | `docs/blog/SUMMARY.md` | [x] |

---

## 预计总工时

| 阶段 | 预计时间 |
|------|---------|
| 基础设施 | 5 min |
| 多语言 | 10 min |
| API 开发 | 10 min |
| 页面开发 | 20 min |
| 验证 | 5 min |
| 架构验证 | 5 min |
| **总计** | **55 min** |

---

## 开发顺序

```
1. 基础设施 → 2. 多语言 → 3. API → 4. 页面 → 5. 验证 → 6. 报告
```
