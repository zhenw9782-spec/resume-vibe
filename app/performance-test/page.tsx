'use client'

/**
 * 性能测试页面（阶段8 · 步骤8.2）
 * 覆盖三大性能指标：首屏加载（< 2s）、AI 响应（< 30s）、PDF 生成（< 5s）
 * 以及包体积、Lighthouse 评分、交互流畅度等辅助指标
 * 支持按项勾选「通过/失败」，结果持久化到 localStorage，自动生成测试报告
 */

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Link2, RefreshCcw, CheckCircle2, XCircle, Circle } from 'lucide-react'

type TestStatus = 'pass' | 'fail' | 'none'

interface TestItem {
  id: string
  label: string
  hint: string
  url?: string
  urlLabel?: string
}

interface TestGroup {
  id: string
  title: string
  desc: string
  needsAi?: boolean
  items: TestItem[]
}

const STORAGE_KEY = 'resumevibe:performance_test_status'

const TEST_GROUPS: TestGroup[] = [
  {
    id: 'firstpaint',
    title: '1. 首屏加载时间（目标 < 2 秒）',
    desc: '使用 Chrome DevTools → Network / Performance 测「DOMContentLoaded 完成 + 首屏可视内容出现」',
    items: [
      {
        id: 'fps-home',
        label: '首页首屏加载 < 2s',
        hint: 'DevTools Network（勾选 Disable cache）刷新 /：从开始到首页 Logo、标题、按钮全部可见 ≤ 2s。',
        url: '/',
        urlLabel: '访问首页',
      },
      {
        id: 'fps-analyze',
        label: '分析页首屏加载 < 2s',
        hint: '同上测 /analyze：双输入卡片与按钮完整渲染 ≤ 2s。',
        url: '/analyze',
        urlLabel: '访问分析页',
      },
      {
        id: 'fps-pdf',
        label: 'PDF 测试页首屏加载 < 2s',
        hint: '同上测 /pdf-generator-test：该页引入 PDF 预览库，体积较大，仍应 ≤ 2s（冷缓存刷新一次）。',
        url: '/pdf-generator-test',
        urlLabel: '访问 PDF 测试页',
      },
      {
        id: 'fps-bundle',
        label: 'First Load JS 包体积合理',
        hint: '运行 npm run build，查看各路由 First Load JS 输出（当前约 104 kB）；总包体无明显异常增长（单页 ≤ 150 kB 可接受）。',
      },
    ],
  },
  {
    id: 'ai',
    title: '2. AI 响应时间（目标 < 30 秒）',
    desc: '需要 Ollama 已启动且限流配额充足；用 DevTools Network 的 Timing 面板测请求耗时',
    needsAi: true,
    items: [
      {
        id: 'ai-fullflow',
        label: 'AI 全流程分析 < 30s',
        hint: '访问 /analyze，粘贴示例 JD + 简历点击「AI 开始分析与改写」，从点击到结果完全展示总耗时 < 30s（页面右上方会显示已用时间）。',
        url: '/analyze',
        urlLabel: '前往分析页',
      },
      {
        id: 'ai-stage',
        label: '各阶段耗时分布合理',
        hint: '观察进度条阶段文案（初始化→提取关键词→语义匹配与改写→生成建议），「语义匹配与改写」占比合理，无单阶段长时间卡死。',
      },
      {
        id: 'ai-semantic',
        label: '语义相似度计算耗时',
        hint: '访问 /semantic-similarity-test 点三组示例：每组展示耗时（embedding 模式或本地降级），应在数秒内返回。',
        url: '/semantic-similarity-test',
        urlLabel: '语义相似度测试页',
      },
      {
        id: 'ai-cache',
        label: '缓存命中响应（毫秒级）',
        hint: '相同输入连续提交，第 2、3 次走 Redis 缓存：Network 中 /api/analyze 耗时仅几十 ms，页面显示「已使用缓存结果」。',
        url: '/rate-limit-cache-test',
        urlLabel: '限流缓存测试页',
      },
    ],
  },
  {
    id: 'pdf',
    title: '3. PDF 生成时间（目标 < 5 秒）',
    desc: '在 /pdf-generator-test 页用 DevTools Network 或秒表测量「点击生成」到「预览出现」',
    items: [
      {
        id: 'pdf-classic',
        label: '经典模板生成 < 5s',
        hint: '选择「经典专业版」点击生成/预览：从点击到右侧预览内容出现 < 5s。',
        url: '/pdf-generator-test',
        urlLabel: 'PDF 测试页',
      },
      {
        id: 'pdf-modern',
        label: '现代模板生成 < 5s',
        hint: '切换「现代设计版」，预览即时更新（重新生成）< 5s。',
      },
      {
        id: 'pdf-download',
        label: 'PDF 下载响应 < 5s',
        hint: '点击「下载 PDF」：从点击到浏览器开始保存文件/下载完成 < 5s，生成文件名包含姓名与岗位。',
      },
    ],
  },
  {
    id: 'extra',
    title: '4. 辅助性能指标',
    desc: '整体体验与资源使用情况',
    items: [
      {
        id: 'extra-lighthouse',
        label: 'Lighthouse Performance ≥ 90',
        hint: 'DevTools → Lighthouse → 类别选 Performance → 生成报告，评分 ≥ 90。',
      },
      {
        id: 'extra-interaction',
        label: '交互流畅无卡顿',
        hint: '导航切换、深色模式切换、对比视图编辑输入时，页面响应及时、滚动流畅，无明显掉帧。',
        url: '/color-test',
        urlLabel: '颜色/深色模式测试页',
      },
      {
        id: 'extra-memory',
        label: '内存占用稳定',
        hint: 'DevTools → Performance → Memory 录制主流程后快照对比：长时间使用（多次分析/PDF 切换）无持续内存增长或泄漏。',
      },
    ],
  },
]

