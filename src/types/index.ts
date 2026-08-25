/**
 * ResumeVibe 类型定义文件
 * 包含核心业务类型定义
 */

/**
 * 简历分析状态
 */
export type AnalysisStatus = 'idle' | 'uploading' | 'analyzing' | 'success' | 'error'

/**
 * 简历分析结果
 */
export interface AnalysisResult {
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
}

/**
 * 岗位描述
 */
export interface JobDescription {
    /**
     * 岗位名称
     */
    title: string

    /**
     * 岗位描述文本
     */
    description: string

    /**
     * 关键技能要求
     */
    requiredSkills: string[]

    /**
     * 工作经验要求
     */
    experience: string

    /**
     * 学历要求
     */
    education: string

    /**
     * 薪资范围
     */
    salary?: string
}

/**
 * 简历
 */
export interface Resume {
    /**
     * 简历文件
     */
    file: File

    /**
     * 简历文本内容
     */
    text: string

    /**
     * 简历解析时间
     */
    parsedAt: Date
}

/**
 * 简历改写结果
 */
export interface RewriteResult {
    /**
     * 改写后的简历文本
     */
    rewrittenText: string

    /**
     * 改写说明
     */
    explanation: string

    /**
     * 修改内容摘要
     */
    summary: string[]
}

/**
 * 文件上传状态
 */
export interface UploadState {
    /**
     * 当前上传的文件
     */
    file: File | null

    /**
     * 上传进度（0-100）
     */
    progress: number

    /**
     * 上传状态
     */
    status: AnalysisStatus

    /**
     * 错误信息（仅在上传失败时存在）
     */
    error?: string
}

/**
 * 简历分析请求
 */
export interface AnalysisRequest {
    /**
     * 岗位描述
     */
    jobDescription: string

    /**
     * 简历文本
     */
    resumeText: string
}

/**
 * 简历分析响应
 */
export interface AnalysisResponse {
    /**
     * 分析结果
     */
    result: AnalysisResult

    /**
     * 改写结果
     */
    rewriteResult: RewriteResult

    /**
     * 处理时间（毫秒）
     */
    processingTime: number

    /**
     * 是否使用缓存
     */
    fromCache: boolean
}