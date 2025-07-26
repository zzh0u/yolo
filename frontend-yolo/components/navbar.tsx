"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import GlassSurface from "@/components/react-bits/glass-surface";
import { PlusCircle, Compass } from "lucide-react";
import AvatarWithFallback from "@/components/ui/avatar-with-fallback";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const isActive = (path: string) => {
    return pathname === path ? "font-bold" : "";
  };

  return (
        <GlassSurface 
            width={"80%"}
            height={60}
            borderRadius={50}
            className="flex flex-rowitems-center justify-evenly px-4 absolute top-12 left-1/2 -translate-x-1/2 z-50"
        >
        {/* 左侧 */}
        <div className="flex w-full flex-row items-center justify-between px-4">
        <div className="flex items-center justify-center">
            <Link href="/" className="text-xl font-bold text-white flex items-center gap-2">
              YOLO
            </Link>
        </div>
        
        {/* 右侧 */}
        <div className="flex space-x-6">
          <Link href="/create" className={`text-white hover:text-gray-300 transition-colors flex items-center gap-1 ${isActive("/create")}`}>
            <PlusCircle size={18} />
            Create
          </Link>
          <Link href="/explore" className={`text-white hover:text-gray-300 transition-colors flex items-center gap-1 ${isActive("/demo")}`}>
            <Compass size={18} />
            Discover
          </Link>
          <Link href="/profile" className={`text-white hover:text-gray-300 transition-colors flex items-center gap-1 ${isActive("/me")}`}>
            <AvatarWithFallback
              src={user?.user_metadata?.avatar_url}
              name={user?.user_metadata?.full_name || user?.email || 'User'}
              alt="User avatar"
              size={24}
            />
            Me
          </Link>
        </div>
        </div>
        </GlassSurface>
  );
}