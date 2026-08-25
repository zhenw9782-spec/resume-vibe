/**
 * 缺失关键词分析模块
 * 实现 implementation-plan.md 步骤 4.5：列出 JD 要求但简历中未提及的关键技能
 *
 * 功能：
 * 1. 分类缺失关键词（硬技能/软技能/学历/经验/其他）
 * 2. 按重要性排序（基于领域词权重和出现频率）
 * 3. 检查同义词/相关技能（简历中可能有类似表达）
 * 4. 生成针对性的补充建议
 */

import { extractKeywords, KeywordExtractionResult } from './keyword-extractor'

/**
 * 关键词分类
 */
export type KeywordCategory =
    | 'hard_skill'    // 硬技能（编程语言、框架、工具）
    | 'soft_skill'    // 软技能（沟通、团队协作）
    | 'education'     // 学历要求
    | 'experience'    // 经验要求
    | 'domain'        // 领域知识
    | 'other'         // 其他

/**
 * 关键词重要性等级
 */
export type KeywordImportance = 'critical' | 'important' | 'nice_to_have'

/**
 * 单个缺失关键词的分析结果
 */
export interface MissingKeywordItem {
    /**
     * 关键词原文
     */
    keyword: string

    /**
     * 关键词分类
     */
    category: KeywordCategory

    /**
     * 重要性等级
     */
    importance: KeywordImportance

    /**
     * 在 JD 中的出现频率（用于判断重要性）
     */
    frequency: number

    /**
     * 相关的同义词/近义词（简历中可能存在的替代表达）
     */
    relatedTerms: string[]

    /**
     * 简历中是否已有相关表达
     */
    hasAlternativeInResume: boolean

    /**
     * 补充建议
     */
    suggestion: string
}

/**
 * 缺失关键词分析结果
 */
export interface MissingKeywordAnalysisResult {
    /**
     * 缺失关键词总数
     */
    totalCount: number

    /**
     * 按分类分组的缺失关键词
     */
    byCategory: Record<KeywordCategory, MissingKeywordItem[]>

    /**
     * 按重要性排序的缺失关键词
     */
    byImportance: {
        critical: MissingKeywordItem[]
        important: MissingKeywordItem[]
        nice_to_have: MissingKeywordItem[]
    }

    /**
     * 缺失关键词覆盖率（JD 要求但简历未覆盖的比例）
     */
    coverageRate: number

    /**
     * 关键词匹配率
     */
    matchRate: number

    /**
     * 综合建议列表
     */
    suggestions: string[]
}

/**
 * 硬技能相关词典（用于分类）
 */
const HARD_SKILL_TERMS: Set<string> = new Set([
    // 编程语言
    'javascript', 'typescript', 'python', 'java', 'c', 'c++', 'c#', 'go', 'golang', 'rust',
    'php', 'ruby', 'swift', 'kotlin', 'scala', 'dart', 'shell', 'sql',
    // 前端框架
    'react', 'vue', 'vuejs', 'angular', 'nextjs', 'nuxt', 'svelte', 'jquery',
    'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap',
    // 后端框架
    'django', 'flask', 'fastapi', 'spring', 'springboot', 'express', 'laravel', 'gin',
    // 数据库
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sqlite',
    // 中间件/消息队列
    'kafka', 'rabbitmq', 'zookeeper',
    // 大数据/ML
    'spark', 'hadoop', 'flink', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
    // DevOps/云
    'docker', 'kubernetes', 'k8s', 'jenkins', 'git', 'github', 'gitlab',
    'aws', 'azure', 'gcp', 'aliyun', 'nginx', 'linux',
    // 构建工具
    'webpack', 'vite', 'rollup', 'babel',
    // 测试
    'jest', 'mocha', 'cypress', 'selenium',
    // 其他技术
    'graphql', 'grpc', 'rest', 'websocket', 'oauth', 'jwt',
    // 中文技术词
    '前端', '后端', '全栈', '移动端', '数据分析', '机器学习', '深度学习',
    '人工智能', '大数据', '云计算', '云原生', '容器化', '微服务',
])

/**
 * 软技能词典
 */
const SOFT_SKILL_TERMS: Set<string> = new Set([
    '团队协作', '团队合作', '沟通协调', '沟通能力', '表达能力', '组织协调',
    '时间管理', '问题解决', '逻辑思维', '学习能力', '抗压能力',
    'team collaboration', 'communication skills', 'problem solving',
    'leadership', 'time management', 'critical thinking',
])

/**
 * 学历相关词典
 */
const EDUCATION_TERMS: Set<string> = new Set([
    '本科', '硕士', '博士', '大专', '专科学历', '本科学历', '硕士学历', '博士学历',
    'bachelor', 'master', 'degree', 'education',
])

/**
 * 同义词映射表
 * 用于检查简历中是否有相关替代表达
 */
