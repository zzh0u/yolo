'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getSupabaseClient } from '@/models/db'

export async function login(formData: FormData) {
  const supabase = await getSupabaseClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signup(formData: FormData) {
  const supabase = await getSupabaseClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect(`/login?message=signup-success&email=${encodeURIComponent(data.email)}`)
}