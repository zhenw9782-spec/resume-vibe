/**
 * OpenAI API 测试页面
 * 用于测试OpenAI API封装的各种功能
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { createOpenAIClient } from '@/src/lib/ai/openai'
import { ApiError } from '@/src/types/api'

export default function AITestPage() {
    const [jobDescription, setJobDescription] = useState('')
    const [resumeText, setResumeText] = useState('')
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    // 💡 移除顶层的 createOpenAIClient()

    const testMatchAnalysis = async () => {
        if (!jobDescription.trim() || !resumeText.trim()) {
            setError('请填写岗位描述和简历内容')
            return
        }

        setLoading(true)
        setError(null)
        setResults(null)

        try {
            // 💡 移至事件处理函数内部，确保异常能被 catch 捕获
            const openaiClient = createOpenAIClient()
            const result = await openaiClient.analyzeResumeMatch(jobDescription, resumeText)
            setResults(result)
        } catch (err) {
            if (err instanceof ApiError) {
                setError(`API错误: ${err.message} (${err.type})`)
            } else {
                setError(`错误: ${err instanceof Error ? err.message : String(err)}`)
            }
        } finally {
            setLoading(false)
        }
    }

    const testResumeOptimization = async () => {
        if (!jobDescription.trim() || !resumeText.trim()) {
            setError('请填写岗位描述和简历内容')
            return
        }

        setLoading(true)
        setError(null)
        setResults(null)

        try {
            const openaiClient = createOpenAIClient()
            const result = await openaiClient.optimizeResume(jobDescription, resumeText)
            setResults(result)
        } catch (err) {
            if (err instanceof ApiError) {
                setError(`API错误: ${err.message} (${err.type})`)
            } else {
                setError(`错误: ${err instanceof Error ? err.message : String(err)}`)
            }
        } finally {
            setLoading(false)
        }
    }

    const testKeywordExtraction = async () => {
        if (!jobDescription.trim()) {
            setError('请填写岗位描述')
            return
        }

        setLoading(true)
        setError(null)
        setResults(null)

        try {
            const openaiClient = createOpenAIClient()
            const result = await openaiClient.extractKeywords(jobDescription)
            setResults({ keywords: result })
        } catch (err) {
            if (err instanceof ApiError) {
                setError(`API错误: ${err.message} (${err.type})`)
            } else {
                setError(`错误: ${err instanceof Error ? err.message : String(err)}`)
            }
        } finally {
            setLoading(false)
        }
    }

    const getMatchLevelColor = (level: string) => {
        switch (level) {
            case 'high':
                return 'bg-green-500'
            case 'medium':
                return 'bg-yellow-500'
            case 'low':
                return 'bg-red-500'
            default:
                return 'bg-gray-500'
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">OpenAI API 测试</h1>
                <p className="text-gray-600">测试OpenAI API封装的各种功能</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>岗位描述</CardTitle>
                        <CardDescription>输入要测试的岗位描述</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="例如：我们正在招聘一位前端开发工程师，要求精通React、Vue等现代前端框架，有3年以上开发经验..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className="min-h-[150px]"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>简历内容</CardTitle>
                        <CardDescription>输入要测试的简历内容</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="例如：张三，5年前端开发经验，精通React、Vue等框架，曾参与多个大型项目开发..."
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            className="min-h-[150px]"
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
                <Button onClick={testMatchAnalysis} disabled={loading}>
                    {loading ? '测试中...' : '测试匹配分析'}
                </Button>
                <Button onClick={testResumeOptimization} disabled={loading} variant="outline">
                    {loading ? '测试中...' : '测试简历优化'}
                </Button>
                <Button onClick={testKeywordExtraction} disabled={loading} variant="outline">
                    {loading ? '测试中...' : '测试关键词提取'}
                </Button>
            </div>

            {error && (
                <Alert className="mb-6" variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {results && (
                <Card>
                    <CardHeader>
                        <CardTitle>测试结果</CardTitle>
                        <CardDescription>API调用成功，返回结果如下</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {results.matchScore !== undefined && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3">匹配分析结果</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600">匹配度分数</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold">{results.matchScore}/100</span>
                                            <Badge className={getMatchLevelColor(results.level)}>
                                                {results.level === 'high' ? '高' : results.level === 'medium' ? '中' : '低'}
                                            </Badge>
                                        </div>
                                    </div>

                                    {results.missingKeywords && results.missingKeywords.length > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">缺失关键词</p>
                                            <div className="flex flex-wrap gap-2">
                                                {results.missingKeywords.map((keyword: string, index: number) => (
                                                    <Badge key={index} variant="secondary">{keyword}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {results.suggestions && results.suggestions.length > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">改进建议</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                {results.suggestions.map((suggestion: string, index: number) => (
                                                    <li key={index} className="text-sm">{suggestion}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {results.report && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">详细报告</p>
                                            <p className="text-sm whitespace-pre-wrap">{results.report}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {results.rewrittenText !== undefined && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3">简历优化结果</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">优化后的简历</p>
                                        <div className="p-4 bg-gray-50 rounded-md">
                                            <p className="whitespace-pre-wrap">{results.rewrittenText}</p>
                                        </div>
                                    </div>

                                    {results.explanation && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">优化说明</p>
                                            <p className="text-sm whitespace-pre-wrap">{results.explanation}</p>
                                        </div>
                                    )}

                                    {results.summary && results.summary.length > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">修改摘要</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                {results.summary.map((item: string, index: number) => (
                                                    <li key={index} className="text-sm">{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {results.keywords && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3">关键词提取结果</h3>
                                <div className="flex flex-wrap gap-2">
                                    {results.keywords.map((keyword: string, index: number) => (
                                        <Badge key={index} variant="outline">{keyword}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="mt-8 p-4 bg-blue-50 rounded-md">
                <h3 className="font-semibold mb-2">测试说明</h3>
                <ul className="text-sm space-y-1 text-gray-700">
                    <li>• 确保已正确配置 OPENAI_API_KEY 环境变量</li>
                    <li>• 岗位描述建议控制在300字以内，简历建议控制在1500字以内</li>
                    <li>• 匹配分析：返回匹配度分数、缺失关键词、改进建议和详细报告</li>
                    <li>• 简历优化：返回优化后的简历文本、优化说明和修改摘要</li>
                    <li>• 关键词提取：从岗位描述中提取10-20个关键技能和要求关键词</li>
                    <li>• 如果出现错误，请检查API密钥是否正确以及网络连接是否正常</li>
                </ul>
            </div>
        </div>
    )
}