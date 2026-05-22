'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

interface ReportMeta {
  id: string
  date: string
  summary: string
  created_at: string
}

function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('sub') === 'confirmed') setMsg('✅ 订阅成功！每日 08:00 将收到资讯推送')
    if (searchParams.get('unsub') === 'done') setMsg('已成功取消订阅')
  }, [searchParams])

  async function handleSubmit() {
    if (!email) return
    setStatus('loading')
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    if (res.ok) { setStatus('done'); setMsg(data.message) }
    else { setStatus('error'); setMsg(data.error) }
  }

  return (
    <div style={{ background: '#0f0f0f', borderRadius: 16, padding: '28px 32px', marginBottom: 32 }}>
      <p style={{ margin: '0 0 4px', fontSize: 11, color: '#555', letterSpacing: 2, textTransform: 'uppercase' }}>DAILY NEWSLETTER</p>
      <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: '#fff' }}>每日 AI 创作情报</h2>
      <p style={{ margin: '0 0 20px', fontSize: 14, color: '#888', lineHeight: 1.6 }}>
        覆盖创作工具 · 平台动态 · 版权合规 · 商业化趋势 · 全球爆款<br />
        每日北京时间 08:00 准时推送到你的邮箱
      </p>
      {msg ? (
        <p style={{ margin: 0, fontSize: 14, color: '#1D9E75' }}>{msg}</p>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #333', background: '#1a1a1a', color: '#fff', fontSize: 14, outline: 'none' }}
          />
          <button
            onClick={handleSubmit}
            disabled={status === 'loading'}
            style={{ padding: '10px 20px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {status === 'loading' ? '发送中...' : '免费订阅'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  const [reports, setReports] = useState<ReportMeta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reports').then(r => r.json()).then(data => {
      setReports(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [])

  return (
    <>
      <Suspense fallback={null}>
        <SubscribeForm />
      </Suspense>

      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#888', letterSpacing: 1 }}>最近 30 天报告存档</h3>
        {loading && <p style={{ color: '#999', fontSize: 14 }}>加载中...</p>}
        {!loading && reports.length === 0 && (
          <p style={{ color: '#999', fontSize: 14 }}>暂无报告，首份报告将于明日 08:00 生成</p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {reports.map((r, i) => (
            <a key={r.id} href={`/report/${r.date}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12,
                padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 16,
                transition: 'border-color 0.15s',
              }}>
                {i === 0 && (
                  <span style={{ fontSize: 11, padding: '2px 8px', background: '#E1F5EE', color: '#085041', borderRadius: 99, fontWeight: 600, whiteSpace: 'nowrap' }}>最新</span>
                )}
                <span style={{ fontSize: 13, color: '#999', whiteSpace: 'nowrap' }}>{r.date}</span>
                <span style={{ fontSize: 14, color: '#1a1a1a', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.summary}</span>
                <span style={{ color: '#ccc', fontSize: 16 }}>→</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </>
  )
}
