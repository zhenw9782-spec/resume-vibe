/**
 * AI 分析后端 API 路由
 * 统一处理：IP 限流 → SHA-256 缓存查询 → AI 调用 → 结果缓存
 * 将 AI 调用从浏览器端迁移到服务端，避免 API Key 暴露
 */

import { NextRequest, NextResponse } from 'next/server'

import { createOpenAIClient } from '@/src/lib/ai/openai'
import { checkRateLimit } from '@/src/lib/rate-limit/rateLimiter'
import { computeCacheKey, getCachedAnalysis, setCachedAnalysis } from '@/src/lib/cache/analysisCache'
import { getCachedAnalysisMemory, setCachedAnalysisMemory } from '@/src/lib/cache/memoryCache'
import { getErrorDisplay } from '@/src/lib/errors/errorHandling'
import type { AnalysisResponse } from '@/src/types'

/**
 * 获取客户端真实 IP（兼容本地开发与常见反代）
 */
function getClientIp(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for')
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }
    const realIp = req.headers.get('x-real-ip')
    if (realIp) {
        return realIp.trim()
    }
    return req.ip || '127.0.0.1'
}

/**
 * 校验请求体
 */
function validateInput(body: unknown): { jobDescription?: string; resumeText?: string; error?: string } {
    if (!body || typeof body !== 'object') {
        return { error: '请求体无效' }
    }
    const { jobDescription, resumeText } = body as { jobDescription?: string; resumeText?: string }

    if (!jobDescription || !jobDescription.trim()) {
        return { error: '请先填写岗位描述' }
    }
    if (!resumeText || !resumeText.trim()) {
        return { error: '请先填写简历内容' }
    }
    if (jobDescription.trim().length < 10) {
        return { error: '岗位描述至少需要10个字符' }
    }
    if (resumeText.trim().length < 20) {
        return { error: '简历内容至少需要20个字符' }
    }
    return { jobDescription: jobDescription.trim(), resumeText: resumeText.trim() }
}

export async function POST(req: NextRequest) {
    const startTime = Date.now()

    // 1. 解析与校验
    let body: unknown
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: '请求体不是有效的 JSON' }, { status: 400 })
    }
    const validation = validateInput(body)
    if (validation.error || !validation.jobDescription || !validation.resumeText) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    const { jobDescription, resumeText } = validation

    // 3. 计算缓存键，先查内存缓存（毫秒级返回，避免跨网络 Redis 往返）
    const cacheKey = computeCacheKey(jobDescription, resumeText)
    const cachedMemory = getCachedAnalysisMemory(cacheKey)
    if (cachedMemory) {
        return NextResponse.json({
            ...cachedMemory,
            fromCache: true,
            processingTime: Date.now() - startTime,
        })
    }

    // 4. IP 限流（12 次/小时）
    const ip = getClientIp(req)
    const rateLimit = await checkRateLimit(ip)
    if (!rateLimit.success) {
        return NextResponse.json(
            {
                error: '请求过于频繁，已超过每小时 12 次的限制，请稍后再试',
                errorType: 'RATE_LIMIT_EXCEEDED',
                rateLimit: {
                    remaining: rateLimit.remaining,
                    reset: rateLimit.reset,
                    window: rateLimit.window,
                },
            },
            { status: 429 }
        )
    }

    // 5. 未命中内存缓存，查询 Redis 缓存
    const cached = await getCachedAnalysis(cacheKey)
    if (cached) {
        setCachedAnalysisMemory(cacheKey, cached)
        return NextResponse.json({
            ...cached,
            fromCache: true,
            processingTime: Date.now() - startTime,
        })
    }

    // 6. Redis 也未命中，调用 AI（分析 + 改写并行）
    const client = createOpenAIClient()
    try {
        const [result, rewriteResult] = await Promise.all([
            client.analyzeResumeMatch(jobDescription, resumeText),
            client.optimizeResume(jobDescription, resumeText),
        ])

        const response: AnalysisResponse = {
            result,
            rewriteResult,
            processingTime: Date.now() - startTime,
            fromCache: false,
        }

        // 7. 写入缓存（内存 + Redis，TTL 300s）
        setCachedAnalysisMemory(cacheKey, response)
        await setCachedAnalysis(cacheKey, response)

        return NextResponse.json(response)
    } catch (err) {
        const display = getErrorDisplay(err)
        return NextResponse.json(
            {
                error: display.description,
                errorType: display.type,
            },
            { status: 502 }
        )
    }
}
