'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * AnalysisResult 组件 Props
 */
export interface AnalysisResultProps {
    /**
     * 匹配度分数（0-100）
     */
    matchScore: number

    /**
     * 缺失关键词列表
     */
    missingKeywords: string[]

    /**
     * 简历优化建议
     */
    suggestions: string[]

    /**
     * 匹配度等级
     */
    level: 'low' | 'medium' | 'high'

    /**
     * 详细分析报告
     */
    report: string

    /**
     * 加载状态
     */
    isLoading?: boolean

    /**
     * 错误信息
     */
    error?: string
}

/**
 * 获取匹配度等级配置
 * @param level 匹配度等级
 * @returns 等级配置（颜色、图标、文本）
 */
function getLevelConfig(level: 'low' | 'medium' | 'high') {
    switch (level) {
        case 'high':
            return {
                color: 'bg-green-100 text-green-800 border-green-200',
                icon: <CheckCircle className="h-5 w-5 text-green-600" />,
                text: '高度匹配',
                description: '简历与岗位要求高度匹配，继续保持',
            }
        case 'medium':
            return {
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: <Minus className="h-5 w-5 text-yellow-600" />,
                text: '中度匹配',
                description: '简历与岗位要求有一定匹配度，可进一步优化',
            }
        case 'low':
            return {
                color: 'bg-red-100 text-red-800 border-red-200',
                icon: <TrendingDown className="h-5 w-5 text-red-600" />,
                text: '低度匹配',
                description: '简历与岗位要求匹配度较低，建议针对性补充',
            }
    }
}

/**
 * 获取匹配度分数颜色
 * @param score 分数（0-100）
 * @returns 颜色类名
 */
function getScoreColor(score: number): string {
    if (score >= 75) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
}

/**
 * 获取匹配度分数背景色
 * @param score 分数（0-100）
 * @returns 背景色类名
 */
function getScoreBackgroundColor(score: number): string {
    if (score >= 75) return 'bg-green-50 border-green-200'
    if (score >= 50) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
}

/**
 * AnalysisResult 分析结果组件
 * 显示匹配度分数和缺失关键词，使用醒目的视觉样式
 */
export function AnalysisResult({
    matchScore,
    missingKeywords,
    suggestions,
    level,
    report,
    isLoading = false,
    error,
}: AnalysisResultProps) {
    // 加载状态
    if (isLoading) {
        return (
            <Card className="w-full">
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-lg font-medium text-gray-700">正在分析简历...</p>
                        <p className="text-sm text-gray-500 mt-2">请稍候，AI正在为您生成分析报告</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // 错误状态
    if (error) {
        return (
            <Card className="w-full">
                <CardContent className="pt-6">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>分析失败</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    const levelConfig = getLevelConfig(level)

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    简历分析结果
                </CardTitle>
                <CardDescription>
                    基于岗位描述和简历内容的智能匹配分析
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* 匹配度分数 */}
                <div className="flex flex-col items-center">
                    <div className={`relative w-32 h-32 rounded-full border-4 ${getScoreBackgroundColor(matchScore)} flex items-center justify-center`}>
                        <div className="text-center">
                            <div className={`text-4xl font-bold ${getScoreColor(matchScore)}`}>
                                {matchScore}
                            </div>
                            <div className="text-sm text-gray-500">匹配度</div>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <Badge className={levelConfig.color}>
                            {levelConfig.icon}
                            <span className="ml-1">{levelConfig.text}</span>
                        </Badge>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 text-center max-w-md">
                        {levelConfig.description}
                    </p>
                </div>

                {/* 缺失关键词 */}
                <div>
                    <h3 className="text-lg font-semibold mb-3">缺失关键词</h3>
                    {missingKeywords.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {missingKeywords.map((keyword, index) => (
                                <Badge key={index} variant="destructive" className="px-3 py-1">
                                    {keyword}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">太棒了！没有发现缺失的关键技能</p>
                    )}
                </div>

                {/* 优化建议 */}
                <div>
                    <h3 className="text-lg font-semibold mb-3">优化建议</h3>
                    {suggestions.length > 0 ? (
                        <ul className="space-y-2">
                            {suggestions.map((suggestion, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span className="text-sm text-gray-700">{suggestion}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500">暂无具体建议</p>
                    )}
                </div>

                {/* 详细分析报告 */}
                {report && (
                    <div>
                        <h3 className="text-lg font-semibold mb-3">详细分析报告</h3>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{report}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}