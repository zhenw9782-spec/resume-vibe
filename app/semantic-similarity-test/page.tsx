/**
 * 语义相似度测试页面（步骤 4.4 验证）
 *
 * 测试目标：
 * - 相似文本对 → 余弦相似度高（≥0.5，语义相似）
 * - 不相似文本对 → 余弦相似度低（<0.5，语义不相似）
 * - 同义改写对 → 相似度显著高于字面重叠（体现 Embeddings 语义能力）
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    calculateSemanticSimilarity,
    SemanticSimilarityDetail,
} from '@/src/lib/matching/semantic-similarity'

/**
 * 预设测试示例
 */
const PRESETS: Array<{ label: string; textA: string; textB: string; expect: string }> = [
    {
        label: '① 相似示例（同一岗位）',
        expect: '高相似度（≥0.5，判定为语义相似）',
        textA:
            '我们正在招聘一位高级前端开发工程师，要求精通 React、Vue.js 等现代前端框架，熟悉 TypeScript、JavaScript，有 3 年以上前端开发经验，熟悉 Webpack、Vite 等构建工具，具备良好的团队协作和沟通能力。',
        textB:
            '本人拥有 5 年前端开发经验，精通 React、Vue 等框架，熟练使用 TypeScript 和 JavaScript，熟悉 Webpack 构建工具，曾在多个大型项目中担任前端开发负责人，具备良好的团队协作能力。',
    },
    {
        label: '② 同义表达示例（用词不同但意思相近）',
        expect: '相似度应显著高于字面重叠（体现语义能力）',
        textA:
            '岗位要求擅长网页前端技术，掌握现代 Web 开发框架，熟悉界面交互与用户体感优化。',
        textB:
            '我熟练进行网站界面开发，精通主流前端框架，注重页面用户体验与交互细节的打磨。',
    },
    {
        label: '③ 不相似示例（完全不同领域）',
        expect: '低相似度（<0.5，判定为语义不相似）',
        textA:
            '我们正在招聘一位高级前端开发工程师，要求精通 React、Vue.js 等现代前端框架，熟悉 TypeScript、JavaScript，有 3 年以上前端开发经验。',
        textB:
            '我是一名资深厨师，擅长川菜和粤菜烹饪，拥有十年后厨管理经验，负责菜品研发、食材采购和厨房团队管理。',
    },
]

