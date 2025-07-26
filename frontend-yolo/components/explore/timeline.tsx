import React, { useState, useEffect, useCallback } from 'react';
import CreatePost from '@/components/explore/create-post';
import { TrendingUp, TrendingDown, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AvatarWithFallback from '@/components/ui/avatar-with-fallback';
import { useRouter } from 'next/navigation';
import { TimelineService, TimelineActivity } from '@/service/timelineService';

const Timeline = () => {
  const router = useRouter();
  const [activities, setActivities] = useState<TimelineActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // 加载时间线数据
  const loadActivities = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    try {
      if (pageNum === 0) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const response = await TimelineService.getTimelineActivities(pageNum, 10);
      
      if (append) {
        setActivities(prev => [...prev, ...response.activities]);
      } else {
        setActivities(response.activities);
      }
      
      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (err) {
      console.error('加载时间线失败:', err);
      setError('加载失败，请重试');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    loadActivities(0);
  }, [loadActivities]);

  // 加载更多
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadActivities(page + 1, true);
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    loadActivities(0);
  };

  // 处理买入/卖出操作
  const handleTrade = (activity: TimelineActivity, action: 'buy' | 'sell') => {
    const stockSymbol = activity.user_stock?.symbol;
    if (stockSymbol) {
      router.push(`/explore/${stockSymbol}`);
    }
  };

  // 处理用户点击跳转到股票页面
  const handleUserClick = (activity: TimelineActivity) => {
    const stockSymbol = activity.user_stock?.symbol;
    if (stockSymbol) {
      router.push(`/explore/${stockSymbol}`);
    }
  };

  // 获取用户显示信息
  const getUserInfo = (activity: TimelineActivity) => {
    const displayName = TimelineService.getUserDisplayName(activity);
    const avatarUrl = TimelineService.getUserAvatarUrl(activity);
    const stockValue = TimelineService.getUserStockValue(activity);
    const relativeTime = TimelineService.formatRelativeTime(activity.created_at);
    
    return { displayName, avatarUrl, stockValue, relativeTime };
  };

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto text-white h-screen flex flex-col px-12 py-12">
        <CreatePost onPostCreated={handleRefresh} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-gray-400 text-sm">加载时间线...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && activities.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto text-white h-screen flex flex-col px-12 py-12">
        <CreatePost onPostCreated={handleRefresh} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <p className="text-red-400 text-sm">{error}</p>
            <Button 
              variant="ghost" 
              onClick={handleRefresh}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto text-white h-screen flex flex-col px-12 py-12">
      <CreatePost onPostCreated={handleRefresh} />
      
      {/* 时间线内容 */}
      <div className="flex-1 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <p className="text-gray-400 text-lg mb-2">暂无动态</p>
              <p className="text-gray-500 text-sm">成为第一个分享动态的人吧</p>
            </div>
          </div>
        ) : (
          <>
            {activities.map((activity) => {
              const { displayName, avatarUrl, stockValue, relativeTime } = getUserInfo(activity);
              
              return (
                <div key={activity.id} className="group relative">
                  {/* 时间线连接线 */}
                  <div className="absolute left-6 top-16 bottom-0 w-px bg-gradient-to-b from-gray-700 to-transparent opacity-30" />
                  
                  <div className="flex gap-4 p-6 transition-all duration-200 hover:bg-gray-900/30 border-b border-gray-800/50">
                    {/* 头像 */}
                    <div 
                      className="relative cursor-pointer"
                      onClick={() => handleUserClick(activity)}
                    >
                      <AvatarWithFallback
                        src={avatarUrl}
                        name={displayName}
                        alt={`${displayName}'s avatar`}
                        size={48}
                        className="ring-2 ring-gray-800 transition-all duration-200 group-hover:ring-gray-600 hover:ring-blue-500"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* 用户信息和时间 */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span 
                            className="font-semibold text-white hover:underline cursor-pointer transition-colors hover:text-blue-400"
                            onClick={() => handleUserClick(activity)}
                          >
                            {displayName}
                          </span>
                          <span className="text-gray-500 text-sm">·</span>
                          <span className="text-gray-500 text-sm hover:text-gray-400 cursor-pointer transition-colors">
                            {relativeTime}
                          </span>
                        </div>
                        
                        {/* 股票总市值 */}
                        {stockValue && (
                          <div className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full">
                            <span className="text-gray-500">Market Cap:</span>
                            <span className="ml-1 font-medium text-gray-200">
                              {stockValue.toLocaleString()} YOLO
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 活动标题 */}
                      {activity.title && (
                        <h3 className="font-medium text-white mb-2 leading-relaxed">
                          {activity.title}
                        </h3>
                      )}

                      {/* 活动内容 */}
                      <p className="text-gray-300 whitespace-pre-wrap leading-relaxed mb-4 text-sm">
                        {activity.content}
                      </p>

                      {/* 交易按钮 */}
                      {activity.user_stock && (
                        <div className="flex items-center gap-3 mt-4">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="flex-1 bg-transparent text-green-400 hover:bg-green-900/20 hover:text-green-300 border border-green-400/20 hover:border-green-400/40 transition-all duration-200 group/btn"
                            onClick={() => handleTrade(activity, 'buy')}
                          >
                            <TrendingUp className="h-3.5 w-3.5 mr-2 transition-transform duration-200 group-hover/btn:scale-110" />
                            <span className="text-xs font-medium">Buy</span>
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="flex-1 bg-transparent text-red-400 hover:bg-red-900/20 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 transition-all duration-200 group/btn"
                            onClick={() => handleTrade(activity, 'sell')}
                          >
                            <TrendingDown className="h-3.5 w-3.5 mr-2 transition-transform duration-200 group-hover/btn:scale-110" />
                            <span className="text-xs font-medium">Sell</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 加载更多按钮 */}
            {hasMore && (
              <div className="flex justify-center py-8">
                <Button
                  variant="ghost"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all duration-200"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      加载中...
                    </>
                  ) : (
                    '显示更多'
                  )}
                </Button>
              </div>
            )}

            {/* 到底提示 */}
            {!hasMore && activities.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">已显示全部动态</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Timeline;