const SYNONYM_MAP: Record<string, string[]> = {
    // 前端
    'react': ['reactjs', 'react.js', 'react native'],
    'vue': ['vuejs', 'vue.js', 'nuxt', 'nuxtjs'],
    'angular': ['angularjs', 'angular.js'],
    'typescript': ['ts'],
    'javascript': ['js', 'es6', 'es2015'],
    'html': ['html5'],
    'css': ['css3', 'sass', 'less', 'scss'],
    'tailwind': ['tailwindcss', 'tailwind css'],
    // 后端
    'python': ['py'],
    'java': ['spring', 'springboot', 'spring boot'],
    'node': ['nodejs', 'node.js', 'express'],
    'go': ['golang'],
    'c#': ['csharp', '.net', 'dotnet'],
    // 数据库
    'mysql': ['sql'],
    'postgresql': ['postgres', 'pg'],
    'mongodb': ['mongo'],
    // 云/DevOps
    'docker': ['container', '容器'],
    'kubernetes': ['k8s'],
    'aws': ['amazon web services'],
    'azure': ['microsoft azure'],
    'gcp': ['google cloud', 'google cloud platform'],
    'git': ['github', 'gitlab', 'version control', '版本控制'],
    // 其他
    '机器学习': ['ml', 'machine learning', '深度学习', 'deep learning'],
    '数据分析': ['data analysis', '数据挖掘', 'data mining'],
    '微服务': ['microservices', 'microservices architecture'],
    // 中文同义词
    '前端开发': ['前端', 'web开发', 'web前端', 'frontend'],
    '后端开发': ['后端', '服务端', 'backend'],
    '全栈开发': ['全栈', 'fullstack', 'full stack'],
    '团队协作': ['团队合作', 'teamwork', 'team collaboration'],
    '沟通能力': ['沟通协调', 'communication skills'],
}

/**
 * 分析缺失关键词
 * @param jobDescriptionKeywords JD 提取的关键词结果
 * @param resumeKeywords 简历提取的关键词结果
 * @returns 缺失关键词分析结果
 */
export function analyzeMissingKeywords(
    jobDescriptionKeywords: KeywordExtractionResult,
    resumeKeywords: KeywordExtractionResult
): MissingKeywordAnalysisResult {
    const jobKeywords = jobDescriptionKeywords.keywords
    const jobFrequency = jobDescriptionKeywords.frequency
    const resumeKeywordsList = resumeKeywords.keywords
    const resumeFrequency = resumeKeywords.frequency

    // 1. 找出缺失的关键词
    const missingItems: MissingKeywordItem[] = []

    for (const keyword of jobKeywords) {
        // 检查简历中是否直接包含该关键词
        const isInResume = resumeKeywordsList.includes(keyword)

        if (!isInResume) {
            // 检查是否有同义词在简历中
            const relatedTerms = getRelatedTerms(keyword)
            const hasAlternative = relatedTerms.some(term =>
                resumeKeywordsList.some(rk =>
                    rk.toLowerCase().includes(term.toLowerCase()) ||
                    term.toLowerCase().includes(rk.toLowerCase())
                )
            )

            const item: MissingKeywordItem = {
                keyword,
                category: categorizeKeyword(keyword),
                importance: determineImportance(keyword, jobFrequency[keyword] || 0),
                frequency: jobFrequency[keyword] || 0,
                relatedTerms,
                hasAlternativeInResume: hasAlternative,
                suggestion: generateSuggestion(keyword, hasAlternative),
            }

            missingItems.push(item)
        }
    }

    // 2. 按分类分组
    const byCategory: Record<KeywordCategory, MissingKeywordItem[]> = {
        hard_skill: [],
        soft_skill: [],
        education: [],
        experience: [],
        domain: [],
        other: [],
    }

    for (const item of missingItems) {
        byCategory[item.category].push(item)
    }

    // 3. 按重要性分组
    const byImportance = {
        critical: missingItems.filter(i => i.importance === 'critical'),
        important: missingItems.filter(i => i.importance === 'important'),
        nice_to_have: missingItems.filter(i => i.importance === 'nice_to_have'),
    }

    // 4. 计算覆盖率和匹配率
    const totalJobKeywords = jobKeywords.length
    const matchedCount = totalJobKeywords - missingItems.length
    const coverageRate = totalJobKeywords > 0 ? matchedCount / totalJobKeywords : 0
    const matchRate = coverageRate

    // 5. 生成综合建议
    const suggestions = generateComprehensiveSuggestions(byCategory, byImportance, coverageRate)

    return {
        totalCount: missingItems.length,
        byCategory,
        byImportance,
        coverageRate,
        matchRate,
        suggestions,
    }
}

/**
 * 分类关键词
 * @param keyword 关键词
 * @returns 分类
 */
