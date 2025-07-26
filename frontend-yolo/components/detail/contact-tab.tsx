'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { UserContactService, type ContactFormData } from '@/service/userContactService';

interface ContactTabProps {
  userId?: string; // 可选的用户ID，用于查看他人的联系方式
  isOwner?: boolean; // 是否是所有者，控制编辑权限
}

const ContactTab: React.FC<ContactTabProps> = ({ userId, isOwner = true }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ContactFormData>({
    email: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasData, setHasData] = useState(false);

  // 确定要操作的用户ID
  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      loadContactData();
    }
  }, [targetUserId]);

  const loadContactData = async () => {
    if (!targetUserId) return;
    
    try {
      setIsLoading(true);
      const contact = await UserContactService.getUserContact(targetUserId);
      
      if (contact) {
        setFormData({
          email: contact.email || '',
          phone: contact.phone || '',
        });
        setHasData(true);
      } else {
        setFormData({ email: '', phone: '' });
        setHasData(false);
        if (isOwner) {
          setIsEditing(true); // 如果没有数据且是所有者，直接进入编辑模式
        }
      }
    } catch (error) {
      console.error('加载联系方式失败:', error);
      setMessage({ type: 'error', text: '加载联系方式失败' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (formData.email && !UserContactService.validateEmail(formData.email)) {
      setMessage({ type: 'error', text: '请输入有效的邮箱地址' });
      return false;
    }
    
    if (formData.phone && !UserContactService.validatePhone(formData.phone)) {
      setMessage({ type: 'error', text: '请输入有效的手机号码' });
      return false;
    }

    if (!formData.email && !formData.phone) {
      setMessage({ type: 'error', text: '请至少填写一种联系方式' });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!targetUserId || !validateForm()) return;

    try {
      setIsLoading(true);
      await UserContactService.upsertUserContact(targetUserId, formData);
      setMessage({ type: 'success', text: '联系方式保存成功' });
      setIsEditing(false);
      setHasData(true);
      
      // 3秒后清除成功消息
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('保存联系方式失败:', error);
      setMessage({ type: 'error', text: '保存失败，请重试' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadContactData(); // 重新加载数据，恢复原始状态
    setMessage(null);
  };

  if (isLoading && !isEditing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* 标题区域 */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-light text-white mb-2">
          {isOwner ? 'My Contact Info' : 'Contact'}
        </h2>
      </div>

      {/* 消息提示 */}
      {message && (
        <div className={`mb-6 p-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-900/20 text-green-400 border border-green-800' 
            : 'bg-red-900/20 text-red-400 border border-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* 内容区域 */}
      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800">
        {!isEditing ? (
          // 显示模式
          <div className="space-y-4">
            {hasData ? (
              <>
                {formData.email && (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 text-zinc-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-white">{formData.email}</span>
                  </div>
                )}
                
                {formData.phone && (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 text-zinc-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <span className="text-white">{formData.phone}</span>
                  </div>
                )}

                {isOwner && (
                  <div className="pt-4 border-t border-zinc-800">
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="w-full bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      编辑联系方式
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 text-zinc-600">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-zinc-500 text-sm">
                  {isOwner ? '暂未设置联系方式' : '暂无联系方式'}
                </p>
                {isOwner && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 bg-white text-black hover:bg-zinc-200"
                  >
                    添加联系方式
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          // 编辑模式
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                邮箱地址
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your@email.com"
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-zinc-300 mb-2">
                手机号码
              </label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="请输入手机号码"
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-500"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 bg-white text-black hover:bg-zinc-200 disabled:opacity-50"
              >
                {isLoading ? '保存中...' : '保存'}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                取消
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactTab;
