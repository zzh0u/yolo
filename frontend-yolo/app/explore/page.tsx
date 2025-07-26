"use client"
import { CollectionTable } from "@/components/explore/collection-table";
import Timeline from "@/components/explore/timeline";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Home, PlusCircle, User, LogOut } from "lucide-react";
import GlassSurface from "@/components/react-bits/glass-surface";
import TextPressure from "@/components/react-bits/text-pressure";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";


export default function DiscoverPage() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#141416]">
        <div className="text-gray-300">Loading...</div>
      </div>
    )
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="flex flex-col h-auto w-screen bg-[#141416] text-gray-300">
      <div className="w-full h-42 flex items-center justify-center px-24">
        <TextPressure 
          text="You Only Live Once" 
          scale={false}
          italic={true}
        />
      </div>

    <div className="flex font-sans h-full">

      {/* 左侧 */}
      <Timeline />

      {/* 右侧 */}
      <div className="flex-1 flex flex-col p-6 py-12">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20}/>
              <Input placeholder="Search" className="w-80 pl-10 bg-transparent border-gray-700 focus:border-blue-500"/>
            </div>

            {/* 榜单选择 */}
            <Tabs defaultValue="top">
              <TabsList>
                <TabsTrigger value="top">Top</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* 用户信息和余额 */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-700 rounded-full px-4 py-2">
                <span className="text-gray-500">My Balance: 8000 YOLO</span>
              </div>
              
              {/* 用户邮箱和登出按钮 */}
              <div className="flex items-center gap-2 border border-gray-700 rounded-full px-4 py-2">
                <span className="text-gray-400 text-sm">{user?.email}</span>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white p-1 h-auto"
                >
                  <LogOut size={16} />
                </Button>
              </div>
            </div>
          </div>
        </header>
        <CollectionTable />
      </div>
      
      {/* 固定在右下角的按钮 */}
      <div className="fixed bottom-6 right-6 z-50 bg-gray-200 rounded-full text-black">
        <GlassSurface 
          className="w-auto h-16 rounded-full"
          brightness={200}

        >
          <div className="flex flex-row items-center justify-evenly gap-4 px-6">
            <Link href="/" className="flex flex-row items-center gap-2 px-3">
              <Home size={18} />
              <span>Intro</span>
            </Link>
            <Link href="/create" className="flex flex-row items-center gap-2 px-3">
              <PlusCircle size={18} />
              <span>Create</span>
            </Link>
            <Link href="/profile" className="flex flex-row items-center gap-2 px-3">
              <User size={18} />
              <span>Me</span>
            </Link>
          </div>
        </GlassSurface>
      </div>
    </div>
    </div>
  );
}
