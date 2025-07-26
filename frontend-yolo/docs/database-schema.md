# 数据库表结构

本文档描述了 YOLO 股票创建功能所需的 Supabase 数据库表结构。

## 核心表

### 1. stock 表 (已存在)
```sql
CREATE TABLE stock (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  symbol TEXT UNIQUE NOT NULL,
  image TEXT,
  owners INTEGER DEFAULT 1,
  supply INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 扩展表 (可选，用于完整功能)

### 2. user_balances 表
用于存储用户的 YOLO 币余额。

```sql
CREATE TABLE user_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  balance DECIMAL(20,8) DEFAULT 8000.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. user_holdings 表
用于记录用户的股票持有情况。

```sql
CREATE TABLE user_holdings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stock_id UUID NOT NULL REFERENCES stock(id) ON DELETE CASCADE,
  shares INTEGER NOT NULL,
  average_price DECIMAL(20,8) NOT NULL,
  total_investment DECIMAL(20,8) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, stock_id)
);
```

### 4. liquidity_pools 表
用于管理股票的流动性池。

```sql
CREATE TABLE liquidity_pools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stock_id UUID UNIQUE NOT NULL REFERENCES stock(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL,
  initial_price DECIMAL(20,8) NOT NULL,
  total_supply INTEGER NOT NULL,
  available_supply INTEGER NOT NULL,
  yolo_reserve DECIMAL(20,8) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 存储桶 (Storage)

### images 桶
用于存储股票图片。

```sql
-- 在 Supabase Storage 中创建 'images' 桶
-- 设置为公开访问，允许上传图片文件
```

## 行级安全策略 (RLS)

### stock 表策略
```sql
-- 允许所有人查看股票
CREATE POLICY "Anyone can view stocks" ON stock FOR SELECT USING (true);

-- 只允许认证用户创建股票
CREATE POLICY "Authenticated users can create stocks" ON stock FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 只允许股票创建者更新
CREATE POLICY "Users can update own stocks" ON stock FOR UPDATE 
USING (auth.uid() = user_id);
```

### user_balances 表策略
```sql
-- 用户只能查看自己的余额
CREATE POLICY "Users can view own balance" ON user_balances FOR SELECT 
USING (auth.uid() = user_id);

-- 用户可以更新自己的余额
CREATE POLICY "Users can update own balance" ON user_balances FOR UPDATE 
USING (auth.uid() = user_id);

-- 允许插入新的余额记录
CREATE POLICY "Users can insert own balance" ON user_balances FOR INSERT 
WITH CHECK (auth.uid() = user_id);
```

### user_holdings 表策略
```sql
-- 用户只能查看自己的持股
CREATE POLICY "Users can view own holdings" ON user_holdings FOR SELECT 
USING (auth.uid() = user_id);

-- 允许插入持股记录
CREATE POLICY "Users can insert holdings" ON user_holdings FOR INSERT 
WITH CHECK (auth.uid() = user_id);
```

## 注意事项

1. **核心功能**：只需要 `stock` 表即可实现基本的股票创建功能
2. **扩展功能**：其他表用于实现完整的余额管理和持股记录
3. **容错设计**：代码已经实现了容错机制，即使扩展表不存在也不会影响核心功能
4. **环境变量**：确保在 `.env.local` 中配置正确的 Supabase 连接信息
5. **用户注册**：新用户注册时会自动分配 8000 YOLO 币初始余额

## 自动余额分配机制

系统实现了双重保障的余额分配机制：

1. **注册时分配**：用户注册成功后，系统会自动在 `user_balances` 表中创建记录，分配 8000 YOLO 币
2. **首次访问分配**：如果用户余额记录不存在（如表创建在用户注册之后），系统会在用户首次查询余额时自动创建记录

这种设计确保了：
- 新用户始终有初始资金进行投资
- 即使数据库表后期添加，现有用户也能获得初始余额
- 系统具有良好的向后兼容性

## 快速开始

1. 确保 `stock` 表已存在
2. 创建 `.env.local` 文件并配置 Supabase 环境变量
3. 可选：创建扩展表以获得完整功能
4. 在 Supabase Storage 中创建 `images` 桶