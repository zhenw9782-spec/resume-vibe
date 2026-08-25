/**
 * 关键词提取模块
 * 使用改进的 TF-IDF 算法从文本中提取关键词，支持中文和英文
 *
 * 分词策略：
 *  - 中文：领域词典最长匹配 + 双字回退（bigram fallback），避免按单字切分
 *  - 英文：按单词切分，并支持多词短语合并（如 "machine learning"、"full stack"）
 * 评分策略：
 *  - TF（词频）：词在文本中出现的频率
 *  - IDF（逆文档频率）：综合考虑词长、领域词权重与文档内稀有度
 *  - 领域词（技术栈、岗位、软技能）会获得更高权重
 */

import { JobDescription, Resume } from '../../types'

/**
 * 关键词提取结果
 */
export interface KeywordExtractionResult {
    /**
     * 提取的关键词列表
     */
    keywords: string[]

    /**
     * 关键词频率统计
     */
    frequency: Record<string, number>

    /**
     * 提取的关键词数量
     */
    count: number

    /**
     * 总词数
     */
    totalWords: number
}

/**
 * TF-IDF结果
 */
export interface TFIDFResult {
    /**
     * TF-IDF分数
     */
    scores: Record<string, number>

    /**
     * 关键词列表（按TF-IDF分数排序）
     */
    keywords: string[]
}

/**
 * 中文领域词典
 * 覆盖岗位、开发方向、技术栈、产品/项目、软技能等常见简历/岗位关键词
 * 匹配时按词长从长到短进行最长匹配
 */
const ZH_TERMS: string[] = [
    // 岗位与角色
    '前端开发工程师', '后端开发工程师', '全栈开发工程师', '软件开发工程师', '测试开发工程师',
    '机器学习工程师', '数据分析师', '算法工程师', '运维工程师', '测试工程师', '研发工程师',
    '开发工程师', '产品经理', '项目经理', '交互设计师', '架构师',
    // 开发方向
    '前端', '后端', '全栈', '移动端', '桌面端',
    '前端开发', '后端开发', '全栈开发', '移动开发', '数据开发', '自动化测试', '软件测试',
    '性能测试', '单元测试', '测试用例',
    // 技术方向
    '数据分析', '机器学习', '深度学习', '人工智能', '自然语言处理', '计算机视觉', '数据挖掘',
    '大数据', '数据仓库', '云计算', '云原生', '容器化', '微服务', '分布式', '高并发', '高可用',
    '性能优化', '架构设计', '系统设计', '数据库设计', '接口设计', '技术选型', '搜索引擎',
    '消息队列', '网络安全', '信息安全', '数据安全',
    // 产品 / 项目
    '需求分析', '竞品分析', '用户研究', '产品规划', '产品设计', '产品路线图', '用户体验',
    '交互设计', '视觉设计', '原型设计', '商业模式', '敏捷开发', '持续集成', '持续交付',
    '版本控制', '代码审查', '代码规范', '代码质量', '技术文档',
    // 软技能
    '团队协作', '团队合作', '沟通协调', '沟通能力', '表达能力', '组织协调', '时间管理',
    '问题解决', '逻辑思维', '学习能力', '抗压能力',
    // 学历 / 资历
    '本科学历', '硕士学历', '博士学历', '本科', '硕士', '博士', '大专', '专科学历',
    '资深', '高级', '中级', '初级', '专家', '总监', '主管', '负责人',
]

/**
 * 英文多词短语词典
 * 用于将相邻的英文单词合并为有意义的短语
 */
