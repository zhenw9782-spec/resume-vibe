/**
 * 匹配算法
 * 实现简历与岗位描述的匹配度计算
 *
 * 评分公式（DESIGN.md 2.3）：
 *   总分 = 关键词匹配分 × 0.6 + 语义相似度分 × 0.4
 *   总分范围：0-100，四舍五入到整数
 *
 * 语义相似度（步骤 4.4）：
 *   - calculateMatchAsync 使用 Embeddings 语义向量计算余弦相似度（真正的语义匹配）
 *   - calculateMatch（同步）使用本地词频向量计算，用于离线/快速测试
 */

import { JobDescription, Resume } from '../../types'
import { extractKeywords } from './keyword-extractor'
import {
    calculateSemanticSimilarity,
    calculateSemanticSimilarityLocal,
    SemanticSimilarityDetail,
} from './semantic-similarity'

/**
 * 匹配度结果
 */
export interface MatchResult {
    /**
     * 匹配度分数（0-100）
     */
    score: number

    /**
     * 匹配度等级
     */
    level: 'low' | 'medium' | 'high'

    /**
     * 关键词匹配详情
     */
    keywordMatch: KeywordMatchResult

    /**
     * 语义相似度详情
     */
    semanticSimilarity: SemanticSimilarityDetail

    /**
     * 缺失关键词列表
     */
    missingKeywords: string[]

    /**
     * 优势关键词列表
     */
    strongKeywords: string[]

    /**
     * 改进建议
     */
    suggestions: string[]
}

/**
 * 关键词匹配结果
 */
export interface KeywordMatchResult {
    /**
     * 匹配的关键词数量
     */
    matchedCount: number

    /**
     * 总关键词数量
     */
    totalCount: number

    /**
     * 匹配率（百分比）
     */
    matchRate: number

    /**
     * 匹配的关键词列表
     */
    matchedKeywords: string[]

    /**
     * 未匹配的关键词列表
     */
    unmatchedKeywords: string[]
}

/**
 * 计算简历与岗位描述的匹配度（同步，本地语义）
 * 语义相似度使用本地词频向量降级方案，无需调用 API，适合快速验证
 * @param jobDescription 岗位描述
 * @param resume 简历
 * @returns 匹配度结果
 */
export function calculateMatch(
    jobDescription: JobDescription,
    resume: Resume
): MatchResult {
    const semantic = calculateSemanticSimilarityLocal(
        jobDescription.description,
        resume.text
    )
    return buildMatchResult(jobDescription, resume, semantic)
}

/**
 * 计算简历与岗位描述的匹配度（异步，Embeddings 语义）
 * 语义相似度优先使用 Embeddings 向量计算余弦相似度，API 不可用时自动降级为本地方案
 * @param jobDescription 岗位描述
 * @param resume 简历
 * @returns 匹配度结果
 */
export async function calculateMatchAsync(
    jobDescription: JobDescription,
    resume: Resume
): Promise<MatchResult> {
    const semantic = await calculateSemanticSimilarity(
        jobDescription.description,
        resume.text
    )
    return buildMatchResult(jobDescription, resume, semantic)
}

/**
 * 构建匹配度结果
 * 共享逻辑：关键词匹配 + 语义相似度 + 综合评分 + 建议生成
 * @param jobDescription 岗位描述
 * @param resume 简历
 * @param semanticDetail 语义相似度详情
 * @returns 匹配度结果
 */
function buildMatchResult(
    jobDescription: JobDescription,
    resume: Resume,
    semanticDetail: SemanticSimilarityDetail
): MatchResult {
    // 1. 提取岗位描述中的关键词
    const jobKeywords = extractKeywords(jobDescription.description).keywords

    // 2. 提取简历中的关键词
    const resumeKeywords = extractKeywords(resume.text).keywords

    // 3. 计算关键词匹配度（60%权重）
    const keywordMatchResult = calculateKeywordMatch(jobKeywords, resumeKeywords)

    // 4. 综合计算匹配度分数
    const keywordScore = keywordMatchResult.matchRate * 100
    const semanticScore = semanticDetail.cosineSimilarity * 100
    const overallScore = keywordScore * 0.6 + semanticScore * 0.4

    // 5. 确定匹配度等级
    const level = getMatchLevel(overallScore)

    // 6. 生成改进建议
    const suggestions = generateSuggestions(
        keywordMatchResult,
        semanticDetail,
        jobKeywords,
        resumeKeywords
    )

    // 7. 确定缺失关键词和优势关键词
    const missingKeywords = keywordMatchResult.unmatchedKeywords
    const strongKeywords = findStrongKeywords(jobKeywords, resumeKeywords)

    return {
        score: Math.round(overallScore),
        level,
        keywordMatch: keywordMatchResult,
        semanticSimilarity: semanticDetail,
        missingKeywords,
        strongKeywords,
        suggestions,
    }
}

