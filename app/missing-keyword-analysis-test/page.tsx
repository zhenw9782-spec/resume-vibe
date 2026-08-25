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
} from '@/src/lib/matching/keyword-extractor'
import {
    analyzeMissingKeywords,
    MissingKeywordAnalysisResult,
    MissingKeywordItem,
} from '@/src/lib/matching/missing-keyword-analysis'

const MAX_CHAR_LIMIT = 5000;

export default function MissingKeywordAnalysisTestPage() {
    const [jobDescription, setJobDescription] = useState<{
        title: string;
        description: string;
        requiredSkills: string[];
        experience: string;
        education: string;
    }>({
        title: '前端开发工程师',
        description: `职位要求：
1. 精通React、TypeScript、JavaScript
2. 熟悉Node.js、Express
3. 了解数据库设计（MySQL、MongoDB）
4. 具备团队协作和沟通能力
5. 本科及以上学历
6. 了解Docker、Kubernetes容器化技术
7. 熟悉Git版本控制
8. 了解CI/CD流程`,
        requiredSkills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Express', 'MySQL', 'MongoDB', 'Docker', 'Kubernetes', 'Git'],
        experience: '3年以上前端开发经验',
        education: '本科及以上学历',
    })

    const [resumeText, setResumeText] = useState(`个人简历

工作经历：
2020-2022 ABC公司 前端开发工程师
- 熟悉JavaScript、HTML、CSS
- 了解React基础
- 使用过jQuery进行开发
- 参与公司内部管理系统开发

2022-至今 XYZ公司 前端开发工程师
- 使用React进行项目开发
- 了解Vue.js基础
- 参与移动端H5页面开发
- 使用Git进行版本控制

技能清单：
- JavaScript、HTML、CSS
- React基础
- jQuery
- Git基础`)

    const [analysisResult, setAnalysisResult] = useState<MissingKeywordAnalysisResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    // 实时预览：岗位描述提取出的关键词
    const jobKeywords = useMemo(
        () => extractKeywordsFromJobDescription(jobDescription).keywords,
        [jobDescription]
    )

    // 实时预览：简历提取出的关键词
    const resumeKeywords = useMemo(
        () => extractKeywords(resumeText, { maxKeywords: 30, minFrequency: 1 }).keywords,
        [resumeText]
    )

    // 字符数校验辅助函数
    const checkLength = (str: string, name: string) => {
        if (str.length > MAX_CHAR_LIMIT) {
            setErrorMsg(`${name}超出限制！当前长度 ${str.length} 字，最大支持 ${MAX_CHAR_LIMIT} 字。`);
            return false;
        }
        setErrorMsg('');
        return true;
    }

    const handleAnalyze = () => {
        if (!checkLength(`${jobDescription.title} ${jobDescription.description} ${jobDescription.requiredSkills.join(' ')} ${jobDescription.experience} ${jobDescription.education}`, '岗位描述') ||
            !checkLength(resumeText, '简历文本')) {
            return;
        }

        setLoading(true)
        setAnalysisResult(null)

        setTimeout(() => {
            try {
                // 提取关键词
                const jobKeywordsResult = extractKeywordsFromJobDescription(jobDescription)
                const resumeKeywordsResult = extractKeywords(resumeText, { maxKeywords: 30, minFrequency: 1 })

                console.log('岗位描述关键词:', jobKeywordsResult.keywords)
                console.log('简历关键词:', resumeKeywordsResult.keywords)

                // 分析缺失关键词
                const result = analyzeMissingKeywords(jobKeywordsResult, resumeKeywordsResult)
                console.log('缺失关键词分析结果:', result)

                setAnalysisResult(result)
            } catch (err) {
                console.error("分析错误:", err)
                setErrorMsg(`分析过程中发生错误: ${err}`)
            } finally {
                setLoading(false)
            }
        }, 100)
    }

    const handleReset = () => {
        setAnalysisResult(null)
        setErrorMsg('')
    }

    // 根据重要性等级返回颜色
    const getImportanceColor = (importance: string) => {
        switch (importance) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200'
            case 'important': return 'bg-orange-100 text-orange-800 border-orange-200'
            case 'nice_to_have': return 'bg-blue-100 text-blue-800 border-blue-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    // 根据分类返回颜色
    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'hard_skill': return 'bg-purple-100 text-purple-800 border-purple-200'
            case 'soft_skill': return 'bg-green-100 text-green-800 border-green-200'
            case 'education': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'experience': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'domain': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    // 根据分类返回中文名称
    const getCategoryName = (category: string) => {
        switch (category) {
            case 'hard_skill': return '硬技能'
            case 'soft_skill': return '软技能'
            case 'education': return '学历要求'
            case 'experience': return '经验要求'
            case 'domain': return '领域知识'
            default: return '其他'
        }
    }

    // 根据重要性返回中文名称
    const getImportanceName = (importance: string) => {
        switch (importance) {
            case 'critical': return '关键'
            case 'important': return '重要'
            case 'nice_to_have': return '可选'
            default: return '未知'
        }
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">缺失关键词分析测试页面</h1>
                <p className="text-gray-600 text-lg">
                    分析JD要求但简历中未提及的关键技能，支持分类、重要性判断和同义词检查
                </p>
                {/* 错误或超长提示栏 */}
                {errorMsg && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {errorMsg}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* 岗位描述输入 */}
                <Card>
                    <CardHeader>
                        <CardTitle>岗位描述</CardTitle>
                        <CardDescription>输入目标岗位的要求（上限 5000 字）</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="岗位标题"
                            value={jobDescription.title}
                            onChange={(e) => setJobDescription({ ...jobDescription, title: e.target.value })}
                            className="min-h-[60px] mb-2"
                        />
                        <Textarea
                            placeholder="岗位描述"
                            value={jobDescription.description}
                            onChange={(e) => setJobDescription({ ...jobDescription, description: e.target.value })}
                            className="min-h-[150px] mb-2"
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
                        <div className="mb-2">
                            <p className="text-xs text-gray-500 mb-1">岗位描述提取出的关键词（{jobKeywords.length} 个）</p>
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
                    </CardContent>
                </Card>

                {/* 简历文本输入 */}
                <Card>
                    <CardHeader>
                        <CardTitle>简历文本</CardTitle>
                        <CardDescription>输入个人简历内容（上限 5000 字）</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="请输入简历内容..."
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            className="min-h-[300px] mb-4"
                        />
                        <div className="mb-2">
                            <p className="text-xs text-gray-500 mb-1">简历提取出的关键词（{resumeKeywords.length} 个）</p>
                            <div className="flex flex-wrap gap-1">
                                {resumeKeywords.map((keyword, index) => (
                                    <Badge key={index} variant="secondary" className="px-2 py-0.5 text-xs">
                                        {keyword}
                                    </Badge>
                                ))}
                                {resumeKeywords.length === 0 && (
                                    <span className="text-xs text-gray-400">请输入简历内容后自动提取</span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 分析按钮 */}
            <div className="flex justify-center gap-4 mb-8">
                <Button
                    onClick={handleAnalyze}
                    disabled={loading}
                    size="lg"
                >
                    {loading ? '分析中...' : '分析缺失关键词'}
                </Button>
                <Button
                    onClick={handleReset}
                    variant="outline"
                    size="lg"
                >
                    重置
                </Button>
            </div>

            {/* 分析结果展示 */}
            {analysisResult && (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>分析结果</CardTitle>
                        <CardDescription>
                            共发现 {analysisResult.totalCount} 个缺失关键词，覆盖率 {Math.round(analysisResult.coverageRate * 100)}%
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* 统计概览 */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                                <div className="text-3xl font-bold text-red-600">
                                    {analysisResult.byImportance.critical.length}
                                </div>
                                <div className="text-sm text-gray-600 mt-2">关键缺失</div>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <div className="text-3xl font-bold text-orange-600">
                                    {analysisResult.byImportance.important.length}
                                </div>
                                <div className="text-sm text-gray-600 mt-2">重要缺失</div>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="text-3xl font-bold text-blue-600">
                                    {analysisResult.byImportance.nice_to_have.length}
                                </div>
                                <div className="text-sm text-gray-600 mt-2">可选缺失</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="text-3xl font-bold text-green-600">
                                    {Math.round(analysisResult.coverageRate * 100)}%
                                </div>
                                <div className="text-sm text-gray-600 mt-2">覆盖率</div>
                            </div>
                        </div>

                        {/* 综合建议 */}
                        {analysisResult.suggestions.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold mb-3">综合建议</h3>
                                <div className="space-y-2">
                                    {analysisResult.suggestions.map((suggestion, index) => (
                                        <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            {suggestion}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 按重要性分组显示 */}
                        <div className="mb-6">
                            <h3 className="font-semibold mb-3">按重要性分组</h3>
                            <div className="space-y-4">
                                {/* 关键缺失 */}
                                {analysisResult.byImportance.critical.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2 text-red-600">关键缺失（{analysisResult.byImportance.critical.length} 个）</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {analysisResult.byImportance.critical.map((item, index) => (
                                                <div key={index} className={`px-3 py-1 rounded-full border ${getImportanceColor(item.importance)}`}>
                                                    {item.keyword}
                                                    {item.hasAlternativeInResume && (
                                                        <span className="ml-1 text-xs">（有替代）</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 重要缺失 */}
                                {analysisResult.byImportance.important.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2 text-orange-600">重要缺失（{analysisResult.byImportance.important.length} 个）</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {analysisResult.byImportance.important.map((item, index) => (
                                                <div key={index} className={`px-3 py-1 rounded-full border ${getImportanceColor(item.importance)}`}>
                                                    {item.keyword}
                                                    {item.hasAlternativeInResume && (
                                                        <span className="ml-1 text-xs">（有替代）</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 可选缺失 */}
                                {analysisResult.byImportance.nice_to_have.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2 text-blue-600">可选缺失（{analysisResult.byImportance.nice_to_have.length} 个）</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {analysisResult.byImportance.nice_to_have.map((item, index) => (
                                                <div key={index} className={`px-3 py-1 rounded-full border ${getImportanceColor(item.importance)}`}>
                                                    {item.keyword}
                                                    {item.hasAlternativeInResume && (
                                                        <span className="ml-1 text-xs">（有替代）</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 按分类分组显示 */}
                        <div className="mb-6">
                            <h3 className="font-semibold mb-3">按分类分组</h3>
                            <div className="space-y-4">
                                {Object.entries(analysisResult.byCategory).map(([category, items]) => (
                                    items.length > 0 && (
                                        <div key={category}>
                                            <h4 className="font-medium mb-2">{getCategoryName(category)}（{items.length} 个）</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {items.map((item, index) => (
                                                    <div key={index} className={`px-3 py-1 rounded-full border ${getCategoryColor(item.category)}`}>
                                                        {item.keyword}
                                                        <span className="ml-1 text-xs">({getImportanceName(item.importance)})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>

                        {/* 详细列表 */}
                        <div>
                            <h3 className="font-semibold mb-3">详细分析列表</h3>
                            <div className="space-y-3">
                                {analysisResult.byImportance.critical.map((item, index) => (
                                    <div key={`critical-${index}`} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className={getImportanceColor(item.importance)}>
                                                {getImportanceName(item.importance)}
                                            </Badge>
                                            <Badge className={getCategoryColor(item.category)}>
                                                {getCategoryName(item.category)}
                                            </Badge>
                                            <span className="font-medium">{item.keyword}</span>
                                            {item.hasAlternativeInResume && (
                                                <Badge variant="outline" className="text-green-600">有替代表达</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{item.suggestion}</p>
                                        {item.relatedTerms.length > 0 && (
                                            <p className="text-xs text-gray-500">
                                                相关术语：{item.relatedTerms.join('、')}
                                            </p>
                                        )}
                                    </div>
                                ))}

                                {analysisResult.byImportance.important.map((item, index) => (
                                    <div key={`important-${index}`} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className={getImportanceColor(item.importance)}>
                                                {getImportanceName(item.importance)}
                                            </Badge>
                                            <Badge className={getCategoryColor(item.category)}>
                                                {getCategoryName(item.category)}
                                            </Badge>
                                            <span className="font-medium">{item.keyword}</span>
                                            {item.hasAlternativeInResume && (
                                                <Badge variant="outline" className="text-green-600">有替代表达</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{item.suggestion}</p>
                                        {item.relatedTerms.length > 0 && (
                                            <p className="text-xs text-gray-500">
                                                相关术语：{item.relatedTerms.join('、')}
                                            </p>
                                        )}
                                    </div>
                                ))}

                                {analysisResult.byImportance.nice_to_have.map((item, index) => (
                                    <div key={`nice_to_have-${index}`} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className={getImportanceColor(item.importance)}>
                                                {getImportanceName(item.importance)}
                                            </Badge>
                                            <Badge className={getCategoryColor(item.category)}>
                                                {getCategoryName(item.category)}
                                            </Badge>
                                            <span className="font-medium">{item.keyword}</span>
                                            {item.hasAlternativeInResume && (
                                                <Badge variant="outline" className="text-green-600">有替代表达</Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{item.suggestion}</p>
                                        {item.relatedTerms.length > 0 && (
                                            <p className="text-xs text-gray-500">
                                                相关术语：{item.relatedTerms.join('、')}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 测试说明 */}
            <Card>
                <CardHeader>
                    <CardTitle>测试说明</CardTitle>
                    <CardDescription>缺失关键词分析功能说明</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">功能特性</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                <li>关键词分类：硬技能、软技能、学历、经验、领域、其他</li>
                                <li>重要性等级：关键、重要、可选</li>
                                <li>同义词检查：检查简历中是否有相关替代表达</li>
                                <li>补充建议：为每个缺失关键词生成针对性的补充建议</li>
                                <li>综合建议：根据整体匹配度给出改进建议</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">测试重点</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                <li>关键词分类是否准确</li>
                                <li>重要性等级判断是否合理</li>
                                <li>同义词检查是否准确</li>
                                <li>补充建议是否有针对性</li>
                                <li>综合建议是否合理</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">预期结果</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                <li>TypeScript、Node.js、Express、MySQL、MongoDB、团队协作、沟通能力、本科应被识别为缺失关键词</li>
                                <li>TypeScript、Node.js、MySQL、MongoDB应为关键或重要等级</li>
                                <li>团队协作、沟通能力应为软技能分类</li>
                                <li>本科应为学历要求分类</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}