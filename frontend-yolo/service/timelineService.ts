import { createClient } from '@/lib/supabase';

const supabase = createClient();

export interface TimelineActivity {
  id: string;
  user_id: string;
  title: string;
  content: string;
  activity_date: string;
  created_at: string;
  user_profile?: {
    description: string | null;
    rednote_link: string | null;
    bonjour_link: string | null;
  } | null;
  user_stock?: {
    name: string;
    symbol: string;
    price: number;
    supply: number;
    image_url: string | null;
  } | null;
  user_email?: string;
}

export interface TimelineResponse {
  activities: TimelineActivity[];
  hasMore: boolean;
  total: number;
}

export class TimelineService {
  /**
   * 获取时间线活动数据，支持分页
   * @param page 页码，从0开始
   * @param limit 每页数量，默认10条
   */
  static async getTimelineActivities(page: number = 0, limit: number = 10): Promise<TimelineResponse> {
    try {
      const offset = page * limit;
      
      // 获取活动数据，关联用户信息、用户资料和股票信息
      const { data: activities, error: activitiesError } = await supabase
        .from('user_activities')
        .select(`
          id,
          user_id,
          title,
          content,
          activity_date,
          created_at
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (activitiesError) {
        console.error('获取活动数据失败:', activitiesError);
        return { activities: [], hasMore: false, total: 0 };
      }

      if (!activities || activities.length === 0) {
        return { activities: [], hasMore: false, total: 0 };
      }

      // 获取用户ID列表
      const userIds = [...new Set(activities.map(activity => activity.user_id))];

      // 批量获取用户资料信息
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, description, rednote_link, bonjour_link')
        .in('user_id', userIds);

      // 批量获取用户股票信息（每个用户的第一个股票作为代表）
      const { data: stocks } = await supabase
        .from('stock')
        .select('user_id, name, symbol, price, supply, image_url')
        .in('user_id', userIds)
        .order('created_at', { ascending: false });

      // 注意：无法直接查询auth.users表，这里先设为空数组
      // 在实际应用中，可以通过其他方式获取用户信息
      const users: any[] = [];

      // 创建映射表以便快速查找
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      const stockMap = new Map();
      const userMap = new Map(users?.map(u => [u.id, u]) || []);

      // 为每个用户只保留第一个股票
      stocks?.forEach(stock => {
        if (!stockMap.has(stock.user_id)) {
          stockMap.set(stock.user_id, stock);
        }
      });

      // 组合数据
      const enrichedActivities: TimelineActivity[] = activities.map(activity => ({
        ...activity,
        user_profile: profileMap.get(activity.user_id) || null,
        user_stock: stockMap.get(activity.user_id) || null,
        user_email: userMap.get(activity.user_id)?.email || null,
      }));

      // 获取总数用于判断是否还有更多数据
      const { count: total } = await supabase
        .from('user_activities')
        .select('*', { count: 'exact', head: true });

      const hasMore = offset + limit < (total || 0);

      return {
        activities: enrichedActivities,
        hasMore,
        total: total || 0
      };

    } catch (error) {
      console.error('获取时间线数据异常:', error);
      return { activities: [], hasMore: false, total: 0 };
    }
  }

  /**
   * 格式化时间为相对时间显示
   */
  static formatRelativeTime(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)}d`;
    }
  }

  /**
   * 获取用户显示名称
   */
  static getUserDisplayName(activity: TimelineActivity): string {
    if (activity.user_stock?.name) {
      return activity.user_stock.name;
    }
    if (activity.user_email) {
      return activity.user_email.split('@')[0];
    }
    return 'Anonymous User';
  }

  /**
   * 获取用户头像URL
   */
  static getUserAvatarUrl(activity: TimelineActivity): string {
    if (activity.user_stock?.image_url) {
      return activity.user_stock.image_url;
    }
    // 返回默认头像
    const avatars = ['/img/sam.png', '/img/elon.png', '/img/jobs.png'];
    const index = activity.user_id.charCodeAt(0) % avatars.length;
    return avatars[index];
  }

  /**
   * 获取用户股票总市值（YOLO）
   */
  static getUserStockValue(activity: TimelineActivity): number | null {
    if (!activity.user_stock) return null;
    // 计算总市值 = 价格 * 流通量
    return activity.user_stock.price * activity.user_stock.supply;
  }
}