import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI 创作者情报局',
  description: '每日全球 AI 内容创作行业资讯，专为创作者而生',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen" style={{ background: '#f4f4f0' }}>
        <header style={{ background: '#0f0f0f', padding: '0 24px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', height: 56 }}>
            <a href="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' }}>
              📡 AI 创作者情报局
            </a>
          </div>
        </header>
        <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
          {children}
        </main>
        <footer style={{ textAlign: 'center', padding: '40px 16px', color: '#999', fontSize: 13 }}>
          AI 创作者情报局 · 每日北京时间 08:00 推送
        </footer>
      </body>
    </html>
  )
}
