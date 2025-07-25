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