function categorizeKeyword(keyword: string): KeywordCategory {
    const lower = keyword.toLowerCase()

    if (HARD_SKILL_TERMS.has(lower) || HARD_SKILL_TERMS.has(keyword)) {
        return 'hard_skill'
    }

    if (SOFT_SKILL_TERMS.has(keyword) || SOFT_SKILL_TERMS.has(lower)) {
        return 'soft_skill'
    }

    if (EDUCATION_TERMS.has(keyword) || EDUCATION_TERMS.has(lower)) {
        return 'education'
    }

    // 包含"经验"、"年"等词的可能是经验要求
    if (/经验|年|years|experience/i.test(keyword)) {
        return 'experience'
    }

    // 包含行业/领域相关词
    if (/行业|领域|金融|医疗|电商|教育/i.test(keyword)) {
        return 'domain'
    }

    return 'other'
}

/**
 * 判断关键词重要性
 * @param keyword 关键词
 * @param frequency 在 JD 中的出现频率
 * @returns 重要性等级
 */
function determineImportance(keyword: string, frequency: number): KeywordImportance {
    // 高频出现的关键词更重要
    if (frequency >= 3) {
        return 'critical'
    }

    if (frequency >= 2) {
        return 'important'
    }

    // 硬技能通常更重要
    const lower = keyword.toLowerCase()
    if (HARD_SKILL_TERMS.has(lower) || HARD_SKILL_TERMS.has(keyword)) {
        return 'important'
    }

    return 'nice_to_have'
}

/**
 * 获取相关同义词
 * @param keyword 关键词
 * @returns 相关词列表
 */
function getRelatedTerms(keyword: string): string[] {
    const lower = keyword.toLowerCase()

    // 直接查找
    if (SYNONYM_MAP[lower]) {
        return SYNONYM_MAP[lower]
    }

    // 反向查找（关键词作为值）
    const related: string[] = []
    for (const [key, values] of Object.entries(SYNONYM_MAP)) {
        if (values.some(v => v.toLowerCase() === lower)) {
            related.push(key)
            related.push(...values.filter(v => v.toLowerCase() !== lower))
        }
    }

    return related
}

/**
 * 为单个缺失关键词生成建议
 * @param keyword 关键词
 * @param hasAlternative 是否有替代表达
 * @returns 建议文本
 */
function generateSuggestion(keyword: string, hasAlternative: boolean): string {
    if (hasAlternative) {
        return `简历中有相关表达，建议使用更标准的术语 "${keyword}"`
    }

    const category = categorizeKeyword(keyword)
    switch (category) {
        case 'hard_skill':
            return `建议在简历中添加对 ${keyword} 的具体使用经验描述`
        case 'soft_skill':
            return `建议在简历中补充 ${keyword} 相关的具体案例或成果`
        case 'education':
            return `学历要求：${keyword}`
        case 'experience':
            return `建议补充相关工作经验描述`
        default:
            return `建议在简历中提及 ${keyword} 相关内容`
    }
}

/**
 * 生成综合建议
 * @param byCategory 按分类分组
 * @param byImportance 按重要性分组
 * @param coverageRate 覆盖率
 * @returns 建议列表
 */
function generateComprehensiveSuggestions(
    byCategory: Record<KeywordCategory, MissingKeywordItem[]>,
    byImportance: { critical: MissingKeywordItem[]; important: MissingKeywordItem[]; nice_to_have: MissingKeywordItem[] },
    coverageRate: number
): string[] {
    const suggestions: string[] = []

    // 1. 关键缺失技能建议
    if (byImportance.critical.length > 0) {
        const criticalSkills = byImportance.critical
            .filter(i => i.category === 'hard_skill')
            .map(i => i.keyword)
        if (criticalSkills.length > 0) {
            suggestions.push(`⚠️ 关键缺失：简历中缺少岗位要求的核心技能 ${criticalSkills.join('、')}，建议优先补充`)
        }
    }

    // 2. 硬技能缺失建议
    if (byCategory.hard_skill.length > 0) {
        const hardSkills = byCategory.hard_skill.slice(0, 5).map(i => i.keyword)
        suggestions.push(`建议在简历中添加以下技术技能的经验：${hardSkills.join('、')}`)
    }

    // 3. 软技能缺失建议
    if (byCategory.soft_skill.length > 0) {
        const softSkills = byCategory.soft_skill.slice(0, 3).map(i => i.keyword)
        suggestions.push(`建议在简历中补充软技能描述：${softSkills.join('、')}`)
    }

    // 4. 有替代表达的关键词
    const hasAlternative = byCategory.hard_skill.filter(i => i.hasAlternativeInResume)
    if (hasAlternative.length > 0) {
        const keywords = hasAlternative.slice(0, 3).map(i => i.keyword)
        suggestions.push(`简历中有相关表达，建议使用更标准的术语：${keywords.join('、')}`)
    }

    // 5. 整体覆盖率建议
    if (coverageRate < 0.5) {
        suggestions.push('简历与岗位要求匹配度较低，建议重新审视岗位要求并针对性地补充简历内容')
    } else if (coverageRate < 0.7) {
        suggestions.push('简历与岗位要求有较好的匹配度，继续补充缺失关键词可进一步提升')
    } else {
        suggestions.push('简历与岗位要求匹配度较高，继续保持')
    }

    return suggestions.slice(0, 5)
}
