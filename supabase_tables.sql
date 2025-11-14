-- Supabase 数据库表结构
-- 在 Supabase SQL Editor 中执行以下 SQL 来创建表

-- 1. 服装表 (clothes)
CREATE TABLE IF NOT EXISTS clothes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('women', 'men', 'kids', 'accessories')),
    sizes TEXT, -- 逗号分隔的尺寸，如: "S,M,L,XL"
    colors TEXT, -- 逗号分隔的颜色，如: "红色,蓝色,黑色"
    material VARCHAR(100),
    season VARCHAR(50),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. 推荐记录表 (recommendations)
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cloth_id UUID NOT NULL REFERENCES clothes(id) ON DELETE CASCADE,
    reason TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(user_id, cloth_id) -- 防止重复推荐记录
);

-- 3. 用户信息扩展表 (profiles)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username VARCHAR(100),
    gender VARCHAR(10),
    style_preference VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_clothes_category ON clothes(category);
CREATE INDEX IF NOT EXISTS idx_clothes_created_at ON clothes(created_at);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_cloth_id ON recommendations(cloth_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_viewed_at ON recommendations(viewed_at);

-- 启用行级安全策略 (RLS)
ALTER TABLE clothes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 设置 RLS 策略
-- 服装表：所有人可读
CREATE POLICY "任何人都可以查看服装" ON clothes FOR SELECT USING (true);

-- 推荐记录表：用户只能查看自己的推荐记录
CREATE POLICY "用户只能查看自己的推荐记录" ON recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户可以插入自己的推荐记录" ON recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户信息表：用户只能查看和修改自己的信息
CREATE POLICY "用户只能查看自己的信息" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "用户可以插入自己的信息" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "用户可以更新自己的信息" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 创建触发器来更新时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clothes_updated_at BEFORE UPDATE ON clothes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入示例数据
INSERT INTO clothes (name, description, price, category, sizes, colors, material, season) VALUES
('时尚连衣裙', '优雅的A字连衣裙，适合各种场合', 299.00, 'women', 'S,M,L', '红色,黑色,白色', '棉质', '春夏'),
('商务衬衫', '经典款商务衬衫，适合正式场合', 199.00, 'men', 'M,L,XL', '白色,蓝色,灰色', '棉', '四季'),
('儿童卫衣', '舒适保暖的儿童卫衣，卡通图案', 159.00, 'kids', '110,120,130', '粉色,蓝色,黄色', '棉绒', '秋冬'),
('时尚手提包', '简约设计手提包，容量大实用', 399.00, 'accessories', '均码', '黑色,棕色,米色', '皮革', '四季'),
('休闲牛仔裤', '修身款牛仔裤，百搭时尚', 259.00, 'women', 'S,M,L,XL', '蓝色,黑色', '牛仔布', '四季'),
('运动夹克', '轻便运动夹克，适合户外活动', 329.00, 'men', 'M,L,XL', '黑色,藏青,红色', '聚酯纤维', '春秋'),
('公主裙', '可爱的公主裙，适合小女孩', 189.00, 'kids', '100,110,120', '粉色,白色,紫色', '纱', '春夏'),
('时尚围巾', '柔软保暖围巾，多种颜色可选', 89.00, 'accessories', '均码', '灰色,驼色,红色', '羊毛', '秋冬');

-- 创建用于存储用户头像的函数（可选）
CREATE OR REPLACE FUNCTION get_avatar_url(user_id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN 'https://ui-avatars.com/api/?name=' || 
           COALESCE((SELECT username FROM profiles WHERE id = user_id), 'User') || 
           '&background=667eea&color=fff&size=128';
END;
$$ LANGUAGE plpgsql;