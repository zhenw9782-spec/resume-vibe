'use client'

/**
 * ResumeVibe Context 状态管理
 * 提供全局状态管理，包括文件、文本、分析结果和状态
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type {
    AnalysisStatus,
    AnalysisResult,
    JobDescription,
    Resume,
    RewriteResult,
    UploadState,
    AnalysisRequest,
    AnalysisResponse
} from '../types'

/**
 * Context值类型
 */
interface ResumeContextValue {
    /**
     * 当前上传的文件
     */
    file: File | null

    /**
     * 解析出的文本
     */
    parsedText: string

    /**
     * 分析结果
     */
    analysisResult: AnalysisResult | null

    /**
     * 改写结果
     */
    rewriteResult: RewriteResult | null

    /**
     * 当前状态
     */
    status: AnalysisStatus

    /**
     * 上传状态
     */
    uploadState: UploadState

    /**
     * 设置文件
     */
    setFile: (file: File | null) => void

    /**
     * 设置解析的文本
     */
    setParsedText: (text: string) => void

    /**
     * 设置分析结果
     */
    setAnalysisResult: (result: AnalysisResult | null) => void

    /**
     * 设置改写结果
     */
    setRewriteResult: (result: RewriteResult | null) => void

    /**
     * 设置状态
     */
    setStatus: (status: AnalysisStatus) => void

    /**
     * 设置上传状态
     */
    setUploadState: (state: UploadState) => void

    /**
     * 重置所有状态
     */
    reset: () => void

    /**
     * 开始上传
     */
    startUpload: () => void

    /**
     * 上传完成
     */
    completeUpload: () => void

    /**
     * 上传失败
     */
    failUpload: (error: string) => void

    /**
     * 开始分析
     */
    startAnalysis: () => void

    /**
     * 分析完成
     */
    completeAnalysis: (data: AnalysisResponse) => void

    /**
     * 分析失败
     */
    failAnalysis: (error: string) => void

    /**
     * 设置岗位描述
     */
    setJobDescription: (jobDescription: string) => void

    /**
     * 设置简历文本
     */
    setResumeText: (resumeText: string) => void

    /**
     * 岗位描述
     */
    jobDescription: string

    /**
     * 简历文本
     */
    resumeText: string

    /**
     * 获取当前分析请求
     */
    getAnalysisRequest: () => AnalysisRequest | null

    /**
     * 是否有数据（函数）
     */
    hasData: () => boolean
}

/**
 * 默认Context值
 */
const defaultContextValue: Omit<ResumeContextValue, 'setFile' | 'setParsedText' | 'setAnalysisResult' | 'setRewriteResult' | 'setStatus' | 'setUploadState' | 'reset' | 'startUpload' | 'completeUpload' | 'failUpload' | 'startAnalysis' | 'completeAnalysis' | 'failAnalysis' | 'setJobDescription' | 'setResumeText' | 'getAnalysisRequest' | 'hasData'> = {
    file: null,
    parsedText: '',
    analysisResult: null,
    rewriteResult: null,
    status: 'idle',
    jobDescription: '',
    resumeText: '',
    uploadState: {
        file: null,
        progress: 0,
        status: 'idle'
    }
}

/**
 * ResumeContext
 */
const ResumeContext = createContext<ResumeContextValue | undefined>(undefined)

/**
 * ResumeContext Provider Props
 */
interface ResumeContextProviderProps {
    /**
     * 子组件
     */
    children: ReactNode
}

/**
 * ResumeContext Provider
 */
export function ResumeContextProvider({ children }: ResumeContextProviderProps) {
    // 状态
    const [file, setFile] = useState<File | null>(null)
    const [parsedText, setParsedText] = useState<string>('')
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
    const [rewriteResult, setRewriteResult] = useState<RewriteResult | null>(null)
    const [status, setStatus] = useState<AnalysisStatus>('idle')
    const [uploadState, setUploadState] = useState<UploadState>({
        file: null,
        progress: 0,
        status: 'idle'
    })
    const [jobDescription, setJobDescription] = useState<string>('')
    const [resumeText, setResumeText] = useState<string>('')

    /**
     * 重置所有状态
     */
    const reset = useCallback(() => {
        setFile(null)
        setParsedText('')
        setAnalysisResult(null)
        setRewriteResult(null)
        setStatus('idle')
        setUploadState({
            file: null,
            progress: 0,
            status: 'idle'
        })
        setJobDescription('')
        setResumeText('')
    }, [])

    /**
     * 开始上传
     */
    const startUpload = useCallback(() => {
        setStatus('uploading')
        setUploadState({
            file,
            progress: 0,
            status: 'uploading'
        })
    }, [file])

    /**
     * 上传完成
     */
    const completeUpload = useCallback(() => {
        setStatus('success')
        setUploadState({
            file,
            progress: 100,
            status: 'success'
        })
    }, [file])

    /**
     * 上传失败
     */
    const failUpload = useCallback((error: string) => {
        setStatus('error')
        setUploadState({
            file,
            progress: 0,
            status: 'error',
            error
        })
    }, [file])

    /**
     * 开始分析
     */
    const startAnalysis = useCallback(() => {
        setStatus('analyzing')
    }, [])

    /**
     * 分析完成
     */
    const completeAnalysis = useCallback((data: AnalysisResponse) => {
        setStatus('success')
        setAnalysisResult(data.result)
        setRewriteResult(data.rewriteResult)
    }, [])

    /**
     * 分析失败
     */
    const failAnalysis = useCallback((error: string) => {
        setStatus('error')
        setAnalysisResult(null)
        setRewriteResult(null)
    }, [])

    /**
     * 获取当前分析请求
     */
    const getAnalysisRequest = useCallback((): AnalysisRequest | null => {
        if (!jobDescription || !resumeText) {
            return null
        }
        return {
            jobDescription,
            resumeText
        }
    }, [jobDescription, resumeText])

    /**
     * 是否有数据
     */
    const hasData = useCallback(() => {
        return !!(file && parsedText)
    }, [file, parsedText])

    /**
     * Context值
     */
    const contextValue: ResumeContextValue = {
        file,
        parsedText,
        analysisResult,
        rewriteResult,
        status,
        uploadState,
        setFile,
        setParsedText,
        setAnalysisResult,
        setRewriteResult,
        setStatus,
        setUploadState,
        reset,
        startUpload,
        completeUpload,
        failUpload,
        startAnalysis,
        completeAnalysis,
        failAnalysis,
        setJobDescription,
        setResumeText,
        jobDescription,
        resumeText,
        getAnalysisRequest,
        hasData
    }

    return (
        <ResumeContext.Provider value={contextValue}>
            {children}
        </ResumeContext.Provider>
    )
}

/**
 * 使用ResumeContext Hook
 * 
 * @throws 如果在Provider外部使用，会抛出错误
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { file, status, setFile, setStatus } = useResumeContext()
 *   
 *   return (
 *     <div>
 *       <p>文件: {file?.name}</p>
 *       <p>状态: {status}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useResumeContext() {
    const context = useContext(ResumeContext)

    if (context === undefined) {
        throw new Error('useResumeContext must be used within a ResumeContextProvider')
    }

    return context
}