const EN_PHRASES: string[] = [
    'software engineer', 'software development', 'frontend developer', 'backend developer',
    'full stack', 'mobile development', 'data analysis', 'data science', 'machine learning',
    'deep learning', 'artificial intelligence', 'natural language processing', 'computer vision',
    'data mining', 'cloud computing', 'containerization', 'microservices architecture',
    'distributed systems', 'high availability', 'high performance', 'performance optimization',
    'architecture design', 'system design', 'database design', 'api development', 'api design',
    'user experience', 'user interface', 'product management', 'project management',
    'agile development', 'continuous integration', 'continuous delivery', 'version control',
    'code review', 'coding standards', 'unit testing', 'test driven development',
    'quality assurance', 'team collaboration', 'communication skills', 'problem solving',
    'business analysis', 'requirements analysis', 'programming skills', 'technical documentation',
    'object oriented', 'design patterns', 'data structure', 'data structures', 'web development',
    'front end', 'back end', 'web design', 'product design', 'experience design',
    'spring boot', 'docker compose', 'react native',
]

/**
 * 英文技术词库
 * 用于提升技术关键词的权重
 */
const TECH_WORDS: string[] = [
    // 前端
    'html', 'css', 'javascript', 'typescript', 'react', 'vue', 'angular', 'jquery', 'webpack',
    'vite', 'redux', 'nextjs', 'nuxt', 'electron', 'flutter', 'reactnative', 'threejs', 'webgl',
    'canvas', 'sass', 'less', 'tailwind', 'bootstrap', 'node', 'nodejs', 'deno', 'ai', 'ml',
    // 后端 / 语言
    'python', 'java', 'c', 'cpp', 'csharp', 'c#', 'go', 'golang', 'rust', 'php', 'ruby', 'swift',
    'kotlin', 'dart', 'scala', 'shell', 'sql', 'graphql', 'grpc', 'rest', 'websocket', 'oauth',
    'jwt',
    // 框架
    'django', 'flask', 'spring', 'springboot', 'laravel', 'express', 'fastapi', 'gin', 'numpy',
    'pandas', 'scikit', 'tensorflow', 'pytorch', 'keras', 'selenium', 'cypress', 'jest', 'mocha',
    // 数据库 / 中间件
    'mysql', 'postgresql', 'postgres', 'oracle', 'mongodb', 'redis', 'kafka', 'elasticsearch',
    'rabbitmq', 'zookeeper', 'hbase', 'sqlite',
    // 大数据 / 运维
    'spark', 'hadoop', 'flink', 'hive', 'flume', 'docker', 'kubernetes', 'k8s', 'nginx',
    'linux', 'ubuntu', 'centos', 'git', 'github', 'gitlab', 'jenkins', 'ansible', 'terraform',
    'prometheus', 'grafana', 'kibana',
    // 云平台
    'aws', 'azure', 'gcp', 'aliyun', 'vercel', 'netlify',
    // 办公 / 数据可视化
    'excel', 'word', 'ppt', 'tableau', 'powerbi', 'eclipse', 'idea', 'vscode', 'xcode',
]

/**
 * 中文停用词（双字及以上）
 * 单字中文会被单独过滤
 */
const ZH_STOP_WORDS: string[] = [
    // 常见动词 / 功能词
    '需要', '精通', '熟悉', '熟练', '掌握', '了解', '使用', '负责', '参与', '要求', '具备',
    '具有', '拥有', '能够', '可以', '进行', '通过', '主要', '负责', '包括', '包含', '善于',
    '具备', '良好', '优秀', '较强', '一定', '相关', '同时', '并且', '以及', '一种', '一些',
    '以上', '以下', '其中', '对于', '关于', '根据', '按照', '作为', '方面', '不同', '各种',
    // 通用名词（太泛，不算关键词）
    '框架', '组件', '平台', '系统', '应用', '项目', '产品', '业务', '流程', '方案', '工具',
    '标准', '规范', '架构', '算法', '接口', '模块', '网络', '协议', '服务器', '数据库', '缓存',
    '中间件', '技术', '数据', '信息', '功能', '团队', '需求', '内容', '方式', '方法', '情况',
    '工作', '岗位', '职位', '职责', '条件', '公司', '企业', '学历', '教育', '专业', '经验',
    '能力', '背景', '方向', '领域', '我们', '大家', '员工', '人员',
    // 动作词（太泛，不算关键词）
    '开发', '构建', '设计', '优化', '维护', '支持', '搭建', '部署', '调试', '编写', '提供',
    '实施', '协调', '处理', '完成', '主导', '配合', '跟进', '推动', '落地', '上线', '技能',
    '招聘', '持续', '改善', '正在', '丰富', '熟练', '精通', '负责', '参与',
]

