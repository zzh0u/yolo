'use client';

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Calendar, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { UserActivityService, type ActivityFormData } from '@/service/userActivityService';
import AvatarWithFallback from '@/components/ui/avatar-with-fallback';

interface CreatePostProps {
  onPostCreated?: () => void; // 回调函数，用于通知父组件刷新数据
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // 表单状态
  const [formData, setFormData] = useState<ActivityFormData>({
    title: '',
    content: '',
    activity_date: new Date().toISOString().split('T')[0], // 默认今天
  });

  // 处理内容变化
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      content: value,
      // 如果没有标题，自动从内容中提取前20个字符作为标题
      title: prev.title || value.slice(0, 20) + (value.length > 20 ? '...' : '')
    }));
  };

  // 处理标题变化
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      title: e.target.value
    }));
  };

  // 处理日期变化
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      activity_date: e.target.value
    }));
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!user) {
      alert('请先登录');
      return;
    }

    if (!formData.content.trim()) {
      alert('请输入内容');
      return;
    }

    if (!formData.title.trim()) {
      alert('请输入标题');
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await UserActivityService.createActivity(user.id, {
        title: formData.title.trim(),
        content: formData.content.trim(),
        activity_date: formData.activity_date,
      });

      if (success) {
        // 重置表单
        setFormData({
          title: '',
          content: '',
          activity_date: new Date().toISOString().split('T')[0],
        });
        
        // 通知父组件刷新数据
        onPostCreated?.();
        
        alert('发布成功！');
      } else {
        alert('发布失败，请重试');
      }
    } catch (error) {
      console.error('发布失败:', error);
      alert('发布失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 检查是否可以提交
  const canSubmit = formData.content.trim() && formData.title.trim() && !isSubmitting;

  return (
    <div className="flex gap-4 p-4 border-b border-gray-800">
      <AvatarWithFallback
        src={user?.user_metadata?.avatar_url}
        name={user?.user_metadata?.full_name || user?.email || 'User'}
        alt="User avatar"
        size={48}
      />
      <div className="w-full space-y-3">
        {/* 标题输入 */}
        <Input
          placeholder="活动标题..."
          value={formData.title}
          onChange={handleTitleChange}
          className="bg-transparent border-gray-700 text-white placeholder-gray-500 focus:border-green-400"
          maxLength={100}
        />

        {/* 内容输入 */}
        <textarea
          placeholder="分享你的想法或活动..."
          value={formData.content}
          onChange={handleContentChange}
          className="w-full bg-transparent text-lg placeholder-gray-500 focus:outline-none resize-none border-none"
          rows={3}
          maxLength={500}
        />

        {/* 日期选择器 */}
        {/* {showDatePicker && (
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-green-400" />
            <Input
              type="date"
              value={formData.activity_date}
              onChange={handleDateChange}
              className="bg-transparent border-gray-700 text-white w-auto"
            />
          </div>
        )} */}

        <div className="border-b border-gray-800"></div>

        {/* 操作栏 */}
        <div className="flex items-center justify-between px-4 ">
          {/* 字符计数 */}
          <span className="text-sm text-gray-500">
            {formData.content.length}/500
          </span>
          
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bg-black hover:bg-gray-900 text-green-400 border border-green-400 font-mono py-2 px-4 rounded disabled:opacity-50 text-base flex items-center gap-2 transition-colors"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            <span>{isSubmitting ? 'Publishing...' : './publish.sh'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;