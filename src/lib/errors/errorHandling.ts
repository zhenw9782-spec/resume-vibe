/**
 * 错误处理模块
 * 将 ApiError 分类为友好的中文提示与恢复建议，用于分析页面错误展示
 */

import { ApiError, ApiErrorType } from '../../types/api'

/**
 * 错误展示信息
 */
export interface ErrorDisplay {
    /**
     * 错误标题（简短）
     */
    title: string

    /**
     * 错误描述（详细中文说明）
     */
    description: string

    /**
     * 恢复建议列表
     */
    suggestions: string[]

    /**
     * 错误类型（用于测试页展示分类是否正确）
     */
    type: string
}

/**
 * 根据错误对象生成友好的中文错误提示与恢复建议
 * 支持 ApiError 分类；其他未知错误统一归类为通用错误
 */
export function getErrorDisplay(err: unknown): ErrorDisplay {
    if (err instanceof ApiError) {
        switch (err.type) {
            case ApiErrorType.NETWORK_ERROR:
                return {
                    type: ApiErrorType.NETWORK_ERROR,
                    title: '网络连接失败',
                    description:
                        '无法连接到 AI 服务，请检查您的网络连接，或确认 AI 服务地址（Base URL）配置是否正确。',
                    suggestions: [
                        '检查网络连接是否正常',
                        '确认 .env.local 中的 API 服务地址配置正确',
                        '本地服务（如 Ollama）请确认其已启动',
                    ],
                }
            case ApiErrorType.TIMEOUT:
                return {
                    type: ApiErrorType.TIMEOUT,
                    title: 'AI 服务响应超时',
                    description:
                        'AI 服务在限定时间内未返回结果（已等待 90 秒）。可能是模型负载过高或网络不稳定导致。',
                    suggestions: [
                        '稍后重试',
                        '尝试减少输入内容长度',
                        '若持续超时，请检查模型服务状态',
                    ],
                }
            case ApiErrorType.RATE_LIMIT_EXCEEDED:
                return {
                    type: ApiErrorType.RATE_LIMIT_EXCEEDED,
                    title: '请求过于频繁',
                    description: '已达到 API 请求频率限制或配额已耗尽，服务暂时拒绝了您的请求。',
                    suggestions: [
                        '等待限流窗口重置后再试（每 IP 每小时 12 次）',
                        '检查 API 账户配额是否已用尽',
                    ],
                }
            case ApiErrorType.INVALID_API_KEY:
                return {
                    type: ApiErrorType.INVALID_API_KEY,
                    title: 'API 密钥无效',
                    description:
                        'AI 服务拒绝了请求，API 密钥可能无效、已过期或缺少访问权限。',
                    suggestions: [
                        '检查 .env.local 中的 API Key 是否正确',
                        '确认 API Key 尚未过期',
                        '联系服务提供商确认账户权限',
                    ],
                }
            case ApiErrorType.INVALID_REQUEST:
                return {
                    type: ApiErrorType.INVALID_REQUEST,
                    title: '请求参数无效',
                    description:
                        err.message || 'AI 服务无法处理本次请求，输入内容或请求参数存在问题。',
                    suggestions: [
                        '检查岗位描述与简历内容是否符合要求',
                        '尝试调整或精简输入内容后重试',
                    ],
                }
            case ApiErrorType.INTERNAL_ERROR:
            default:
                return {
                    type: ApiErrorType.INTERNAL_ERROR,
                    title: 'AI 服务异常',
                    description: err.message || 'AI 服务内部出现错误，请稍后重试。',
                    suggestions: ['请稍后重试', '若问题持续，请联系开发者排查'],
                }
        }
    }

    return {
        type: 'UNKNOWN',
        title: '操作失败',
        description: err instanceof Error ? err.message : '发生未知错误，请稍后重试。',
        suggestions: ['请稍后重试'],
    }
}
