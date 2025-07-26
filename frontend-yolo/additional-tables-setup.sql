-- YOLO 平台额外功能表（简化版）
-- 基于 overview、activity 和 contact 组件设计的新表

-- 1. 用户概览信息表 (Overview)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT, -- 用户描述信息
  rednote_link VARCHAR(500), -- 小红书链接
  bonjour_link VARCHAR(500), -- Bonjour社交媒体链接
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 用户活动时间线表 (Activity)
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL, -- 活动标题
  content TEXT NOT NULL, -- 活动内容
  activity_date DATE NOT NULL, -- 活动日期
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 用户联系方式表 (Contact)
CREATE TABLE IF NOT EXISTS user_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255), -- 联系邮箱
  phone VARCHAR(50), -- 联系电话
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 禁用RLS（权限全开，开发环境）
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_contacts DISABLE ROW LEVEL SECURITY;

-- 创建基础索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_contacts_user_id ON user_contacts(user_id);

-- 完成！简化版表结构包含：
-- 1. user_profiles: 用户概览（描述、社交链接）
-- 2. user_activities: 活动时间线（标题、内容、日期）
-- 3. user_contacts: 联系方式（邮箱、电话）
