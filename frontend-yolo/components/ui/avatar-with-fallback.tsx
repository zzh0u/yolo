'use client';

import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';

interface AvatarWithFallbackProps {
  src?: string;
  alt?: string;
  name?: string;
  className?: string;
  size?: number;
}

const AvatarWithFallback: React.FC<AvatarWithFallbackProps> = ({
  src,
  alt = "Avatar",
  name = "User",
  className = "",
  size = 48
}) => {
  // 获取名称的首字母，支持中英文
  const getInitials = (str: string) => {
    if (!str) return 'U';
    
    // 如果是中文，取第一个字符
    if (/[\u4e00-\u9fa5]/.test(str)) {
      return str.charAt(0);
    }
    
    // 如果是英文，取首字母
    const words = str.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join('');
  };

  // 基于名称生成颜色
  const generateColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // 使用黑白灰色系
    const colors = [
      '#1f2937', // 深灰
      '#374151', // 中深灰
      '#4b5563', // 中灰
      '#6b7280', // 浅中灰
      '#9ca3af', // 浅灰
      '#2d3748', // 深蓝灰
      '#4a5568', // 中蓝灰
      '#718096', // 浅蓝灰
      '#2d3748', // 重复深色调
      '#1a202c', // 极深灰
      '#2a2e37', // 深炭灰
      '#3a3f47'  // 中炭灰
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(name);
  const backgroundColor = generateColor(name);

  return (
    <Avatar 
      className={className}
      style={{ width: size, height: size }}
    >
      {src && <AvatarImage src={src} alt={alt} />}
      <AvatarFallback 
        className="text-white font-semibold"
        style={{ 
          backgroundColor,
          fontSize: size * 0.4,
        }}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default AvatarWithFallback;