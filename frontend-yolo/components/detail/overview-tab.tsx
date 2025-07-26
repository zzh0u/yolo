'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileService, UserProfile } from '@/service/userProfileService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Save, X, Loader2 } from 'lucide-react';

const OverviewTab = () => {
  const { stock } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // 编辑表单状态
  const [editForm, setEditForm] = useState({
    description: '',
    rednote_link: '',
    bonjour_link: ''
  });

  // 加载用户概览信息
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id || !stock) return;
      
      try {
        setLoading(true);
        
        // 检查是否是股票所有者
        const ownerCheck = await UserProfileService.isStockOwner(user.id, stock as string);
        setIsOwner(ownerCheck);
        
        // 获取用户概览信息
        const profileData = await UserProfileService.getUserProfile(user.id);
        setProfile(profileData);
        
        // 设置编辑表单的初始值
        if (profileData) {
          setEditForm({
            description: profileData.description || '',
            rednote_link: profileData.rednote_link || '',
            bonjour_link: profileData.bonjour_link || ''
          });
        }
      } catch (error) {
        console.error('加载用户概览信息失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.id, stock]);

  // 开始编辑
  const handleEdit = () => {
    setIsEditing(true);
    // 重新设置表单值
    setEditForm({
      description: profile?.description || '',
      rednote_link: profile?.rednote_link || '',
      bonjour_link: profile?.bonjour_link || ''
    });
  };

  // 取消编辑
  const handleCancel = () => {
    setIsEditing(false);
    // 恢复原始值
    setEditForm({
      description: profile?.description || '',
      rednote_link: profile?.rednote_link || '',
      bonjour_link: profile?.bonjour_link || ''
    });
  };

  // 保存更改
  const handleSave = async () => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      
      const updatedProfile = await UserProfileService.upsertUserProfile(user.id, editForm);
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('保存用户概览信息失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 加载中状态
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        <span className="ml-2 text-zinc-400">加载中...</span>
      </div>
    );
  }

  // 编辑模式
  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">编辑概览信息</h3>
          <div className="flex gap-2">
            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <X className="h-4 w-4 mr-1" />
              取消
            </Button>
            <Button
              onClick={handleSave}
              size="sm"
              disabled={saving}
              className="bg-white text-black hover:bg-zinc-200"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              保存
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="description" className="text-zinc-300">描述</Label>
            <Textarea
              id="description"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="介绍一下这个项目..."
              className="mt-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="rednote" className="text-zinc-300">小红书链接</Label>
            <Input
              id="rednote"
              type="url"
              value={editForm.rednote_link}
              onChange={(e) => setEditForm({ ...editForm, rednote_link: e.target.value })}
              placeholder="https://xiaohongshu.com/user/..."
              className="mt-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <div>
            <Label htmlFor="bonjour" className="text-zinc-300">Bonjour链接</Label>
            <Input
              id="bonjour"
              type="url"
              value={editForm.bonjour_link}
              onChange={(e) => setEditForm({ ...editForm, bonjour_link: e.target.value })}
              placeholder="https://bonjour.com/user/..."
              className="mt-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>
        </div>
      </div>
    );
  }

  // 显示模式
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">项目概况</h3>
        {isOwner && (
          <Button
            onClick={handleEdit}
            variant="outline"
            size="sm"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <Edit className="h-4 w-4 mr-1" />
            编辑
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* 描述 */}
        <div>
          <h4 className="text-sm font-medium text-zinc-400 mb-2">描述</h4>
          <p className="text-lg leading-relaxed text-zinc-300">
            {profile?.description || (isOwner ? '点击编辑按钮添加项目描述...' : '暂无描述信息')}
          </p>
        </div>

        {/* 社交媒体链接 */}
        {(profile?.rednote_link || profile?.bonjour_link || isOwner) && (
          <div>
            <h4 className="text-sm font-medium text-zinc-400 mb-2">社交媒体</h4>
            <div className="flex flex-wrap gap-3">
              {profile?.rednote_link && (
                <a
                  href={profile.rednote_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  小红书
                </a>
              )}
              {profile?.bonjour_link && (
                <a
                  href={profile.bonjour_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                >
                  Bonjour
                </a>
              )}
              {isOwner && !profile?.rednote_link && !profile?.bonjour_link && (
                <span className="text-zinc-500 text-sm">点击编辑按钮添加社交媒体链接...</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;