/**
 * 英文停用词
 */
const EN_STOP_WORDS: string[] = [
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'from', 'as', 'are', 'is', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall',
    'can', 'that', 'this', 'these', 'those', 'it', 'its', 'which', 'who', 'whom', 'whose',
    'what', 'where', 'when', 'why', 'how', 'about', 'above', 'after', 'again', 'against',
    'all', 'am', 'any', 'because', 'before', 'being', 'below', 'between', 'both', 'cannot',
    'each', 'few', 'more', 'most', 'no', 'nor', 'not', 'now', 'off', 'once', 'only', 'other',
    'our', 'out', 'over', 'own', 'same', 'so', 'some', 'such', 'than', 'their', 'then',
    'there', 'through', 'too', 'under', 'until', 'up', 'very', 'your', 'you', 'we', 'they',
    'he', 'she', 'i', 'me', 'us', 'him', 'her', 'them', 'his', 'hers', 'their', 'into',
    'upon', 'within', 'during', 'while', 'also', 'etc', 'like', 'including', 'using', 'use',
    'used', 'strong', 'good', 'great', 'excellent', 'solid', 'basic', 'plus', 'preferred',
    'nice', 'extra', 'familiar', 'familiarity', 'proficient', 'proficiency', 'knowledge',
    'ability', 'experience', 'skill', 'skills', 'working', 'work', 'years', 'year',
    'bachelor', 'master', 'degree', 'education', 'requirements', 'requirement',
    'responsibilities', 'responsibility', 'description', 'job', 'role', 'position',
    'full-time', 'fulltime', 'office', 'remote', 'hybrid', 'salary', 'bonus', 'team',
    'member', 'report', 'related', 'within', 'across', 'every', 'either', 'neither',
    'platform', 'platforms', 'required', 'modern', 'framework', 'frameworks',
    'developed', 'developing', 'various', 'greatly', 'such',
]

/**
 * 英文单词 token 正则
 */
