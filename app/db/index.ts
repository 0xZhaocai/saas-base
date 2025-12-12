// app/db/index.ts
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// 这个函数以后我们在每个 API 里都会用到
// env 是 Cloudflare 的环境变量，包含数据库绑定
export const getDb = (env: any) => {
  return drizzle(env.DB, { schema });
};
