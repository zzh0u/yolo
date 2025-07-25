"use client"
import { CategoryFilter } from "@/components/explore/category-filter";
import { CollectionTable } from "@/components/explore/collection-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Home, Compass, PlusCircle, User } from "lucide-react";
import GlassSurface from "@/components/react-bits/glass-surface";
import Link from "next/link";


export default function DiscoverPage() {
  return (
    <div className="flex bg-[#141416] text-gray-300 min-h-screen font-sans">
      <CategoryFilter />
      <div className="flex-1 flex flex-col p-6">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20}/>
              <Input placeholder="Search collections" className="w-80 pl-10 bg-transparent border-gray-700 focus:border-blue-500"/>
            </div>
            <Tabs defaultValue="top">
              <TabsList>
                <TabsTrigger value="top">Top</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="sm">All</Button>
             <Button variant="ghost" size="sm">30d</Button>
             <Button variant="secondary" size="sm">7d</Button>
             <Button variant="ghost"size="sm">1d</Button>
             <Button variant="ghost" size="sm">1h</Button>
             <Button variant="ghost" size="sm">15m</Button>
             <Button variant="ghost" size="sm">5m</Button>
             <Button variant="ghost" size="sm">1m</Button>
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
  );
}
