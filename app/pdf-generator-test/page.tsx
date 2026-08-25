'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { generateDownloadFileName } from '@/src/lib/pdf/fileName'

// @react-pdf-viewer 依赖浏览器 API，需禁用 SSR，仅在客户端加载
const PDFPreview = dynamic(
  () => import('@/src/components/PDFPreview/PDFPreview'),
  { ssr: false }
)

/**
 * PDF 生成测试页面
 */
export default function PDFGeneratorTest() {
  const [resumeText, setResumeText] = useState(`张三
电话：13812345678
邮箱：zhangsan@example.com
地址：北京市海淀区中关村大街1号

个人简介：
具有5年前端开发经验的软件工程师，擅长React、TypeScript和Node.js开发。熟悉敏捷开发流程，具有良好的团队协作能力。

工作经历：
2021-至今 ABC科技有限公司 前端开发工程师
- 负责公司核心产品的前端开发工作
- 使用React和TypeScript重构遗留系统
- 优化页面性能，提升用户体验

2019-2021 XYZ互联网公司 初级前端开发工程师
- 参与电商平台前端开发
- 使用Vue.js开发用户界面
- 编写单元测试和集成测试

教育背景：
2015-2019 北京大学 计算机科学与技术 本科

专业技能：
React
TypeScript
Node.js
Vue.js
JavaScript
HTML/CSS
Git

项目经历：
电商平台重构项目
- 使用React和TypeScript重构电商平台前端
- 实现组件化开发，提升代码复用率
- 优化首屏加载时间，提升用户体验

内部管理系统开发
- 使用Vue.js开发内部管理系统
- 实现数据可视化和报表功能
- 集成第三方API，实现数据同步`)

  const [fileName, setFileName] = useState('张三_前端开发工程师_优化简历')
  const [template, setTemplate] = useState<'classic' | 'modern'>('classic')

  const downloadFileName = generateDownloadFileName(resumeText)

  const handleReset = () => {
    setResumeText('')
    setFileName('优化简历')
    setTemplate('classic')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">PDF 生成工具测试</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：输入和控制 */}
          <div className="space-y-6">
            {/* 简历文本输入 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">简历文本</h2>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full h-64 p-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入简历文本..."
              />
              <div className="mt-2 text-sm text-gray-500">
                字数：{resumeText.length}
              </div>
            </div>

            {/* 生成选项 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">生成选项</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    文件名
                  </label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="输入文件名（不含.pdf）"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    模板类型
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center text-gray-900">
                      <input
                        type="radio"
                        value="classic"
                        checked={template === 'classic'}
                        onChange={(e) => setTemplate(e.target.value as 'classic' | 'modern')}
                        className="mr-2"
                      />
                      经典专业版
                    </label>
                    <label className="flex items-center text-gray-900">
                      <input
                        type="radio"
                        value="modern"
                        checked={template === 'modern'}
                        onChange={(e) => setTemplate(e.target.value as 'classic' | 'modern')}
                        className="mr-2"
                      />
                      现代设计版
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex gap-4">
                <button
                  onClick={handleReset}
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
                >
                  重置
                </button>
              </div>
            </div>

            {/* 下载文件名提示 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-800 mb-4">下载文件名（自动生成）</h2>
              <p className="text-green-700">
                下载时自动生成文件名：<span className="font-medium">{downloadFileName}.pdf</span>
              </p>
              <p className="mt-2 text-sm text-green-600">
                命名规则：[姓名]_[岗位]_优化简历.pdf；姓名取简历首行，岗位取&quot;求职意向/目标职位&quot;等声明或工作经历中的职位。
              </p>
            </div>

            {/* 测试说明 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">测试说明</h2>
              <div className="text-blue-700 space-y-2">
                <p>1. 在左侧输入简历文本（已预填示例内容）</p>
                <p>2. 调整文件名和模板类型</p>
                <p>3. 右侧预览区实时生成 PDF</p>
                <p>4. 使用预览工具栏缩放、翻页查看</p>
                <p>5. 点击&quot;下载 PDF&quot;按钮下载文件</p>
                <p>6. 验证生成的 PDF 文件是否正常打开和显示</p>
              </div>
            </div>
          </div>

          {/* 右侧：预览（PDFPreview 组件） */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">PDF 预览</h2>
            <PDFPreview
              resumeText={resumeText}
              template={template}
              fileName={fileName}
              onTemplateChange={setTemplate}
            />
          </div>
        </div>
      </div>
    </div>
  )
}