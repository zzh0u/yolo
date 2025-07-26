'use client'
// Landing Page
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoginModal } from '@/signin/components/login/modal';
import { useSession, signOut } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <div className="flex items-start justify-start h-screen bg-black p-4">
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
          <Button variant="outline" className="bg-white text-black border-white hover:bg-gray-200 hover:text-black" onClick={() => setIsOpen(true)}>Login</Button>
          <LoginModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
      )}
    </div>
  );
}