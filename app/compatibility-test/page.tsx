'use client'

/**
 * 兼容性测试页面（阶段8 · 步骤8.3）
 * 覆盖浏览器兼容（Chrome / Edge / Firefox）、响应式布局、浏览器 API、
 * 中文字体、深色模式与稳定性检查
 * 每个测试项在三个浏览器中分别标记「通过/失败」，结果持久化到 localStorage
 * 说明：Safari 仅 macOS/iOS 可用，Windows 系统无法安装，部署后可在 Mac 上补测
 */

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Link2, RefreshCcw, CheckCircle2, XCircle, Circle } from 'lucide-react'

type TestStatus = 'pass' | 'fail' | 'none'

interface Browser {
  id: string
  label: string
  hint: string
}

interface TestItem {
  id: string
  label: string
  hint: string
  url?: string
  urlLabel?: string
  needsAi?: boolean
}

interface TestGroup {
  id: string
  title: string
  desc: string
  items: TestItem[]
}

const STORAGE_KEY = 'resumevibe:compatibility_test_status'

const BROWSERS: Browser[] = [
  {
    id: 'chrome',
    label: 'Chrome',
    hint: '开始菜单 → Google Chrome，或双击桌面快捷方式',
  },
  {
    id: 'edge',
    label: 'Edge',
    hint: 'Windows 自带浏览器，开始菜单 → Microsoft Edge',
  },
  {
    id: 'firefox',
    label: 'Firefox',
    hint: '若未安装：访问 https://www.mozilla.org/firefox 下载安装',
  },
]

const TEST_GROUPS: TestGroup[] = [
  {
    id: 'core',
    title: '1. 核心页面与完整流程（Chrome / Edge / Firefox）',
    desc: '在三个浏览器中分别打开以下页面并执行对应操作，确认功能与 Chrome 一致',
    items: [
      {
        id: 'home',
        label: '首页渲染与导航',
        hint: 'Logo、主标题、「开始优化简历」按钮与特性卡片正常显示；导航链接跳转正确；无布局错乱。',
        url: '/',
        urlLabel: '访问首页',
      },
      {
        id: 'analyze',
        label: '分析页完整流程',
        hint: '输入示例 JD + 简历 → 「AI 开始分析与改写」→ 进度条 → 匹配度分数/缺失关键词/建议 → 对比视图 → PDF 预览与下载，全程无报错。',
        url: '/analyze',
        urlLabel: '前往分析页',
        needsAi: true,
      },
      {
        id: 'pdf',
        label: 'PDF 预览 / 模板切换 / 下载',
        hint: '打开 /pdf-generator-test：经典/现代模板都能生成预览，点击「下载 PDF」可正常保存文件，文件名含姓名与岗位。',
        url: '/pdf-generator-test',
        urlLabel: 'PDF 测试页',
      },
      {
        id: 'compare',
        label: '对比视图编辑与一键复制',
        hint: '打开 /compare-view-test：查看说明、展开/收起、在线编辑保存、一键复制（粘贴到记事本验证内容）。',
        url: '/compare-view-test',
        urlLabel: '对比视图测试页',
      },
      {
        id: 'cache',
        label: '限流缓存测试页',
        hint: '打开 /rate-limit-cache-test：连续 3 次相同输入，第 2、3 次 fromCache=true；点击清除前端冷却正常。',
        url: '/rate-limit-cache-test',
        urlLabel: '限流缓存测试页',
        needsAi: true,
      },
      {
        id: 'semantic',
        label: '语义相似度计算',
        hint: '打开 /semantic-similarity-test：三组示例都能出结果（embedding 或本地降级），页面正常渲染。',
        url: '/semantic-similarity-test',
        urlLabel: '语义相似度测试页',
        needsAi: true,
      },
      {
        id: 'privacy',
        label: '隐私声明弹窗',
        hint: '清除 localStorage 后访问任一页面，隐私弹窗自动显示；点击「我已了解」关闭；刷新后不再显示。',
        url: '/privacy-test',
        urlLabel: '隐私弹窗测试页',
      },
      {
        id: 'static',
        label: '静态页渲染',
        hint: '关于我们 / 隐私政策 / 使用条款 三页文字、图标、列表均正常渲染，无乱码、无布局错乱。',
        url: '/about',
        urlLabel: '关于我们',
      },
    ],
  },
  {
    id: 'responsive',
    title: '2. 布局与响应式（每浏览器调整窗口宽度）',
    desc: '按 F12 → 设备模式（Ctrl+Shift+M），或直接拖动窗口宽度，逐档验证布局',
    items: [
      {
        id: 'desktop',
        label: '桌面端布局（≥ 1024px）',
        hint: '首页特性卡三列、分析页输入区并排两栏、对比视图左右分栏，页脚正常。',
      },
      {
        id: 'tablet',
        label: '平板宽度（768-1024px）',
        hint: '首页特性卡降为两列，导航菜单仍完整显示，无内容溢出或遮挡。',
      },
      {
        id: 'mobile',
        label: '移动端宽度（< 640px）',
        hint: '导航变为汉堡菜单（☰），点击展开/收起正常、跳转后自动关闭；各页面单列布局，无横向滚动条。',
      },
    ],
  },
  {
    id: 'api',
    title: '3. 浏览器 API 兼容性',
    desc: '验证依赖浏览器内置 API 的功能在各浏览器下表现一致',
    items: [
      {
        id: 'clipboard',
        label: '一键复制（navigator.clipboard）',
        hint: '对比视图点击「复制」，粘贴到记事本验证内容完整；若浏览器拦截剪贴板权限，需在地址栏权限设置中允许。',
        url: '/compare-view-test',
        urlLabel: '对比视图测试页',
      },
      {
        id: 'download',
        label: 'PDF 文件下载（Blob + URL.createObjectURL）',
        hint: '每个浏览器点击「下载 PDF」都应正常保存 .pdf 文件，且下载的文件能正常打开。',
        url: '/pdf-generator-test',
        urlLabel: 'PDF 测试页',
      },
      {
        id: 'storage',
        label: 'localStorage 持久化',
        hint: '刷新页面后：主题选择、前端 30 秒冷却记录、测试页通过/失败标记均应保留。',
      },
      {
        id: 'pdfjs',
        label: 'PDF 预览（pdfjs worker）',
        hint: '/pdf-generator-test 右侧预览区（@react-pdf-viewer）能正常渲染，可上下滚动，无空白/黑屏。',
        url: '/pdf-generator-test',
        urlLabel: 'PDF 测试页',
      },
      {
        id: 'fonts',
        label: '中文字体渲染',
        hint: '所有中文内容清晰无乱码、无方块（□）、无缺字；PDF 导出中文也正常。',
      },
      {
        id: 'darkmode',
        label: '深色 / 浅色模式',
        hint: '导航栏主题切换按钮点击后，首页、分析页、关于/隐私/条款等页面文字与背景对比度正常、清晰可读。',
      },
    ],
  },
  {
    id: 'stability',
    title: '4. 稳定性与错误监控',
    desc: '在每个浏览器中打开 DevTools 检查，发现问题在测试报告中记录',
    items: [
      {
        id: 'console',
        label: '控制台无 JS 报错',
        hint: 'DevTools → Console：正常操作过程中不应有红色报错（Uncaught / TypeError / ReferenceError 等）。',
      },
      {
        id: 'network',
        label: '无 404 / 加载失败资源',
        hint: 'DevTools → Network：刷新各页面，不应有红色失败请求（js/css/font/api 资源均 200）。',
      },
      {
        id: 'security',
        label: '无安全 / 混合内容警告',
        hint: 'Console 中不应出现「Mixed Content」「blocked by Content Security Policy」等安全类警告。',
      },
    ],
  },
]

