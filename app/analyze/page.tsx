'use client'

/**
 * 分析与改写页面
 * 集成 InputPanel / AnalysisResult / CompareView / PDFPreview，实现完整用户流程
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Wand2, RotateCcw, Download } from 'lucide-react'
import { ResumeContextProvider, useResumeContext } from '@/src/context/ResumeContext'
import { InputPanel } from '@/src/components/InputPanel/InputPanel'
import { AnalysisResult } from '@/src/components/AnalysisResult/AnalysisResult'
import { CompareView } from '@/src/components/CompareView/CompareView'
import { ProgressIndicator } from '@/src/components/ProgressIndicator/ProgressIndicator'
import { getErrorDisplay, type ErrorDisplay } from '@/src/lib/errors/errorHandling'
import { generateDownloadFileName } from '@/src/lib/pdf/fileName'
import { ApiError, ApiErrorType } from '@/src/types/api'
import type { AnalysisResponse } from '@/src/types'

// 前端冷却时间：30 秒内禁止重复提交（localStorage 记录）
const COOLDOWN_MS = 30_000
const COOLDOWN_KEY = 'resumevibe:last_analysis_time'

// @react-pdf-viewer 依赖浏览器 API，需禁用 SSR，仅在客户端加载
const PDFPreview = dynamic(
  () => import('@/src/components/PDFPreview/PDFPreview'),
  { ssr: false }
)

/**
 * 分析页面主体（使用 ResumeContext）
 */
