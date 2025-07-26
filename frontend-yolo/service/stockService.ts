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

  // 获取用户YOLO币余额
  static async getUserBalance(userId: string): Promise<UserBalance> {
    try {
      this.checkSupabaseConfig();
      
      // 尝试从 user_balances 表获取余额
      let balance = 8000; // 默认余额
      
      try {
        const { data: balanceData, error: balanceError } = await supabase
          .from('user_balances')
          .select('balance')
          .eq('user_id', userId)
          .single();

        if (balanceError && !balanceError.message.includes('relation "user_balances" does not exist')) {
          console.warn('获取用户余额时出错:', balanceError);
        } else if (balanceData) {
          balance = balanceData.balance;
        }
      } catch (error: any) {
        if (!error.message?.includes('relation "user_balances" does not exist')) {
          console.warn('获取用户余额失败，使用默认值:', error);
        }
      }
      
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

  // 创建新的 stock（包含流动性池创建）
  static async createStock(stockData: CreateStockData, userId: string): Promise<Stock> {
    try {
      this.checkSupabaseConfig();
      
      // 开始事务处理
      const { data: stockData_result, error: stockError } = await supabase
        .from('stock')
        .insert({
          user_id: userId,
          name: stockData.name,
          symbol: stockData.symbol.toUpperCase(),
          image: stockData.image || this.generateDefaultAvatar(stockData.name),
          owners: 1, // 创建者默认为第一个持有者
          supply: stockData.supply,
        })
        .select()
        .single();

      if (stockError) {
        console.error('Error creating stock:', stockError);
        throw new Error(`创建股票失败: ${stockError.message}`);
      }

      // 创建流动性池记录（如果有相关表的话）
      try {
        await this.createLiquidityPool(stockData_result.id, stockData.price, stockData.supply, userId);
      } catch (poolError) {
        console.warn('创建流动性池失败，但股票创建成功:', poolError);
      }

      // 创建用户持股记录
      try {
        await this.createUserHolding(stockData_result.id, userId, stockData.supply, stockData.price);
      } catch (holdingError) {
        console.warn('创建持股记录失败，但股票创建成功:', holdingError);
      }

      // 扣除用户YOLO币（投资金额）
      try {
        const investmentAmount = stockData.price * stockData.supply;
        await this.deductUserBalance(userId, investmentAmount);
      } catch (balanceError) {
        console.warn('扣除用户余额失败，但股票创建成功:', balanceError);
      }

      return stockData_result;
    } catch (error) {
      console.error('Error in createStock:', error);
      throw error;
    }
  }

  // 创建流动性池（如果有相关表）
  private static async createLiquidityPool(stockId: string, price: number, supply: number, userId: string) {
    // 这里假设有一个 liquidity_pools 表
    // 如果没有这个表，这个方法会静默失败
    try {
      const { error } = await supabase
        .from('liquidity_pools')
        .insert({
          stock_id: stockId,
          creator_id: userId,
          initial_price: price,
          total_supply: supply,
          available_supply: supply,
          yolo_reserve: price * supply, // 初始YOLO币储备
          created_at: new Date().toISOString()
        });

      if (error && !error.message.includes('relation "liquidity_pools" does not exist')) {
        throw error;
      }
    } catch (error: any) {
      if (!error.message?.includes('relation "liquidity_pools" does not exist')) {
        throw error;
      }
    }
  }

  // 创建用户持股记录
  private static async createUserHolding(stockId: string, userId: string, shares: number, price: number) {
    // 这里假设有一个 user_holdings 表
    try {
      const { error } = await supabase
        .from('user_holdings')
        .insert({
          user_id: userId,
          stock_id: stockId,
          shares: shares,
          average_price: price,
          total_investment: price * shares,
          created_at: new Date().toISOString()
        });

      if (error && !error.message.includes('relation "user_holdings" does not exist')) {
        throw error;
      }
    } catch (error: any) {
      if (!error.message?.includes('relation "user_holdings" does not exist')) {
        throw error;
      }
    }
  }

  // 扣除用户YOLO币余额
  private static async deductUserBalance(userId: string, amount: number) {
    // 这里假设有一个 user_balances 表
    try {
      // 首先获取当前余额
      const { data: currentBalance, error: fetchError } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (fetchError && !fetchError.message.includes('relation "user_balances" does not exist')) {
        throw fetchError;
      }

      if (currentBalance) {
        // 更新余额
        const { error: updateError } = await supabase
          .from('user_balances')
          .update({ 
            balance: currentBalance.balance - amount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) {
          throw updateError;
        }
      } else {
        // 如果没有余额记录，创建一个（从8000开始扣除）
        const { error: insertError } = await supabase
          .from('user_balances')
          .insert({
            user_id: userId,
            balance: 8000 - amount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError && !insertError.message.includes('relation "user_balances" does not exist')) {
          throw insertError;
        }
      }
    } catch (error: any) {
      if (!error.message?.includes('relation "user_balances" does not exist')) {
        throw error;
      }
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

  // 验证投资金额是否合理
  static async validateInvestment(userId: string, price: number, supply: number): Promise<{ valid: boolean; message?: string }> {
    try {
      const userBalance = await this.getUserBalance(userId);
      const totalInvestment = price * supply;
      
      if (totalInvestment > userBalance.balance) {
        return {
          valid: false,
          message: `投资金额 ${totalInvestment} YOLO 超过了您的余额 ${userBalance.balance} YOLO`
        };
      }
      
      if (totalInvestment > userBalance.maxInvestment) {
        return {
          valid: false,
          message: `投资金额 ${totalInvestment} YOLO 超过了建议的最大投资额 ${userBalance.maxInvestment} YOLO（余额的20%）`
        };
      }
      
      return { valid: true };
    } catch (error) {
      console.error('Error validating investment:', error);
      return {
        valid: false,
        message: '验证投资金额时发生错误'
      };
    }
  }

  // 获取股票详细信息（包含创建者信息）
  static async getStockDetails(stockId: string): Promise<Stock | null> {
    try {
      this.checkSupabaseConfig();
      
      const { data, error } = await supabase
        .from('stock')
        .select('*')
        .eq('id', stockId)
        .single();

      if (error) {
        console.error('Error fetching stock details:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getStockDetails:', error);
      return null;
    }
  }

  // 获取用户的持股信息
  static async getUserHoldings(userId: string): Promise<any[]> {
    try {
      this.checkSupabaseConfig();
      
      // 尝试从 user_holdings 表获取持股信息
      try {
        const { data, error } = await supabase
          .from('user_holdings')
          .select(`
            *,
            stock:stock_id (
              id,
              name,
              symbol,
              image
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error && !error.message.includes('relation "user_holdings" does not exist')) {
          throw error;
        }

        return data || [];
      } catch (error: any) {
        if (error.message?.includes('relation "user_holdings" does not exist')) {
          // 如果没有持股表，返回用户创建的股票
          return await this.getUserStocks(userId);
        }
        throw error;
      }
    } catch (error) {
      console.error('Error getting user holdings:', error);
      return [];
    }
  }
}