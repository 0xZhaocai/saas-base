// app/db/schema/business.ts
// 业务扩展表 - 在此添加您的业务相关表
// 新增业务模块时，在此文件添加表定义即可

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import { user } from "./auth";

/**
 * ========================================
 * Blog 模块 - 文章表
 * ========================================
 */
export const post = sqliteTable("post", {
    id: text("id").primaryKey().$defaultFn(() => nanoid()),
    title: text("title").notNull(),
    content: text("content").notNull(),
    authorId: text("author_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Post = typeof post.$inferSelect;
export type NewPost = typeof post.$inferInsert;

/**
 * ========================================
 * 在下方添加更多业务表
 * ========================================
 */
