'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ChevronDown, ChevronUp, Edit3, Eye, EyeOff, Save, X, RotateCcw, Copy, Check } from 'lucide-react'

/**
 * 修改逻辑详情
 */
export interface ModificationDetail {
    /**
     * 修改类型
     */
    type: 'addition' | 'deletion' | 'modification' | 'reordering'

    /**
     * 修改位置
     */
    location: string

    /**
     * 修改前内容
     */
    before?: string

    /**
     * 修改后内容
     */
    after?: string

    /**
     * 修改原因
     */
    reason: string
}

/**
 * CompareView 组件 Props
 */
export interface CompareViewProps {
    /**
     * 原版简历文本
     */
    originalResume: string

    /**
     * 改写后的简历文本
     */
    rewrittenResume: string

    /**
     * 修改说明
     */
    explanation: string

    /**
     * 修改内容摘要
     */
    summary: string[]

    /**
     * 修改逻辑详情（可选）
     */
    modificationDetails?: ModificationDetail[]

    /**
     * 是否展开
     */
    isExpanded?: boolean

    /**
     * 切换展开/收起回调
     */
    onToggleExpand?: () => void

    /**
     * 编辑改写后的简历回调
     */
    onEditResume?: (text: string) => void
}

/**
 * CompareView 对比视图组件
 * 实现左右分栏对比原版和改写后的简历，支持在线编辑和实时预览
 */
