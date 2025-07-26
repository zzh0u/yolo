import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase';
import { UserActivityService, UserActivity, ActivityFormData } from '@/service/userActivityService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const supabase = createClient();

interface ActivityDisplayItem {
  id?: string;
  date: string;
  title: string;
  description: string;
}

const parseDate = (dateStr: string): Date => {
  // 支持格式: "2024年1月15日 14:30" 或 "2024年1月15日"
  const cleanStr = dateStr.replace('年', '-').replace('月', '-').replace('日', '');
  return new Date(cleanStr);
};

const ActivityTab = ({ highlightDate }: { highlightDate?: string }) => {
  const params = useParams();
  const { user } = useAuth();
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const [activities, setActivities] = useState<ActivityDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // 新增活动表单
  const [newActivity, setNewActivity] = useState<ActivityFormData>({
    title: '',
    content: '',
    activity_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
  });

  const stockSymbol = params?.stock as string;

  // 转换数据库数据为显示格式
  const convertToDisplayFormat = (dbActivities: UserActivity[]): ActivityDisplayItem[] => {
    return dbActivities.map(activity => ({
      id: activity.id,
      date: UserActivityService.formatCreatedAtToChinese(activity.created_at),
      title: activity.title,
      description: activity.content,
    }));
  };

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      if (!stockSymbol) return;
      
      setLoading(true);
      try {
        // 获取股票创建者的用户ID
         const { data: stockData, error: stockError } = await supabase
           .from('stock')
           .select('user_id')
           .eq('symbol', stockSymbol.toUpperCase())
           .single();

        if (stockError || !stockData) {
          console.error('获取股票信息失败:', stockError);
          setActivities([]);
          return;
        }

        const stockOwnerId = stockData.user_id;

        // 检查当前用户是否是股票所有者
        if (user) {
          const ownerCheck = await UserActivityService.isStockOwner(user.id, stockSymbol);
          setIsOwner(ownerCheck);
        }

        // 获取股票所有者的活动
        const userActivities = await UserActivityService.getUserActivities(stockOwnerId);
        const displayActivities = convertToDisplayFormat(userActivities);
        setActivities(displayActivities);
      } catch (error) {
        console.error('加载活动数据失败:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [stockSymbol, user]);

  // 高亮逻辑
  const highlightIndex = useMemo(() => {
    if (!highlightDate || activities.length === 0) {
      return -1;
    }
    
    const targetDate = parseDate(highlightDate);
    if (isNaN(targetDate.getTime())) {
      return -1;
    }

    let closestIndex = -1;
    let minDiff = Infinity;

    activities.forEach((activity, index) => {
      const activityDate = parseDate(activity.date);
      const diff = Math.abs(targetDate.getTime() - activityDate.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = index;
      }
    });

    return closestIndex;
  }, [highlightDate, activities]);

  // 滚动到高亮项
  useEffect(() => {
    if (highlightIndex !== -1 && itemRefs.current[highlightIndex]) {
      itemRefs.current[highlightIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [highlightIndex]);

  // 处理新增活动
  const handleAddActivity = () => {
    setIsAdding(true);
    setNewActivity({
      title: '',
      content: '',
      activity_date: new Date().toISOString().split('T')[0],
    });
  };

  // 取消新增
  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewActivity({
      title: '',
      content: '',
      activity_date: new Date().toISOString().split('T')[0],
    });
  };

  // 保存新活动
  const handleSaveActivity = async () => {
    if (!user || !newActivity.title.trim() || !newActivity.content.trim()) {
      return;
    }

    setSaving(true);
    try {
      const success = await UserActivityService.createActivity(user.id, newActivity);
      if (success) {
        // 重新加载活动列表
        const userActivities = await UserActivityService.getUserActivities(user.id);
        const displayActivities = convertToDisplayFormat(userActivities);
        setActivities(displayActivities);
        
        // 重置表单
        setIsAdding(false);
        setNewActivity({
          title: '',
          content: '',
          activity_date: new Date().toISOString().split('T')[0],
        });
      }
    } catch (error) {
      console.error('保存活动失败:', error);
    } finally {
      setSaving(false);
    }
  };

  // 删除活动
  const handleDeleteActivity = async (activityId: string) => {
    if (!user || !confirm('确定要删除这个活动吗？')) {
      return;
    }

    try {
      const success = await UserActivityService.deleteActivity(activityId, user.id);
      if (success) {
        // 重新加载活动列表
        const userActivities = await UserActivityService.getUserActivities(user.id);
        const displayActivities = convertToDisplayFormat(userActivities);
        setActivities(displayActivities);
      }
    } catch (error) {
      console.error('删除活动失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-zinc-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="relative pl-8">
      {/* 时间线 */}
      <div className="absolute left-8 top-0 bottom-0 w-px bg-zinc-800"></div>
      
      {/* 新增按钮 - 圆形浮动按钮，左下角 */}
      {isOwner && !isAdding && (
        <div className="fixed bottom-8 left-8 z-10">
          <Button 
            onClick={handleAddActivity}
            className="group relative w-14 h-14 rounded-full bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 text-white shadow-2xl hover:shadow-gray-500/30 transition-all duration-300 ease-out border-0 p-0 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
            <svg className="relative w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        </div>
      )}

      {/* 新增活动表单 - 乔布斯风格 */}
      {isAdding && (
        <div className="relative mb-8 p-6 bg-gradient-to-br from-zinc-900/90 to-zinc-800/90 backdrop-blur-sm rounded-2xl border border-zinc-700/50 shadow-2xl">
          <div className="absolute h-4 w-4 rounded-full border-4 border-zinc-950 bg-gradient-to-r from-blue-500 to-blue-400 shadow-lg -left-10 top-6"></div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-200 mb-3 tracking-wide">
                日期
              </label>
              <Input
                type="date"
                value={newActivity.activity_date}
                onChange={(e) => setNewActivity(prev => ({ ...prev, activity_date: e.target.value }))}
                className="bg-zinc-800/50 border-zinc-600/50 text-white rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-zinc-200 mb-3 tracking-wide">
                标题
              </label>
              <Input
                value={newActivity.title}
                onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                placeholder="输入活动标题..."
                className="bg-zinc-800/50 border-zinc-600/50 text-white rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-zinc-200 mb-3 tracking-wide">
                内容
              </label>
              <Textarea
                value={newActivity.content}
                onChange={(e) => setNewActivity(prev => ({ ...prev, content: e.target.value }))}
                placeholder="描述这个活动..."
                rows={4}
                className="bg-zinc-800/50 border-zinc-600/50 text-white rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 resize-none"
              />
            </div>
            
            <div className="flex gap-3 justify-end pt-4">
              <Button 
                onClick={handleCancelAdd}
                className="px-6 py-2.5 bg-transparent border border-zinc-600 text-zinc-300 hover:bg-zinc-800/50 hover:border-zinc-500 rounded-xl font-medium tracking-wide transition-all duration-200"
              >
                取消
              </Button>
              <Button 
                onClick={handleSaveActivity}
                disabled={saving || !newActivity.title.trim() || !newActivity.content.trim()}
                className="group relative overflow-hidden px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-zinc-600 disabled:to-zinc-500 text-white rounded-xl font-medium tracking-wide shadow-lg hover:shadow-blue-500/25 transition-all duration-200 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-out"></div>
                <span className="relative">
                  {saving ? '保存中...' : '保存'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 活动列表 */}
      <div className="space-y-12">
        {activities.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center">
                <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg font-medium">
                {isOwner ? '还没有任何动态' : '暂无动态信息'}
              </p>
              {isOwner && (
                 <p className="text-sm text-zinc-500">
                   点击左下角圆形按钮添加第一个动态
                 </p>
               )}
            </div>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div
              key={activity.id || index}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className={`relative transition-all duration-300 group ${
                index === highlightIndex ? 'p-4 -ml-4 rounded-xl bg-gradient-to-r from-zinc-900/80 to-zinc-800/60 backdrop-blur-sm border border-zinc-700/50' : ''
              }`}
            >
              <div
                className={`absolute h-4 w-4 rounded-full border-4 border-zinc-950 transition-all duration-300 ${
                  index === highlightIndex ? '-left-10 top-5.5 bg-gradient-to-r from-sky-400 to-blue-500 shadow-lg shadow-sky-500/30' : '-left-10 top-1.5 bg-zinc-700 group-hover:bg-zinc-600'
                }`}
              ></div>
              
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-zinc-400 font-medium tracking-wide">{activity.date}</p>
                  <h3 className="mt-2 text-lg font-semibold text-white tracking-wide">{activity.title}</h3>
                  <p className="mt-2 text-zinc-400 leading-relaxed">{activity.description}</p>
                </div>
                
                {/* 删除按钮 - 乔布斯风格，悬浮显示 */}
                {isOwner && activity.id && (
                  <Button
                    onClick={() => handleDeleteActivity(activity.id!)}
                    className="opacity-0 group-hover:opacity-100 transition-all duration-200 ml-4 p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 rounded-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityTab;
