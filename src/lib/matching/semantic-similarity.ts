/**
 * 语义相似度计算模块
 *
 * 实现步骤 4.4：使用 Embeddings 将岗位描述（JD）与简历文本转换为向量，计算余弦相似度，
 * 从而获得"真正的语义匹配"（能够识别同义词与不同表达，例如"前端开发" vs "Web 开发"）。
 *
 * 设计要点：
 * 1. 远程 Embeddings API（智谱 GLM embedding-3 / 任意 OpenAI 兼容服务）生成文本向量；
 * 2. 内置 LRU 内存缓存，相同文本只调用一次 API，控制成本；
 * 3. API 不可用时自动降级为本地词频向量（词袋）余弦相似度，保证算法不中断；
 * 4. 句子对匹配统计使用本地关键词 Jaccard 计算，不额外消耗 API 调用。
 *
 * 环境变量（与 openai.ts 共用，均为 NEXT_PUBLIC_ 前缀，兼容浏览器端测试）：
 * - NEXT_PUBLIC_OPENAI_API_KEY: 服务 API Key（缺省时读取 OPENAI_API_KEY）
 * - NEXT_PUBLIC_OPENAI_BASE_URL: Embeddings 服务地址（缺省时读取 OPENAI_BASE_URL）
 * - NEXT_PUBLIC_EMBEDDING_MODEL_NAME: Embedding 模型名（默认 embedding-3）
 */

import OpenAI from 'openai'
import { extractKeywords } from './keyword-extractor'

/**
 * 语义相似度计算结果（算法模块与测试页面共用）
 */
export interface SemanticSimilarityDetail {
    /**
     * 余弦相似度（0-1）
     */
    cosineSimilarity: number

    /**
     * 相似度等级
     */
    similarityLevel: 'low' | 'medium' | 'high'

    /**
     * 匹配的句子对数量（本地统计，用于辅助展示）
     */
    matchedSentencePairs: number

    /**
     * 不匹配的句子对数量
     */
    unmatchedSentencePairs: number

    /**
     * 计算方式：embedding = 远程语义向量；local = 本地词频向量降级
     */
    method: 'embedding' | 'local'

    /**
     * 向量维度（embedding 模式为 API 返回维度，local 模式为词表大小）
     */
    dimension: number

    /**
     * 使用的模型名
     */
    model: string

    /**
     * 计算耗时（毫秒）
     */
    elapsedMs: number

    /**
     * 错误信息（仅降级模式且 API 调用失败时存在）
     */
    error?: string
}

/**
 * Embedding 模型名（默认智谱 embedding-3，可通过环境变量覆盖）
 */
const DEFAULT_EMBEDDING_MODEL =
    process.env.NEXT_PUBLIC_EMBEDDING_MODEL_NAME || 'embedding-3'

/**
 * 单条文本最大长度（超出部分截断，避免触发服务端长度限制）
 */
const MAX_TEXT_CHARS = 8000

/**
 * Embedding 缓存最大条目数（LRU）
 */
const EMBEDDING_CACHE_MAX = 200

/**
 * 相似度阈值：句子对相似度 > 该值视为"匹配"
 */
const MATCH_PAIR_THRESHOLD = 0.5

/**
 * Embedding 内存缓存（key = 原文，value = 向量）
 * 用于减少重复 API 调用，控制成本
 */
const embeddingCache = new Map<string, number[]>()

/**
 * 余弦相似度阈值表：高（≥0.7）/ 中（0.4-0.69）/ 低（<0.4）
 */
const SIMILARITY_HIGH_THRESHOLD = 0.7
const SIMILARITY_MEDIUM_THRESHOLD = 0.4

/**
 * 获取 Embeddings API 客户端
 * 支持独立的 embedding baseURL（优先使用 NEXT_PUBLIC_EMBEDDING_BASE_URL）
 */
function getEmbeddingClient(): OpenAI {
    const apiKey =
        process.env.NEXT_PUBLIC_OPENAI_API_KEY ||
        process.env.OPENAI_API_KEY ||
        'empty-key'

    // 优先使用独立的 embedding baseURL，这样可以和文本模型分开配置
    // 例如：文本模型用智谱，embedding 用本地 Ollama
    const baseURL =
        process.env.NEXT_PUBLIC_EMBEDDING_BASE_URL ||
        process.env.NEXT_PUBLIC_OPENAI_BASE_URL ||
        process.env.OPENAI_BASE_URL ||
        'http://localhost:11434/v1'

    return new OpenAI({
        apiKey,
        baseURL,
        dangerouslyAllowBrowser: true,
    })
}

/**
 * 计算两个向量的余弦相似度
 * @param vectorA 向量 A
 * @param vectorB 向量 B
 * @returns 余弦相似度（0-1），任一向量为零向量时返回 0
 */