interface StatusState {
  [key: string]: TestStatus
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

function detectBrowser(): string {
  if (typeof window === 'undefined') return ''
  const ua = window.navigator.userAgent
  if (/Edg\//.test(ua)) return 'edge'
  if (/Firefox\//.test(ua)) return 'firefox'
  if (/Chrome\//.test(ua)) return 'chrome'
  return ''
}

export default function CompatibilityTestPage() {
  const [status, setStatus] = useState<StatusState>({})
  const [currentBrowser, setCurrentBrowser] = useState('')

  useEffect(() => {
    setStatus(loadStatus())
    setCurrentBrowser(detectBrowser())
  }, [])

  const keyFor = (itemId: string, browserId: string) => `${itemId}::${browserId}`

  const cycle = (itemId: string, browserId: string) => {
    const key = keyFor(itemId, browserId)
    setStatus((prev) => {
      const order: TestStatus[] = ['none', 'pass', 'fail']
      const cur = prev[key] || 'none'
      const next = order[(order.indexOf(cur) + 1) % order.length]
      const updated = { ...prev, [key]: next }
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch {
        // localStorage 不可用时忽略
      }
      return updated
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

  const { total, passCount, failCount, progress, perBrowser } = useMemo(() => {
    const allItems = TEST_GROUPS.flatMap((g) => g.items)
    const per: Record<string, { total: number; pass: number; fail: number }> = {}
    for (const b of BROWSERS) {
      per[b.id] = { total: 0, pass: 0, fail: 0 }
    }
    let pass = 0
    let fail = 0
    for (const item of allItems) {
      for (const b of BROWSERS) {
        const s = status[keyFor(item.id, b.id)] || 'none'
        if (s === 'pass') pass++
        if (s === 'fail') fail++
        per[b.id].total++
        if (s === 'pass') per[b.id].pass++
        if (s === 'fail') per[b.id].fail++
      }
    }
    return {
      total: allItems.length * BROWSERS.length,
      passCount: pass,
      failCount: fail,
      progress: Math.round((pass + fail) / (allItems.length * BROWSERS.length) * 100),
      perBrowser: per,
    }
  }, [status])

  const failedItems = useMemo(
    () =>
      TEST_GROUPS.flatMap((g) =>
        g.items
          .flatMap((item) =>
            BROWSERS.filter((b) => status[keyFor(item.id, b.id)] === 'fail').map((b) => ({
              label: `${item.label}（${b.label}）`,
            }))
          )
      ),
    [status]
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">兼容性测试（阶段 8 · 步骤 8.3）</h1>
        <p className="text-gray-600">
          在 Chrome、Edge、Firefox 三个浏览器中逐一验证功能、布局、浏览器 API 与稳定性
        </p>
      </div>

      {/* 测试环境自检 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>测试环境自检</CardTitle>
          <CardDescription>开始前确认浏览器与依赖是否就绪</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Badge variant="outline">开发服务器 localhost:3000（当前页面已加载，正常）</Badge>
          {currentBrowser && (
            <Badge variant="secondary">当前浏览器：{BROWSERS.find((b) => b.id === currentBrowser)?.label ?? currentBrowser}</Badge>
          )}
          <Badge variant="outline">被测浏览器：Chrome / Edge / Firefox</Badge>
          <Badge variant="outline">Safari：Windows 无法安装，部署后在 Mac 补测</Badge>
        </CardContent>
      </Card>

      {/* 测试进度 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>测试进度</CardTitle>
          <CardDescription>
            通过 {passCount} / 失败 {failCount} / 共 {total} 项，完成率 {progress}%
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex flex-wrap gap-4">
            {BROWSERS.map((b) => (
              <div key={b.id} className="flex items-center gap-2">
                <Badge variant={perBrowser[b.id].fail > 0 ? 'destructive' : perBrowser[b.id].pass === perBrowser[b.id].total ? 'secondary' : 'outline'}>
                  {b.label}：{perBrowser[b.id].pass} / {perBrowser[b.id].total}
                </Badge>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
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
            {group.items.map((item) => (
              <div key={item.id} className="border rounded-md p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium">{item.label}</span>
                    {item.needsAi && <Badge variant="outline">需 AI 配额</Badge>}
                  </div>
                  <div className="flex gap-2">
                    {BROWSERS.map((b) => {
                      const s = status[keyFor(item.id, b.id)] || 'none'
                      return (
                        <Button
                          key={b.id}
                          size="sm"
                          variant={s === 'pass' ? 'default' : s === 'fail' ? 'destructive' : 'outline'}
                          onClick={() => cycle(item.id, b.id)}
                          className="gap-1"
                        >
                          {s === 'pass' ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : s === 'fail' ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                          {b.label}
                        </Button>
                      )
                    })}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{item.hint}</p>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary mt-1">
                    <Link2 className="h-3.5 w-3.5" /> {item.urlLabel || '打开测试页'}
                  </a>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* 测试报告 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>测试报告</CardTitle>
          <CardDescription>汇总本次兼容性测试结果</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary">通过 {passCount} 项</Badge>
            <Badge variant="destructive">失败 {failCount} 项</Badge>
            <Badge variant="outline">未测 {total - passCount - failCount} 项</Badge>
          </div>
          {failCount > 0 && (
            <Alert variant="destructive">
              <AlertTitle>以下项目未通过，请在对应浏览器中复测确认</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {failedItems.map((item, i) => (
                    <li key={i}>{item.label}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          {passCount === total && total > 0 && (
            <Alert>
              <AlertTitle>兼容性测试全部通过</AlertTitle>
              <AlertDescription>
                Chrome / Edge / Firefox 三浏览器验证无兼容性问题，可进入下一步骤（步骤 8.4：用户体验测试）。
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 关键路由入口 */}
      <Card>
        <CardHeader>
          <CardTitle>关键路由入口</CardTitle>
          <CardDescription>兼容性测试涉及的页面快捷访问（每个页面都需在三个浏览器中打开验证）</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { url: '/', label: '首页（导航/布局）' },
              { url: '/analyze', label: '分析页（完整流程）' },
              { url: '/pdf-generator-test', label: 'PDF（预览/下载）' },
              { url: '/compare-view-test', label: '对比视图（编辑/复制）' },
              { url: '/rate-limit-cache-test', label: '限流 / 缓存' },
              { url: '/semantic-similarity-test', label: '语义相似度' },
              { url: '/privacy-test', label: '隐私弹窗' },
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
