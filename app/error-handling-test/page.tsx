/**
 * 错误处理测试页面
 * 用于验证各类 AI 异常（网络错误 / 超时 / 限流 / 密钥无效 / 请求参数 / 服务器错误）
 * 是否被正确分类，并展示对应的友好中文提示与恢复建议
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ApiError, ApiErrorType } from '@/src/types/api'
import { getErrorDisplay, type ErrorDisplay } from '@/src/lib/errors/errorHandling'
import { createOpenAIClient } from '@/src/lib/ai/openai'

/**
 * 构造指定类型的 ApiError 模拟错误
 */
function createMockError(type: ApiErrorType): ApiError {
    const mockMap: Record<string, { message: string; status?: number }> = {
        [ApiErrorType.NETWORK_ERROR]: { message: '无法连接到 AI 服务', status: 0 },
        [ApiErrorType.TIMEOUT]: { message: 'AI 服务响应超时', status: 0 },
        [ApiErrorType.RATE_LIMIT_EXCEEDED]: { message: '请求过于频繁', status: 429 },
        [ApiErrorType.INVALID_API_KEY]: { message: 'API 密钥无效', status: 401 },
        [ApiErrorType.INVALID_REQUEST]: { message: '请求参数无效', status: 400 },
        [ApiErrorType.INTERNAL_ERROR]: { message: 'AI 服务暂时不可用', status: 500 },
    }
    const cfg = mockMap[type]
    return new ApiError(cfg?.message || '模拟错误', type, {
        statusCode: cfg?.status,
        details: { mock: true },
    })
}

/**
 * 展示单个错误分类结果
 */
function ErrorDisplayCard({ display }: { display: ErrorDisplay }) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="mb-3">
                    <Badge variant="outline">{display.type}</Badge>
                </div>
                <Alert variant="destructive" className="mb-4">
                    <AlertTitle>{display.title}</AlertTitle>
                    <AlertDescription>
                        <p>{display.description}</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            {display.suggestions.map((s) => (
                                <li key={s}>{s}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    )
}

export default function ErrorHandlingTestPage() {
    const [simulated, setSimulated] = useState<ErrorDisplay[]>([])
    const [liveResult, setLiveResult] = useState<ErrorDisplay | null>(null)
    const [liveStatus, setLiveStatus] = useState<'idle' | 'loading' | 'done'>('idle')

    // 真实调用一次（在断网 / 改错 BaseURL 情况下触发网络错误）
    const runLiveTest = async () => {
        setLiveStatus('loading')
        setLiveResult(null)
        try {
            const client = createOpenAIClient()
            await client.analyzeResumeMatch('这是一段测试岗位描述', '这是一段用于错误处理的测试简历')
            setLiveResult({
                type: 'SUCCESS',
                title: '调用成功',
                description: '本次调用未触发任何错误，说明 AI 服务配置正常、网络畅通。',
                suggestions: ['无需处理'],
            })
        } catch (err) {
            setLiveResult(getErrorDisplay(err))
        } finally {
            setLiveStatus('done')
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">错误处理测试</h1>
                <p className="text-gray-600">验证各类 AI 异常的错误分类与友好提示</p>
            </div>

            {/* 模拟错误分类测试 */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>一、模拟错误分类</CardTitle>
                    <CardDescription>
                        点击下方按钮，模拟各类 AI 异常，验证错误被正确分类并显示友好提示
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3 mb-6">
                        {Object.values(ApiErrorType).map((type) => (
                            <Button
                                key={type}
                                variant="outline"
                                onClick={() => {
                                    const display = getErrorDisplay(createMockError(type))
                                    setSimulated((prev) => [display, ...prev.filter((d) => d.type !== display.type)])
                                }}
                            >
                                {type}
                            </Button>
                        ))}
                    </div>
                    {simulated.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            尚未模拟任何错误，请点击上方按钮测试。
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {simulated.map((d) => (
                                <ErrorDisplayCard key={d.type} display={d} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 真实调用错误测试 */}
            <Card>
                <CardHeader>
                    <CardTitle>二、真实调用错误测试</CardTitle>
                    <CardDescription>
                        真实调用 AI 服务。如需模拟网络错误，可先断开网络或临时修改
                        .env.local 中的 API 服务地址后点击此按钮。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={runLiveTest} disabled={liveStatus === 'loading'}>
                        {liveStatus === 'loading' ? '测试中...' : '真实调用一次'}
                    </Button>
                    {liveResult && (
                        <div className="mt-4 max-w-2xl">
                            {liveResult.type === 'SUCCESS' ? (
                                <Alert className="mb-4">
                                    <AlertTitle>{liveResult.title}</AlertTitle>
                                    <AlertDescription>{liveResult.description}</AlertDescription>
                                </Alert>
                            ) : (
                                <ErrorDisplayCard display={liveResult} />
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="mt-8 p-4 bg-blue-50 rounded-md">
                <h3 className="font-semibold mb-2">测试说明</h3>
                <ul className="text-sm space-y-1 text-gray-700">
                    <li>• 部分一：通过模拟 ApiError 验证各类错误是否被正确分类并生成友好提示</li>
                    <li>• 部分二：真实调用 AI 服务，验证 openai.ts 中的错误分类逻辑是否生效</li>
                    <li>
                        • 模拟网络错误：断开网络后点击「真实调用一次」，应显示网络连接失败提示
                    </li>
                    <li>
                        • 模拟密钥无效：临时把 .env.local 中 API Key 改错后点击「真实调用一次」，
                        应显示 API 密钥无效提示
                    </li>
                    <li>
                        • 模拟超时：将 .env.local 中 API 服务地址改为不存在的地址，
                        应显示网络连接失败提示（连接层面即失败）
                    </li>
                    <li>• 测试完成后请恢复 .env.local 的原始配置</li>
                </ul>
            </div>
        </div>
    )
}
