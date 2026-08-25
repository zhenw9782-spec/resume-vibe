/**
 * 限流模块
 * 基于 @upstash/ratelimit 实现 IP 限流（默认 12 次/小时）
 * 仅在后端使用，避免 API Key 暴露与绕过
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// 从环境变量读取 Upstash 配置，构建共享 Redis 实例
const redis = Redis.fromEnv()

// 默认限流配置（可用环境变量覆盖）
const MAX_REQUESTS_PER_HOUR = Number(process.env.MAX_REQUESTS_PER_HOUR || 12)
const RATE_LIMIT_WINDOW = Number(process.env.RATE_LIMIT_WINDOW || 3600)

/**
 * 限流结果
 */
export interface RateLimitResult {
    /**
     * 是否允许本次请求
     */
    success: boolean

    /**
     * 窗口内剩余可用次数
     */
    remaining: number

    /**
     * 重置时间（Unix 毫秒时间戳）
     */
    reset: number

    /**
     * 窗口时长（秒）
     */
    window: number
}

/**
 * IP 限流器（固定窗口：12 次/小时）
 * 使用单一前缀，供全站 IP 限流复用
 */
const ratelimit = new Ratelimit({
    redis,
    prefix: 'resumevibe:ratelimit',
    limiter: Ratelimit.fixedWindow(MAX_REQUESTS_PER_HOUR, `${RATE_LIMIT_WINDOW} s`),
    analytics: false,
})

/**
 * 对指定 IP 进行限流检查
 * 当 Upstash 服务不可用或权限不足时，优雅降级（fail-open），不阻塞核心分析流程
 * @param ip 客户端 IP
 */
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
    try {
        const { success, remaining, reset } = await ratelimit.limit(ip)
        return {
            success,
            remaining,
            reset,
            window: RATE_LIMIT_WINDOW,
        }
    } catch (err) {
        // 限流服务异常时放行，避免整个分析流程不可用
        console.error('[ratelimit] 限流检查失败，本次放行:', err instanceof Error ? err.message : err)
        return {
            success: true,
            remaining: MAX_REQUESTS_PER_HOUR,
            reset: Date.now() + RATE_LIMIT_WINDOW * 1000,
            window: RATE_LIMIT_WINDOW,
        }
    }
}
