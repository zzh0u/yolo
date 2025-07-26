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

        if (balanceError) {
          if (balanceError.code === 'PGRST116') {
            // 用户余额记录不存在，为新用户创建初始余额
            try {
              const { error: insertError } = await supabase
                .from('user_balances')
                .insert({
                  user_id: userId,
                  balance: 8000.0,
                  created_at: new Date().toISOString()
                });

              if (insertError && !insertError.message.includes('relation "user_balances" does not exist')) {
                console.warn('创建用户余额记录失败:', insertError);
              } else if (!insertError) {
                console.log(`为用户 ${userId} 创建了初始余额记录`);
              }
            } catch (createError: any) {
              if (!createError.message?.includes('relation "user_balances" does not exist')) {
                console.warn('创建用户余额记录时发生错误:', createError);
              }
            }
          } else if (!balanceError.message.includes('relation "user_balances" does not exist')) {
            console.warn('获取用户余额时出错:', balanceError);
          }
        } else if (balanceData) {
          balance = balanceData.balance;
        }
      } catch (error: any) {
        if (!error.message?.includes('relation "user_balances" does not exist')) {
          console.warn('获取用户余额失败，使用默认值:', error);
        }
      }
      
      // 移除投资限制，用户可以使用全部余额
      const maxInvestment = balance; // 可以使用全部余额
      
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
      
      // 开始事务处理
      const { data: stockData_result, error: stockError } = await supabase
        .from('stock')
        .insert({
          user_id: userId,
          name: stockData.name,
          symbol: stockData.symbol.toUpperCase(),
          image_url: this.generateDefaultAvatar(stockData.name),
          owners: 1, // 创建者默认为第一个持有者
          supply: stockData.supply,
          price: stockData.price
        })
        .select()
        .single();

      if (stockError) {
        console.error('Error creating stock:', stockError);
        throw new Error(`创建股票失败: ${stockError.message}`);
      }

      // 创建流动性池记录（平台提供65%的流动性）
      try {
        await this.createLiquidityPool(stockData_result.id, stockData.price, stockData.supply, userId);
      } catch (poolError) {
        console.warn('创建流动性池失败，但股票创建成功:', poolError);
      }

      // 创建用户持股记录（用户获得35%股份）
      try {
        await this.createUserHolding(stockData_result.id, userId, stockData.supply, stockData.price);
      } catch (holdingError) {
        console.warn('创建持股记录失败，但股票创建成功:', holdingError);
      }

      // 扣除用户YOLO币（只需支付35%股份对应的金额）
      try {
        const userShares = stockData.supply * 0.35; // 35% 的股份，支持小数
        const actualInvestment = stockData.price * userShares; // 用户实际需要支付的金额
        await this.deductUserBalance(userId, actualInvestment);
      } catch (balanceError) {
        console.warn('扣除用户余额失败，但股票创建成功:', balanceError);
      }

      return stockData_result;
    } catch (error) {
      console.error('Error in createStock:', error);
      throw error;
    }
  }

  // 创建流动性池（平台提供65%的流动性）
  private static async createLiquidityPool(stockId: string, price: number, totalSupply: number, userId: string) {
    // 65% 的股份进入流动性池，35% 归创建者
    const poolSupply = totalSupply * 0.65; // 65% 进入流动性池，支持小数
    const poolYoloReserve = price * poolSupply; // 平台提供的YOLO币储备
    const kConstant = poolYoloReserve * poolSupply; // AMM 恒定乘积 k = x * y
    
    try {
      const { error } = await supabase
        .from('liquidity_pools')
        .insert({
          stock_id: stockId,
          creator_id: userId,
          yolo_reserve: poolYoloReserve, // YOLO币储备
          stock_reserve: poolSupply, // 股票储备
          total_supply: totalSupply, // 总发行量
          k_constant: kConstant, // AMM 恒定乘积
          created_at: new Date().toISOString()
        });

      if (error && !error.message.includes('relation "liquidity_pools" does not exist')) {
        throw error;
      }
      
      console.log(`流动性池创建成功：${poolSupply} 股份 (${(poolSupply/totalSupply*100).toFixed(1)}%) 进入交易池，平台提供 ${poolYoloReserve} YOLO 币流动性，K常数: ${kConstant}`);
    } catch (error: any) {
      if (!error.message?.includes('relation "liquidity_pools" does not exist')) {
        throw error;
      }
    }
  }

  // 创建用户持股记录
  private static async createUserHolding(stockId: string, userId: string, totalSupply: number, price: number) {
    // 用户自动获得所创建股票的 35% 持股
    const userShares = totalSupply * 0.35; // 35% 的股份，支持小数
    const userInvestment = price * userShares; // 用户实际投资金额
    
    try {
      const { error } = await supabase
        .from('user_holdings')
        .insert({
          user_id: userId,
          stock_id: stockId,
          shares: userShares,
          average_price: price,
          total_investment: userInvestment,
          created_at: new Date().toISOString()
        });

      if (error && !error.message.includes('relation "user_holdings" does not exist')) {
        throw error;
      }
      
      console.log(`用户 ${userId} 获得股票 ${stockId} 的 ${userShares} 股份 (${(userShares/totalSupply*100).toFixed(1)}%)`);
    } catch (error: any) {
      if (!error.message?.includes('relation "user_holdings" does not exist')) {
        throw error;
      }
    }
  }

  // 扣除用户YOLO币余额
  private static async deductUserBalance(userId: string, amount: number) {
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
            balance: currentBalance.balance - amount
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
            created_at: new Date().toISOString()
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

  // 验证投资金额（移除限制，只检查余额是否足够）
  static async validateInvestment(userId: string, price: number, supply: number): Promise<{valid: boolean, message?: string}> {
    try {
      const userBalance = await this.getUserBalance(userId);
      const userShares = supply * 0.35; // 35% 的股份，支持小数
      const requiredAmount = price * userShares; // 用户需要支付的金额
      
      if (requiredAmount > userBalance.balance) {
        return {
          valid: false,
          message: `余额不足。需要 ${requiredAmount.toLocaleString()} YOLO，当前余额 ${userBalance.balance.toLocaleString()} YOLO`
        };
      }
      
      return { valid: true };
    } catch (error) {
      console.error('验证投资失败:', error);
      return {
        valid: false,
        message: '验证投资时发生错误'
      };
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

  // 获取股票详情
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

  // 获取用户持股信息
  static async getUserHoldings(userId: string): Promise<any[]> {
    try {
      this.checkSupabaseConfig();
      
      // 尝试从 user_holdings 表获取持股信息
      try {
        const { data, error } = await supabase
          .from('user_holdings')
          .select(`
            *,
            stock:stock_id (*)
          `)
          .eq('user_id', userId);

        if (error && !error.message.includes('relation "user_holdings" does not exist')) {
          throw error;
        }

        if (data && data.length > 0) {
          return data;
        }
      } catch (error: any) {
        if (!error.message?.includes('relation "user_holdings" does not exist')) {
          console.warn('获取用户持股失败:', error);
        }
      }

      // 如果 user_holdings 表不存在或没有数据，回退到用户创建的股票
      const userStocks = await this.getUserStocks(userId);
      return userStocks.map(stock => ({
        stock_id: stock.id,
        shares: stock.supply * 0.35, // 35% 持股，支持小数
        average_price: stock.price || 1,
        total_investment: (stock.price || 1) * (stock.supply * 0.35),
        stock: stock
      }));
    } catch (error) {
      console.error('Error in getUserHoldings:', error);
      return [];
    }
  }

  // 获取股票的交易记录
  static async getStockTransactions(stockId: string, limit: number = 100): Promise<any[]> {
    try {
      this.checkSupabaseConfig();
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('stock_id', stockId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error && !error.message.includes('relation "transactions" does not exist')) {
        throw error;
      }

      return data || [];
    } catch (error: any) {
      if (!error.message?.includes('relation "transactions" does not exist')) {
        console.error('Error fetching stock transactions:', error);
      }
      return [];
    }
  }

  // 获取所有交易记录（用于计算市场数据）
  static async getAllTransactions(limit: number = 1000): Promise<any[]> {
    try {
      this.checkSupabaseConfig();
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error && !error.message.includes('relation "transactions" does not exist')) {
        throw error;
      }

      return data || [];
    } catch (error: any) {
      if (!error.message?.includes('relation "transactions" does not exist')) {
        console.error('Error fetching all transactions:', error);
      }
      return [];
    }
  }

  // 计算股票的24小时交易量（YOLO）
  static async calculateDailyVolume(stockId: string): Promise<number> {
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data, error } = await supabase
        .from('transactions')
        .select('total_amount')
        .eq('stock_id', stockId)
        .gte('created_at', oneDayAgo.toISOString());

      if (error && !error.message.includes('relation "transactions" does not exist')) {
        throw error;
      }

      if (!data || data.length === 0) {
        return 0;
      }

      return data.reduce((sum, transaction) => sum + parseFloat(transaction.total_amount), 0);
    } catch (error: any) {
      if (!error.message?.includes('relation "transactions" does not exist')) {
        console.error('Error calculating daily volume:', error);
      }
      return 0;
    }
  }

  // 计算股票的24小时价格变化
  static async calculateDailyChange(stockId: string, currentPrice: number): Promise<number> {
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data, error } = await supabase
        .from('transactions')
        .select('price_per_share, created_at')
        .eq('stock_id', stockId)
        .lte('created_at', oneDayAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (error && !error.message.includes('relation "transactions" does not exist')) {
        throw error;
      }

      if (!data || data.length === 0) {
        return 0; // 没有历史数据，变化为0
      }

      const yesterdayPrice = parseFloat(data[0].price_per_share);
      if (yesterdayPrice === 0) return 0;

      return ((currentPrice - yesterdayPrice) / yesterdayPrice) * 100;
    } catch (error: any) {
      if (!error.message?.includes('relation "transactions" does not exist')) {
        console.error('Error calculating daily change:', error);
      }
      return 0;
    }
  }

  // 获取股票的历史价格数据（用于图表）
  static async getStockPriceHistory(stockId: string, days: number = 7): Promise<{ value: number; timestamp: string }[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('transactions')
        .select('price_per_share, created_at')
        .eq('stock_id', stockId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error && !error.message.includes('relation "transactions" does not exist')) {
        throw error;
      }

      if (!data || data.length === 0) {
        return []; // 没有历史数据
      }

      return data.map(transaction => ({
        value: parseFloat(transaction.price_per_share),
        timestamp: transaction.created_at
      }));
    } catch (error: any) {
      if (!error.message?.includes('relation "transactions" does not exist')) {
        console.error('Error fetching price history:', error);
      }
      return [];
    }
  }

  // 获取股票的图表数据（支持不同时间范围）
  static async getStockChartData(stockId: string, timeRange: '1D' | '1W' | '1M' | '3M' = '3M'): Promise<{ time: number; value: number }[]> {
    try {
      let days: number;
      let groupByHours = false;
      
      switch (timeRange) {
        case '1D':
          days = 1;
          groupByHours = true; // 1天内按小时分组
          break;
        case '1W':
          days = 7;
          break;
        case '1M':
          days = 30;
          break;
        case '3M':
          days = 90;
          break;
        default:
          days = 90;
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('transactions')
        .select('price_per_share, created_at')
        .eq('stock_id', stockId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error && !error.message.includes('relation "transactions" does not exist')) {
        throw error;
      }

      if (!data || data.length === 0) {
        // 如果没有交易数据，返回当前价格的模拟数据
        return this.generateFallbackChartData(stockId, timeRange);
      }

      // 处理数据分组
      const chartData: { time: number; value: number }[] = [];
      
      if (groupByHours && timeRange === '1D') {
        // 按小时分组
        const hourlyData = new Map<string, { sum: number; count: number }>();
        
        data.forEach(transaction => {
          const date = new Date(transaction.created_at);
          const hourKey = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}-${date.getUTCHours()}`;
          
          if (!hourlyData.has(hourKey)) {
            hourlyData.set(hourKey, { sum: 0, count: 0 });
          }
          
          const hourData = hourlyData.get(hourKey)!;
          hourData.sum += parseFloat(transaction.price_per_share);
          hourData.count += 1;
        });
        
        // 转换为图表数据
        hourlyData.forEach((value, key) => {
          const [year, month, day, hour] = key.split('-').map(Number);
          const date = new Date(year, month, day, hour);
          chartData.push({
            time: Math.floor(date.getTime() / 1000),
            value: value.sum / value.count
          });
        });
      } else {
        // 按天分组
        const dailyData = new Map<string, { sum: number; count: number }>();
        
        data.forEach(transaction => {
          const date = new Date(transaction.created_at);
          const dayKey = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
          
          if (!dailyData.has(dayKey)) {
            dailyData.set(dayKey, { sum: 0, count: 0 });
          }
          
          const dayData = dailyData.get(dayKey)!;
          dayData.sum += parseFloat(transaction.price_per_share);
          dayData.count += 1;
        });
        
        // 转换为图表数据
        dailyData.forEach((value, key) => {
          const [year, month, day] = key.split('-').map(Number);
          const date = new Date(year, month, day);
          date.setUTCHours(0, 0, 0, 0);
          chartData.push({
            time: Math.floor(date.getTime() / 1000),
            value: value.sum / value.count
          });
        });
      }

      return chartData.sort((a, b) => a.time - b.time);
    } catch (error: any) {
      if (!error.message?.includes('relation "transactions" does not exist')) {
        console.error('Error fetching chart data:', error);
      }
      return this.generateFallbackChartData(stockId, timeRange);
    }
  }

  // 生成备用图表数据（当没有交易数据时）
  private static async generateFallbackChartData(stockId: string, timeRange: '1D' | '1W' | '1M' | '3M'): Promise<{ time: number; value: number }[]> {
    try {
      // 获取股票当前价格
      const stock = await supabase
        .from('stock')
        .select('price')
        .eq('id', stockId)
        .single();

      const currentPrice = stock.data?.price || 1;
      
      let days: number;
      let pointsCount: number;
      
      switch (timeRange) {
        case '1D':
          days = 1;
          pointsCount = 24; // 24小时
          break;
        case '1W':
          days = 7;
          pointsCount = 7; // 7天
          break;
        case '1M':
          days = 30;
          pointsCount = 30; // 30天
          break;
        case '3M':
          days = 90;
          pointsCount = 90; // 90天
          break;
        default:
          days = 90;
          pointsCount = 90;
      }

      const data: { time: number; value: number }[] = [];
      const now = new Date();
      
      for (let i = 0; i < pointsCount; i++) {
        const date = new Date(now);
        
        if (timeRange === '1D') {
          date.setUTCHours(date.getUTCHours() - (pointsCount - 1 - i));
        } else {
          date.setUTCDate(date.getUTCDate() - (pointsCount - 1 - i));
          date.setUTCHours(0, 0, 0, 0);
        }
        
        // 生成轻微波动的价格数据
        const variation = (Math.random() - 0.5) * 0.1; // ±5%的波动
        const price = currentPrice * (1 + variation);
        
        data.push({
          time: Math.floor(date.getTime() / 1000),
          value: Math.max(0.01, price) // 确保价格不为负
        });
      }

      return data;
    } catch (error) {
      console.error('Error generating fallback chart data:', error);
      return [];
    }
  }

  // 获取股票的实际持有人数
  static async getStockOwnersCount(stockId: string): Promise<number> {
    try {
      this.checkSupabaseConfig();
      
      const { data, error } = await supabase
        .from('user_holdings')
        .select('user_id')
        .eq('stock_id', stockId)
        .gt('shares', 0);

      if (error && !error.message.includes('relation "user_holdings" does not exist')) {
        throw error;
      }

      return data ? data.length : 1; // 至少有创建者
    } catch (error: any) {
      if (!error.message?.includes('relation "user_holdings" does not exist')) {
        console.error('Error fetching owners count:', error);
      }
      return 1; // 默认至少有创建者
    }
  }

  // 获取增强的股票数据（包含计算的市场数据）
  static async getEnhancedStockData(stocks: Stock[]): Promise<any[]> {
    const enhancedStocks = await Promise.all(
      stocks.map(async (stock) => {
        const [dailyVolume, dailyChange, priceHistory, ownersCount] = await Promise.all([
          this.calculateDailyVolume(stock.id),
          this.calculateDailyChange(stock.id, stock.price || 1),
          this.getStockPriceHistory(stock.id),
          this.getStockOwnersCount(stock.id)
        ]);

        const price = stock.price || 1;
        const marketCap = price * stock.supply;

        // 确定股票状态
        const createdAt = new Date(stock.created_at);
        const daysSinceCreation = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        let status: "idea" | "prototype" | "demo" | "fundraising";
        
        if (daysSinceCreation < 1) status = "idea";
        else if (daysSinceCreation < 7 && price < 10) status = "prototype";
        else if (daysSinceCreation < 30 && price < 50) status = "demo";
        else status = "fundraising";

        return {
          id: stock.id,
          name: stock.name,
          symbol: stock.symbol,
          image_url: stock.image_url,
          price,
          supply: stock.supply,
          owners: Math.max(ownersCount, stock.owners || 1),
          created_at: stock.created_at,
          user_id: stock.user_id,
          marketCap,
          dailyChange,
          dailyVolume,
          status,
          chartData: priceHistory.length > 0 ? priceHistory.map(p => ({ value: p.value })) : []
        };
      })
    );

    return enhancedStocks;
  }

  // 获取单个股票的增强数据（根据symbol）
  static async getSingleStockEnhancedData(symbol: string): Promise<any | null> {
    try {
      // 首先根据symbol获取股票基础信息
      const stock = await this.getStockBySymbol(symbol);
      if (!stock) {
        return null;
      }

      // 获取增强数据
      const [dailyVolume, dailyChange, priceHistory, ownersCount] = await Promise.all([
        this.calculateDailyVolume(stock.id),
        this.calculateDailyChange(stock.id, stock.price || 1),
        this.getStockPriceHistory(stock.id),
        this.getStockOwnersCount(stock.id)
      ]);

      const price = stock.price || 1;
      const marketCap = price * stock.supply;

      // 确定股票状态
      const createdAt = new Date(stock.created_at);
      const daysSinceCreation = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      let status: "idea" | "prototype" | "demo" | "fundraising";
      
      if (daysSinceCreation < 1) status = "idea";
      else if (daysSinceCreation < 7 && price < 10) status = "prototype";
      else if (daysSinceCreation < 30 && price < 50) status = "demo";
      else status = "fundraising";

      return {
        id: stock.id,
        name: stock.name,
        symbol: stock.symbol,
        image_url: stock.image_url,
        current_price: price,
        supply: stock.supply,
        owners: Math.max(ownersCount, stock.owners || 1),
        created_at: stock.created_at,
        user_id: stock.user_id,
        market_cap: marketCap,
        daily_change: dailyChange,
        daily_volume: dailyVolume,
        status,
        chart_data: priceHistory.length > 0 ? priceHistory.map(p => ({ value: p.value })) : [],
        holders_count: Math.max(ownersCount, stock.owners || 1)
      };
    } catch (error) {
      console.error('Error in getSingleStockEnhancedData:', error);
      return null;
    }
  }

  // ==================== 交易相关方法 ====================

  // 根据symbol获取股票信息
  static async getStockBySymbol(symbol: string): Promise<Stock | null> {
    try {
      this.checkSupabaseConfig();
      
      const { data, error } = await supabase
        .from('stock')
        .select('*')
        .eq('symbol', symbol.toUpperCase())
        .single();

      if (error) {
        console.error('Error fetching stock by symbol:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getStockBySymbol:', error);
      return null;
    }
  }

  // 获取流动性池信息
  static async getLiquidityPool(stockId: string): Promise<any | null> {
    try {
      this.checkSupabaseConfig();
      
      const { data, error } = await supabase
        .from('liquidity_pools')
        .select('*')
        .eq('stock_id', stockId)
        .single();

      if (error && !error.message.includes('relation "liquidity_pools" does not exist')) {
        console.error('Error fetching liquidity pool:', error);
        return null;
      }

      return data;
    } catch (error: any) {
      if (!error.message?.includes('relation "liquidity_pools" does not exist')) {
        console.error('Error in getLiquidityPool:', error);
      }
      return null;
    }
  }

  // 计算AMM买入价格（用YOLO买股票）
  static calculateBuyPrice(yoloReserve: number, stockReserve: number, yoloAmount: number): {
    stockAmount: number;
    pricePerStock: number;
    priceImpact: number;
  } {
    if (yoloReserve <= 0 || stockReserve <= 0 || yoloAmount <= 0) {
      return { stockAmount: 0, pricePerStock: 0, priceImpact: 0 };
    }

    // AMM恒定乘积公式: x * y = k
    const k = yoloReserve * stockReserve;
    const newYoloReserve = yoloReserve + yoloAmount;
    const newStockReserve = k / newYoloReserve;
    const stockAmount = stockReserve - newStockReserve;
    
    const pricePerStock = stockAmount > 0 ? yoloAmount / stockAmount : 0;
    const currentPrice = yoloReserve / stockReserve;
    const priceImpact = pricePerStock > 0 ? ((pricePerStock - currentPrice) / currentPrice) * 100 : 0;

    return {
      stockAmount: stockAmount, // 保持原始精度，不强制截断
      pricePerStock,
      priceImpact
    };
  }

  // 计算AMM卖出价格（卖股票换YOLO）
  static calculateSellPrice(yoloReserve: number, stockReserve: number, stockAmount: number): {
    yoloAmount: number;
    pricePerStock: number;
    priceImpact: number;
  } {
    if (yoloReserve <= 0 || stockReserve <= 0 || stockAmount <= 0) {
      return { yoloAmount: 0, pricePerStock: 0, priceImpact: 0 };
    }

    // AMM恒定乘积公式: x * y = k
    const k = yoloReserve * stockReserve;
    const newStockReserve = stockReserve + stockAmount;
    const newYoloReserve = k / newStockReserve;
    const yoloAmount = yoloReserve - newYoloReserve;
    
    const pricePerStock = yoloAmount > 0 ? yoloAmount / stockAmount : 0;
    const currentPrice = yoloReserve / stockReserve;
    const priceImpact = pricePerStock > 0 ? ((currentPrice - pricePerStock) / currentPrice) * 100 : 0;

    return {
      yoloAmount: yoloAmount, // 保持原始精度，不强制截断
      pricePerStock,
      priceImpact
    };
  }

  // 执行买入交易
  static async executeBuyTransaction(
    userId: string, 
    stockId: string, 
    yoloAmount: number
  ): Promise<{ success: boolean; message: string; transaction?: any }> {
    try {
      this.checkSupabaseConfig();

      // 1. 获取用户余额
      const userBalance = await this.getUserBalance(userId);
      if (userBalance.balance < yoloAmount) {
        return { success: false, message: '余额不足' };
      }

      // 2. 获取流动性池信息
      const pool = await this.getLiquidityPool(stockId);
      if (!pool) {
        return { success: false, message: '流动性池不存在' };
      }

      // 3. 计算交易结果
      const { stockAmount, pricePerStock } = this.calculateBuyPrice(
        pool.yolo_reserve, 
        pool.stock_reserve, 
        yoloAmount
      );

      if (stockAmount <= 0) {
        return { success: false, message: '交易金额过小' };
      }

      // 4. 更新流动性池
      const newYoloReserve = pool.yolo_reserve + yoloAmount;
      const newStockReserve = pool.stock_reserve - stockAmount;
      const newKConstant = newYoloReserve * newStockReserve;

      const { error: poolError } = await supabase
        .from('liquidity_pools')
        .update({
          yolo_reserve: newYoloReserve,
          stock_reserve: newStockReserve,
          k_constant: newKConstant
        })
        .eq('stock_id', stockId);

      if (poolError) {
        return { success: false, message: `更新流动性池失败: ${poolError.message}` };
      }

      // 5. 扣除用户YOLO余额
      await this.deductUserBalance(userId, yoloAmount);

      // 6. 更新用户持股
      await this.updateUserHolding(userId, stockId, stockAmount, pricePerStock, 'buy');

      // 7. 记录交易
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          stock_id: stockId,
          transaction_type: 'buy',
          shares: stockAmount, // 支持小数精度
          price_per_share: pricePerStock,
          total_amount: yoloAmount,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (transactionError && !transactionError.message.includes('relation "transactions" does not exist')) {
        console.warn('记录交易失败:', transactionError);
      }

      // 8. 更新股票价格
      await this.updateStockPrice(stockId, pricePerStock);

      return { 
        success: true, 
        message: `成功购买 ${stockAmount.toFixed(6)} 股`, 
        transaction 
      };

    } catch (error) {
      console.error('Error in executeBuyTransaction:', error);
      return { success: false, message: '交易执行失败' };
    }
  }

  // 执行卖出交易
  static async executeSellTransaction(
    userId: string, 
    stockId: string, 
    stockAmount: number
  ): Promise<{ success: boolean; message: string; transaction?: any }> {
    try {
      this.checkSupabaseConfig();

      // 1. 检查用户持股
      const userHolding = await this.getUserStockHolding(userId, stockId);
      if (!userHolding || userHolding.shares < stockAmount) {
        return { success: false, message: '持股不足' };
      }

      // 2. 获取流动性池信息
      const pool = await this.getLiquidityPool(stockId);
      if (!pool) {
        return { success: false, message: '流动性池不存在' };
      }

      // 3. 计算交易结果
      const { yoloAmount, pricePerStock } = this.calculateSellPrice(
        pool.yolo_reserve, 
        pool.stock_reserve, 
        stockAmount
      );

      if (yoloAmount <= 0) {
        return { success: false, message: '交易金额过小' };
      }

      // 4. 更新流动性池
      const newYoloReserve = pool.yolo_reserve - yoloAmount;
      const newStockReserve = pool.stock_reserve + stockAmount;
      const newKConstant = newYoloReserve * newStockReserve;

      const { error: poolError } = await supabase
        .from('liquidity_pools')
        .update({
          yolo_reserve: newYoloReserve,
          stock_reserve: newStockReserve,
          k_constant: newKConstant
        })
        .eq('stock_id', stockId);

      if (poolError) {
        return { success: false, message: `更新流动性池失败: ${poolError.message}` };
      }

      // 5. 增加用户YOLO余额
      await this.addUserBalance(userId, yoloAmount);

      // 6. 更新用户持股
      await this.updateUserHolding(userId, stockId, -stockAmount, pricePerStock, 'sell');

      // 7. 记录交易
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          stock_id: stockId,
          transaction_type: 'sell',
          shares: stockAmount, // 支持小数精度
          price_per_share: pricePerStock,
          total_amount: yoloAmount,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (transactionError && !transactionError.message.includes('relation "transactions" does not exist')) {
        console.warn('记录交易失败:', transactionError);
      }

      // 8. 更新股票价格
      await this.updateStockPrice(stockId, pricePerStock);

      return { 
        success: true, 
        message: `成功卖出 ${stockAmount} 股，获得 ${yoloAmount.toFixed(2)} YOLO`, 
        transaction 
      };

    } catch (error) {
      console.error('Error in executeSellTransaction:', error);
      return { success: false, message: '交易执行失败' };
    }
  }

  // 获取用户特定股票的持股信息
  static async getUserStockHolding(userId: string, stockId: string): Promise<any | null> {
    try {
      this.checkSupabaseConfig();
      
      const { data, error } = await supabase
        .from('user_holdings')
        .select('*')
        .eq('user_id', userId)
        .eq('stock_id', stockId)
        .single();

      if (error && !error.message.includes('relation "user_holdings" does not exist')) {
        console.error('Error fetching user stock holding:', error);
        return null;
      }

      return data;
    } catch (error: any) {
      if (!error.message?.includes('relation "user_holdings" does not exist')) {
        console.error('Error in getUserStockHolding:', error);
      }
      return null;
    }
  }

  // 更新用户持股
  private static async updateUserHolding(
    userId: string, 
    stockId: string, 
    sharesDelta: number, 
    price: number, 
    type: 'buy' | 'sell'
  ) {
    try {
      const existingHolding = await this.getUserStockHolding(userId, stockId);
      
      if (existingHolding) {
        // 更新现有持股
        const newShares = existingHolding.shares + sharesDelta;
        const newTotalInvestment = type === 'buy' 
          ? existingHolding.total_investment + (sharesDelta * price)
          : existingHolding.total_investment - (Math.abs(sharesDelta) * existingHolding.average_price);
        
        const newAveragePrice = newShares > 0 ? newTotalInvestment / newShares : 0;

        const { error } = await supabase
          .from('user_holdings')
          .update({
            shares: Math.max(0, newShares),
            average_price: newAveragePrice,
            total_investment: Math.max(0, newTotalInvestment)
          })
          .eq('user_id', userId)
          .eq('stock_id', stockId);

        if (error && !error.message.includes('relation "user_holdings" does not exist')) {
          throw error;
        }
      } else if (type === 'buy' && sharesDelta > 0) {
        // 创建新的持股记录
        const { error } = await supabase
          .from('user_holdings')
          .insert({
            user_id: userId,
            stock_id: stockId,
            shares: sharesDelta,
            average_price: price,
            total_investment: sharesDelta * price,
            created_at: new Date().toISOString()
          });

        if (error && !error.message.includes('relation "user_holdings" does not exist')) {
          throw error;
        }
      }
    } catch (error: any) {
      if (!error.message?.includes('relation "user_holdings" does not exist')) {
        throw error;
      }
    }
  }

  // 增加用户余额
  private static async addUserBalance(userId: string, amount: number) {
    try {
      const { data: currentBalance, error: fetchError } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (fetchError && !fetchError.message.includes('relation "user_balances" does not exist')) {
        throw fetchError;
      }

      if (currentBalance) {
        const { error: updateError } = await supabase
          .from('user_balances')
          .update({ 
            balance: currentBalance.balance + amount
          })
          .eq('user_id', userId);

        if (updateError) {
          throw updateError;
        }
      } else {
        const { error: insertError } = await supabase
          .from('user_balances')
          .insert({
            user_id: userId,
            balance: 8000 + amount,
            created_at: new Date().toISOString()
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

  // 更新股票价格
  private static async updateStockPrice(stockId: string, newPrice: number) {
    try {
      const { error } = await supabase
        .from('stock')
        .update({ price: newPrice })
        .eq('id', stockId);

      if (error) {
        console.warn('更新股票价格失败:', error);
      }
    } catch (error) {
      console.warn('更新股票价格时发生错误:', error);
    }
  }

  // 获取当前市场价格（基于流动性池）
  static async getCurrentMarketPrice(stockId: string): Promise<number> {
    try {
      const pool = await this.getLiquidityPool(stockId);
      if (!pool || pool.stock_reserve <= 0) {
        // 如果没有流动性池，返回股票表中的价格
        const stock = await this.getStockDetails(stockId);
        return stock?.price || 1;
      }

      return pool.yolo_reserve / pool.stock_reserve;
    } catch (error) {
      console.error('Error getting current market price:', error);
      return 1;
    }
  }
}