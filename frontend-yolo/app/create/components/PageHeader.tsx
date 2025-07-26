'use client';

import { ArrowLeft, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function PageHeader({ 
  title, 
  subtitle, 
  onBack, 
  showBackButton = true 
}: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between pb-6 border-b">
      <div className="flex items-start gap-4">
        {showBackButton && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="mt-1"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          </div>
          {subtitle && (
            <p className="text-muted-foreground text-lg">{subtitle}</p>
          )}
        </div>
      </div>
      
      {/* 可选的右侧操作按钮 */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          预览
        </Button>
        <Button variant="outline" size="sm">
          帮助
        </Button>
      </div>
    </div>
  );
} 