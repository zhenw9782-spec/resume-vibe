/**
 * 文件名生成工具（轻量模块，无 PDF 库依赖）
 * 拆分自 generator.tsx，避免静态导入时把 @react-pdf/renderer 带入路由首屏 bundle
 */

/**
 * 从简历文本中提取姓名
 * 优先取第一行非空行（不含冒号）；否则尝试常见姓名标识
 */
export function extractName(resumeText: string): string {
  const lines = resumeText.split('\n').filter(line => line.trim())
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    // 跳过联系方式、部分标题等含冒号的行
    if (trimmed.includes('：') || trimmed.includes(':')) continue
    // 跳过明显不是姓名的行
    if (/^[\d\s\-·—]+$/.test(trimmed)) continue
    return trimmed
  }
  return ''
}

/**
 * 从简历文本中提取岗位/职位名称
 * 优先匹配"求职意向/目标职位/应聘岗位/期望职位"等显式声明；
 * 否则从工作经历首条中提取（"2021-至今 ABC科技有限公司 前端开发工程师" → 前端开发工程师）
 */
export function extractJobTitle(resumeText: string): string {
  const lines = resumeText.split('\n').map(line => line.trim()).filter(Boolean)

  // 1. 显式声明行
  const explicitPatterns = ['求职意向', '目标职位', '应聘岗位', '期望职位', '期望岗位', '目标岗位']
  for (const line of lines) {
    for (const p of explicitPatterns) {
      if (line.startsWith(p)) {
        const value = line.slice(p.length).replace(/^[:：\s]+/, '').replace(/\s+/g, '')
        if (value) return value
      }
    }
  }

  // 2. 从工作经历中提取
  let inExperience = false
  for (const line of lines) {
    if (/^(工作经历|工作经验|职业经历|实习经历)/.test(line)) {
      inExperience = true
      continue
    }
    if (inExperience) {
      // 遇到下一个部分标题则停止
      if (/^(教育背景|专业技能|项目经历|个人简介|自我评价)/.test(line)) break
      if (!line) continue
      // 匹配 "日期 公司名 职位" 格式：取最后一个词作为职位
      const parts = line.split(/\s+/).filter(Boolean)
      if (parts.length >= 2) {
        const last = parts[parts.length - 1]
        // 过滤掉纯日期/公司常见词
        if (!/^\d/.test(last) && !/公司$/.test(last) && last.length <= 20) {
          return last
        }
      }
    }
  }

  return ''
}

/**
 * 生成下载文件名：[姓名]_[岗位]_优化简历（不含扩展名）
 * 姓名/岗位提取失败时回退为默认文件名
 */
export function generateDownloadFileName(resumeText: string, fallbackName = '优化简历'): string {
  const name = extractName(resumeText)
  const jobTitle = extractJobTitle(resumeText)

  const parts = []
  if (name) parts.push(name)
  if (jobTitle) parts.push(jobTitle)

  if (parts.length === 0) {
    return fallbackName
  }

  return `${parts.join('_')}_优化简历`
}
