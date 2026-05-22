-- =============================================
-- AI 创作者资讯系统 — Supabase 数据库初始化
-- 在 Supabase SQL Editor 中执行此文件
-- =============================================

-- 每日报告表
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  items JSONB NOT NULL DEFAULT '[]',
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_date ON reports(date DESC);

-- 订阅用户表
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'unsubscribed')),
  token TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
  subscribed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_status ON subscribers(status);
CREATE INDEX idx_subscribers_token ON subscribers(token);

-- Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- 报告：所有人可读
CREATE POLICY "reports_public_read" ON reports FOR SELECT USING (true);

-- 报告：只有 service role 可写
CREATE POLICY "reports_service_insert" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "reports_service_update" ON reports FOR UPDATE USING (true);

-- 订阅者：只有 service role 可操作（通过 API）
CREATE POLICY "subscribers_service_all" ON subscribers FOR ALL USING (true);
