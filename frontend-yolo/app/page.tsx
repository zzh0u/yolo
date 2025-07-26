'use client'
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoginModal } from '@/signin/components/login/modal';
import { useSession, signOut } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Lightning from "@/components/react-bits/lighting"
import TargetCursor from "@/components/react-bits/target-cursor"
import Navbar from "@/components/navbar"
import { useRouter } from "next/navigation"

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter()

  const handleCreate = () => { router.push("/create") }
  const handleExplore = () => { router.push("/explore") }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Navbar />
      <div className="absolute inset-0 z-0">
        <Lightning hue={360} xOffset={-0.7} />
      </div>
      <div className="relative z-10 flex flex-row items-center justify-evenly h-full">
        <div className="flex flex-col items-start justify-center w-1/2 gap-4">
          <h1 className="text-6xl font-bold text-white">Your Growth is also a Stock</h1>
          <h2 className="text-2xl text-gray-300">Every step forward is already worth holding.</h2>
          <div className="flex flex-row items-center justify-center">
            <TargetCursor spinDuration={2} hideDefaultCursor={true} />
            {session ? (
              <Card className="w-[350px] bg-gray-800 text-white">
                <CardHeader>
                  <CardTitle>欢迎回来</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={session.user?.avatar_url} alt="@user" />
                      <AvatarFallback>{session.user?.nickname?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-lg font-medium">{session.user?.nickname}</p>
                      <p className="text-sm text-gray-400">{session.user?.email}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => signOut()} 
                    className="mt-4 w-full bg-red-600 hover:bg-red-700"
                  >
                    登出
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <button onClick={handleCreate} className="cursor-target px-6 py-12 bg-white text-black text-2xl font-semibold rounded-md my-8 mr-4 hover:bg-opacity-90 transition-all shadow-lg transform hover:scale-105">Create my YOLO stock</button>
                <button onClick={() => setIsOpen(true)} className="cursor-target px-6 py-6 bg-transparent border-2 border-white text-white font-semibold rounded-md my-8 hover:bg-red-500 hover:bg-opacity-10 transition-all shadow-lg transform hover:scale-105">Login</button>
                <LoginModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
              </>
            )}
            <button onClick={handleExplore} className="cursor-target px-6 py-6 bg-transparent border-2 border-white text-white font-semibold rounded-md my-8 hover:bg-red-500 hover:bg-opacity-10 transition-all shadow-lg transform hover:scale-105">Explore the Market</button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center"></div>
      </div>
    </div>
  );
}