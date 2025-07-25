"use client"
import Lightning from "@/components/react-bits/lighting"
import TargetCursor from "@/components/react-bits/target-cursor"
import Navbar from "@/components/navbar"
import { useRouter } from "next/navigation"

export default function Landing() {
    const router = useRouter()

    const handleCreate = () => {
        router.push("/create")
    }

    const handleExplore = () => {
        router.push("/explore")
    }

    return (
        <div className="relative w-screen h-screen overflow-hidden">
            <Navbar />

            {/* Lightning 背景 */}
            <div className="absolute inset-0 z-0">
                <Lightning 
                    hue={360} 
                    xOffset={-0.7}
                />
            </div>
            
            {/* 页面内容 */}
            <div className="relative z-10 flex flex-row items-center justify-evenly h-full">
                {/* 左侧 */}
                <div className="flex flex-col items-start justify-center w-1/2 gap-4">
                    <h1 className="text-6xl font-bold text-white">
                      Your Growth is also a Stock
                    </h1>
                    <h2 className="text-2xl text-gray-300">Every step forward is already worth holding.</h2>
                    <div className="flex flex-row items-center justify-center">
                        <TargetCursor 
                            spinDuration={2}
                            hideDefaultCursor={true}
                        />
                        
                        <button onClick={handleCreate} className="cursor-target px-6 py-12 bg-white text-black text-2xl font-semibold rounded-md my-8 mr-4 hover:bg-opacity-90 transition-all shadow-lg transform hover:scale-105">
                            Create my YOLO stock
                        </button>

                        <button onClick={handleExplore} className="cursor-target px-6 py-6 bg-transparent border-2 border-white text-white font-semibold rounded-md my-8 hover:bg-red-500 hover:bg-opacity-10 transition-all shadow-lg transform hover:scale-105">
                            Explore the Market
                        </button>
                    </div>
                </div>

                {/* 右侧 */}
                <div className="flex flex-col items-center justify-center">
                </div>
            </div>
        </div>
    )
}