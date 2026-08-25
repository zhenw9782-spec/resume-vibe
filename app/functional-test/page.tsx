'use client'

/**
 * 功能测试页面（阶段8 · 步骤8.1）
 * 覆盖完整用户流程：首页 → 导航 → 输入 → AI 分析 → 结果展示 → 对比编辑 → PDF 导出
 * 以及限流缓存、错误处理、隐私弹窗、响应式与深色模式
 * 支持按项勾选「通过/失败」，结果持久化到 localStorage，自动生成测试报告
 */

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Link2, RefreshCcw, CheckCircle2, XCircle, Circle, PlayCircle } from 'lucide-react'

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
  items: TestItem[]
}

const STORAGE_KEY = 'resumevibe:functional_test_status'

const TEST_GROUPS: TestGroup[] = [
  {
    id: 'entry',
    title: '1. 流程入口与导航',
    desc: '首页、导航栏、页脚与静态页面跳转',
    items: [
      {
        id: 'entry-home',
        label: '首页正常加载',
        hint: '访问 http://localhost:3000，首页应显示 Logo、「简历极速打磨专家」副标题与「开始优化简历」按钮。',
        url: '/',
        urlLabel: '访问首页',
      },
      {
        id: 'entry-cta',
        label: '首页「开始优化简历」按钮跳转',
        hint: '点击首页主按钮，应跳转到 /analyze 分析页。',
      },
      {
        id: 'entry-nav',
        label: '导航栏链接与当前页高亮',
        hint: '点击「首页 / 优化简历 / 关于我们」，页面正确切换且当前链接高亮显示。',
      },
      {
        id: 'entry-hamburger',
        label: '移动端汉堡菜单',
        hint: '浏览器开发者工具切换设备模式（宽度 < 768px），点击左上角菜单图标可展开/收起，跳转后自动关闭。',
        url: '/responsive-test',
        urlLabel: '响应式测试页',
      },
      {
        id: 'entry-static',
        label: '关于/隐私/条款页面',
        hint: '访问 /about、/privacy、/terms 均正常显示，页脚「隐私政策 / 使用条款」链接可跳转。',
        url: '/about',
        urlLabel: '访问 /about',
      },
      {
        id: 'entry-theme',
        label: '深色模式切换',
        hint: '点击导航栏太阳/月亮图标切换深浅色，刷新后主题状态保持；三个静态页面深色模式下文字清晰。',
        url: '/color-test',
        urlLabel: '颜色测试页',
      },
    ],
  },
  {
    id: 'input',
    title: '2. 输入模块',
    desc: '字数统计、敏感信息脱敏、输入校验与隐私弹窗',
    items: [
      {
        id: 'input-privacy',
        label: '隐私声明弹窗',
        hint: '首次访问（清除 localStorage 后）自动弹出隐私声明，点击「我已了解」关闭且刷新后不再显示。',
        url: '/privacy-test',
        urlLabel: '隐私弹窗测试页',
      },
      {
        id: 'input-count',
        label: '实时字数统计',
        hint: '岗位描述显示 0/3000、简历显示 0/1500，输入时实时更新；接近上限（2700/1350）时 Badge 变红并出现精简提示。',
        url: '/input-panel-test',
        urlLabel: '输入面板测试页',
      },
      {
        id: 'input-mask',
        label: '敏感信息脱敏',
        hint: '输入手机号 13812345678 显示为 138****5678；邮箱、身份证号、银行卡号均被屏蔽。',
      },
      {
        id: 'input-validate',
        label: '输入校验',
        hint: '点击分析时：输入为空提示「请先填写岗位描述和简历内容」，JD < 10 字、简历 < 20 字均有对应提示。',
        url: '/error-handling-test',
        urlLabel: '错误处理测试页',
      },
      {
        id: 'input-warning',
        label: '接近上限变色提醒',
        hint: '岗位描述输入超过 2700 字、简历超过 1350 字时，字数 Badge 变红并显示「已接近字数上限」警告。',
      },
    ],
  },
  {
    id: 'analyze',
    title: '3. 分析与结果展示',
    desc: '进度条、匹配度分数、缺失关键词、优化建议与详细报告',
    items: [
      {
        id: 'analyze-progress',
        label: '分析中进度条与阶段文案',
        hint: '点击「AI 开始分析与改写」后显示进度条、阶段文案（初始化→提取关键词→语义匹配与改写→生成建议）与已用时间。',
      },
      {
        id: 'analyze-score',
        label: '匹配度分数与等级',
        hint: '结果顶部显示 0-100 分圆形进度条，颜色随分数变化（绿/黄/红），并显示高/中/低匹配标签。',
        url: '/analysis-result-test',
        urlLabel: '分析结果测试页',
      },
      {
        id: 'analyze-keywords',
        label: '缺失关键词与优化建议',
        hint: '结果页显示缺失关键词红色标签、优化建议列表与详细分析报告。',
        url: '/missing-keyword-analysis-test',
        urlLabel: '缺失关键词测试页',
      },
      {
        id: 'analyze-semantic',
        label: '语义相似度能力',
        hint: '测试页三组示例（相似/同义/不相似）能正确区分，API 不可用时自动降级为本地计算。',
        url: '/semantic-similarity-test',
        urlLabel: '语义相似度测试页',
      },
    ],
  },
  {
    id: 'compare',
    title: '4. 对比视图与编辑',
    desc: '左右分栏、修改说明、在线编辑与一键复制',
    items: [
      {
        id: 'compare-layout',
        label: '左右分栏对比',
        hint: '原版简历灰色背景、优化后简历绿色背景，桌面端左右分栏、移动端上下排列。',
        url: '/compare-view-test',
        urlLabel: '对比视图测试页',
      },
      {
        id: 'compare-explain',
        label: '修改说明与详细修改逻辑',
        hint: '点击「查看说明」显示修改摘要；「查看详细修改逻辑」显示新增/删除/修改/重排类型的修改前后内容与原因。',
      },
      {
        id: 'compare-edit',
        label: '在线编辑与实时预览',
        hint: '点击「编辑」进入编辑模式，输入实时预览并统计字数，有修改时显示「有未保存的修改」，保存后更新显示（绿色区域内容同步变化）。',
      },
      {
        id: 'compare-copy',
        label: '一键复制',
        hint: '点击「复制」按钮显示「已复制」，粘贴到记事本内容为优化后简历；2 秒后按钮恢复。',
      },
    ],
  },
  {
    id: 'pdf',
    title: '5. PDF 导出',
    desc: '模板切换、预览、下载与自动文件名',
    items: [
      {
        id: 'pdf-generate',
        label: 'PDF 生成与预览',
        hint: '生成 PDF 后右侧可上下滚动预览，中文字体正常渲染无乱码。',
        url: '/pdf-generator-test',
        urlLabel: 'PDF 测试页',
      },
      {
        id: 'pdf-template',
        label: '经典/现代两种模板切换',
        hint: '经典专业版为单栏 ATS 友好样式；现代设计版为左侧深蓝边栏；切换后预览即时更新。',
      },
      {
        id: 'pdf-download',
        label: 'PDF 下载',
        hint: '点击「下载 PDF」开始下载，打开后内容与预览一致，中文字体正常。',
      },
      {
        id: 'pdf-filename',
        label: '自动文件名',
        hint: '文件名符合 [姓名]_[岗位]_优化简历.pdf（如 张三_前端开发工程师_优化简历.pdf），修改姓名/岗位后同步变化。',
      },
    ],
  },
  {
    id: 'limit',
    title: '6. 限流、缓存与错误处理',
    desc: '后端 IP 限流、Redis 缓存、前端冷却与友好错误提示',
    items: [
      {
        id: 'limit-cache',
        label: 'Redis 缓存命中',
        hint: '测试页「连续 3 次相同输入」：第 2、3 次 fromCache=true 且耗时仅几十 ms；分析页结果顶部显示蓝色「已使用缓存结果」提示。',
        url: '/rate-limit-cache-test',
        urlLabel: '限流缓存测试页',
      },
      {
        id: 'limit-ratelimit',
        label: 'IP 限流（12 次/小时）',
        hint: '同一 IP 1 小时内第 13 次请求返回 429「请求过于频繁，请稍后再试」。',
      },
      {
        id: 'limit-cooldown',
        label: '前端 30 秒冷却',
        hint: '分析成功后 30 秒内再次点击分析，显示「操作过于频繁，请在 X 秒后再试」。',
      },
      {
        id: 'limit-error',
        label: '友好错误提示',
        hint: '断网/服务不可用/限流等异常显示中文标题、描述与恢复建议列表，而非原始英文错误。',
        url: '/error-handling-test',
        urlLabel: '错误处理测试页',
      },
    ],
  },
]

