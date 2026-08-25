/**
 * OpenAI / Ollama API 封装
 * 提供简历分析和改写的AI能力
 */

import OpenAI from 'openai'
import {
    APIConnectionError,
    APIConnectionTimeoutError,
    APIUserAbortError,
    AuthenticationError,
    BadRequestError,
    InternalServerError,
    NotFoundError,
    PermissionDeniedError,
    RateLimitError,
    UnprocessableEntityError,
} from 'openai'
import { OpenAIRequest, OpenAIResponse, ApiError, ApiErrorType } from '../../types/api'

// 💡 注意：请将这里的 'qwen2.5' 改为你本地 ollama 已安装的模型名字（例如 'llama3'、'deepseek-r1' 等）
const DEFAULT_MODEL = process.env.NEXT_PUBLIC_MODEL_NAME || 'qwen2.5'
const DEFAULT_TEMPERATURE = 0.7
const MAX_TOKENS = 2000

// 请求超时时间（毫秒）：AI 响应通常 15-30 秒，超时给予 90 秒宽限
const REQUEST_TIMEOUT_MS = 90000

/**
 * OpenAI / Ollama API 客户端类
 */
export class OpenAIClient {
    private client: OpenAI

    constructor() {
        // 从环境变量获取 API 密钥（Ollama 不需要真实 Key，但 SDK 不能为空）
        const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY || 'ollama'

        // 获取 Ollama 的 Base URL
        const baseURL = process.env.NEXT_PUBLIC_OPENAI_BASE_URL || process.env.OPENAI_BASE_URL || 'http://localhost:11434/v1'

        this.client = new OpenAI({
            apiKey,
            baseURL, // 💡 动态配置地址，不会再报 undefined
            dangerouslyAllowBrowser: true, // 允许浏览器端测试调用
            timeout: REQUEST_TIMEOUT_MS, // 请求超时控制
            maxRetries: 0, // 关闭 SDK 内部重试，由上层统一处理
        })
    }

    /**
     * 发送请求
     */
    async sendRequest(request: OpenAIRequest): Promise<OpenAIResponse> {
        try {
            const response = await this.client.chat.completions.create({
                model: request.model || DEFAULT_MODEL,
                messages: request.messages,
                temperature: request.temperature ?? DEFAULT_TEMPERATURE,
                max_tokens: request.max_tokens ?? MAX_TOKENS,
                response_format: request.response_format,
            })

            return {
                choices: response.choices.map(choice => ({
                    index: choice.index,
                    message: {
                        role: choice.message.role as 'system' | 'user' | 'assistant',
                        content: choice.message.content || '',
                    },
                    finish_reason: choice.finish_reason,
                })),
                usage: {
                    prompt_tokens: response.usage?.prompt_tokens || 0,
                    completion_tokens: response.usage?.completion_tokens || 0,
                    total_tokens: response.usage?.total_tokens || 0,
                },
                model: response.model,
            }
        } catch (error) {
            this.handleApiError(error)
        }
    }

    /**
     * 分析简历和岗位描述的匹配度
     */
    async analyzeResumeMatch(jobDescription: string, resumeText: string) {
        const prompt = `
你是一位专业的简历分析师，请分析简历与岗位描述的匹配度。

**岗位描述：**
${jobDescription}

**简历内容：**
${resumeText}

请以JSON格式返回分析结果，包含以下字段：
- matchScore: 匹配度分数（0-100）
- missingKeywords: 缺失的关键词列表
- suggestions: 改进建议列表
- level: 匹配等级（'low' | 'medium' | 'high'）
- report: 详细分析报告

请确保返回有效的JSON格式。
        `

        const response = await this.sendRequest({
            model: DEFAULT_MODEL, // 💡 使用本地模型
            messages: [
                {
                    role: 'system',
                    content: '你是一位专业的简历分析师，擅长分析简历与岗位描述的匹配度，并提供专业的改进建议。'
                },
                {
                    role: 'user',
                    content: prompt,
                }
            ],
            response_format: {
                type: 'json_object'
            }
        })

        const content = response.choices[0].message.content
        if (!content) {
            throw new ApiError('No response from AI API', ApiErrorType.INTERNAL_ERROR)
        }

        try {
            const result = JSON.parse(content)
            return {
                matchScore: Math.min(100, Math.max(0, result.matchScore || 0)),
                missingKeywords: Array.isArray(result.missingKeywords) ? result.missingKeywords : [],
                suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
                level: result.level || 'medium',
                report: result.report || '',
            }
        } catch (error) {
            throw new ApiError('Failed to parse AI response', ApiErrorType.INTERNAL_ERROR, { details: error })
        }
    }

    /**
     * 根据岗位要求优化简历
     */
    async optimizeResume(jobDescription: string, resumeText: string) {
        const prompt = `
请根据以下岗位描述优化简历内容，使其更符合岗位要求。

**岗位描述：**
${jobDescription}

**原始简历：**
${resumeText}

优化要求：
1. 保持简历的基本结构和信息不变
2. 强调与岗位要求相关的技能和经验
3. 使用更专业、更精准的表达
4. 突出核心竞争力
5. 保持简历的简洁性和可读性

请以JSON格式返回优化结果，包含以下字段：
- rewrittenText: 优化后的简历文本
- explanation: 优化说明
- summary: 修改内容摘要列表

请确保返回有效的JSON格式。
        `

        const response = await this.sendRequest({
            model: DEFAULT_MODEL, // 💡 使用本地模型
            messages: [
                {
                    role: 'system',
                    content: '你是一位专业的简历优化师，擅长根据岗位要求优化简历内容，提升简历的针对性和竞争力。'
                },
                {
                    role: 'user',
                    content: prompt,
                }
            ],
            response_format: {
                type: 'json_object'
            }
        })

        const content = response.choices[0].message.content
        if (!content) {
            throw new ApiError('No response from AI API', ApiErrorType.INTERNAL_ERROR)
        }

        try {
            const result = JSON.parse(content)
            return {
                rewrittenText: result.rewrittenText || resumeText,
                explanation: result.explanation || '',
                summary: Array.isArray(result.summary) ? result.summary : [],
            }
        } catch (error) {
            throw new ApiError('Failed to parse AI response', ApiErrorType.INTERNAL_ERROR, { details: error })
        }
    }