export function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (!Array.isArray(vectorA) || !Array.isArray(vectorB)) {
        return 0
    }
    if (vectorA.length === 0 || vectorB.length === 0) {
        return 0
    }
    if (vectorA.length !== vectorB.length) {
        // 维度不一致时无法计算余弦，视为无相似
        return 0
    }

    let dot = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < vectorA.length; i++) {
        const a = vectorA[i] || 0
        const b = vectorB[i] || 0
        dot += a * b
        normA += a * a
        normB += b * b
    }

    if (normA === 0 || normB === 0) {
        return 0
    }

    return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * 获取文本的 Embedding 向量（带 LRU 缓存）
 * @param text 输入文本
 * @returns 向量数组
 */
async function getEmbedding(text: string): Promise<number[]> {
    const cacheKey = text

    // 命中缓存
    const cached = embeddingCache.get(cacheKey)
    if (cached) {
        // LRU：删除后重新插入，置为最新
        embeddingCache.delete(cacheKey)
        embeddingCache.set(cacheKey, cached)
        return cached
    }

    const client = getEmbeddingClient()
    const input = text.length > MAX_TEXT_CHARS ? text.slice(0, MAX_TEXT_CHARS) : text

    const response = await client.embeddings.create({
        model: DEFAULT_EMBEDDING_MODEL,
        input,
    })

    const embedding = response.data?.[0]?.embedding

    if (!Array.isArray(embedding) || embedding.length === 0) {
        throw new Error('Embedding API 返回空向量')
    }

    // 写入缓存（LRU 淘汰最旧条目）
    embeddingCache.set(cacheKey, embedding)
    if (embeddingCache.size > EMBEDDING_CACHE_MAX) {
        const oldestKey = embeddingCache.keys().next().value
        if (oldestKey !== undefined) {
            embeddingCache.delete(oldestKey)
        }
    }

    return embedding
}

/**
 * 构建本地词频向量（降级方案）
 * 基于 keyword-extractor 的词频统计，词表为两段文本的并集
 * @param frequency 词频统计
 * @param vocab 词表（并集，需按固定顺序）
 * @returns 归一化向量
 */
function buildLocalVector(
    frequency: Record<string, number>,
    vocab: string[]
): number[] {
    const vector = vocab.map(word => frequency[word] || 0)
    // L2 归一化
    let norm = 0
    for (const value of vector) {
        norm += value * value
    }
    if (norm === 0) {
        return vector
    }
    const sqrtNorm = Math.sqrt(norm)
    return vector.map(value => value / sqrtNorm)
}

/**
 * 计算句子级的匹配/不匹配对统计
 * 使用本地关键词 Jaccard 相似度，不消耗 Embedding API 调用
 * @param jdText 岗位描述
 * @param resumeText 简历文本
 * @returns 匹配与不匹配的句子对数量
 */
function calculateSentencePairStats(
    jdText: string,
    resumeText: string
): { matchedSentencePairs: number; unmatchedSentencePairs: number } {
    const jdSentences = splitIntoSentences(jdText)
    const resumeSentences = splitIntoSentences(resumeText)

    if (jdSentences.length === 0 || resumeSentences.length === 0) {
        return { matchedSentencePairs: 0, unmatchedSentencePairs: 0 }
    }

    // 计算所有句子对的 Jaccard 相似度
    const pairs: Array<{ similarity: number }> = []
    for (const jdSentence of jdSentences) {
        for (const resumeSentence of resumeSentences) {
            pairs.push({
                similarity: calculateSentenceSimilarity(jdSentence, resumeSentence),
            })
        }
    }

    // 取前 10 个最高分
    pairs.sort((a, b) => b.similarity - a.similarity)
    const topPairs = pairs.slice(0, 10)

    const matchedSentencePairs = topPairs.filter(
        pair => pair.similarity > MATCH_PAIR_THRESHOLD
    ).length
    const unmatchedSentencePairs = topPairs.length - matchedSentencePairs

    return { matchedSentencePairs, unmatchedSentencePairs }
}

/**
 * 将文本拆分为句子
 * @param text 输入文本
 * @returns 句子列表
 */
function splitIntoSentences(text: string): string[] {
    if (!text) {
        return []
    }
    return text
        .split(/[。！？!?；;]+/)
        .map(sentence => sentence.trim())
        .filter(sentence => sentence.length > 0)
}

/**
 * 计算两个句子的相似度（关键词 Jaccard）
 * @param sentence1 句子 1
 * @param sentence2 句子 2
 * @returns 相似度（0-1）
 */