export default function SemanticSimilarityTestPage() {
    const [textA, setTextA] = useState('')
    const [textB, setTextB] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<SemanticSimilarityDetail | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleRun = async () => {
        if (!textA.trim() || !textB.trim()) {
            setError('请先填写文本A和文本B')
            return
        }

        setLoading(true)
        setError(null)
        setResult(null)

        try {
            const detail = await calculateSemanticSimilarity(textA, textB)
            setResult(detail)
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setLoading(false)
        }
    }

    const loadPreset = (preset: (typeof PRESETS)[number]) => {
        setTextA(preset.textA)
        setTextB(preset.textB)
        setResult(null)
        setError(null)
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

    const getVerdict = (cosine: number) => {
        if (cosine >= 0.5) return '语义相似'
        if (cosine >= 0.4) return '边界情况'
        return '语义不相似'
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">语义相似度测试页面</h1>
                <p className="text-gray-600 text-lg">
                    步骤 4.4：使用 Embeddings 将文本转换为向量，计算余弦相似度，验证语义匹配能力
                </p>
            </div>

            {/* 预设示例 */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>预设测试示例</CardTitle>
                    <CardDescription>一键加载测试数据，验证相似度是否符合预期</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        {PRESETS.map(preset => (
                            <Button
                                key={preset.label}
                                variant="outline"
                                onClick={() => loadPreset(preset)}
                                disabled={loading}
                            >
                                {preset.label}
                            </Button>
                        ))}
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setTextA('')
                                setTextB('')
                                setResult(null)
                                setError(null)
                            }}
                            disabled={loading}
                        >
                            清空
                        </Button>
                    </div>
                    <ul className="mt-4 space-y-1 text-sm text-gray-600">
                        {PRESETS.map(preset => (
                            <li key={preset.label}>
                                <span className="font-semibold">{preset.label}</span>
                                {'：'}{preset.expect}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* 输入区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>文本A（岗位描述）</CardTitle>
                        <CardDescription>输入岗位描述或任意待比较文本</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="请输入文本A，例如：我们正在招聘一位高级前端开发工程师，要求精通React、Vue.js..."
                            value={textA}
                            onChange={(e) => setTextA(e.target.value)}
                            className="min-h-[240px] mb-2"
                        />
                        <div className="text-sm text-gray-500">字数：{textA.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>文本B（简历内容）</CardTitle>
                        <CardDescription>输入简历内容或任意待比较文本</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="请输入文本B，例如：本人拥有5年前端开发经验，精通React、Vue等框架..."
                            value={textB}
                            onChange={(e) => setTextB(e.target.value)}
                            className="min-h-[240px] mb-2"
                        />
                        <div className="text-sm text-gray-500">字数：{textB.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* 计算按钮 */}
            <div className="flex justify-center mb-8">
                <Button
                    onClick={handleRun}
                    disabled={loading || !textA.trim() || !textB.trim()}
                    size="lg"
                    className="px-8 py-6 text-lg"
                >
                    {loading ? '计算中...' : '开始计算语义相似度'}
                </Button>
            </div>

            {error && (
                <Alert className="mb-6" variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* 结果展示 */}
            {result && (
                <div className="space-y-6">
                    {/* 相似度概览 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>相似度结果</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6 mb-6">
                                <div className="flex-1">
                                    <div className="text-6xl font-bold mb-2">
                                        {(result.cosineSimilarity * 100).toFixed(1)}
                                        <span className="text-3xl text-gray-500">%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            className={`text-lg py-2 px-4 ${getLevelColor(result.similarityLevel)}`}
                                        >
                                            {result.similarityLevel === 'high'
                                                ? '高相似度'
                                                : result.similarityLevel === 'medium'
                                                  ? '中等相似度'
                                                  : '低相似度'}
                                        </Badge>
                                        <Badge variant="secondary" className="text-lg py-2 px-4">
                                            判定：{getVerdict(result.cosineSimilarity)}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">计算方式：</span>
                                        <Badge
                                            className={
                                                result.method === 'embedding'
                                                    ? 'bg-green-100 text-green-800 border-green-300'
                                                    : 'bg-orange-100 text-orange-800 border-orange-300'
                                            }
                                        >
                                            {result.method === 'embedding'
                                                ? 'Embeddings 语义向量（API）'
                                                : '本地词频向量（降级）'}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        向量维度：<span className="font-semibold">{result.dimension}</span>
                                        {'　'}模型：<span className="font-semibold">{result.model}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        计算耗时：<span className="font-semibold">{result.elapsedMs}ms</span>
                                    </div>
                                </div>
                            </div>

                            {/* 进度条 */}
                            <div className="mb-2 flex justify-between text-sm">
                                <span className="text-gray-600">余弦相似度</span>
                                <span className="font-semibold">
                                    {(result.cosineSimilarity * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    className={`h-4 rounded-full transition-all duration-500 ${
                                        result.cosineSimilarity >= 0.5 ? 'bg-success' : 'bg-warning'
                                    }`}
                                    style={{ width: `${result.cosineSimilarity * 100}%` }}
                                ></div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 细节统计 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>细节统计</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-3xl font-bold text-success">
                                        {result.matchedSentencePairs}
                                    </div>
                                    <div className="text-sm text-gray-600">匹配句子对</div>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-3xl font-bold text-warning">
                                        {result.unmatchedSentencePairs}
                                    </div>
                                    <div className="text-sm text-gray-600">不匹配句子对</div>
                                </div>
                            </div>

                            {result.error && (
                                <Alert className="mt-4" variant="destructive">
                                    <AlertDescription>
                                        Embeddings API 调用失败，已自动降级为本地词频向量计算。错误信息：
                                        {result.error}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* 测试说明 */}
            <div className="mt-8 p-4 bg-blue-50 rounded-md">
                <h3 className="font-semibold mb-2">测试说明与判定标准</h3>
                <ul className="text-sm space-y-1 text-gray-700">
                    <li>• 余弦相似度 ≥ 0.5 判定为「语义相似」，&lt; 0.5 判定为「语义不相似」</li>
                    <li>• 建议先点击「① 相似示例」和「③ 不相似示例」各测一次，结果应符合预期</li>
                    <li>• 「② 同义表达示例」用于验证 Embeddings 的语义能力：用词不同但意思相近，相似度仍应较高</li>
                    <li>• 计算方式显示「Embeddings 语义向量（API）」表示调用了远程 Embeddings 服务</li>
                    <li>• 若显示「本地词频向量（降级）」，说明 API 调用失败，请检查网络或环境变量配置</li>
                    <li>• 测试通过后，匹配算法（/matching-algorithm-test）的语义相似度部分即为真实语义匹配</li>
                </ul>
            </div>
        </div>
    )
}