interface StatusState {
  [id: string]: TestStatus
}

function loadStatus(): StatusState {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StatusState) : {}
  } catch {
    return {}
  }
}

export default function PerformanceTestPage() {
  const [status, setStatus] = useState<StatusState>({})
  const [ollamaOnline, setOllamaOnline] = useState<boolean | null>(null)

  useEffect(() => {
    setStatus(loadStatus())
    let cancelled = false
    const checkOllama = async () => {
      try {
        const res = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(4000) })
        if (!cancelled) setOllamaOnline(res.ok)
      } catch {
        if (!cancelled) setOllamaOnline(false)
      }
    }
    checkOllama()
    return () => {
      cancelled = true
    }
  }, [])

  const toggle = (id: string, value: TestStatus) => {
    setStatus((prev) => {
      const next = { ...prev, [id]: value === prev[id] ? 'none' : value }
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // localStorage 不可用时忽略
      }
      return next
    })
  }

  const resetAll = () => {
    setStatus({})
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // 忽略
    }
  }

  const markAll = (value: TestStatus) => {
    const next: StatusState = {}
    for (const group of TEST_GROUPS) {
      for (const item of group.items) {
        next[item.id] = value
      }
    }
    setStatus(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // 忽略
    }
  }

  const { total, passCount, failCount, progress, aiTotal, aiPass } = useMemo(() => {
    const all = TEST_GROUPS.flatMap((g) => g.items)
    const aiItems = TEST_GROUPS.find((g) => g.needsAi)?.items ?? []
    return {
      total: all.length,
      passCount: all.filter((i) => status[i.id] === 'pass').length,
      failCount: all.filter((i) => status[i.id] === 'fail').length,
      progress: Math.round((all.filter((i) => status[i.id] !== 'none').length / all.length) * 100),
      aiTotal: aiItems.length,
      aiPass: aiItems.filter((i) => status[i.id] === 'pass').length,
    }
  }, [status])

  const failedItems = useMemo(
    () => TEST_GROUPS.flatMap((g) => g.items).filter((i) => status[i.id] === 'fail'),
    [status]
  )

  const pendingAi: TestItem[] = useMemo(
    () => TEST_GROUPS.filter((g) => g.needsAi).flatMap((g) => g.items).filter((i) => status[i.id] === 'none'),
    [status]
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">性能测试（阶段 8 · 步骤 8.2）</h1>
        <p className="text-gray-600">
          验证三项性能目标：首屏加载 &lt; 2 秒、AI 响应 &lt; 30 秒、PDF 生成 &lt; 5 秒，并检查包体积与交互流畅度
        </p>
      </div>

      {/* 测试环境自检 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>测试环境自检</CardTitle>
          <CardDescription>开始前确认以下依赖是否就绪</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Badge variant="outline">开发服务器 localhost:3000（当前页面已加载，正常）</Badge>
          <Badge variant={ollamaOnline === false ? 'destructive' : ollamaOnline === true ? 'secondary' : 'outline'}>
            Ollama（AI 服务）：{ollamaOnline === false ? '未运行，AI 响应项请在启动后测试' : ollamaOnline === true ? '已运行' : '检测中…'}
          </Badge>
          <Badge variant="outline">限流配额：每 IP 每小时 12 次，AI 响应测试前请确认配额充足</Badge>
          <Badge variant="outline">测量工具：Chrome DevTools（Network / Performance / Lighthouse）</Badge>
        </CardContent>
      </Card>

      {/* 测试总览 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>测试进度</CardTitle>
          <CardDescription>
            通过 {passCount} / 失败 {failCount} / 共 {total} 项，完成率 {progress}%
            {aiTotal > 0 && aiPass === aiTotal ? '；AI 响应项已全部通过' : '；AI 响应项待测 ' + (aiTotal - aiPass) + ' 项'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="sm" onClick={() => markAll('pass')}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> 全部标记为通过
            </Button>
            <Button size="sm" variant="outline" onClick={resetAll}>
              <RefreshCcw className="h-4 w-4 mr-1" /> 重置测试记录
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 分组测试清单 */}
      {TEST_GROUPS.map((group) => (
        <Card key={group.id} className="mb-6">
          <CardHeader>
            <CardTitle>{group.title}</CardTitle>
            <CardDescription>{group.desc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {group.items.map((item) => {
              const s = status[item.id] || 'none'
              return (
                <div key={item.id} className="border rounded-md p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {s === 'pass' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                      ) : s === 'fail' ? (
                        <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300 shrink-0" />
                      )}
                      <span className="font-medium">{item.label}</span>
                      {s === 'pass' && <Badge variant="secondary">通过</Badge>}
                      {s === 'fail' && <Badge variant="destructive">失败</Badge>}
                      {s === 'none' && group.needsAi && <Badge variant="outline">需 AI 配额</Badge>}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => toggle(item.id, 'pass')}>
                        通过
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => toggle(item.id, 'fail')}>
                        失败
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{item.hint}</p>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary mt-1">
                      <Link2 className="h-3.5 w-3.5" /> {item.urlLabel || '打开测试页'}
                    </a>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      ))}

      {/* 测试报告 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>测试报告</CardTitle>
          <CardDescription>汇总本次性能测试结果</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary">通过 {passCount} 项</Badge>
            <Badge variant="destructive">失败 {failCount} 项</Badge>
            <Badge variant="outline">未测 {total - passCount - failCount} 项</Badge>
          </div>
          {failCount > 0 && (
            <Alert variant="destructive">
              <AlertTitle>以下项目未通过，请在优化后重新测试</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {failedItems.map((item) => (
                    <li key={item.id}>{item.label}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          {pendingAi.length > 0 && (
            <Alert>
              <AlertTitle>AI 响应项待补测</AlertTitle>
              <AlertDescription>
                以下 {pendingAi.length} 项依赖 AI 配额 / Ollama，可待限额窗口重置后统一补测：
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {pendingAi.map((item) => (
                    <li key={item.id}>{item.label}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          {passCount === total && total > 0 && (
            <Alert>
              <AlertTitle>性能测试全部通过</AlertTitle>
              <AlertDescription>
                三项性能指标达标，可进入下一步骤（步骤 8.3：兼容性测试）。
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 关键路由入口 */}
      <Card>
        <CardHeader>
          <CardTitle>关键路由入口</CardTitle>
          <CardDescription>性能测试涉及的页面快捷访问</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { url: '/', label: '首页（首屏加载）' },
              { url: '/analyze', label: '分析页（首屏 + AI 响应）' },
              { url: '/pdf-generator-test', label: 'PDF 页（首屏 + 生成/下载）' },
              { url: '/semantic-similarity-test', label: '语义相似度（计算耗时）' },
              { url: '/rate-limit-cache-test', label: '限流 / 缓存（命中响应）' },
              { url: '/functional-test', label: '功能测试（回归联动）' },
            ].map((entry) => (
              <a key={entry.url} href={entry.url} target="_blank" rel="noreferrer">
                <div className="border rounded-md p-3 hover:border-primary hover:shadow-sm transition">
                  <p className="font-medium text-primary">{entry.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">/ {entry.url.replace(/^\//, '')}</p>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}