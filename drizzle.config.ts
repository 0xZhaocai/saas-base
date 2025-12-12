import type { Config } from "drizzle-kit";

export default {
  out: "./drizzle",
  schema: "./app/db/schema.ts",
  dialect: "sqlite",
  driver: "d1-http", // 关键：告诉 Drizzle 我们用的是 D1
} satisfies Config;

