import { createClient } from '@/lib/supabase';

const supabase = createClient();

export interface UserContact {
  id: string;
  user_id: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

export interface ContactFormData {
  email?: string;
  phone?: string;
}

export class UserContactService {
  /**
   * 获取用户联系方式
   */
  static async getUserContact(userId: string): Promise<UserContact | null> {
    try {
      const { data, error } = await supabase
        .from('user_contacts')
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
      console.error('获取用户联系方式失败:', error);
      throw error;
    }
  }

  /**
   * 创建或更新用户联系方式
   */
  static async upsertUserContact(
    userId: string, 
    contactData: ContactFormData
  ): Promise<UserContact> {
    try {
      const { data, error } = await supabase
        .from('user_contacts')
        .upsert({
          user_id: userId,
          email: contactData.email || null,
          phone: contactData.phone || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('更新用户联系方式失败:', error);
      throw error;
    }
  }

  /**
   * 删除用户联系方式
   */
  static async deleteUserContact(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_contacts')
        .delete()
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('删除用户联系方式失败:', error);
      throw error;
    }
  }

  /**
   * 验证邮箱格式
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 验证手机号格式（支持中国大陆手机号）
   */
  static validatePhone(phone: string): boolean {
    // 支持中国大陆手机号和国际格式
    const phoneRegex = /^(\+?86)?1[3-9]\d{9}$|^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s|-/g, ''));
  }
}