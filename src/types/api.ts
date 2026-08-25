/**
 * ResumeVibe API 类型定义文件
 * 包含API请求和响应类型
 */

/**
 * API响应基础结构
 */
export interface ApiResponse<T = any> {
    /**
     * 是否成功
     */
    success: boolean

    /**
     * 响应数据
     */
    data?: T

    /**
     * 错误信息
     */
    error?: {
        message: string
        code?: string
        details?: any
    }

    /**
     * 请求时间戳
     */
    timestamp: number
}

/**
 * OpenAI API 请求
 */
export interface OpenAIRequest {
    /**
     * 模型名称
     */
    model: string

    /**
     * 消息列表
     */
    messages: Message[]

    /**
     * 温度参数（0-2）
     */
    temperature?: number

    /**
     * 最大令牌数
     */
    max_tokens?: number

    /**
     * 响应格式
     */
    response_format?: {
        type: 'json_object'
    }
}

/**
 * OpenAI 消息
 */
export interface Message {
    /**
     * 消息角色
     */
    role: 'system' | 'user' | 'assistant'

    /**
     * 消息内容
     */
    content: string
}

/**
 * OpenAI API 响应
 */
export interface OpenAIResponse {
    /**
     * 选中的消息
     */
    choices: Array<{
        index: number
        message: Message
        finish_reason: string
    }>

    /**
     * 使用的令牌数
     */
    usage: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
    }

    /**
     * 模型信息
     */
    model: string
}

/**
 * Upstash Redis 缓存请求
 */
export interface CacheRequest {
    /**
     * 缓存键
     */
    key: string

    /**
     * 缓存值
     */
    value: any

    /**
     * 过期时间（秒）
     */
    ttl?: number
}

/**
 * Upstash Redis 缓存响应
 */
export interface CacheResponse {
    /**
     * 是否成功
     */
    success: boolean

    /**
     * 键
     */
    key: string

    /**
     * 值
     */
    value?: any

    /**
     * 过期时间（秒）
     */
    ttl?: number
}

/**
 * 限流请求
 */
export interface RateLimitRequest {
    /**
     * IP地址
     */
    ip: string

    /**
     * 限流键
     */
    key: string
}

/**
 * 限流响应
 */
export interface RateLimitResponse {
    /**
     * 是否允许请求
     */
    allowed: boolean

    /**
     * 剩余请求数
     */
    remaining: number

    /**
     * 重置时间（Unix时间戳）
     */
    reset: number

    /**
     * 限流窗口（秒）
     */
    window: number
}

/**
 * API 错误类型
 */
export enum ApiErrorType {
    /**
     * 网络错误
     */
    NETWORK_ERROR = 'NETWORK_ERROR',

    /**
     * API 限流
     */
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

    /**
     * API 超时
     */
    TIMEOUT = 'TIMEOUT',

    /**
     * 无效的请求参数
     */
    INVALID_REQUEST = 'INVALID_REQUEST',

    /**
     * 内部服务器错误
     */
    INTERNAL_ERROR = 'INTERNAL_ERROR',

    /**
     * API 密钥无效
     */
    INVALID_API_KEY = 'INVALID_API_KEY'
}

/**
 * API 错误
 */
export class ApiError extends Error {
    public readonly type: ApiErrorType
    public readonly statusCode?: number
    public readonly details?: any

    constructor(message: string, type: ApiErrorType, options?: { statusCode?: number; details?: any }) {
        super(message)
        this.type = type
        this.statusCode = options?.statusCode
        this.details = options?.details
        this.name = 'ApiError'
    }
}

/**
 * 文件上传请求
 */
export interface FileUploadRequest {
    /**
     * 文件
     */
    file: File

    /**
     * 文件类型
     */
    fileType: 'resume' | 'job_description'
}

/**
 * 文件上传响应
 */
export interface FileUploadResponse {
    /**
     * 文件ID
     */
    fileId: string

    /**
     * 文件名
     */
    fileName: string

    /**
     * 文件大小（字节）
     */
    fileSize: number

    /**
     * 文件类型
     */
    fileType: string

    /**
     * 上传时间
     */
    uploadedAt: Date
}