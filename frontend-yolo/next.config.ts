import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 优化构建输出
  output: 'standalone',
  
  // 图片优化配置
  images: {
    domains: [],
    unoptimized: false,
  },
  
  // 实验性功能
  experimental: {
    // 启用 turbopack（开发时）
    turbo: {
      rules: {},
    },
  },
  
  // ESLint 配置
  eslint: {
    // 在构建时忽略 ESLint 错误（仅警告不会阻止构建）
    ignoreDuringBuilds: false,
  },
  
  // TypeScript 配置
  typescript: {
    // 在构建时忽略 TypeScript 错误（不推荐，但可以用于紧急部署）
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
