# AI 创作者情报局

每日自动抓取全球 AI 内容创作资讯，推送到创作者邮箱。

## 技术架构

```
Vercel Cron (08:00 UTC+8)
    → /api/cron
    → Claude API + web_search（抓取资讯）
    → Supabase（存储报告）
    → Resend（邮件推送）
    → WxPusher（微信推送，可选）
```

## 部署步骤

### 第一步：Supabase 数据库

1. 登录 [supabase.com](https://supabase.com) 创建新项目
2. 进入 SQL Editor，粘贴并执行 `supabase-schema.sql` 的全部内容
3. 记录以下信息：
   - Project URL（Settings → API → Project URL）
   - anon public key（Settings → API → anon public）
   - service_role key（Settings → API → service_role）

### 第二步：Resend 邮件服务

1. 登录 [resend.com](https://resend.com) 注册账号
2. 添加并验证你的发件域名（Domains → Add Domain）
3. 创建 API Key（API Keys → Create API Key）
4. 记录 API Key

### 第三步：Vercel 部署

1. 将项目推送到 GitHub
2. 登录 [vercel.com](https://vercel.com)，导入该 GitHub 仓库
3. 在 Environment Variables 中添加以下变量：

```env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
SUPABASE_SERVICE_ROLE_KEY=xxxx
RESEND_API_KEY=re_xxxxxxxx
EMAIL_FROM=newsletter@yourdomain.com
EMAIL_FROM_NAME=AI创作者情报局
NEXT_PUBLIC_SITE_URL=https://yourdomain.vercel.app
CRON_SECRET=（随机字符串，如 openssl rand -hex 32 生成）
ADMIN_EMAIL=your@email.com
```

4. 点击 Deploy

### 第四步：验证 Cron（在 Vercel 中）

Vercel 会自动读取 `vercel.json` 中的 cron 配置：
```json
{ "path": "/api/cron", "schedule": "0 0 * * *" }
```
这等于每天 UTC 00:00 = 北京时间 08:00 触发。

你也可以手动测试：
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.vercel.app/api/cron
```

### 第五步（可选）：微信推送

1. 注册 [WxPusher](https://wxpusher.zjiecode.com)
2. 创建应用，获取 AppToken
3. 创建 Topic（话题），获取 Topic ID
4. 在 Vercel 中添加环境变量：
   ```
   WXPUSHER_APP_TOKEN=AT_xxxxxxxx
   WXPUSHER_TOPIC_ID=12345
   ```
5. 让订阅者扫码关注该 Topic

## 本地开发

```bash
npm install
cp .env.example .env.local
# 填入环境变量
npm run dev
```

手动触发资讯抓取（本地测试）：
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron
```

## 项目结构

```
app/
  page.tsx              # 首页：报告列表 + 订阅表单
  report/[date]/        # 报告详情页
  api/
    cron/route.ts       # Cron 任务入口（每日触发）
    subscribe/route.ts  # 订阅接口
    subscribe/confirm/  # 邮件确认接口
    unsubscribe/        # 取消订阅接口
    reports/route.ts    # 报告列表接口
lib/
  claude.ts             # Claude API + web_search 调用
  email.ts              # Resend 邮件发送 + 重试逻辑
  email-template.ts     # HTML 邮件模板
  wechat.ts             # WxPusher 微信推送
  supabase.ts           # Supabase 客户端
  types.ts              # TypeScript 类型定义
supabase-schema.sql     # 数据库初始化脚本
vercel.json             # Vercel Cron 配置
```
