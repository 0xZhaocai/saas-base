import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths"; // 关键点 1：引入这个插件

const prebundleDeps = [
  "react",
  "react-dom",
  "react-router",
  "react-router/dom",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "isbot",
  "zod",
  "sonner",
  "class-variance-authority",
  "clsx",
  "tailwind-merge",
  "lucide-react",
];

export default defineConfig(() => ({
  plugins: [
    tsconfigPaths(), // 关键点：必须放在第一位！先解析路径别名，其他插件才能正确找到模块
    tailwindcss(),
    cloudflare(),   // Cloudflare 插件
    reactRouter(),  // React Router 插件
  ],
  resolve: {
    dedupe: ["react", "react-dom", "react-router"],
  },
  optimizeDeps: {
    include: prebundleDeps,
    // 扫描全量源码入口，尽量一次性收敛依赖，避免 Cloudflare runner-worker 在运行中遇到 pre-bundle hash 变更
    entries: ["app/**/*.{ts,tsx}", "workers/**/*.{ts,tsx}"],
    // 注意：之前将 Radix UI 排除在 optimizeDeps 外会导致客户端 hydration 后组件无法交互
    // 在 React 19 + Vite 7 环境下，不再需要这个排除配置
    holdUntilCrawlEnd: true,
    force: false,
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
}));
