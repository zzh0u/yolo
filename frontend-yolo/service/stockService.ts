import { createClient } from '@/lib/supabase';
import { CreateStockData, Stock, UserBalance } from '@/app/create/types';

const supabase = createClient();

export class StockService {
  // 检查 Supabase 配置
  private static checkSupabaseConfig() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Supabase 配置缺失。请在 .env.local 文件中配置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
  }

  // 获取用户YOLO币余额（模拟数据，实际应该从用户表获取）
  static async getUserBalance(userId: string): Promise<UserBalance> {
    try {
      this.checkSupabaseConfig();
      
      // 这里应该从实际的用户表获取余额，现在使用模拟数据
      const balance = 8000; // 默认8000 YOLO币
      const maxInvestment = balance * 0.2; // 最大可投资20%
      
      return {
        balance,
        maxInvestment
      };
    } catch (error) {
      console.error('Error getting user balance:', error);
      throw error;
    }
  }

  // 创建新的 stock
  static async createStock(stockData: CreateStockData, userId: string): Promise<Stock> {
    try {
      this.checkSupabaseConfig();
      
      const { data, error } = await supabase
        .from('stock')
        .insert({
          user_id: userId,
          name: stockData.name,
          symbol: stockData.symbol.toUpperCase(),
          image: stockData.image || '',
          owners: 1, // 创建者默认为第一个持有者
          supply: stockData.supply,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating stock:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error in createStock:', error);
      throw error;
    }
  }

  // 获取用户的 stocks
  static async getUserStocks(userId: string): Promise<Stock[]> {
    try {
      this.checkSupabaseConfig();
      
      const { data, error } = await supabase
        .from('stock')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user stocks:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserStocks:', error);
      throw error;
    }
  }

  // 获取所有 stocks
  static async getAllStocks(): Promise<Stock[]> {
    try {
      this.checkSupabaseConfig();
      
      const { data, error } = await supabase
        .from('stock')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all stocks:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllStocks:', error);
      throw error;
    }
  }

  // 根据 symbol 检查是否已存在
  static async checkSymbolExists(symbol: string): Promise<boolean> {
    try {
      this.checkSupabaseConfig();
      
      const { data, error } = await supabase
        .from('stock')
        .select('id')
        .eq('symbol', symbol.toUpperCase())
        .limit(1);

      if (error) {
        console.error('Error checking symbol:', error);
        throw new Error(error.message);
      }

      return (data && data.length > 0) || false;
    } catch (error) {
      console.error('Error in checkSymbolExists:', error);
      throw error;
    }
  }

  // 上传图片到 Supabase Storage
  static async uploadImage(file: File, stockSymbol: string): Promise<string> {
    try {
      this.checkSupabaseConfig();
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${stockSymbol}_${Date.now()}.${fileExt}`;
      const filePath = `stock-images/${fileName}`;

      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading image:', error);
        throw new Error(error.message);
      }

      // 获取公共 URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      throw error;
    }
  }

  // 生成默认头像 URL
  static generateDefaultAvatar(stockName: string): string {
    // 使用 DiceBear API 生成默认头像
    const seed = encodeURIComponent(stockName);
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=random`;
  }
}