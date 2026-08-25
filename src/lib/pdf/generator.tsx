/**
 * PDF 生成工具
 * 封装 react-pdf/renderer 生成逻辑
 */

import React from 'react'
import { pdf } from '@react-pdf/renderer'
import type { DocumentProps } from '@react-pdf/renderer'

export { extractName, extractJobTitle, generateDownloadFileName } from './fileName'

/**
 * PDF 生成选项
 */
export interface PDFGenerationOptions {
  /**
   * 简历文本内容
   */
  resumeText: string

  /**
   * 文件名（不含扩展名）
   */
  fileName?: string

  /**
   * 模板类型
   */
  template?: 'classic' | 'modern'
}

/**
 * PDF 生成结果
 */
export interface PDFGenerationResult {
  /**
   * 生成的 Blob 对象
   */
  blob: Blob

  /**
   * 文件名
   */
  fileName: string

  /**
   * 生成时间（毫秒）
   */
  generationTime: number
}

/**
 * 解析简历文本为结构化数据
 */
export function parseResumeText(text: string): ResumeData {
  const lines = text.split('\n').filter(line => line.trim())
  
  const resumeData: ResumeData = {
    name: '',
    contact: {
      phone: '',
      email: '',
      address: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: []
  }

  let currentSection = ''
  let currentContent: string[] = []

  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // 检测姓名（第一行非空行）
    if (!resumeData.name && trimmedLine && !trimmedLine.includes('：') && !trimmedLine.includes(':')) {
      resumeData.name = trimmedLine
      continue
    }

    // 检测联系方式
    if (trimmedLine.includes('电话') || trimmedLine.includes('手机') || trimmedLine.match(/^\d{11}$/)) {
      resumeData.contact.phone = trimmedLine.replace(/[^0-9]/g, '')
      continue
    }
    
    if (trimmedLine.includes('@') || trimmedLine.includes('邮箱')) {
      const emailMatch = trimmedLine.match(/[\w.-]+@[\w.-]+\.\w+/)
      if (emailMatch) {
        resumeData.contact.email = emailMatch[0]
      }
      continue
    }

    // 检测地址
    if (trimmedLine.includes('地址') || trimmedLine.includes('住址') || trimmedLine.includes('所在地')) {
      resumeData.contact.address = trimmedLine.replace(/^(地址|住址|所在地)\s*[:：]\s*/, '').trim()
      continue
    }

    // 检测各个部分
    if (trimmedLine.includes('个人简介') || trimmedLine.includes('自我评价') || trimmedLine.includes('摘要')) {
      if (currentSection && currentContent.length) {
        saveSection(resumeData, currentSection, currentContent)
      }
      currentSection = 'summary'
      currentContent = []
      continue
    }

    if (trimmedLine.includes('工作经历') || trimmedLine.includes('工作经验') || trimmedLine.includes('职业经历')) {
      if (currentSection && currentContent.length) {
        saveSection(resumeData, currentSection, currentContent)
      }
      currentSection = 'experience'
      currentContent = []
      continue
    }

    if (trimmedLine.includes('教育背景') || trimmedLine.includes('教育经历') || trimmedLine.includes('学历')) {
      if (currentSection && currentContent.length) {
        saveSection(resumeData, currentSection, currentContent)
      }
      currentSection = 'education'
      currentContent = []
      continue
    }

    if (trimmedLine.includes('专业技能') || trimmedLine.includes('技能') || trimmedLine.includes('技术栈')) {
      if (currentSection && currentContent.length) {
        saveSection(resumeData, currentSection, currentContent)
      }
      currentSection = 'skills'
      currentContent = []
      continue
    }

    if (trimmedLine.includes('项目经历') || trimmedLine.includes('项目经验') || trimmedLine.includes('项目')) {
      if (currentSection && currentContent.length) {
        saveSection(resumeData, currentSection, currentContent)
      }
      currentSection = 'projects'
      currentContent = []
      continue
    }

    // 添加到当前部分
    if (currentSection) {
      currentContent.push(trimmedLine)
    } else if (trimmedLine) {
      // 如果没有明确的部分标记，添加到摘要
      if (!resumeData.summary) {
        resumeData.summary = trimmedLine
      }
    }
  }

  // 保存最后一个部分
  if (currentSection && currentContent.length) {
    saveSection(resumeData, currentSection, currentContent)
  }

  return resumeData
}

/**
 * 保存部分数据
 */
function saveSection(resumeData: ResumeData, section: string, content: string[]) {
  switch (section) {
    case 'summary':
      resumeData.summary = content.join('\n')
      break
    case 'experience':
      resumeData.experience.push(...content)
      break
    case 'education':
      resumeData.education.push(...content)
      break
    case 'skills':
      resumeData.skills.push(...content)
      break
    case 'projects':
      resumeData.projects.push(...content)
      break
  }
}

/**
 * 简历数据结构
 */
export interface ResumeData {
  name: string
  contact: {
    phone: string
    email: string
    address: string
  }
  summary: string
  experience: string[]
  education: string[]
  skills: string[]
  projects: string[]
}

/**
 * 生成 PDF 文件
 */
export async function generatePDF(options: PDFGenerationOptions): Promise<PDFGenerationResult> {
  const startTime = Date.now()
  
  const { resumeText, fileName = '优化简历', template = 'classic' } = options

  // 解析简历文本
  const resumeData = parseResumeText(resumeText)

  // 动态导入 PDF 组件（避免 SSR 问题）
  const { default: ClassicTemplate } = await import('./templates/classic')
  const { default: ModernTemplate } = await import('./templates/modern')

  // 根据模板类型选择组件
  const TemplateComponent = template === 'modern' ? ModernTemplate : ClassicTemplate

  // 创建 PDF 文档
  const pdfDocument = <TemplateComponent resumeData={resumeData} />

  // 生成 PDF blob
  const blob = await pdf(pdfDocument).toBlob()

  const generationTime = Date.now() - startTime

  return {
    blob,
    fileName: `${fileName}.pdf`,
    generationTime
  }
}

/**
 * 下载 PDF 文件
 * @param result 生成结果
 * @param fileName 可选文件名覆盖（不含扩展名）；不传则使用 result.fileName
 */
export function downloadPDF(result: PDFGenerationResult, fileName?: string): void {
  const downloadName = fileName ? `${fileName}.pdf` : result.fileName
  const url = URL.createObjectURL(result.blob)
  const link = document.createElement('a')
  link.href = url
  link.download = downloadName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 获取 PDF Blob URL（用于预览）
 */
export function getPDFBlobUrl(blob: Blob): string {
  return URL.createObjectURL(blob)
}

/**
 * 释放 PDF Blob URL
 */
export function revokePDFBlobUrl(url: string): void {
  URL.revokeObjectURL(url)
}
