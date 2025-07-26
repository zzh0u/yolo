// 从 Supabase 返回的 Stock 数据结构
export interface Stock {
  id: string;
  user_id: string;
  name: string;
  symbol: string;
  image_url: string;
  owners: number;
  supply: number; // 流通量，支持小数精度（DECIMAL(20,8)）
  price: number; // 发行价格（YOLO币），支持小数精度
  created_at: string;
}

// 流动性池数据结构
export interface LiquidityPool {
  id: string;
  stock_id: string;
  creator_id: string;
  yolo_reserve: number; // YOLO币储备，支持小数精度
  stock_reserve: number; // 股票储备，支持小数精度（DECIMAL(20,8)）
  total_supply: number; // 总供应量，支持小数精度（DECIMAL(20,8)）
  k_constant: number; // AMM常数，支持高精度
  created_at: string;
}

// 用户持股记录
export interface UserHolding {
  id: string;
  user_id: string;
  stock_id: string;
  shares: number; // 持股数量，支持小数精度（DECIMAL(20,8)）
  average_price: number; // 平均价格，支持小数精度
  total_investment: number; // 总投资额，支持小数精度
  created_at: string;
  stock?: Stock; // 关联的股票信息
}

// 交易记录
export interface Transaction {
  id: string;
  user_id: string;
  stock_id: string;
  transaction_type: 'buy' | 'sell' | 'create';
  shares: number; // 交易股份数量，支持小数精度（DECIMAL(20,8)）
  price_per_share: number; // 每股价格，支持小数精度
  total_amount: number; // 交易总额，支持小数精度
  created_at: string;
}

// 创建 Stock 时需要的数据
export interface CreateStockData {
  name: string;
  symbol: string;
  image_url?: string;
  supply: number; // 流通量，支持小数精度
  price: number; // 发行价格（YOLO币），支持小数精度
}

// 表单数据（不包含图片文件）
export interface StockFormData {
  name: string;
  symbol: string;
  story: string;
  supply: number; // 流通量，支持小数精度
  price: number; // 发行价格，支持小数精度
}

// 用户YOLO币余额信息
export interface UserBalance {
  balance: number;
  maxInvestment: number; // 最大可投资金额（10%-20%）
}

// 创建步骤枚举
export enum CreateStep {
  BASIC_INFO = 1,
  PRICING = 2,
  IMAGE_CONFIRM = 3
}

// CardSwap 组件相关类型
export interface CardProps extends React.ComponentProps<'div'> {
  children: React.ReactNode;
}

export interface CardSwapProps {
  children: React.ReactNode;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  width?: number | string;
  height?: number | string;
  skewAmount?: number;
  easing?: "linear" | "elastic";
  onCardClick?: (idx: number) => void;
}