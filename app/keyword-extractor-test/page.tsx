'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
    extractKeywords,
    extractKeywordsFromJobDescription,
    KeywordExtractionResult,
    compareKeywordExtraction,
} from '@/src/lib/matching/keyword-extractor'

const MAX_CHAR_LIMIT = 5000;

export default function KeywordExtractorTestPage() {
    const [text, setText] = useState('')
    const [jobDescription, setJobDescription] = useState<{
        title: string;
        description: string;
        requiredSkills: string[];
        experience: string;
        education: string;
    }>({
        title: '',
        description: '',
        requiredSkills: [],
        experience: '',
        education: '',
    })
    const [result, setResult] = useState<KeywordExtractionResult | null>(null)
    const [compareResult, setCompareResult] = useState<{
        commonKeywords: string[]
        uniqueToText1: string[]
        uniqueToText2: string[]
    } | null>(null)
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    // 实时预览：基础文本提取出的关键词
    const basicKeywords = useMemo(
        () => extractKeywords(text, { maxKeywords: 30, minFrequency: 1 }).keywords,
        [text]
    )

    // 实时预览：岗位描述提取出的关键词
    const jobKeywords = useMemo(
        () => extractKeywordsFromJobDescription(jobDescription).keywords,
        [jobDescription]
    )

    // 字符数校验辅助函数
    const checkLength = (str: string) => {
        if (str.length > MAX_CHAR_LIMIT) {
            setErrorMsg(`输入文本超出限制！当前长度 ${str.length} 字，最大支持 ${MAX_CHAR_LIMIT} 字。`);
            return false;
        }
        setErrorMsg('');
        return true;
    }

    const handleTestBasic = () => {
        if (!checkLength(text)) return;
        setLoading(true)
        setResult(null)

        setTimeout(() => {
            try {
                const res = extractKeywords(text, { maxKeywords: 30, minFrequency: 1 })
                setResult(res)
            } catch (err) {
                console.error("提取错误:", err)
            } finally {
                setLoading(false)
            }
        }, 100)
    }

    const handleTestJobDescription = () => {
        // 构建完整的岗位描述文本
        const title = jobDescription.title || '';
        const description = jobDescription.description || '';
        const skills = jobDescription.requiredSkills.join(' '); // 添加空格分隔
        const experience = jobDescription.experience || '';
        const education = jobDescription.education || '';

        const fullContent = `${title} ${description} ${skills} ${experience} ${education}`.trim();

        console.log('岗位描述提取 - 原始输入:', {
            title,
            description,
            requiredSkills: jobDescription.requiredSkills,
            skills,
            experience,
            education,
            fullContent
        });

        if (!checkLength(fullContent)) return;

        setLoading(true)
        setResult(null)

        setTimeout(() => {
            try {
                const res = extractKeywordsFromJobDescription(jobDescription)
                console.log('岗位描述提取 - 提取结果:', res);
                setResult(res)
            } catch (err) {
                console.error("岗位描述提取错误:", err)
            } finally {
                setLoading(false)
            }
        }, 100)
    }

    const handleTestCompare = () => {
        // 比较基础文本和岗位描述的完整内容
        const text1 = text;
        const text2 = `${jobDescription.title} ${jobDescription.description} ${jobDescription.requiredSkills.join(' ')} ${jobDescription.experience} ${jobDescription.education}`.trim();

        console.log('关键词比较 - 输入文本:', {
            text1Length: text1.length,
            text2Length: text2.length,
            text1,
            text2
        });

        if (!checkLength(text1) || !checkLength(text2)) return;
        setLoading(true)
        setCompareResult(null)

        setTimeout(() => {
            try {
                const res = compareKeywordExtraction(text1, text2)
                console.log('关键词比较 - 结果:', res);
                setCompareResult(res)
            } catch (err) {
                console.error("比较错误:", err)
            } finally {
                setLoading(false)
            }
        }, 100)
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">关键词提取测试页面</h1>
                <p className="text-gray-600 text-lg">
                    使用TF-IDF算法从文本中提取关键词，支持中文和英文
                </p>
                {/* 错误或超长提示栏 */}
                {errorMsg && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {errorMsg}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* 基础文本提取测试 */}
                <Card>
                    <CardHeader>
                        <CardTitle>基础文本提取</CardTitle>
                        <CardDescription>从任意文本中提取关键词（上限 5000 字）</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="请输入要提取关键词的文本，支持中文和英文..."
                            value={text}
                            maxLength={MAX_CHAR_LIMIT}
                            onChange={(e) => {
                                setText(e.target.value);
                                if (errorMsg) setErrorMsg('');
                            }}
                            className="min-h-[300px] mb-4"
                        />
                        <div className={`text-sm mb-4 ${text.length >= MAX_CHAR_LIMIT ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                            字数: {text.length} / {MAX_CHAR_LIMIT}
                        </div>
                        <Button
                            onClick={handleTestBasic}
                            disabled={loading || !text}
                            className="w-full"
                        >
                            {loading ? '提取中...' : '提取关键词'}
                        </Button>
                    </CardContent>
                </Card>

                {/* 岗位描述提取测试 */}
                <Card>
                    <CardHeader>
                        <CardTitle>岗位描述提取</CardTitle>
                        <CardDescription>从岗位描述中提取技能关键词</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="岗位标题（可选）"
                            value={jobDescription.title}
                            maxLength={MAX_CHAR_LIMIT}
                            onChange={(e) => setJobDescription({ ...jobDescription, title: e.target.value })}
                            className="min-h-[60px] mb-2"
                        />
                        <Textarea
                            placeholder="岗位描述"
                            value={jobDescription.description}
                            maxLength={MAX_CHAR_LIMIT}
                            onChange={(e) => setJobDescription({ ...jobDescription, description: e.target.value })}
                            className="min-h-[80px] mb-2"
                        />
                        <Textarea
                            placeholder="关键技能要求（逗号分隔）"
                            value={jobDescription.requiredSkills.join(', ')}
                            onChange={(e) => setJobDescription({ ...jobDescription, requiredSkills: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                            className="min-h-[60px] mb-2"
                        />
                        <Textarea
                            placeholder="工作经验要求"
                            value={jobDescription.experience}
                            onChange={(e) => setJobDescription({ ...jobDescription, experience: e.target.value })}
                            className="min-h-[60px] mb-2"
                        />
                        <Textarea
                            placeholder="学历要求"
                            value={jobDescription.education}
                            onChange={(e) => setJobDescription({ ...jobDescription, education: e.target.value })}
                            className="min-h-[60px] mb-4"
                        />
                        <Button
                            onClick={handleTestJobDescription}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? '提取中...' : '提取岗位关键词'}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* 比较测试 */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>关键词比较</CardTitle>
                    <CardDescription>比较文本1与岗位描述的关键词差异（比较的是下方「提取出的关键词」，不是原始输入文本）</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm font-medium mb-1">文本 1（原始输入）</p>
                            <Textarea
                                placeholder="输入文本1"
                                value={text}
                                maxLength={MAX_CHAR_LIMIT}
                                onChange={(e) => setText(e.target.value)}
                                className="min-h-[120px] mb-2"
                            />
                            <div className="mb-2">
                                <p className="text-xs text-gray-500 mb-1">从文本 1 提取出的关键词（{basicKeywords.length} 个）</p>
                                <div className="flex flex-wrap gap-1">
                                    {basicKeywords.map((keyword, index) => (
                                        <Badge key={index} variant="secondary" className="px-2 py-0.5 text-xs">
                                            {keyword}
                                        </Badge>
                                    ))}
                                    {basicKeywords.length === 0 && (
                                        <span className="text-xs text-gray-400">请输入文本后自动提取</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium mb-1">文本 2（岗位描述，原始输入）</p>
                            <Textarea
                                placeholder="输入文本2（或在上方填写岗位描述）"
                                value={`${jobDescription.title} ${jobDescription.description} ${jobDescription.requiredSkills.join(' ')} ${jobDescription.experience} ${jobDescription.education}`.trim()}
                                readOnly
                                className="min-h-[120px] mb-2 bg-gray-50"
                            />
                            <div className="mb-2">
                                <p className="text-xs text-gray-500 mb-1">从文本 2 提取出的关键词（{jobKeywords.length} 个）</p>
                                <div className="flex flex-wrap gap-1">
                                    {jobKeywords.map((keyword, index) => (
                                        <Badge key={index} variant="secondary" className="px-2 py-0.5 text-xs">
                                            {keyword}
                                        </Badge>
                                    ))}
                                    {jobKeywords.length === 0 && (
                                        <span className="text-xs text-gray-400">请在上方填写岗位描述后自动提取</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={handleTestCompare}
                        disabled={loading || !text}
                        className="w-full mt-4"
                    >
                        {loading ? '比较中...' : '比较关键词'}
                    </Button>
                </CardContent>
            </Card>

            {/* 比较结果展示（已提至外层，独立渲染） */}
            {compareResult && (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>比较结果</CardTitle>
                        <CardDescription>两个文本的共同和独特关键词</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="text-3xl font-bold text-green-600">
                                    {compareResult.commonKeywords.length}
                                </div>
                                <div className="text-sm text-gray-600 mt-2">共同关键词</div>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="text-3xl font-bold text-blue-600">
                                    {compareResult.uniqueToText1.length}
                                </div>
                                <div className="text-sm text-gray-600 mt-2">文本1独有</div>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <div className="text-3xl font-bold text-orange-600">
                                    {compareResult.uniqueToText2.length}
                                </div>
                                <div className="text-sm text-gray-600 mt-2">文本2独有</div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div>
                                <h3 className="font-semibold mb-3">共同关键词</h3>
                                <div className="flex flex-wrap gap-2">
                                    {compareResult.commonKeywords.map((keyword: string, index: number) => (
                                        <Badge key={index} variant="default" className="px-3 py-1">
                                            {keyword}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3">文本1独有关键词</h3>
                                <div className="flex flex-wrap gap-2">
                                    {compareResult.uniqueToText1.map((keyword: string, index: number) => (
                                        <Badge key={index} variant="outline" className="px-3 py-1">
                                            {keyword}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3">文本2独有关键词</h3>
                                <div className="flex flex-wrap gap-2">
                                    {compareResult.uniqueToText2.map((keyword: string, index: number) => (
                                        <Badge key={index} variant="outline" className="px-3 py-1">
                                            {keyword}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 单项提取结果展示 */}
            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>提取结果</CardTitle>
                        <CardDescription>
                            共提取 {result.count} 个关键词，总词数 {result.totalWords}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-3xl font-bold text-primary">{result.count}</div>
                                <div className="text-sm text-gray-600">关键词数量</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-3xl font-bold text-gray-600">{result.totalWords}</div>
                                <div className="text-sm text-gray-600">总词数</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-3xl font-bold text-green-600">{Object.keys(result.frequency || {}).length}</div>
                                <div className="text-sm text-gray-600">唯一词数</div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3">提取的关键词（按权重排序）</h3>
                            <div className="flex flex-wrap gap-2">
                                {result.keywords.map((keyword: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="px-3 py-1">
                                        {keyword}
                                        {result.frequency && result.frequency[keyword] && (
                                            <span className="text-xs text-gray-500 ml-1">
                                                ({result.frequency[keyword]})
                                            </span>
                                        )}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}