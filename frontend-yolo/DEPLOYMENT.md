# YOLO Frontend 部署指南

## 部署前准备

### 1. 环境变量配置
在 Vercel 部署时，需要配置以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. 部署到 Vercel

#### 方法一：通过 Vercel CLI
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel

# 设置环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# 重新部署以应用环境变量
vercel --prod
```

#### 方法二：通过 Vercel Dashboard
1. 访问 [vercel.com](https://vercel.com)
2. 连接你的 GitHub 仓库
3. 在项目设置中添加环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 触发重新部署

### 3. 已解决的部署问题

✅ **修复了空的 share/page.tsx 文件**
- 添加了基本的页面组件

✅ **修复了 CardSwap.tsx 中的 TypeScript 错误**
- 解决了 CardCloneProps 类型问题

✅ **修复了 login/page.tsx 中的 useSearchParams 问题**
- 使用 Suspense 包装组件以符合 Next.js 15 要求

✅ **优化了 Next.js 配置**
- 添加了适合 Vercel 部署的配置选项

✅ **创建了 Vercel 配置文件**
- 优化了构建和部署设置

### 4. 项目结构优化

- ✅ 所有 TypeScript 错误已修复
- ✅ 构建成功通过
- ✅ 静态页面生成正常
- ✅ 中间件配置正确

### 5. 性能优化

项目已配置以下优化：
- 静态页面预渲染
- 代码分割和懒加载
- 图片优化
- 构建输出优化

### 6. 注意事项

1. **环境变量安全**：确保不要在代码中硬编码敏感信息
2. **Supabase 配置**：确保 Supabase 项目的 URL 和密钥正确
3. **域名配置**：部署后需要在 Supabase 中添加 Vercel 域名到允许的重定向 URL

### 7. 部署后验证

部署完成后，请验证以下功能：
- [ ] 首页加载正常
- [ ] 用户登录/注册功能
- [ ] 页面路由正常
- [ ] Supabase 连接正常
- [ ] 所有静态资源加载正常

## 故障排除

如果遇到部署问题，请检查：
1. Vercel 构建日志
2. 环境变量是否正确设置
3. Supabase 配置是否正确
4. 域名是否在 Supabase 允许列表中

## 联系支持

如果遇到其他问题，可以：
1. 查看 Vercel 文档
2. 检查 Next.js 15 迁移指南
3. 查看 Supabase 文档