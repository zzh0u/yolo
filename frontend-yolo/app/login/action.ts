'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function login(formData: FormData) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/', 'layout')
  redirect('/explore')
}

export async function signup(formData: FormData) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    throw new Error(error.message)
  }

  // 如果注册成功且有用户ID，为用户分配初始 YOLO 币余额
  if (authData.user?.id) {
    try {
      // 尝试为新用户创建初始余额记录
      const { error: balanceError } = await supabase
        .from('user_balances')
        .insert({
          user_id: authData.user.id,
          balance: 8000.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (balanceError) {
        // 如果 user_balances 表不存在，记录警告但不影响注册流程
        console.warn('无法创建用户余额记录，可能是因为 user_balances 表不存在:', balanceError.message)
      } else {
        console.log(`成功为用户 ${authData.user.id} 分配 8000 YOLO 币`)
      }
    } catch (balanceError) {
      // 余额分配失败不应该影响注册流程
      console.warn('分配初始余额时发生错误:', balanceError)
    }
  }

  revalidatePath('/', 'layout')
  redirect(`/login?message=signup-success&email=${encodeURIComponent(data.email)}`)
}