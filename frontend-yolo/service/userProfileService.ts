import { createClient } from '@/lib/supabase';

const supabase = createClient();

export interface UserProfile {
  id: string;
  user_id: string;
  description: string | null;
  rednote_link: string | null;
  bonjour_link: string | null;
  created_at: string;
}

export class UserProfileService {
  // 获取用户概览信息
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 记录不存在，返回null
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // 创建或更新用户概览信息
  static async upsertUserProfile(
    userId: string, 
    profileData: {
      description?: string;
      rednote_link?: string;
      bonjour_link?: string;
    }
  ): Promise<UserProfile> {
    try {
      // 首先检查用户是否已有profile记录
      const existingProfile = await this.getUserProfile(userId);
      
      if (existingProfile) {
        // 如果存在，则更新记录
        const { data, error } = await supabase
          .from('user_profiles')
          .update({
            description: profileData.description || null,
            rednote_link: profileData.rednote_link || null,
            bonjour_link: profileData.bonjour_link || null,
          })
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return data;
      } else {
        // 如果不存在，则创建新记录
        const { data, error } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            description: profileData.description || null,
            rednote_link: profileData.rednote_link || null,
            bonjour_link: profileData.bonjour_link || null,
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        return data;
      }
    } catch (error) {
      console.error('Error upserting user profile:', error);
      throw error;
    }
  }

  // 检查用户是否是股票的所有者
  static async isStockOwner(userId: string, stockSymbol: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('stock')
        .select('user_id')
        .eq('symbol', stockSymbol.toUpperCase())
        .single();

      if (error) {
        console.error('Error checking stock ownership:', error);
        return false;
      }

      return data.user_id === userId;
    } catch (error) {
      console.error('Error checking stock ownership:', error);
      return false;
    }
  }
}