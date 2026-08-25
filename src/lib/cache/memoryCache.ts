/**
 * 内存缓存模块
 * 作为 Redis 缓存之上的快速缓存层，避免每次请求都跨网络访问 Upstash（REST 往返 200ms+）
 * 仅限单实例部署；TTL 与 Redis 保持一致（300s）
 */

import type { AnalysisResponse } from '../../types'

interface MemoryCacheEntry {
    data: AnalysisResponse
    expiresAt: number
}

// 缓存过期时间（秒）：5 分钟，与 Redis TTL 保持一致
const CACHE_TTL_SECONDS = 300

// 内存 Map：key → { data, expiresAt }
const cache = new Map<string, MemoryCacheEntry>()

/**
 * 从内存缓存读取分析结果
 * @param key 缓存键（由 computeCacheKey 生成）
 * @returns 命中返回结果；未命中返回 null
 */
export function getCachedAnalysisMemory(key: string): AnalysisResponse | null {
    const entry = cache.get(key)
    if (!entry) return null
    if (entry.expiresAt <= Date.now()) {
        cache.delete(key)
        return null
    }
    return entry.data
}

/**
 * 将分析结果写入内存缓存
 */
export function setCachedAnalysisMemory(key: string, data: AnalysisResponse): void {
    cache.set(key, {
        data,
        expiresAt: Date.now() + CACHE_TTL_SECONDS * 1000,
    })
}
