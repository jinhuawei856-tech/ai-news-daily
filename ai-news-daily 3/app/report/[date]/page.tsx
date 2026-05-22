import { supabase } from '@/lib/supabase'
import { DailyReport, NewsItem, CATEGORY_CONFIG, IMPACT_CONFIG, Category } from '@/lib/types'
import { notFound } from 'next/navigation'

async function getReport(date: string): Promise<DailyReport | null> {
  const { data } = await supabase
    .from('reports')
    .select('*')
    .eq('date', date)
    .single()
  return data
}

function NewsCard({ item }: { item: NewsItem }) {
  const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.tool
  const imp = IMPACT_CONFIG[item.impact]
  return (
    <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: '20px 24px', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}>{cat.label}</span>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: imp.bg, color: imp.color }}>{imp.label}</span>
        <span style={{ fontSize: 11, color: '#999', marginLeft: 'auto' }}>{item.source}</span>
      </div>
      <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.4 }}>{item.title}</h3>
      <p style={{ margin: '0 0 12px', fontSize: 13, color: '#555', lineHeight: 1.7 }}>{item.body}</p>
      {item.actionable && (
        <div style={{ background: '#f0faf5', borderLeft: '3px solid #1D9E75', padding: '8px 12px', borderRadius: '0 6px 6px 0' }}>
          <span style={{ fontSize: 12, color: '#085041' }}><strong>⚡ 立即行动：</strong>{item.actionable}</span>
        </div>
      )}
      {item.tags?.length > 0 && (
        <div style={{ marginTop: 10 }}>
          {item.tags.map(t => (
            <span key={t} style={{ fontSize: 11, color: '#888', background: '#f5f5f5', padding: '2px 8px', borderRadius: 4, marginRight: 4 }}>#{t}</span>
          ))}
        </div>
      )}
    </div>
  )
}

const CAT_ORDER: Category[] = ['tool', 'platform', 'method', 'copyright', 'biz', 'viral']

export default async function ReportPage({ params }: { params: { date: string } }) {
  const report = await getReport(params.date)
  if (!report) notFound()

  const highItems = report.items.filter(i => i.impact === 'high')
  const otherItems = report.items.filter(i => i.impact !== 'high')

  const grouped = CAT_ORDER.reduce((acc, cat) => {
    const items = otherItems.filter(i => i.category === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {} as Record<Category, NewsItem[]>)

  const dateStr = new Date(report.date).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  })

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <a href="/" style={{ fontSize: 13, color: '#999', textDecoration: 'none' }}>← 返回首页</a>
      </div>

      <div style={{ background: '#0f0f0f', borderRadius: 16, padding: '28px 32px', marginBottom: 24 }}>
        <p style={{ margin: '0 0 4px', fontSize: 11, color: '#555', letterSpacing: 2 }}>{dateStr.toUpperCase()}</p>
        <h1 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: '#fff' }}>每日 AI 创作情报</h1>
        <p style={{ margin: 0, fontSize: 14, color: '#1D9E75' }}>{report.summary}</p>
      </div>

      {highItems.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ margin: '0 0 12px', fontSize: 11, color: '#999', letterSpacing: 1, fontWeight: 600 }}>HIGH IMPACT · 重点关注</p>
          {highItems.map((item, i) => <NewsCard key={i} item={item} />)}
        </div>
      )}

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 24 }}>
          <p style={{ margin: '0 0 12px', fontSize: 11, color: '#999', letterSpacing: 1, fontWeight: 600 }}>
            {CATEGORY_CONFIG[cat as Category]?.label.toUpperCase()}
          </p>
          {items.map((item, i) => <NewsCard key={i} item={item} />)}
        </div>
      ))}

      <div style={{ textAlign: 'center', padding: '24px 0 0', borderTop: '1px solid #e8e8e8' }}>
        <p style={{ fontSize: 13, color: '#999', margin: '0 0 12px' }}>觉得有用？订阅每日推送</p>
        <a href="/" style={{ display: 'inline-block', background: '#0f0f0f', color: '#fff', padding: '10px 24px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>前往订阅 →</a>
      </div>
    </>
  )
}
