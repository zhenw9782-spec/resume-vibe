'use client'

/**
 * PDF 预览组件
 * 使用 @react-pdf-viewer 渲染 PDF，支持模板切换和下载
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
// 仅用核心 Viewer + 轻量滚动渲染，避免 default-layout 整套重型插件导致交互卡顿
import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core'
import '@react-pdf-viewer/core/lib/styles/index.css'
import {
  generatePDF,
  downloadPDF,
  getPDFBlobUrl,
  revokePDFBlobUrl,
  generateDownloadFileName,
} from '@/src/lib/pdf/generator'
import type { PDFGenerationResult } from '@/src/lib/pdf/generator'
import type { PDFPreviewProps } from '@/src/types/components'

/**
 * pdfjs worker 地址（本地托管，兼容 @react-pdf-viewer 3.x 所需 pdfjs v3）
 */
const PDFJS_WORKER_URL = '/pdfjs/pdf.worker.min.js'

/**
 * PDF 预览组件
 */
export default function PDFPreview({
  resumeText,
  template,
  fileName = '优化简历',
  onTemplateChange,
  onDownload,
}: PDFPreviewProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  // 仅在浏览器端渲染 @react-pdf-viewer（避免 SSR 崩溃）
  const [mounted, setMounted] = useState(false)
  // 输入防抖：停止输入 800ms 后才重新生成 PDF，避免每键一次阻塞主线程
  const [debouncedResumeText, setDebouncedResumeText] = useState(resumeText)

  // 保存最近一次生成结果，用于下载
  const latestResultRef = useRef<PDFGenerationResult | null>(null)
  // 追踪当前 blob URL，供卸载时释放（不在 cleanup 中调用 setState）
  const blobUrlRef = useRef<string | null>(null)

  // 布局插件实例（保持稳定）
  // 已弃用 default-layout，改用轻量纯 Viewer

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedResumeText(resumeText), 800)
    return () => clearTimeout(timer)
  }, [resumeText])

  const generate = useCallback(async () => {
    setIsGenerating(true)
    setGenError(null)
    try {
      const result = await generatePDF({ resumeText: debouncedResumeText, template, fileName })
      latestResultRef.current = result
      const url = getPDFBlobUrl(result.blob)
      if (blobUrlRef.current) revokePDFBlobUrl(blobUrlRef.current)
      blobUrlRef.current = url
      setBlobUrl(url)
    } catch (err) {
      console.error('PDF generation error:', err)
      setGenError(err instanceof Error ? err.message : 'PDF生成失败')
    } finally {
      setIsGenerating(false)
    }
  }, [debouncedResumeText, template, fileName])

  useEffect(() => {
    generate()
    return () => {
      if (blobUrlRef.current) {
        revokePDFBlobUrl(blobUrlRef.current)
        blobUrlRef.current = null
      }
    }
  }, [generate])

  const handleDownload = () => {
    if (onDownload) {
      onDownload()
    } else if (latestResultRef.current) {
      const downloadName = generateDownloadFileName(debouncedResumeText, fileName)
      downloadPDF(latestResultRef.current, downloadName)
    }
  }

  const actualDownloadName = generateDownloadFileName(debouncedResumeText, fileName)

  const templateButtonClass = (isActive: boolean) =>
    `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
    }`

  return (
    <div className="flex flex-col w-full">
      {/* 工具栏：模板切换 + 下载 */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onTemplateChange?.('classic')}
            className={templateButtonClass(template === 'classic')}
          >
            经典专业版
          </button>
          <button
            type="button"
            onClick={() => onTemplateChange?.('modern')}
            className={templateButtonClass(template === 'modern')}
          >
            现代设计版
          </button>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={!blobUrl}
          className="px-4 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          下载 PDF
        </button>
      </div>

      {/* 实际下载文件名提示 */}
      <div className="mb-4 text-sm text-gray-600">
        下载文件名：<span className="font-medium text-gray-900">{actualDownloadName}</span>
      </div>

      {/* 预览区：仅在客户端挂载后渲染 @react-pdf-viewer */}
      <div className="border border-gray-200 rounded-md overflow-hidden h-[600px] bg-gray-50">
        {!mounted && (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-gray-500">加载中...</p>
          </div>
        )}

        {mounted && isGenerating && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-900">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-sm">正在生成 PDF...</p>
            </div>
          </div>
        )}

        {mounted && !isGenerating && genError && (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center">
              <p className="text-red-600 font-medium mb-2">生成失败</p>
              <p className="text-sm text-gray-900 break-all">{genError}</p>
            </div>
          </div>
        )}

        {mounted && !isGenerating && !genError && blobUrl && (
          <Worker workerUrl={PDFJS_WORKER_URL}>
            <Viewer fileUrl={blobUrl} defaultScale={SpecialZoomLevel.PageFit} />
          </Worker>
        )}
      </div>
    </div>
  )
}