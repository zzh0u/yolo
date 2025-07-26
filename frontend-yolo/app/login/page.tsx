'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { login, signup } from '@/app/login/action'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// 极简黑白风格弹窗组件
function SuccessModal({ isOpen, onConfirm }: { isOpen: boolean; onConfirm: () => void }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-80 p-8 shadow-2xl">
        <div className="text-center">
          {/* 成功图标 */}
          <div className="w-16 h-16 mx-auto mb-6 bg-black rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          
          {/* 标题 */}
          <h2 className="text-xl font-light text-black mb-2">
            Login Successful
          </h2>
          
          {/* 描述 */}
          <p className="text-gray-500 text-sm font-light mb-8">
            Welcome back! You will be redirected to explore.
          </p>
          
          {/* 确认按钮 */}
          <Button
            onClick={onConfirm}
            className="w-full h-12 bg-black hover:bg-gray-800 text-white font-light text-base rounded-none border-0 transition-colors duration-300"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const message = searchParams.get('message')
    const emailParam = searchParams.get('email')
    
    if (message === 'signup-success') {
      setIsLogin(true) // 切换到登录模式
      setShowSuccessMessage(true)
      
      // 如果有邮箱参数，自动填写
      if (emailParam) {
        setEmail(emailParam)
      }
      
      // 3秒后隐藏成功消息
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 3000)
    }
  }, [searchParams])

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError('')
    
    try {
      if (isLogin) {
        const result = await login(formData)
        if (result?.success) {
          setShowSuccessModal(true)
        }
      } else {
        await signup(formData)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false)
    router.push('/explore')
  }

  const handleModeSwitch = () => {
    setIsLogin(!isLogin)
    setShowSuccessMessage(false) // 切换模式时隐藏成功消息
    setError('') // 清除错误消息
    // 切换模式时清空表单
    if (!isLogin) {
      setEmail('')
      setPassword('')
    }
  }

  return (
    <>
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-full max-w-sm mx-auto">
          {/* Success Message */}
          {showSuccessMessage && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-green-800 text-sm font-light">
                Registration successful! Please sign in with your credentials.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
              <p className="text-red-800 text-sm font-light">
                {error}
              </p>
            </div>
          )}

          {/* Logo/Brand */}
          <div className="text-center mb-16">
            <div className="w-16 h-16 mx-auto mb-8 bg-black rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-white rounded-full"></div>
            </div>
            <h1 className="text-2xl font-light text-black tracking-wide">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </h1>
          </div>

          {/* Form */}
           <form action={handleSubmit} className="space-y-8">
             <div>
               <Input
                 id="email"
                 name="email"
                 type="email"
                 placeholder="Email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
                 className="w-full h-12 px-0 border-0 border-b border-gray-300 rounded-none bg-transparent text-black placeholder:text-gray-400 focus:border-black focus:ring-0 focus:outline-none transition-colors duration-300 text-base font-light"
               />
             </div>
             
             <div>
               <Input
                 id="password"
                 name="password"
                 type="password"
                 placeholder="Password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
                 className="w-full h-12 px-0 border-0 border-b border-gray-300 rounded-none bg-transparent text-black placeholder:text-gray-400 focus:border-black focus:ring-0 focus:outline-none transition-colors duration-300 text-base font-light"
               />
             </div>

             <div className="pt-8">
               <Button
                 type="submit"
                 disabled={isLoading}
                 className="w-full h-12 bg-black hover:bg-gray-800 text-white font-light text-base rounded-none border-0 transition-colors duration-300 disabled:opacity-50"
               >
                 {isLoading ? (
                   <div className="flex items-center justify-center">
                     <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                     {isLogin ? 'Signing In...' : 'Signing Up...'}
                   </div>
                 ) : (
                   isLogin ? 'Sign In' : 'Sign Up'
                 )}
               </Button>
             </div>
           </form>

           {/* Switch Mode */}
           <div className="mt-12 text-center">
             <button
               type="button"
               onClick={handleModeSwitch}
               className="text-gray-500 hover:text-black transition-colors duration-300 text-sm font-light"
             >
               {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
             </button>
           </div>

          {/* Footer */}
          <div className="mt-16 text-center">
            <p className="text-xs text-gray-400 font-light">
              By continuing, you agree to our{' '}
              <a href="#" className="text-black hover:underline">
                Terms
              </a>{' '}
              and{' '}
              <a href="#" className="text-black hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal 
        isOpen={showSuccessModal} 
        onConfirm={handleSuccessConfirm}
      />
    </>
  )
}