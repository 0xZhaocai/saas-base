// app/db/schema/index.ts
// Schema 统一导出入口

// 认证表 (底座核心 - 请勿修改)
export {
    user,
    session,
    account,
    verification,
} from "./auth";

export type {
    User,
    NewUser,
    Session,
    Account,
    Verification,
} from "./auth";

// 业务表 (可扩展 - 自由修改)
export { post } from "./business";
export type { Post, NewPost } from "./business";
