'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { calculateMatchAsync, MatchResult } from '@/src/lib/matching/algorithm'

export default function MatchingAlgorithmTestPage() {
    const [jobDescription, setJobDescription] = useState('')
    const [resumeText, setResumeText] = useState('')
    const [result, setResult] = useState<MatchResult | null>(null)
    const [loading, setLoading] = useState(false)

    const handleTest = async () => {
        setLoading(true)
        setResult(null)

        try {
            const jobDescriptionObj = {
                title: '测试岗位',
                description: jobDescription,
                requiredSkills: [],
                experience: '',
                education: '',
            }

            const resumeObj = {
                text: resumeText,
                file: new File([], 'resume.txt'),
                parsedAt: new Date(),
            }

            const matchResult = await calculateMatchAsync(jobDescriptionObj, resumeObj)
            setResult(matchResult)
        } catch (err) {
            console.error('匹配分析失败:', err)
        } finally {
            setLoading(false)
        }
    }

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'high':
                return 'bg-green-100 text-green-800 border-green-300'
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300'
            case 'low':
                return 'bg-red-100 text-red-800 border-red-300'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300'
        }
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">匹配算法测试页面</h1>
                <p className="text-gray-600 text-lg">
                    测试简历与岗位描述的匹配度计算功能，包括关键词匹配（60%）和语义相似度（40%）
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* 岗位描述输入 */}
                <Card>
                    <CardHeader>
                        <CardTitle>岗位描述</CardTitle>
                        <CardDescription>输入目标岗位的描述和要求</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="请输入岗位描述，例如：我们正在招聘一位高级前端开发工程师，要求精通React、Vue.js等现代前端框架，熟悉TypeScript、JavaScript ES6+，有3年以上前端开发经验，熟悉Webpack、Vite等构建工具..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className="min-h-[300px] mb-4"
                        />
                        <div className="text-sm text-gray-500">
                            字数: {jobDescription.length}
                        </div>
                    </CardContent>
                </Card>

                {/* 简历文本输入 */}
                <Card>
                    <CardHeader>
                        <CardTitle>简历内容</CardTitle>
                        <CardDescription>输入待分析的简历文本</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="请输入简历内容，例如：张三，5年前端开发经验，精通React、Vue等框架，曾参与多个大型项目开发。熟练使用TypeScript、JavaScript，熟悉Webpack构建工具。具备良好的团队协作能力，曾担任项目技术负责人..."
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            className="min-h-[300px] mb-4"
                        />
                        <div className="text-sm text-gray-500">
                            字数: {resumeText.length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 测试按钮 */}
            <div className="flex justify-center mb-8">
                <Button
                    onClick={handleTest}
                    disabled={loading || !jobDescription || !resumeText}
                    size="lg"
                    className="px-8 py-6 text-lg"
                >
                    {loading ? '计算中...' : '开始匹配分析'}
                </Button>
            </div>

            {/* 结果展示 */}
            {result && (
                <div className="space-y-6">
                    {/* 总体匹配度 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>总体匹配度</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6">
                                <div className="flex-1">
                                    <div className="text-6xl font-bold mb-2">
                                        {result.score}
                                        <span className="text-3xl text-gray-500">/100</span>
                                    </div>
                                    <Badge className={`text-lg py-2 px-4 ${getLevelColor(result.level)}`}>
                                        {result.level === 'high' ? '高匹配度' : result.level === 'medium' ? '中等匹配度' : '低匹配度'}
                                    </Badge>
                                </div>
                                <div className="flex-1">
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">关键词匹配（60%）</span>
                                            <span className="font-semibold">
                                                {(result.keywordMatch.matchRate * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-primary h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${result.keywordMatch.matchRate * 100}%` }}
                                            ></div>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-600">语义相似度（40%）</span>
                                            <span className="font-semibold">
                                                {(result.semanticSimilarity.cosineSimilarity * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-success h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${result.semanticSimilarity.cosineSimilarity * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 关键词匹配详情 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>关键词匹配详情</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-3xl font-bold text-primary">{result.keywordMatch.matchedCount}</div>
                                    <div className="text-sm text-gray-600">匹配关键词</div>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-3xl font-bold text-gray-600">{result.keywordMatch.totalCount}</div>
                                    <div className="text-sm text-gray-600">总关键词数</div>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-3xl font-bold text-success">
                                        {(result.keywordMatch.matchRate * 100).toFixed(1)}%
                                    </div>
                                    <div className="text-sm text-gray-600">匹配率</div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="font-semibold mb-3">匹配的关键词</h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.keywordMatch.matchedKeywords.map((keyword: string, index: number) => (
                                        <Badge key={index} variant="secondary" className="px-3 py-1">
                                            {keyword}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3">未匹配的关键词</h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.keywordMatch.unmatchedKeywords.map((keyword: string, index: number) => (
                                        <Badge key={index} variant="outline" className="px-3 py-1">
                                            {keyword}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 语义相似度详情 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>语义相似度详情</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-3xl font-bold text-primary">
                                        {(result.semanticSimilarity.cosineSimilarity * 100).toFixed(2)}
                                    </div>
                                    <div className="text-sm text-gray-600">余弦相似度</div>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-3xl font-bold text-success">
                                        {result.semanticSimilarity.matchedSentencePairs}
                                    </div>
                                    <div className="text-sm text-gray-600">匹配句子对</div>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-3xl font-bold text-warning">
                                        {result.semanticSimilarity.unmatchedSentencePairs}
                                    </div>
                                    <div className="text-sm text-gray-600">不匹配句子对</div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="font-semibold mb-3">相似度等级</h3>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge className={`text-lg py-2 px-4 ${getLevelColor(result.semanticSimilarity.similarityLevel)}`}>
                                        {result.semanticSimilarity.similarityLevel === 'high' ? '高相似度' : result.semanticSimilarity.similarityLevel === 'medium' ? '中等相似度' : '低相似度'}
                                    </Badge>
                                    <Badge variant="secondary" className="text-lg py-2 px-4">
                                        {result.semanticSimilarity.method === 'embedding' ? 'Embeddings 语义向量' : '本地词频向量（降级）'}
                                    </Badge>
                                </div>
                                <p className="mt-2 text-sm text-gray-500">
                                    模型：{result.semanticSimilarity.model}
                                    {'　'}维度：{result.semanticSimilarity.dimension}
                                    {'　'}耗时：{result.semanticSimilarity.elapsedMs}ms
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3">优势关键词</h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.strongKeywords.map((keyword: string, index: number) => (
                                        <Badge key={index} variant="default" className="px-3 py-1">
                                            {keyword}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 改进建议 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>改进建议</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {result.suggestions.map((suggestion: string, index: number) => (
                                    <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <span className="text-success font-bold">•</span>
                                        <span>{suggestion}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}