    /**
     * 从岗位描述中提取关键词
     */
    async extractKeywords(jobDescription: string): Promise<string[]> {
        const prompt = `
请从以下岗位描述中提取关键技能和要求关键词。

**岗位描述：**
${jobDescription}

提取要求：
1. 提取硬技能关键词（如编程语言、框架、工具等）
2. 提取软技能关键词（如沟通能力、团队协作等）
3. 提取专业术语和行业关键词
4. 去除重复和无关词汇
5. 返回10-20个最重要的关键词

请以JSON格式返回，包含一个keywords字段，关键词数组。
        `

        const response = await this.sendRequest({
            model: DEFAULT_MODEL, // 💡 使用本地模型
            messages: [
                {
                    role: 'system',
                    content: '你是一位专业的人力资源分析师，擅长从岗位描述中提取关键技能和要求。'
                },
                {
                    role: 'user',
                    content: prompt,
                }
            ],
            response_format: {
                type: 'json_object'
            }
        })

        const content = response.choices[0].message.content
        if (!content) {
            throw new ApiError('No response from AI API', ApiErrorType.INTERNAL_ERROR)
        }

        try {
            const result = JSON.parse(content)
            return Array.isArray(result.keywords) ? result.keywords : []
        } catch (error) {
            throw new ApiError('Failed to parse AI response', ApiErrorType.INTERNAL_ERROR, { details: error })
        }
    }

    /**
     * 错误处理：按 openai SDK 错误类型分类，映射为友好的 ApiError
     */
    private handleApiError(error: any): never {
        // 请求被用户中止（例如组件卸载）
        if (error instanceof APIUserAbortError) {
            throw new ApiError('请求已取消', ApiErrorType.TIMEOUT, { details: error })
        }

        // 连接超时
        if (error instanceof APIConnectionTimeoutError) {
            throw new ApiError('AI 服务响应超时，请稍后重试', ApiErrorType.TIMEOUT, { details: error })
        }

        // 网络连接错误（DNS、断网、服务不可达等）
        if (error instanceof APIConnectionError) {
            throw new ApiError(
                '无法连接到 AI 服务，请检查网络连接或服务地址配置',
                ApiErrorType.NETWORK_ERROR,
                { details: error }
            )
        }

        // 触发了 API 限流（429）
        if (error instanceof RateLimitError || error?.status === 429) {
            throw new ApiError(
                '请求过于频繁或 API 配额已耗尽，请稍后再试',
                ApiErrorType.RATE_LIMIT_EXCEEDED,
                { statusCode: 429, details: error }
            )
        }

        // API 密钥无效（401）或权限不足（403）
        if (error instanceof AuthenticationError || error?.status === 401) {
            throw new ApiError(
                'API 密钥无效或已过期，请检查 API Key 配置',
                ApiErrorType.INVALID_API_KEY,
                { statusCode: 401, details: error }
            )
        }
        if (error instanceof PermissionDeniedError || error?.status === 403) {
            throw new ApiError(
                '没有权限访问该 AI 服务，请检查账户权限',
                ApiErrorType.INVALID_API_KEY,
                { statusCode: 403, details: error }
            )
        }

        // 无效的请求参数（400）
        if (error instanceof BadRequestError || error?.status === 400) {
            throw new ApiError(
                '请求参数无效，请检查输入内容后重试',
                ApiErrorType.INVALID_REQUEST,
                { statusCode: 400, details: error }
            )
        }

        // 资源不存在（404）
        if (error instanceof NotFoundError || error?.status === 404) {
            throw new ApiError(
                'AI 服务资源不存在，请检查模型名称或服务地址配置',
                ApiErrorType.INVALID_REQUEST,
                { statusCode: 404, details: error }
            )
        }

        // 无法处理的实体（422）
        if (error instanceof UnprocessableEntityError || error?.status === 422) {
            throw new ApiError(
                '请求内容无法被 AI 服务处理，请调整输入后重试',
                ApiErrorType.INVALID_REQUEST,
                { statusCode: 422, details: error }
            )
        }

        // 服务器内部错误（5xx）
        if (error instanceof InternalServerError || (error?.status >= 500 && error?.status < 600)) {
            throw new ApiError(
                'AI 服务暂时不可用，请稍后重试',
                ApiErrorType.INTERNAL_ERROR,
                { statusCode: error?.status, details: error }
            )
        }

        // 其他未分类错误
        throw new ApiError(
            `AI 服务调用失败: ${error?.message || '未知错误'}`,
            ApiErrorType.INTERNAL_ERROR,
            { details: error }
        )
    }
}

/**
 * 工厂函数
 */
export function createOpenAIClient(): OpenAIClient {
    return new OpenAIClient()
}

/**
 * 默认导出函数，避免模块加载时立即初始化
 */
export default createOpenAIClient