function AnalyzeContent() {
  const {
    jobDescription,
    resumeText,
    analysisResult,
    rewriteResult,
    status,
    setJobDescription,
    setResumeText,
    startAnalysis,
    completeAnalysis,
    failAnalysis,
    reset,
  } = useResumeContext()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<ErrorDisplay | null>(null)
  const [fromCache, setFromCache] = useState(false)
  const [cacheInfo, setCacheInfo] = useState<{ remaining: number; reset: number } | null>(null)
  const [template, setTemplate] = useState<'classic' | 'modern'>('classic')
  // 供 PDF 预览/下载使用的最终简历文本（默认改写结果，编辑后同步）
  const [pdfText, setPdfText] = useState('')
  // 对比视图展示的改写后简历（编辑保存后同步更新，保证「保存后更新显示」）
  const [displayRewritten, setDisplayRewritten] = useState('')
  // 真实分析进度（0-100）与当前阶段
  const [progress, setProgress] = useState(0)
  const [progressStage, setProgressStage] = useState('init')
  // 已用时间计时（秒），由 ProgressIndicator 内部驱动
  const startTimeRef = useRef(0)

  // PDF 下载文件名（自动生成：[姓名]_[岗位]_优化简历）
  const downloadFileName = generateDownloadFileName(pdfText)

  // 分析开始后，已用时间由 ProgressIndicator 内部计时，这里仅记录开始时刻
  useEffect(() => {
    return () => {
      startTimeRef.current = 0
    }
  }, [])

  /**
   * 触发 AI 分析与改写
   * 按真实步骤推进进度：初始化 → 关键词提取 → 语义匹配与简历改写（并行） → 生成建议 → 完成
   */
  const handleAnalyze = useCallback(async () => {
    setError(null)

    // 冷却时间检查：30 秒内禁止重复提交
    const now = Date.now()
    const lastTime = Number(localStorage.getItem(COOLDOWN_KEY) || 0)
    const remainingMs = COOLDOWN_MS - (now - lastTime)
    if (remainingMs > 0) {
      const remainingSec = Math.ceil(remainingMs / 1000)
      setError({
        type: 'COOLDOWN',
        title: '操作过于频繁',
        description: `为避免资源浪费，两次分析之间需间隔 ${COOLDOWN_MS / 1000} 秒。请在 ${remainingSec} 秒后再试。`,
        suggestions: [`请等待 ${remainingSec} 秒后重新提交`],
      })
      return
    }

    if (!jobDescription.trim() || !resumeText.trim()) {
      setError({
        type: 'VALIDATION',
        title: '输入内容不完整',
        description: '请先填写岗位描述和简历内容，再进行 AI 分析与改写。',
        suggestions: ['填写目标岗位描述', '粘贴或输入您的简历内容'],
      })
      return
    }
    if (jobDescription.trim().length < 10) {
      setError({
        type: 'VALIDATION',
        title: '岗位描述太短',
        description: '岗位描述至少需要 10 个字符，请补充完整。',
        suggestions: ['补充岗位职责、技能要求等内容'],
      })
      return
    }
    if (resumeText.trim().length < 20) {
      setError({
        type: 'VALIDATION',
        title: '简历内容太短',
        description: '简历内容至少需要 20 个字符，请补充完整。',
        suggestions: ['粘贴完整的简历内容后再试'],
      })
      return
    }

    setIsSubmitting(true)
    startAnalysis()
    setProgress(0)
    setProgressStage('init')
    startTimeRef.current = Date.now()

    try {
      // 步骤1：本地关键词提取阶段
      setProgressStage('keywords')
      setProgress(20)

      // 步骤2：进入服务端语义分析与简历改写阶段（分析 + 改写并行执行）
      setProgressStage('semantic')
      setProgress(40)

      // 调用后端 API（后端统一处理限流、缓存与 AI 调用）
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, resumeText }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new ApiError(
          data?.error || '分析失败，请稍后重试',
          (data?.errorType as ApiErrorType) || ApiErrorType.INTERNAL_ERROR
        )
      }

      // 步骤3：后端返回结果（已包含缓存命中 / AI 计算结果）
      setProgressStage('suggestions')
      setProgress(90)
      await new Promise((resolve) => setTimeout(resolve, 400))

      const response: AnalysisResponse = data

      setProgressStage('done')
      setProgress(100)
      setFromCache(!!response.fromCache)
      setCacheInfo(
        data?.rateLimit ? { remaining: data.rateLimit.remaining, reset: data.rateLimit.reset } : null
      )
      completeAnalysis(response)
      setPdfText(response.rewriteResult.rewrittenText)
      setDisplayRewritten(response.rewriteResult.rewrittenText)
      // 分析成功后才记录本次提交时间（用于 30 秒冷却），失败不触发冷却
      localStorage.setItem(COOLDOWN_KEY, String(Date.now()))
    } catch (err) {
      const display = getErrorDisplay(err)
      setError(display)
      failAnalysis(display.description)
    } finally {
      setIsSubmitting(false)
    }
  }, [jobDescription, resumeText, startAnalysis, completeAnalysis, failAnalysis])

  /**
   * 重新开始（回到输入状态）
   */
  const handleReset = useCallback(() => {
    reset()
    setError(null)
    setPdfText('')
    setDisplayRewritten('')
    setTemplate('classic')
    setProgress(0)
    setProgressStage('init')
    setFromCache(false)
    setCacheInfo(null)
  }, [reset])

  /**
   * 编辑改写后的简历（同步到对比视图展示与 PDF 预览）
   */
  const handleEditResume = useCallback((text: string) => {
    setPdfText(text)
    setDisplayRewritten(text)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">优化简历</h1>
          <p className="text-gray-600">
            输入目标岗位描述与您的简历，AI 将进行匹配分析并生成优化建议
          </p>
        </div>

        {/* 错误提示 */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{error.title}</AlertTitle>
            <AlertDescription>
              <p>{error.description}</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {error.suggestions.map((suggestion) => (
                  <li key={suggestion}>{suggestion}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* 步骤一：输入阶段（idle / error 后重试） */}
        {(status === 'idle' || status === 'error') && (
          <div className="space-y-6">
            <InputPanel
              jobDescription={jobDescription}
              resumeText={resumeText}
              onJobDescriptionChange={(text) => setJobDescription(text)}
              onResumeTextChange={(text) => setResumeText(text)}
            />

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={handleAnalyze}
                disabled={isSubmitting}
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold"
              >
                <Wand2 className="h-5 w-5 mr-2" />
                AI 开始分析与改写
              </Button>
              <Button size="lg" variant="outline" onClick={handleReset}>
                <RotateCcw className="h-5 w-5 mr-2" />
                清空
              </Button>
            </div>
          </div>
        )}

        {/* 分析中 */}
        {status === 'analyzing' && (
          <Card className="w-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-16">
                <ProgressIndicator progress={progress} stageKey={progressStage} />
                <p className="text-sm text-muted-foreground mt-6">
                  正在执行匹配度分析与简历优化（预计 15-30 秒），请勿关闭页面
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 结果阶段：分析结果 + 对比视图 + PDF 导出 */}
        {status === 'success' && analysisResult && rewriteResult && (
          <div className="space-y-8">
            {/* 缓存命中提示 */}
            {fromCache && (
              <Alert className="mb-0">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>已使用缓存结果</AlertTitle>
                <AlertDescription>
                  相同输入在 5 分钟内已有分析结果，本次直接返回缓存，未重复调用 AI。
                  {cacheInfo && (
                    <span> 本次请求后，1 小时内还可进行 {Math.max(0, cacheInfo.remaining)} 次分析。</span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* 分析结果 */}
            <AnalysisResult
              matchScore={analysisResult.matchScore}
              missingKeywords={analysisResult.missingKeywords}
              suggestions={analysisResult.suggestions}
              level={analysisResult.level}
              report={analysisResult.report}
            />

            {/* 对比视图 */}
            <CompareView
              originalResume={resumeText}
              rewrittenResume={displayRewritten}
              explanation={rewriteResult.explanation}
              summary={rewriteResult.summary}
              onEditResume={handleEditResume}
            />

            {/* PDF 导出 */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  导出 PDF
                </CardTitle>
                <CardDescription>
                  预览并下载优化后的简历（支持经典专业版 / 现代设计版两种模板）
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PDFPreview
                  resumeText={pdfText || rewriteResult.rewrittenText}
                  template={template}
                  fileName={downloadFileName}
                  onTemplateChange={setTemplate}
                />
              </CardContent>
            </Card>

            {/* 底部操作栏 */}
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                重新开始
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * 分析与改写页面
 */
export default function AnalyzePage() {
  return (
    <ResumeContextProvider>
      <AnalyzeContent />
    </ResumeContextProvider>
  )
}
