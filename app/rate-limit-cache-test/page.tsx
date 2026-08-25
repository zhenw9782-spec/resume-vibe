/**
 * 限流与缓存测试页面
 * 验证：
 *  1. 后端 API /api/analyze 的 IP 限流（12 次/小时）
 *  2. SHA-256 输入哈希 + Redis 缓存（相同输入 5 分钟直接返回，不调用 AI）
 *  3. 前端 30 秒冷却时间限制（localStorage）
 *  4. 缓存命中时返回 fromCache=true，耗时极短
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

const DEFAULT_JD = '前端开发工程师，精通React、TypeScript、JavaScript，熟悉Node.js、Express，了解数据库设计（MySQL、MongoDB），具备团队协作和沟通能力，本科及以上学历。'
const DEFAULT_RESUME = '张三，5年前端开发经验，精通React、Vue等现代前端框架，熟悉TypeScript和JavaScript，掌握Node.js、Express等后端技术，熟悉MySQL、MongoDB数据库设计与优化，具备良好的团队协作与沟通能力，参与过多个大型项目开发。'

export default function RateLimitCacheTestPage() {
    const [jobDescription, setJobDescription] = useState(DEFAULT_JD)
    const [resumeText, setResumeText] = useState(DEFAULT_RESUME)
    const [loading, setLoading] = useState(false)
    const [logs, setLogs] = useState<Array<{ time: string; msg: string; type: 'info' | 'success' | 'error' }>>([])
    const [cooldownLeft, setCooldownLeft] = useState<number>(0)

    const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
        const time = new Date().toLocaleTimeString('zh-CN', { hour12: false })
        setLogs((prev) => [{ time, msg, type }, ...prev])
    }

    // 读取 localStorage 冷却剩余秒数
    const readCooldown = (): number => {
        const last = Number(localStorage.getItem('resumevibe:last_analysis_time') || 0)
        const remaining = 30000 - (Date.now() - last)
        setCooldownLeft(remaining > 0 ? Math.ceil(remaining / 1000) : 0)
        return remaining > 0 ? Math.ceil(remaining / 1000) : 0
    }

    const runRequest = async (label: string, jd: string, resume: string) => {
        setLoading(true)
        addLog(`[${label}] 发起请求...`)
        const start = Date.now()
        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobDescription: jd, resumeText: resume }),
            })
            const data = await res.json()
            const cost = Date.now() - start
            if (res.ok) {
                addLog(
                    `[${label}] 成功，耗时 ${cost}ms，fromCache=${data?.fromCache}, matchScore=${data?.result?.matchScore}`,
                    'success'
                )
            } else if (res.status === 429) {
                addLog(`[${label}] 限流拦截(429)：${data?.error}`, 'error')
            } else {
                addLog(`[${label}] 失败(${res.status})：${data?.error}`, 'error')
            }
        } catch (err) {
            addLog(`[${label}] 请求异常：${err instanceof Error ? err.message : String(err)}`, 'error')
        } finally {
            setLoading(false)
        }
    }

    // 连续提交相同输入（验证缓存）
    const testCache = async () => {
        await runRequest('第1次(相同输入)', jobDescription, resumeText)
        await runRequest('第2次(相同输入)', jobDescription, resumeText)
        await runRequest('第3次(相同输入)', jobDescription, resumeText)
    }

    // 提交不同输入（验证不命中缓存）
    const testDifferentInput = async () => {
        await runRequest('不同输入(应重新调用AI)', jobDescription + '（不同后缀）', resumeText)
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">限流与缓存测试</h1>
                <p className="text-gray-600">验证后端 IP 限流、Redis 缓存与前端 30 秒冷却</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>岗位描述</CardTitle>
                        <CardDescription>用于计算 SHA-256 哈希作为缓存键</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className="min-h-[150px]"
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>简历内容</CardTitle>
                        <CardDescription>与岗位描述共同参与哈希计算</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            className="min-h-[150px]"
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
                <Button onClick={testCache} disabled={loading}>
                    {loading ? '处理中...' : '连续 3 次相同输入（验证缓存）'}
                </Button>
                <Button onClick={testDifferentInput} disabled={loading} variant="outline">
                    {loading ? '处理中...' : '提交不同输入（验证重新调用 AI）'}
                </Button>
                <Button
                    onClick={() => {
                        localStorage.removeItem('resumevibe:last_analysis_time')
                        readCooldown()
                        addLog('已清除前端冷却时间记录', 'info')
                    }}
                    variant="outline"
                >
                    清除前端冷却
                </Button>
                <Button
                    onClick={() => {
                        setLogs([])
                        readCooldown()
                    }}
                    variant="ghost"
                >
                    清空日志
                </Button>
            </div>

            {/* 前端冷却状态 */}
            <Card className="mb-6">
                <CardContent className="pt-6 flex items-center justify-between">
                    <div>
                        <p className="font-medium">前端 30 秒冷却状态</p>
                        <p className="text-sm text-muted-foreground">
                            通过 localStorage 记录最近提交时间，冷却期内禁止重复提交
                        </p>
                    </div>
                    {cooldownLeft > 0 ? (
                        <Badge variant="destructive">冷却中，剩余 {cooldownLeft} 秒</Badge>
                    ) : (
                        <Badge variant="outline">冷却已结束</Badge>
                    )}
                </CardContent>
            </Card>

            {/* 日志 */}
            <Card>
                <CardHeader>
                    <CardTitle>请求日志</CardTitle>
                    <CardDescription>每次请求的耗时、状态与缓存命中情况</CardDescription>
                </CardHeader>
                <CardContent>
                    {logs.length === 0 ? (
                        <p className="text-sm text-muted-foreground">尚无请求记录。</p>
                    ) : (
                        <div className="space-y-2 font-mono text-sm">
                            {logs.map((log, i) => (
                                <div
                                    key={i}
                                    className={`flex gap-2 ${
                                        log.type === 'error'
                                            ? 'text-red-600'
                                            : log.type === 'success'
                                              ? 'text-green-700'
                                              : 'text-gray-700'
                                    }`}
                                >
                                    <span className="text-gray-400 shrink-0">[{log.time}]</span>
                                    <span className="break-all">{log.msg}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="mt-8 p-4 bg-blue-50 rounded-md">
                <h3 className="font-semibold mb-2">验证要点</h3>
                <ul className="text-sm space-y-1 text-gray-700">
                    <li>
                        • 缓存验证：连续 3 次相同输入，第 2、3 次应显示
                        fromCache=true 且耗时远小于第 1 次（几十 ms，不调用 AI）
                    </li>
                    <li>
                        • 缓存 TTL：5 分钟（300 秒），超过后相同输入会重新调用 AI
                    </li>
                    <li>
                        • 限流验证：1 小时内超过 12 次请求（不同输入），第 13 次应返回 429
                        「请求过于频繁」提示
                    </li>
                    <li>
                        • 前端冷却：分析完成后 30 秒内再次提交，分析页应显示
                        「操作过于频繁，请等待 X 秒」提示
                    </li>
                    <li>
                        • 哈希：缓存键基于「岗位描述 + 简历内容」的 SHA-256，输入任一不同即重新计算
                    </li>
                </ul>
            </div>
        </div>
    )
}
