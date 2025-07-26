-- YOLO 股票平台数据库表
-- 请在 Supabase SQL 编辑器中执行这些语句
-- 使用 Supabase Auth 进行用户管理，权限全开（开发环境）

-- 1. 创建股票表
CREATE TABLE IF NOT EXISTS stock (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  symbol VARCHAR(20) UNIQUE NOT NULL,
  image_url TEXT,
  owners INTEGER DEFAULT 1,
  supply DECIMAL(20,8) NOT NULL DEFAULT 1000.0,
  price DECIMAL(20,8) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建用户余额表
CREATE TABLE IF NOT EXISTS user_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(20,8) DEFAULT 8000.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建用户持股记录表
CREATE TABLE IF NOT EXISTS user_holdings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stock_id UUID NOT NULL REFERENCES stock(id) ON DELETE CASCADE,
  shares DECIMAL(20,8) NOT NULL DEFAULT 0,
  average_price DECIMAL(20,8) NOT NULL DEFAULT 0,
  total_investment DECIMAL(20,8) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, stock_id)
);

-- 4. 创建流动性池表（AMM计价）
CREATE TABLE IF NOT EXISTS liquidity_pools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stock_id UUID UNIQUE NOT NULL REFERENCES stock(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  yolo_reserve DECIMAL(20,8) NOT NULL DEFAULT 0,
  stock_reserve DECIMAL(20,8) NOT NULL DEFAULT 0,
  total_supply DECIMAL(20,8) NOT NULL DEFAULT 0,
  k_constant DECIMAL(40,16) NOT NULL DEFAULT 0, -- x * y = k
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 创建交易记录表
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stock_id UUID NOT NULL REFERENCES stock(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('buy', 'sell', 'create')),
  shares DECIMAL(20,8) NOT NULL,
  price_per_share DECIMAL(20,8) NOT NULL,
  total_amount DECIMAL(20,8) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 禁用RLS（权限全开）
ALTER TABLE stock DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_balances DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_holdings DISABLE ROW LEVEL SECURITY;
ALTER TABLE liquidity_pools DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- 7. 创建索引
CREATE INDEX IF NOT EXISTS idx_stock_symbol ON stock(symbol);
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_holdings_user_id ON user_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_holdings_stock_id ON user_holdings(stock_id);
CREATE INDEX IF NOT EXISTS idx_liquidity_pools_stock_id ON liquidity_pools(stock_id);
CREATE INDEX IF NOT EXISTS idx_liquidity_pools_creator_id ON liquidity_pools(creator_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stock_id ON transactions(stock_id);

-- 8. 插入示例数据
-- Note: user_id needs to be provided when inserting actual data
-- INSERT INTO stock (name, symbol, price, user_id) VALUES 
-- ('YOLO Token', 'YOLO', 1.0, 'user-uuid-here'),
-- ('Test Stock A', 'TSA', 10.5, 'user-uuid-here'),
-- ('Test Stock B', 'TSB', 25.75, 'user-uuid-here')
-- ON CONFLICT (symbol) DO NOTHING;

-- 完成！
-- 数据库设置完成，包含股票、余额、持股、流动性池（AMM）和交易记录功能