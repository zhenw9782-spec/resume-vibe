/**
 * 分析结果缓存模块
 * 对相同输入进行 SHA-256 哈希计算作为缓存键，使用 Redis 缓存 5 分钟（TTL 300s）
 * 仅在后端使用
 */

import { createHash } from 'crypto'
import { Redis } from '@upstash/redis'

import type { AnalysisResponse } from '../../types'

// 从环境变量读取 Upstash 配置，构建共享 Redis 实例
const redis = Redis.fromEnv()

// 缓存过期时间（秒）：5 分钟
const CACHE_TTL_SECONDS = 300

// 缓存键前缀
const CACHE_PREFIX = 'resumevibe:cache:'

/**
 * 计算输入文本的 SHA-256 哈希作为缓存键
 * @param jobDescription 岗位描述
 * @param resumeText 简历文本
 */
export function computeCacheKey(jobDescription: string, resumeText: string): string {
    const normalizedInput = `${jobDescription.trim()}\u0000${resumeText.trim()}`
    const hash = createHash('sha256').update(normalizedInput).digest('hex')
    return `${CACHE_PREFIX}${hash}`
}

/**
 * 从缓存读取分析结果
 * @param key 缓存键（由 computeCacheKey 生成）
 * @returns 命中返回结果；未命中返回 null
 */
export async function getCachedAnalysis(key: string): Promise<AnalysisResponse | null> {
    try {
        const cached = await redis.get<AnalysisResponse>(key)
        return cached ?? null
    } catch (err) {
        // 缓存不可用时静默降级，不影响正常分析流程
        console.error('[cache] 读取缓存失败:', err instanceof Error ? err.message : err)
        return null
    }
}

/**
 * 将分析结果写入缓存
 * @param key 缓存键（由 computeCacheKey 生成）
 * @param data 分析结果
 */
export async function setCachedAnalysis(key: string, data: AnalysisResponse): Promise<void> {
    try {
        await redis.set(key, data, { ex: CACHE_TTL_SECONDS })
    } catch (err) {
        // 缓存写入失败不阻塞主流程
        console.error('[cache] 写入缓存失败:', err instanceof Error ? err.message : err)
    }
}
