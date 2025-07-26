import { createClient } from '@/lib/supabase'

// 获取当前用户信息
export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  
  return user
}

// 获取用户 session
export async function getSession() {
  const supabase = createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Error getting session:', error)
    return null
  }
  
  return session
}

// 检查用户是否已认证
export async function isAuthenticated() {
  const user = await getCurrentUser()
  return !!user
}

// 登出
export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

// 获取访问令牌
export async function getAccessToken() {
  const session = await getSession()
  return session?.access_token || null
}