const ENGLISH_TOKEN_REGEX = /^[a-z0-9+#.\-]+$/i

/**
 * 纯数字/符号 token 正则（如 "3-5"、"2024"、"C#" 不在此列）
 */
const NUMBER_ONLY_REGEX = /^[\d+\-#.]+$/

/**
 * 中文停用词集合（双字及以上）
 */
const STOP_WORDS: Set<string> = new Set([
    ...ZH_STOP_WORDS,
    ...EN_STOP_WORDS,
])

/**
 * 中文功能字（单字）
 * 这些字几乎只作为虚词/介词/连词/助词出现，不会成为简历关键词，
 * 分词时直接跳过，避免双字回退在这些字附近错位（如"等深度学习框架"错切成"等深"）
 */
const ZH_FUNCTION_CHARS: Set<string> = new Set(
    '的了吗呢啊吧哟哦呀嘛在我你他她它们就也都等为以与及并或而之其从对将把被让但只才已还再又于由向当若因虽这那那么怎什此每各某该些且则即更最太很较略稍吧嗯啦喂谁非但凡是上下中前后内外间一和有位个名项份种类套次'
)

/**
 * 中文词典按词长降序排列，用于最长匹配
 */
const ZH_TERMS_SORTED: string[] = [...ZH_TERMS].sort(
    (a, b) => b.length - a.length
)

/**
 * 中文词典集合
 */
const ZH_TERM_SET: Set<string> = new Set(ZH_TERMS)

/**
 * 英文短语集合
 */
const EN_PHRASE_SET: Set<string> = new Set(EN_PHRASES)

/**
 * 英文技术词集合
 */
const TECH_WORD_SET: Set<string> = new Set(TECH_WORDS)

/**
 * 从文本中提取关键词
 * 使用改进的TF-IDF算法
 * @param text 输入文本
 * @param options 配置选项
 * @returns 关键词提取结果
 */
export function extractKeywords(
    text: string,
    options: {
        maxKeywords?: number
        minFrequency?: number
        includeNumbers?: boolean
    } = {}
): KeywordExtractionResult {
    const {
        maxKeywords = 30,
        minFrequency = 1,
        includeNumbers = false,
    } = options

    if (!text || typeof text !== 'string') {
        return {
            keywords: [],
            frequency: {},
            count: 0,
            totalWords: 0,
        }
    }

    // 预处理文本
    const cleanedText = preprocessText(text)

    // 分词
    const words = tokenize(cleanedText)

    // 合并英文多词短语
    const mergedWords = mergeEnglishPhrases(words)

    // 计算词频
    const wordFrequency = calculateWordFrequency(mergedWords, includeNumbers)

    // 计算TF-IDF分数
    const tfidfResult = calculateTFIDF(mergedWords, wordFrequency)

    // 过滤和排序关键词
    const filteredKeywords = filterKeywords(
        tfidfResult.keywords,
        wordFrequency,
        maxKeywords,
        minFrequency
    )

    // 生成结果
    return {
        keywords: filteredKeywords,
        frequency: wordFrequency,
        count: filteredKeywords.length,
        totalWords: mergedWords.length,
    }
}

/**
 * 从岗位描述中提取关键词
 * @param jobDescription 岗位描述
 * @returns 关键词提取结果
 */
export function extractKeywordsFromJobDescription(
    jobDescription: JobDescription
): KeywordExtractionResult {
    // 构建完整文本：标题 + 描述 + 技能 + 经验 + 学历
    const title = jobDescription.title || ''
    const description = jobDescription.description || ''
    const skills = jobDescription.requiredSkills?.join(' ') || ''
    const experience = jobDescription.experience || ''
    const education = jobDescription.education || ''

    const fullText = `${title} ${description} ${skills} ${experience} ${education}`.trim()

    console.log('岗位描述提取 - 输入:', {
        title,
        description,
        skills,
        experience,
        education,
        fullText,
    })

    return extractKeywords(fullText, {
        maxKeywords: 50,
        minFrequency: 1,
        includeNumbers: false,
    })
}

/**
 * 从简历中提取关键词
 * @param resume 简历
 * @returns 关键词提取结果
 */
export function extractKeywordsFromResume(
    resume: Resume
): KeywordExtractionResult {
    return extractKeywords(resume.text, {
        maxKeywords: 30,
        minFrequency: 1,
        includeNumbers: false,
    })
}

/**
 * 预处理文本
 * @param text 输入文本
 * @returns 清理后的文本
 */
function preprocessText(text: string): string {
    // 移除HTML标签
    let cleaned = text.replace(/<[^>]*>/g, ' ')

    // 将中英文标点符号和特殊字符替换为空格（保留中文汉字和英文单词）
    cleaned = cleaned.replace(
        /[\u3000-\u303f\uff00-\uffef]/g,
        ' '
    )

    // 移除其他标点符号
    cleaned = cleaned.replace(/[^\w\s\u4e00-\u9fa5+#.\-]/g, ' ')

    // 移除多余的空格
    cleaned = cleaned.replace(/\s+/g, ' ')

    // 转换为小写（英文）
    cleaned = cleaned.toLowerCase()

    // 移除首尾空格
    cleaned = cleaned.trim()

    return cleaned
}

/**
 * 分词
 * 中文：领域词典最长匹配 + 双字回退
 * 英文：按单词切分（保留 . + # - 等字符，如 "node.js"、"C#"、"react-native"）
 * @param text 输入文本
 * @returns 词列表
 */
function tokenize(text: string): string[] {
    const tokens: string[] = []
    let i = 0
    const n = text.length

    while (i < n) {
        const ch = text[i]

        // 英文 / 数字
        if (/[a-z0-9]/.test(ch)) {
            let j = i
            while (j < n && /[a-z0-9+#.\-]/.test(text[j])) {
                j++
            }
            const word = text
                .slice(i, j)
                .replace(/^[+#.]+/, '')
                .replace(/[+#.]+$/, '')
            if (word.length > 0) {
                tokens.push(word)
            }
            i = j
        } else if (/[\u4e00-\u9fa5]/.test(ch)) {
            // 中文：取一段连续的汉字串后按词典+双字切分
            let j = i
            while (j < n && /[\u4e00-\u9fa5]/.test(text[j])) {
                j++
            }
            tokens.push(...segmentChinese(text.slice(i, j)))
            i = j
        } else {
            i++
        }
    }

    return tokens
}

/**
 * 中文分词
 * 优先使用领域词典做最长匹配；未命中时：
 *  - 当前字符为功能字（的/了/是/等）时直接跳过，避免双字回退错位
 *  - 否则回退为双字词；若双字中包含功能字或是停用词则丢弃
 * @param run 连续的中文字符串
 * @returns 词列表
 */
function segmentChinese(run: string): string[] {
    const tokens: string[] = []
    let i = 0

    while (i < run.length) {
        // 1. 词典最长匹配
        const matched = matchLongestChineseTerm(run, i)
        if (matched) {
            tokens.push(matched)
            i += matched.length
            continue
        }

        // 2. 跳过功能字
        if (ZH_FUNCTION_CHARS.has(run[i])) {
            i++
            continue
        }

        // 3. 双字回退
        const bigram = run.slice(i, i + 2)
        if (
            bigram.length === 2 &&
            !ZH_FUNCTION_CHARS.has(run[i + 1]) &&
            !isStopWord(bigram)
        ) {
            tokens.push(bigram)
        }
        i += bigram.length
    }

    return tokens
}

/**
 * 在中文串指定位置尝试最长匹配领域词典
 * @param run 中文字符串
 * @param index 起始位置
 * @returns 命中的词；未命中返回 null
 */
function matchLongestChineseTerm(
    run: string,
    index: number
): string | null {
    for (const term of ZH_TERMS_SORTED) {
        if (run.startsWith(term, index)) {
            return term
        }
    }
    return null
}

/**
 * 合并相邻的英文单词为多词短语
 * @param tokens 词列表
 * @returns 合并后的词列表
 */
function mergeEnglishPhrases(tokens: string[]): string[] {
    const out: string[] = []
    let i = 0

    while (i < tokens.length) {
        if (!ENGLISH_TOKEN_REGEX.test(tokens[i])) {
            out.push(tokens[i])
            i++
            continue
        }

        // 尝试从当前位置匹配最长的多词短语
        let phraseFound = false
        for (let len = 4; len >= 2; len--) {
            if (i + len > tokens.length) {
                continue
            }
            const phrase = tokens.slice(i, i + len).join(' ').toLowerCase()
            if (EN_PHRASE_SET.has(phrase)) {
                out.push(phrase)
                i += len
                phraseFound = true
                break
            }
        }

        if (!phraseFound) {
            out.push(tokens[i])
            i++
        }
    }

    return out
}

/**
 * 计算词频
 * @param words 词列表
 * @param includeNumbers 是否包含纯数字
 * @returns 词频统计
 */
function calculateWordFrequency(
    words: string[],
    includeNumbers: boolean
): Record<string, number> {
    const frequency: Record<string, number> = {}

    words.forEach(word => {
        // 过滤停用词
        if (isStopWord(word)) {
            return
        }

        // 过滤单字符（中文单字、英文单字母都不算关键词）
        if (word.length === 1) {
            return
        }

        // 过滤纯数字/符号 token
        if (!includeNumbers && NUMBER_ONLY_REGEX.test(word)) {
            return
        }

        // 更新频率
        frequency[word] = (frequency[word] || 0) + 1
    })

    return frequency
}

/**
 * 计算TF-IDF分数
 * @param words 分词后的词列表
 * @param wordFrequency 词频统计
 * @returns TF-IDF结果
 */
function calculateTFIDF(
    words: string[],
    wordFrequency: Record<string, number>
): TFIDFResult {
    const totalWords = Math.max(1, words.length)

    // 计算TF-IDF
    const scores: Record<string, number> = {}

    Object.entries(wordFrequency).forEach(([word, freq]) => {
        // TF (Term Frequency)
        const tf = freq / totalWords

        // IDF (Inverse Document Frequency)
        const idf = calculateIDF(word, freq)

        // TF-IDF
        scores[word] = tf * idf
    })

    // 按分数排序
    const sortedKeywords = Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0])

    return {
        scores,
        keywords: sortedKeywords,
    }
}

/**
 * 计算IDF分数
 * 综合词长、领域词权重与文档内稀有度
 * @param word 词
 * @param frequency 词频
 * @returns IDF分数
 */
function calculateIDF(word: string, frequency: number): number {
    // 词长加权：更长（通常是短语）的信息量更高
    const lengthBoost = Math.min(2, 1 + word.length * 0.06)

    // 领域词加权：技术栈、岗位、软技能等获得更高权重
    const domainBoost = isDomainTerm(word) ? 3 : 1

    // 稀有度加权：同一文档内高频出现的词，信息量相对较低
    const rarity = Math.max(0.5, 1 / Math.log2(frequency + 1))

    return lengthBoost * domainBoost * rarity
}

/**
 * 判断是否为领域词（技术词 / 中文词典词 / 英文短语）
 * @param word 词
 * @returns 是否为领域词
 */
function isDomainTerm(word: string): boolean {
    const lower = word.toLowerCase()
    return (
        ZH_TERM_SET.has(word) ||
        EN_PHRASE_SET.has(lower) ||
        TECH_WORD_SET.has(lower)
    )
}

/**
 * 过滤关键词
 * @param keywords 关键词列表（按分数降序）
 * @param frequency 词频统计
 * @param maxKeywords 最大关键词数量
 * @param minFrequency 最小频率
 * @returns 过滤后的关键词列表
 */
function filterKeywords(
    keywords: string[],
    frequency: Record<string, number>,
    maxKeywords: number,
    minFrequency: number
): string[] {
    return keywords
        .filter(word => (frequency[word] || 0) >= minFrequency)
        .slice(0, maxKeywords)
}

/**
 * 检查是否为停用词
 * @param word 词
 * @returns 是否为停用词
 */
function isStopWord(word: string): boolean {
    return STOP_WORDS.has(word)
}

/**
 * 比较两个文本的关键词提取结果
 * @param text1 文本1
 * @param text2 文本2
 * @returns 匹配的关键词列表
 */
export function compareKeywordExtraction(
    text1: string,
    text2: string
): {
    commonKeywords: string[]
    uniqueToText1: string[]
    uniqueToText2: string[]
} {
    const result1 = extractKeywords(text1, { maxKeywords: 50, minFrequency: 1 })
    const result2 = extractKeywords(text2, { maxKeywords: 50, minFrequency: 1 })

    const keywords1 = result1.keywords
    const keywords2 = result2.keywords

    const commonKeywords = keywords1.filter(word => keywords2.includes(word))
    const uniqueToText1 = keywords1.filter(word => !keywords2.includes(word))
    const uniqueToText2 = keywords2.filter(word => !keywords1.includes(word))

    console.log('关键词比较 - 结果:', {
        text1Length: text1.length,
        text2Length: text2.length,
        keywords1: result1.keywords,
        keywords2: result2.keywords,
        commonKeywords: commonKeywords.length,
        uniqueToText1: uniqueToText1.length,
        uniqueToText2: uniqueToText2.length,
    })

    return {
        commonKeywords,
        uniqueToText1,
        uniqueToText2,
    }
}