function calculateSentenceSimilarity(sentence1: string, sentence2: string): number {
    const keywords1 = extractKeywords(sentence1, { maxKeywords: 30 }).keywords
    const keywords2 = extractKeywords(sentence2, { maxKeywords: 30 }).keywords

    const set1 = new Set(keywords1)
    const set2 = new Set(keywords2)

    let intersection = 0
    for (const word of set1) {
        if (set2.has(word)) {
            intersection++
        }
    }

    const union = new Set<string>([...set1, ...set2])
    if (union.size === 0) {
        return 0
    }

    return intersection / union.size
}

/**
 * 根据余弦相似度确定相似度等级
 * @param score 余弦相似度（0-1）
 * @returns 相似度等级
 */
function getSimilarityLevel(score: number): 'low' | 'medium' | 'high' {
    if (score >= SIMILARITY_HIGH_THRESHOLD) {
        return 'high'
    }
    if (score >= SIMILARITY_MEDIUM_THRESHOLD) {
        return 'medium'
    }
    return 'low'
}

/**
 * 计算语义相似度（本地降级方案，同步）
 * 使用本地词频向量 + 余弦相似度，不依赖网络 / API
 * @param jdText 岗位描述文本
 * @param resumeText 简历文本
 * @returns 语义相似度结果
 */
export function calculateSemanticSimilarityLocal(
    jdText: string,
    resumeText: string
): SemanticSimilarityDetail {
    const startedAt = Date.now()

    const jdResult = extractKeywords(jdText, { maxKeywords: 50, minFrequency: 1 })
    const resumeResult = extractKeywords(resumeText, {
        maxKeywords: 50,
        minFrequency: 1,
    })

    // 词表并集（固定顺序）
    const vocab = Array.from(
        new Set([...Object.keys(jdResult.frequency), ...Object.keys(resumeResult.frequency)])
    )

    const vectorA = buildLocalVector(jdResult.frequency, vocab)
    const vectorB = buildLocalVector(resumeResult.frequency, vocab)
    const cosine = cosineSimilarity(vectorA, vectorB)

    const pairStats = calculateSentencePairStats(jdText, resumeText)

    return {
        cosineSimilarity: cosine,
        similarityLevel: getSimilarityLevel(cosine),
        matchedSentencePairs: pairStats.matchedSentencePairs,
        unmatchedSentencePairs: pairStats.unmatchedSentencePairs,
        method: 'local',
        dimension: vocab.length,
        model: 'local-bow',
        elapsedMs: Date.now() - startedAt,
    }
}

/**
 * 从 Embedding API 错误中提取可读的错误信息
 * 兼容 OpenAI SDK 的 APIConnectionError / APIError 等类型
 * @param error 原始错误
 * @returns 可读的错误描述
 */
function extractErrorMessage(error: unknown): string {
    if (error && typeof error === 'object') {
        const err = error as {
            message?: string
            status?: number
            error?: { message?: string }
            cause?: unknown
        }

        // OpenAI SDK APIError：优先读取响应体中的错误信息
        const bodyMessage = err.error?.message
        if (bodyMessage) {
            return `${bodyMessage}${err.status ? ` (HTTP ${err.status})` : ''}`
        }

        if (err.message) {
            return `${err.message}${err.status ? ` (HTTP ${err.status})` : ''}`
        }
    }
    return error instanceof Error ? error.message : String(error)
}

/**
 * 计算语义相似度（Embeddings 方案，异步）
 * 优先使用远程 Embeddings API 生成语义向量并计算余弦相似度；
 * 若 API 调用失败（网络 / 配置 / 限流等），自动降级为本地词频向量方案。
 * @param jdText 岗位描述文本
 * @param resumeText 简历文本
 * @returns 语义相似度结果
 */
export async function calculateSemanticSimilarity(
    jdText: string,
    resumeText: string
): Promise<SemanticSimilarityDetail> {
    const startedAt = Date.now()

    try {
        // 并发获取两段文本的 Embedding
        const [embeddingA, embeddingB] = await Promise.all([
            getEmbedding(jdText),
            getEmbedding(resumeText),
        ])

        const cosine = cosineSimilarity(embeddingA, embeddingB)
        const pairStats = calculateSentencePairStats(jdText, resumeText)

        return {
            cosineSimilarity: cosine,
            similarityLevel: getSimilarityLevel(cosine),
            matchedSentencePairs: pairStats.matchedSentencePairs,
            unmatchedSentencePairs: pairStats.unmatchedSentencePairs,
            method: 'embedding',
            dimension: embeddingA.length,
            model: DEFAULT_EMBEDDING_MODEL,
            elapsedMs: Date.now() - startedAt,
        }
    } catch (error) {
        // 降级为本地方案，保证功能不中断
        const fallback = calculateSemanticSimilarityLocal(jdText, resumeText)
        fallback.error = extractErrorMessage(error)
        fallback.elapsedMs = Date.now() - startedAt
        return fallback
    }
}
