# YOLO 认证系统使用指南

## 概述

本项目使用 Supabase 作为认证服务，提供了完整的用户认证和会话管理功能。

## 文件结构

```
lib/
├── supabase.ts          # 客户端 Supabase 实例
└── auth.ts              # 认证工具函数

contexts/
└── AuthContext.tsx      # 认证上下文

middleware.ts            # 路由保护中间件
```

## 主要功能

### 1. 认证上下文 (AuthContext)

提供全局的用户状态管理：

```tsx
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, loading, signOut } = useAuth()
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### 2. 认证工具函数

在 `lib/auth.ts` 中提供的便捷函数：

```tsx
import { getCurrentUser, getSession, isAuthenticated, getAccessToken } from '@/lib/auth'

// 获取当前用户
const user = await getCurrentUser()

// 获取会话信息
const session = await getSession()

// 检查是否已认证
const isAuth = await isAuthenticated()

// 获取访问令牌
const token = await getAccessToken()
```

### 3. 路由保护

中间件自动保护以下路由：
- `/explore` - 需要登录
- `/create` - 需要登录  
- `/profile` - 需要登录

未登录用户访问这些路由会自动重定向到 `/login`。

### 4. 在组件中使用认证

#### 获取用户信息
```tsx
'use client'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please login</div>
  
  return (
    <div>
      <h1>Profile</h1>
      <p>Email: {user.email}</p>
      <p>User ID: {user.id}</p>
    </div>
  )
}
```

#### 条件渲染
```tsx
function Navigation() {
  const { user, signOut } = useAuth()
  
  return (
    <nav>
      {user ? (
        <div>
          <span>Welcome, {user.email}</span>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <Link href="/login">Sign In</Link>
      )}
    </nav>
  )
}
```

### 5. API 调用中使用认证

```tsx
import { getAccessToken } from '@/lib/auth'

async function fetchUserData() {
  const token = await getAccessToken()
  
  const response = await fetch('/api/user-data', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  return response.json()
}
```

### 6. 服务端组件中的认证

```tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function ServerComponent() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>Please login</div>
  }
  
  return <div>Welcome, {user.email}</div>
}
```

## 环境变量

确保在 `.env.local` 中设置以下环境变量：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 注意事项

1. **客户端 vs 服务端**: 
   - 客户端组件使用 `useAuth()` hook
   - 服务端组件使用 `createServerClient`

2. **中间件保护**: 
   - 自动处理路由保护
   - 已登录用户访问 `/login` 会重定向到 `/explore`

3. **会话持久化**: 
   - Supabase 自动处理会话持久化
   - 刷新页面不会丢失登录状态

4. **错误处理**: 
   - 所有认证函数都包含错误处理
   - 建议在使用时添加 try-catch

## 示例：完整的受保护页面

```tsx
'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { getAccessToken } from '@/lib/auth'

export default function ProtectedPage() {
  const { user, loading } = useAuth()
  const [data, setData] = useState(null)
  
  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])
  
  const fetchData = async () => {
    try {
      const token = await getAccessToken()
      const response = await fetch('/api/protected-data', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Unauthorized</div>
  
  return (
    <div>
      <h1>Protected Content</h1>
      <p>User: {user.email}</p>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  )
}
```