/**
 * 计算关键词匹配度
 * @param jobKeywords 岗位关键词
 * @param resumeKeywords 简历关键词
 * @returns 关键词匹配结果
 */
function calculateKeywordMatch(
    jobKeywords: string[],
    resumeKeywords: string[]
): KeywordMatchResult {
    const matchedKeywords: string[] = []
    const unmatchedKeywords: string[] = []

    // 检查简历中是否包含岗位关键词
    jobKeywords.forEach(keyword => {
        if (resumeKeywords.includes(keyword)) {
            matchedKeywords.push(keyword)
        } else {
            unmatchedKeywords.push(keyword)
        }
    })

    const matchedCount = matchedKeywords.length
    const totalCount = jobKeywords.length
    const matchRate = totalCount > 0 ? matchedCount / totalCount : 0

    return {
        matchedCount,
        totalCount,
        matchRate,
        matchedKeywords,
        unmatchedKeywords,
    }
}

/**
 * 获取匹配度等级
 * @param score 匹配度分数（0-100）
 * @returns 匹配度等级
 */
function getMatchLevel(score: number): 'low' | 'medium' | 'high' {
    if (score >= 75) return 'high'
    if (score >= 50) return 'medium'
    return 'low'
}

/**
 * 生成改进建议
 * @param keywordMatch 关键词匹配结果
 * @param semanticSimilarity 语义相似度结果
 * @param jobKeywords 岗位关键词
 * @param resumeKeywords 简历关键词
 * @returns 改进建议列表
 */
function generateSuggestions(
    keywordMatch: KeywordMatchResult,
    semanticSimilarity: SemanticSimilarityDetail,
    jobKeywords: string[],
    resumeKeywords: string[]
): string[] {
    const suggestions: string[] = []

    // 关键词匹配建议
    if (keywordMatch.matchRate < 0.5) {
        suggestions.push('简历中缺少岗位要求的关键技能，建议补充相关经验描述')
    }

    if (keywordMatch.matchRate > 0.7) {
        suggestions.push('简历与岗位要求高度匹配，请继续完善细节')
    }

    // 语义相似度建议
    if (semanticSimilarity.cosineSimilarity < 0.4) {
        suggestions.push('简历内容与岗位描述的语义相关性较低，建议调整简历重点')
    }

    if (semanticSimilarity.cosineSimilarity >= 0.7) {
        suggestions.push('简历内容与岗位描述高度一致，匹配度良好')
    }

    // 缺失关键词建议
    if (keywordMatch.unmatchedKeywords.length > 0) {
        const topMissing = keywordMatch.unmatchedKeywords.slice(0, 5)
        suggestions.push(`建议在简历中添加以下关键词：${topMissing.join('、')}`)
    }

    // 优势关键词建议
    if (keywordMatch.matchedKeywords.length > 0) {
        const topMatched = keywordMatch.matchedKeywords.slice(0, 5)
        suggestions.push(`简历中已包含以下优势关键词：${topMatched.join('、')}`)
    }

    // 通用建议
    if (suggestions.length === 0) {
        suggestions.push('简历整体表现良好，继续保持')
    }

    // 限制建议数量
    return suggestions.slice(0, 5)
}

/**
 * 找出优势关键词
 * @param jobKeywords 岗位关键词
 * @param resumeKeywords 简历关键词
 * @returns 优势关键词列表
 */
function findStrongKeywords(
    jobKeywords: string[],
    resumeKeywords: string[]
): string[] {
    const strongKeywords: string[] = []

    jobKeywords.forEach(keyword => {
        if (resumeKeywords.includes(keyword)) {
            strongKeywords.push(keyword)
        }
    })

    return strongKeywords.slice(0, 10)
}
