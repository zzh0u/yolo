"use client"
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Edit2, Save, X, Home, PlusCircle, User, LogOut } from "lucide-react";
import GlassSurface from "@/components/react-bits/glass-surface";
import TextPressure from "@/components/react-bits/text-pressure";
import Link from "next/link";

export default function Profile() {
  const { user, loading, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState("Steve Jobs");
  const [bio, setBio] = useState("Think Different");
  const [tempNickname, setTempNickname] = useState(nickname);
  const [tempBio, setTempBio] = useState(bio);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#141416]">
        <div className="text-gray-300">Loading...</div>
      </div>
    );
  }

  const handleEdit = () => {
    setTempNickname(nickname);
    setTempBio(bio);
    setIsEditing(true);
  };

  const handleSave = () => {
    setNickname(tempNickname);
    setBio(tempBio);
    setIsEditing(false);
    // 这里可以添加保存到后端的逻辑
  };

  const handleCancel = () => {
    setTempNickname(nickname);
    setTempBio(bio);
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#141416] text-gray-300">
      {/* 顶部标题 */}
      <div className="w-full h-42 flex items-center justify-center px-24">
        <TextPressure 
          text="You Only Live Once" 
          scale={false}
          italic={true}
        />
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-[#1a1a1c] border-gray-700 p-8">
          <div className="flex flex-col items-center space-y-6">
            {/* 头像 */}
            <div className="relative">
              <Avatar className="size-32 border-4 border-gray-600">
                <AvatarImage src="/img/jobs.png" />
                <AvatarFallback className="text-2xl bg-gray-700">SJ</AvatarFallback>
              </Avatar>
            </div>

            {/* 用户信息 */}
            <div className="w-full space-y-4">
              {/* 昵称 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">昵称</label>
                {isEditing ? (
                  <Input
                    value={tempNickname}
                    onChange={(e) => setTempNickname(e.target.value)}
                    className="bg-transparent border-gray-600 focus:border-blue-500 text-center"
                    placeholder="输入昵称"
                  />
                ) : (
                  <div className="text-xl font-bold text-center text-white">
                    {nickname}
                  </div>
                )}
              </div>

              {/* 邮箱 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">邮箱</label>
                <div className="text-center text-gray-300">
                  {user?.email || "未登录"}
                </div>
              </div>

              {/* 个人简介 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">个人简介</label>
                {isEditing ? (
                  <Input
                    value={tempBio}
                    onChange={(e) => setTempBio(e.target.value)}
                    className="bg-transparent border-gray-600 focus:border-blue-500 text-center"
                    placeholder="输入个人简介"
                  />
                ) : (
                  <div className="text-center text-gray-300">
                    {bio}
                  </div>
                )}
              </div>

              {/* 余额显示 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">余额</label>
                <div className="text-center text-green-400 font-semibold">
                  8000 YOLO
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="w-full space-y-3">
              {isEditing ? (
                <div className="flex gap-3">
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save size={16} />
                    保存
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <X size={16} />
                    取消
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleEdit}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white"
                >
                  <Edit2 size={16} />
                  编辑资料
                </Button>
              )}

              <Button
                onClick={handleSignOut}
                variant="destructive"
                className="w-full"
              >
                <LogOut size={16} />
                退出登录
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* 固定在右下角的导航按钮 */}
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
            <Link href="/profile" className="flex flex-row items-center gap-2 px-3 bg-black/20 rounded-full">
              <User size={18} />
              <span>Me</span>
            </Link>
          </div>
        </GlassSurface>
      </div>
    </div>
  );
}