import { createClient } from '@/lib/supabase';

const supabase = createClient();

export interface UserActivity {
  id: string;
  user_id: string;
  title: string;
  content: string;
  activity_date: string; // YYYY-MM-DD format
  created_at: string;
}

export interface ActivityFormData {
  title: string;
  content: string;
  activity_date: string;
}

export class UserActivityService {
  /**
   * 获取指定用户的所有活动，按创建时间倒序排列
   */
  static async getUserActivities(userId: string): Promise<UserActivity[]> {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('获取用户活动失败:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('获取用户活动异常:', error);
      return [];
    }
  }

  /**
   * 创建新的用户活动
   */
  static async createActivity(userId: string, activityData: ActivityFormData): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          title: activityData.title,
          content: activityData.content,
          activity_date: activityData.activity_date,
        });

      if (error) {
        console.error('创建活动失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('创建活动异常:', error);
      return false;
    }
  }

  /**
   * 删除指定活动
   */
  static async deleteActivity(activityId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_activities')
        .delete()
        .eq('id', activityId)
        .eq('user_id', userId); // 确保只能删除自己的活动

      if (error) {
        console.error('删除活动失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('删除活动异常:', error);
      return false;
    }
  }

  /**
   * 检查用户是否是股票的所有者（从stock表查询）
   */
  static async isStockOwner(userId: string, stockSymbol: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('stock')
        .select('user_id')
        .eq('symbol', stockSymbol.toUpperCase())
        .single();

      if (error) {
        console.error('检查股票所有者失败:', error);
        return false;
      }

      return data?.user_id === userId;
    } catch (error) {
      console.error('检查股票所有者异常:', error);
      return false;
    }
  }

  /**
   * 格式化日期为中文格式 (YYYY年MM月DD日)
   */
  static formatDateToChinese(dateStr: string): string {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  }

  /**
   * 格式化created_at时间戳为中文格式，显示到分钟 (YYYY年MM月DD日 HH:mm)
   */
  static formatCreatedAtToChinese(createdAtStr: string): string {
    const date = new Date(createdAtStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
  }

  /**
   * 解析中文日期格式为标准日期格式
   */
  static parseDateFromChinese(chineseDateStr: string): string {
    const standardDate = chineseDateStr
      .replace('年', '-')
      .replace('月', '-')
      .replace('日', '');
    return standardDate;
  }
}