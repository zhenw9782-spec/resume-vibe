'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { AnalysisResult } from '@/src/components/AnalysisResult/AnalysisResult'

export default function AnalysisResultTestPage() {
    const [matchScore, setMatchScore] = useState(75)
    const [missingKeywords, setMissingKeywords] = useState('React, TypeScript, Node.js, MySQL')
    const [suggestions, setSuggestions] = useState('建议在简历中添加React项目经验\n建议补充TypeScript使用经验\n建议增加Node.js后端开发经验')
    const [level, setLevel] = useState<'low' | 'medium' | 'high'>('medium')
    const [report, setReport] = useState('简历与岗位要求有一定匹配度，但缺少一些关键技术栈的使用经验。建议针对性地补充相关技能描述。')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleTestLoading = () => {
        setIsLoading(true)
        setError('')
        setTimeout(() => {
            setIsLoading(false)
        }, 3000)
    }

    const handleTestError = () => {
        setError('测试错误：API调用失败，请稍后重试')
        setIsLoading(false)
    }

    const handleReset = () => {
        setMatchScore(75)
        setMissingKeywords('React, TypeScript, Node.js, MySQL')
        setSuggestions('建议在简历中添加React项目经验\n建议补充TypeScript使用经验\n建议增加Node.js后端开发经验')
        setLevel('medium')
        setReport('简历与岗位要求有一定匹配度，但缺少一些关键技术栈的使用经验。建议针对性地补充相关技能描述。')
        setIsLoading(false)
        setError('')
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">分析结果组件测试页面</h1>
                <p className="text-gray-600 text-lg">
                    测试AnalysisResult组件的各种状态和功能
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* 控制面板 */}
                <Card>
                    <CardHeader>
                        <CardTitle>控制面板</CardTitle>
                        <CardDescription>调整组件参数进行测试</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">匹配度分数 (0-100)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={matchScore}
                                onChange={(e) => setMatchScore(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">匹配度等级</label>
                            <select
                                value={level}
                                onChange={(e) => setLevel(e.target.value as 'low' | 'medium' | 'high')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="low">低度匹配 (low)</option>
                                <option value="medium">中度匹配 (medium)</option>
                                <option value="high">高度匹配 (high)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">缺失关键词（逗号分隔）</label>
                            <Textarea
                                value={missingKeywords}
                                onChange={(e) => setMissingKeywords(e.target.value)}
                                placeholder="输入缺失关键词，用逗号分隔"
                                className="min-h-[80px]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">优化建议（每行一条）</label>
                            <Textarea
                                value={suggestions}
                                onChange={(e) => setSuggestions(e.target.value)}
                                placeholder="输入优化建议，每行一条"
                                className="min-h-[100px]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">详细分析报告</label>
                            <Textarea
                                value={report}
                                onChange={(e) => setReport(e.target.value)}
                                placeholder="输入详细分析报告"
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleTestLoading} variant="outline" className="flex-1">
                                测试加载状态
                            </Button>
                            <Button onClick={handleTestError} variant="outline" className="flex-1">
                                测试错误状态
                            </Button>
                            <Button onClick={handleReset} variant="secondary" className="flex-1">
                                重置
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 组件预览 */}
                <div className="lg:col-span-1">
                    <AnalysisResult
                        matchScore={matchScore}
                        missingKeywords={missingKeywords.split(',').map(k => k.trim()).filter(k => k)}
                        suggestions={suggestions.split('\n').filter(s => s.trim())}
                        level={level}
                        report={report}
                        isLoading={isLoading}
                        error={error}
                    />
                </div>
            </div>

            {/* 测试用例 */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>测试用例</CardTitle>
                    <CardDescription>预设的测试场景</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                            onClick={() => {
                                setMatchScore(90)
                                setMissingKeywords('')
                                setSuggestions('简历与岗位要求高度匹配，继续保持')
                                setLevel('high')
                                setReport('恭喜！您的简历与目标岗位高度匹配，建议继续完善细节。')
                                setError('')
                                setIsLoading(false)
                            }}
                            variant="outline"
                        >
                            测试高匹配度
                        </Button>
                        <Button
                            onClick={() => {
                                setMatchScore(60)
                                setMissingKeywords('React, TypeScript, Node.js, MySQL, Docker')
                                setSuggestions('建议在简历中添加React项目经验\n建议补充TypeScript使用经验\n建议增加Node.js后端开发经验\n建议学习MySQL数据库\n建议了解Docker容器化技术')
                                setLevel('medium')
                                setReport('简历与岗位要求有一定匹配度，但缺少一些关键技术栈的使用经验。建议针对性地补充相关技能描述。')
                                setError('')
                                setIsLoading(false)
                            }}
                            variant="outline"
                        >
                            测试中匹配度
                        </Button>
                        <Button
                            onClick={() => {
                                setMatchScore(30)
                                setMissingKeywords('React, TypeScript, Node.js, MySQL, Docker, Kubernetes, Git, Express')
                                setSuggestions('简历与岗位要求匹配度较低，建议重新审视岗位要求并针对性地补充简历内容')
                                setLevel('low')
                                setReport('简历与岗位要求匹配度较低，建议重新审视岗位要求并针对性地补充简历内容。')
                                setError('')
                                setIsLoading(false)
                            }}
                            variant="outline"
                        >
                            测试低匹配度
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* 测试说明 */}
            <Card>
                <CardHeader>
                    <CardTitle>测试说明</CardTitle>
                    <CardDescription>AnalysisResult组件功能说明</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">组件功能</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                <li>显示匹配度分数（0-100）</li>
                                <li>显示匹配度等级（高/中/低）</li>
                                <li>显示缺失关键词列表</li>
                                <li>显示优化建议</li>
                                <li>显示详细分析报告</li>
                                <li>支持加载状态</li>
                                <li>支持错误状态</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">视觉特性</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                <li>匹配度分数使用圆形进度条样式</li>
                                <li>根据分数自动调整颜色（绿/黄/红）</li>
                                <li>缺失关键词使用红色标签</li>
                                <li>优化建议使用列表样式</li>
                                <li>详细分析报告使用灰色背景</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">测试重点</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                <li>不同匹配度分数下的颜色变化</li>
                                <li>不同匹配度等级下的图标和文本</li>
                                <li>缺失关键词的显示和样式</li>
                                <li>优化建议的显示和样式</li>
                                <li>加载状态的动画效果</li>
                                <li>错误状态的提示信息</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}