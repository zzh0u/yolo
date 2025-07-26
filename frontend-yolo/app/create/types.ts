// 从 Supabase 返回的 Stock 数据结构
export interface Stock {
  id: string;
  user_id: string;
  name: string;
  symbol: string;
  image: string;
  owners: number;
  supply: number;
  created_at: string;
}

// 创建 Stock 时需要的数据
export interface CreateStockData {
  name: string;
  symbol: string;
  image?: string;
  supply: number;
  price: number; // 发行价格（YOLO币）
}

// 表单数据（包含可选的图片文件）
export interface StockFormData {
  name: string;
  symbol: string;
  story: string;
  supply: number;
  price: number; // 发行价格
  image?: File;
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

// Create页面相关的类型定义
export interface CreateFormData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
}

export interface CreatePageProps {
  onSubmit?: (data: CreateFormData) => void;
  isLoading?: boolean;
}

export const CATEGORIES = [
  { value: 'technology', label: '技术' },
  { value: 'design', label: '设计' },
  { value: 'business', label: '商业' },
  { value: 'education', label: '教育' },
] as const;


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

export const PRIORITY_OPTIONS = [
  { value: 'low', label: '低优先级', color: 'text-green-600' },
  { value: 'medium', label: '中优先级', color: 'text-yellow-600' },
  { value: 'high', label: '高优先级', color: 'text-red-600' },
] as const;