const SAMPLE_JD =
  '前端开发工程师，精通React、TypeScript、JavaScript，熟悉Node.js、Express，了解数据库设计（MySQL、MongoDB），具备团队协作和沟通能力，本科及以上学历。'

const SAMPLE_RESUME =
  '张三，5年前端开发经验，精通React、Vue等现代前端框架，熟悉TypeScript和JavaScript，掌握Node.js、Express等后端技术，熟悉MySQL、MongoDB数据库设计与优化，具备良好的团队协作与沟通能力，参与过多个大型项目开发。'

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

export default function FunctionalTestPage() {
  const [status, setStatus] = useState<StatusState>({})
  const [ollamaOnline, setOllamaOnline] = useState<boolean | null>(null)
  const [copied, setCopied] = useState(false)

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

  const { total, passCount, failCount, progress } = useMemo(() => {
    const all = TEST_GROUPS.flatMap((g) => g.items)
    const total = all.length
    const passCount = all.filter((i) => status[i.id] === 'pass').length
    const failCount = all.filter((i) => status[i.id] === 'fail').length
    const progress = Math.round(((passCount + failCount) / total) * 100)
    return { total, passCount, failCount, progress }
  }, [status])

  const failedItems = useMemo(
    () => TEST_GROUPS.flatMap((g) => g.items).filter((i) => status[i.id] === 'fail'),
    [status]
  )

  const copySample = async () => {
    try {
      await navigator.clipboard.writeText(`【岗位描述】\n${SAMPLE_JD}\n\n【简历】\n${SAMPLE_RESUME}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 剪贴板不可用时忽略
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">功能测试（阶段 8 · 步骤 8.1）</h1>
        <p className="text-gray-600">
          验证完整用户流程：首页 → 输入 → AI 分析 → 结果展示 → 对比编辑 → PDF 导出，并覆盖限流缓存与错误处理
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
            Ollama（AI 服务）：{ollamaOnline === false ? '未运行，请启动后测试' : ollamaOnline === true ? '已运行' : '检测中…'}
          </Badge>
          <Badge variant="outline">限流配额：每 IP 每小时 12 次，验证缓存/限流前请确认配额充足</Badge>
        </CardContent>
      </Card>

      {/* 测试总览 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>测试进度</CardTitle>
          <CardDescription>
            通过 {passCount} / 失败 {failCount} / 共 {total} 项，完成率 {progress}%
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="sm" onClick={() => markAll('pass')}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> 全部标记为通过
            </Button>
            <Button size="sm" variant="outline" onClick={resetAll}>
              <RefreshCcw className="h-4 w-4 mr-1" /> 重置测试记录
            </Button>
            <Button size="sm" variant="secondary" onClick={copySample}>
              {copied ? '已复制' : '复制示例 JD + 简历'}
            </Button>
            <a href="/analyze" className="inline-flex">
              <Button size="sm" variant="secondary">
                <PlayCircle className="h-4 w-4 mr-1" /> 前往分析页实测
              </Button>
            </a>
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
          <CardDescription>汇总本次功能测试结果</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary">通过 {passCount} 项</Badge>
            <Badge variant="destructive">失败 {failCount} 项</Badge>
            <Badge variant="outline">未测 {total - passCount - failCount} 项</Badge>
          </div>
          {failCount > 0 && (
            <Alert variant="destructive">
              <AlertTitle>以下项目未通过，请在修复后重新测试</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {failedItems.map((item) => (
                    <li key={item.id}>{item.label}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          {passCount === total && total > 0 && (
            <Alert>
              <AlertTitle>功能测试全部通过</AlertTitle>
              <AlertDescription>
                完整用户流程与各功能模块均正常，可进入下一步骤（步骤 8.2：性能测试）。
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 完整流程示例数据 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>端到端流程示例数据</CardTitle>
          <CardDescription>用于 /analyze 页面实测的完整 JD 与简历（点击上方按钮一键复制）</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-1">岗位描述（JD）</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-md leading-relaxed">{SAMPLE_JD}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">简历内容</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-md leading-relaxed">{SAMPLE_RESUME}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">端到端测试步骤</h3>
            <ol className="list-decimal pl-5 space-y-1 text-gray-700">
              <li>打开 /analyze，粘贴示例 JD 与简历，验证字数统计与脱敏</li>
              <li>点击「AI 开始分析与改写」，观察进度条与阶段文案</li>
              <li>验证结果页：分数、等级、缺失关键词、建议、报告</li>
              <li>对比视图：查看说明 → 编辑 → 复制</li>
              <li>PDF 导出：切换模板 → 预览 → 下载（文件名含姓名与岗位）</li>
              <li>再次提交相同输入，验证「已使用缓存结果」蓝色提示</li>
              <li>30 秒内再次提交，验证「操作过于频繁」冷却提示</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* 模块测试入口 */}
      <Card>
        <CardHeader>
          <CardTitle>各功能模块测试入口</CardTitle>
          <CardDescription>每个模块均有独立测试页，可快速定位问题</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { url: '/input-panel-test', label: '输入面板 / 字数统计 / 脱敏' },
              { url: '/privacy-test', label: '隐私声明弹窗' },
              { url: '/keyword-extractor-test', label: '关键词提取' },
              { url: '/matching-algorithm-test', label: '匹配算法' },
              { url: '/semantic-similarity-test', label: '语义相似度' },
              { url: '/missing-keyword-analysis-test', label: '缺失关键词分析' },
              { url: '/analysis-result-test', label: '分析结果组件' },
              { url: '/compare-view-test', label: '对比视图 / 编辑 / 复制' },
              { url: '/pdf-generator-test', label: 'PDF 生成 / 预览 / 下载' },
              { url: '/rate-limit-cache-test', label: '限流 / 缓存' },
              { url: '/error-handling-test', label: '错误处理' },
              { url: '/responsive-test', label: '响应式 / 深色模式' },
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
