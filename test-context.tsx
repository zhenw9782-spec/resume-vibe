'use client'

/**
 * Context 测试文件
 * 用于验证ResumeContext的使用
 */

import React, { useState } from 'react'
import { ResumeContextProvider, useResumeContext } from './src/context/ResumeContext'

/**
 * 测试组件1：基本状态展示
 */
function TestComponent1() {
    const { file, status, setFile, setStatus } = useResumeContext()

    return (
        <div className="p-4 border rounded">
            <h3 className="font-bold mb-2">测试组件1：基本状态</h3>
            <p>文件: {file?.name || '无文件'}</p>
            <p>状态: {status}</p>
            <div className="mt-2">
                <button
                    onClick={() => setFile(new File(['test'], 'test.txt', { type: 'text/plain' }))}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    设置文件
                </button>
                <button
                    onClick={() => setStatus('analyzing' as const)}
                    className="px-4 py-2 bg-green-500 text-white rounded ml-2"
                >
                    设置状态：analyzing
                </button>
            </div>
        </div>
    )
}

/**
 * 测试组件2：完整功能测试
 */
function TestComponent2() {
    const {
        file,
        parsedText,
        status,
        uploadState,
        analysisResult,
        rewriteResult,
        setFile,
        setParsedText,
        setStatus,
        setUploadState,
        setAnalysisResult,
        setRewriteResult,
        reset,
        startUpload,
        completeUpload,
        failUpload,
        startAnalysis,
        completeAnalysis,
        failAnalysis,
        setJobDescription,
        setResumeText,
        getAnalysisRequest,
        hasData
    } = useResumeContext()

    const testAnalysisResult = {
        matchScore: 85,
        missingKeywords: ['Python', 'Docker'],
        suggestions: ['建议添加Python项目经验', '增加Docker相关技能描述'],
        level: 'high' as const,
        report: '简历与岗位匹配度较高，建议补充Python和Docker相关项目经验。'
    }

    const testRewriteResult = {
        rewrittenText: '优化后的简历文本...',
        explanation: '根据岗位要求进行了针对性优化',
        summary: ['补充了Python项目经验', '增加了Docker技能描述', '优化了项目描述语言']
    }

    return (
        <div className="p-4 border rounded">
            <h3 className="font-bold mb-2">测试组件2：完整功能</h3>

            {/* 状态信息 */}
            <div className="mb-4 space-y-1">
                <p>文件: {file?.name || '无'}</p>
                <p>解析文本: {parsedText.substring(0, 50)}...</p>
                <p>状态: {status}</p>
                <p>上传进度: {uploadState.progress}%</p>
                <p>是否有数据: {hasData() ? '是' : '否'}</p>
            </div>

            {/* 测试按钮 */}
            <div className="mb-4 space-x-2">
                <button
                    onClick={() => setFile(new File(['test'], 'resume.txt', { type: 'text/plain' }))}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                >
                    设置文件
                </button>
                <button
                    onClick={() => setParsedText('这是测试的简历文本内容')}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                >
                    设置文本
                </button>
                <button
                    onClick={() => setStatus('uploading' as const)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                >
                    上传中
                </button>
                <button
                    onClick={() => completeUpload()}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                >
                    上传完成
                </button>
                <button
                    onClick={() => failUpload('上传失败')}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                >
                    上传失败
                </button>
            </div>

            {/* 分析结果测试 */}
            <div className="mb-4">
                <h4 className="font-semibold mb-2">分析结果测试</h4>
                <button
                    onClick={() => {
                        setAnalysisResult(testAnalysisResult)
                        setRewriteResult(testRewriteResult)
                        completeAnalysis({
                            result: testAnalysisResult,
                            rewriteResult: testRewriteResult,
                            processingTime: 1200,
                            fromCache: false
                        })
                    }}
                    className="px-3 py-1 bg-purple-500 text-white rounded text-sm"
                >
                    设置分析结果
                </button>
                {analysisResult && (
                    <div className="mt-2 text-sm">
                        <p>匹配度: {analysisResult.matchScore}%</p>
                        <p>等级: {analysisResult.level}</p>
                        <p>缺失关键词: {analysisResult.missingKeywords.join(', ')}</p>
                    </div>
                )}
            </div>

            {/* 岗位描述测试 */}
            <div className="mb-4">
                <h4 className="font-semibold mb-2">岗位描述测试</h4>
                <button
                    onClick={() => {
                        setJobDescription('高级前端工程师，要求React、TypeScript、Next.js经验')
                        setResumeText('我有5年React开发经验，熟练使用TypeScript')
                    }}
                    className="px-3 py-1 bg-indigo-500 text-white rounded text-sm"
                >
                    设置岗位和简历
                </button>
                {getAnalysisRequest() && (
                    <div className="mt-2 text-sm">
                        <p>岗位描述: {getAnalysisRequest()!.jobDescription}</p>
                        <p>简历文本: {getAnalysisRequest()!.resumeText}</p>
                    </div>
                )}
            </div>

            {/* 重置按钮 */}
            <button
                onClick={reset}
                className="px-4 py-2 bg-gray-500 text-white rounded"
            >
                重置所有状态
            </button>
        </div>
    )
}

/**
 * 测试组件3：错误处理测试
 */
function TestComponent3() {
    const { status, failAnalysis } = useResumeContext()

    return (
        <div className="p-4 border rounded">
            <h3 className="font-bold mb-2">测试组件3：错误处理</h3>
            <p>当前状态: {status}</p>
            <button
                onClick={() => failAnalysis('分析服务暂时不可用，请稍后再试')}
                className="px-4 py-2 bg-red-500 text-white rounded"
            >
                模拟分析失败
            </button>
        </div>
    )
}

/**
 * 测试主组件
 */
export default function ContextTest() {
    return (
        <ResumeContextProvider>
            <div className="max-w-4xl mx-auto p-6 space-y-4">
                <h1 className="text-2xl font-bold mb-6">ResumeContext 测试</h1>

                <TestComponent1 />
                <TestComponent2 />
                <TestComponent3 />

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <h3 className="font-bold text-yellow-800 mb-2">测试说明</h3>
                    <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                        <li>点击按钮测试各种状态变更</li>
                        <li>观察状态是否正确更新</li>
                        <li>测试重置功能是否正常</li>
                        <li>测试错误处理是否正常</li>
                        <li>测试Context在Provider外使用是否抛出错误</li>
                    </ul>
                </div>
            </div>
        </ResumeContextProvider>
    )
}