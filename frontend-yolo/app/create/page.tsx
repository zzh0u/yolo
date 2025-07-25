'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Stepper, { Step } from './components/Stepper';
import CardSwap, { Card } from './components/CardSwap';
import Beams from './components/Beams';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
const center = 'flex items-center justify-center';

export default function CreatePage() {
  const router = useRouter();
  const [tokenName, setTokenName] = useState('');
  const [story, setStory] = useState('');

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen text-white">
      {/* 主要内容区域 - 响应式布局 */}
      <div className="min-h-screen flex flex-col xl:flex-row">
        
        {/* 左侧 Stepper - 响应式 */}
        <div className={cn(center,'flex-1 xl:flex-none xl:w-[40%] relative overflow-hidden') }>
          {/* 左侧 3D 背景 */}
          <div className="absolute inset-0 z-0">
            <Beams beamWidth={1.2} beamHeight={18} beamNumber={8} lightColor="#ffffff" speed={1.2} noiseIntensity={1.2} scale={0.22} rotation={0} />
            {/* 左侧暗化遮罩 */}
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Stepper 前景 */}
          <div className="relative z-10 w-full max-w-xl p-8 lg:p-14">
            <Stepper
              initialStep={1}
              onStepChange={(step) => console.log(step)}
              onFinalStepCompleted={() => console.log("Stepper Completed")}
              backButtonText="上一步"
              nextButtonText="下一步"
            >
              {/* Step 1 */}
              <Step>
                <h2 className="text-2xl font-extrabold mb-4">1. 为你的社交货币命名</h2>
                <input
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  placeholder="输入币种名称，如 YOLOTOKEN"
                  className="w-full px-4 py-3 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </Step>

              {/* Step 2 */}
              <Step>
                <h2 className="text-2xl font-extrabold mb-4">2. 分享你的 star 经历</h2>
                <textarea
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  rows={5}
                  placeholder="描述一次让你收获点赞或关注的经历..."
                  className="w-full px-4 py-3 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </Step>

              {/* Step 3 */}
              <Step>
                <h2 className="text-2xl font-extrabold mb-4">3. 加入 Yolo</h2>
                <p className="text-muted-foreground mb-4">准备好了吗？点击完成，立即加入 Yolo 生态，释放你的社交价值！</p>
                {tokenName && (
                  <div className="mb-4 p-4 bg-primary/10 rounded-lg">
                    <p className="text-primary font-medium">你的社交货币: {tokenName}</p>
                  </div>
                )}
                <Button variant="white" className="px-6 py-3">完成</Button>
              </Step>
            </Stepper>
          </div>
        </div>

        {/* 右侧 CardSwap + 3D 背景 - 放大和优化 */}
        <div className={cn(center,'flex-1 xl:flex-none xl:w-[60%] relative min-h-[600px] xl:min-h-screen overflow-hidden')}>
          {/* 3D Beams 背景 */}
          <div className="absolute inset-0 z-0">
            <Beams
              beamWidth={2}
              beamHeight={15}
              beamNumber={12}
              lightColor="#ffffff"
              speed={2}
              noiseIntensity={1.75}
              scale={0.2}
              rotation={0}
            />
          </div>
          
          {/* CardSwap 前景 */}
          <div className={cn(center,'relative z-10 w-full h-full p-8 -translate-y-12') }>
            <CardSwap 
              cardDistance={120} 
              verticalDistance={80} 
              delay={4000} 
              pauseOnHover={true}
              width={620}
              height={380}
              skewAmount={4}
              easing="elastic"
            >
              <Card>
                <div className="flex flex-col h-full items-start gap-4">
                  <h3 className="text-3xl font-extrabold text-white">社交货币上链</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    将你的影响力资产化，互动即收益，让社交价值得到真实记录与流转。
                  </p>
                </div>
              </Card>
              <Card>
                <div className="flex flex-col h-full items-start gap-4">
                  <h3 className="text-3xl font-extrabold text-white">价值信任背书</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    区块链不可篡改的信用体系，为你的每次贡献提供权威证明，建立可信社交关系。
                  </p>
                </div>
              </Card>
              <Card>
                <div className="flex flex-col h-full items-start gap-4">
                  <h3 className="text-3xl font-extrabold text-white">个人成长增值</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    参与、学习、分享，成长路径透明可见；贡献越多，潜在收益与成长价值越大。
                  </p>
                </div>
              </Card>
            </CardSwap>
          </div>
        </div>

      </div>
    </div>
  );
}