export function CompareView({
    originalResume,
    rewrittenResume,
    explanation,
    summary,
    modificationDetails = [],
    isExpanded = false,
    onToggleExpand,
    onEditResume,
}: CompareViewProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editedResume, setEditedResume] = useState(rewrittenResume)
    const [showExplanation, setShowExplanation] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const [isCopying, setIsCopying] = useState(false)
    const [copySuccess, setCopySuccess] = useState(false)

    // 监听编辑内容变化
    useEffect(() => {
        setHasChanges(editedResume !== rewrittenResume)
    }, [editedResume, rewrittenResume])

    const handleToggleExpand = () => {
        onToggleExpand?.()
    }

    const handleEdit = () => {
        setIsEditing(true)
        setEditedResume(rewrittenResume)
    }

    const handleSave = () => {
        setIsEditing(false)
        onEditResume?.(editedResume)
    }

    const handleCancel = () => {
        setIsEditing(false)
        setEditedResume(rewrittenResume)
    }

    const handleReset = () => {
        setEditedResume(rewrittenResume)
    }

    const handleCopy = async () => {
        setIsCopying(true)
        setCopySuccess(false)
        
        try {
            await navigator.clipboard.writeText(rewrittenResume)
            setCopySuccess(true)
            setTimeout(() => setCopySuccess(false), 2000)
        } catch (err) {
            console.error('复制失败:', err)
            // 降级方案：使用textarea复制
            const textarea = document.createElement('textarea')
            textarea.value = rewrittenResume
            textarea.style.position = 'fixed'
            textarea.style.opacity = '0'
            document.body.appendChild(textarea)
            textarea.select()
            try {
                document.execCommand('copy')
                setCopySuccess(true)
                setTimeout(() => setCopySuccess(false), 2000)
            } catch (execErr) {
                console.error('降级复制也失败:', execErr)
            }
            document.body.removeChild(textarea)
        } finally {
            setIsCopying(false)
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            简历对比视图
                        </CardTitle>
                        <CardDescription>
                            原版简历与优化后简历的对比
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowExplanation(!showExplanation)}
                        >
                            {showExplanation ? (
                                <>
                                    <EyeOff className="h-4 w-4 mr-1" />
                                    隐藏说明
                                </>
                            ) : (
                                <>
                                    <Eye className="h-4 w-4 mr-1" />
                                    查看说明
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleToggleExpand}
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUp className="h-4 w-4 mr-1" />
                                    收起
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-4 w-4 mr-1" />
                                    展开
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* 修改说明区域 */}
                {showExplanation && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-blue-800">修改说明</h3>
                            {modificationDetails.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    {showDetails ? '隐藏详情' : '查看详细修改逻辑'}
                                </Button>
                            )}
                        </div>
                        <p className="text-sm text-blue-700 mb-3">{explanation}</p>
                        
                        {summary.length > 0 && (
                            <div>
                                <h4 className="font-medium mb-2 text-blue-800">修改摘要</h4>
                                <ul className="space-y-1">
                                    {summary.map((item, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm text-blue-700">
                                            <span className="text-blue-500 mt-1">•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* 详细修改逻辑 */}
                        {showDetails && modificationDetails.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-blue-200">
                                <h4 className="font-medium mb-3 text-blue-800">详细修改逻辑</h4>
                                <div className="space-y-3">
                                    {modificationDetails.map((detail, index) => (
                                        <div key={index} className="bg-white p-3 rounded-lg border border-blue-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant={
                                                    detail.type === 'addition' ? 'default' :
                                                    detail.type === 'deletion' ? 'destructive' :
                                                    detail.type === 'modification' ? 'secondary' :
                                                    'outline'
                                                } className={
                                                    detail.type === 'addition' ? 'bg-green-100 text-green-800' :
                                                    detail.type === 'deletion' ? 'bg-red-100 text-red-800' :
                                                    detail.type === 'modification' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-purple-100 text-purple-800'
                                                }>
                                                    {detail.type === 'addition' ? '新增' :
                                                     detail.type === 'deletion' ? '删除' :
                                                     detail.type === 'modification' ? '修改' : '重排'}
                                                </Badge>
                                                <span className="text-sm font-medium text-gray-700">{detail.location}</span>
                                            </div>
                                            {detail.before && (
                                                <div className="text-xs text-gray-500 mb-1">
                                                    <span className="font-medium">修改前：</span>
                                                    <span className="line-through text-red-600">{detail.before}</span>
                                                </div>
                                            )}
                                            {detail.after && (
                                                <div className="text-xs text-gray-500 mb-1">
                                                    <span className="font-medium">修改后：</span>
                                                    <span className="text-green-600">{detail.after}</span>
                                                </div>
                                            )}
                                            <div className="text-xs text-gray-600 mt-2">
                                                <span className="font-medium">原因：</span>{detail.reason}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 对比内容区域 */}
                <div className={`grid gap-6 ${isExpanded ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
                    {/* 原版简历 */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-700">原版简历</h3>
                            <Badge variant="secondary">原始版本</Badge>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[300px]">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{originalResume}</p>
                        </div>
                    </div>

                    {/* 改写后的简历 */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-green-700">优化后简历</h3>
                            <div className="flex gap-2">
                                <Badge variant="default" className="bg-green-100 text-green-800">优化版本</Badge>
                                {!isEditing && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleCopy}
                                            disabled={isCopying}
                                        >
                                            {copySuccess ? (
                                                <>
                                                    <Check className="h-4 w-4 mr-1" />
                                                    已复制
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-4 w-4 mr-1" />
                                                    复制
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleEdit}
                                        >
                                            <Edit3 className="h-4 w-4 mr-1" />
                                            编辑
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                        {isEditing ? (
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm text-gray-500">
                                        编辑模式 - 实时预览
                                    </span>
                                    <span className={`text-sm ${editedResume.length > 1500 ? 'text-red-500' : 'text-gray-500'}`}>
                                        {editedResume.length} / 1500 字
                                    </span>
                                </div>
                                <Textarea
                                    value={editedResume}
                                    onChange={(e) => setEditedResume(e.target.value)}
                                    className="min-h-[300px] mb-3"
                                    placeholder="请输入优化后的简历内容..."
                                />
                                <div className="flex gap-2 items-center">
                                    <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
                                        <Save className="h-4 w-4 mr-1" />
                                        保存
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={handleCancel}>
                                        <X className="h-4 w-4 mr-1" />
                                        取消
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={handleReset} disabled={!hasChanges}>
                                        <RotateCcw className="h-4 w-4 mr-1" />
                                        重置
                                    </Button>
                                    {hasChanges && (
                                        <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                                            有未保存的修改
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 min-h-[300px]">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{rewrittenResume}</p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}