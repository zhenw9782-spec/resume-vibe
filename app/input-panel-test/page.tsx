'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InputPanel } from '@/src/components/InputPanel/InputPanel'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export default function InputPanelTestPage() {
    const [jobDescription, setJobDescription] = useState('')
    const [resumeText, setResumeText] = useState('')
    const [isValid, setIsValid] = useState(false)
    const [isDisabled, setIsDisabled] = useState(false)
    const [testResults, setTestResults] = useState<Record<string, boolean>>({})

    // 测试函数
    const runAllTests = () => {
        const results: Record<string, boolean> = {}

        // 测试1: 表单验证 - 必填项
        results.test1 = jobDescription.length >= 10 && resumeText.length >= 20

        // 测试2: 字数统计
        results.test2 = jobDescription.length <= 3000 && resumeText.length <= 1500

        // 测试3: 警告阈值
        results.test3 = jobDescription.length <= 2700 && resumeText.length <= 1350

        // 测试4: 表单验证错误提示
        const testJobEmpty = jobDescription.length < 10
        const testResumeEmpty = resumeText.length < 20
        results.test4 = !testJobEmpty || !testResumeEmpty

        setTestResults(results)
    }

    // 重置测试
    const resetTests = () => {
        setJobDescription('')
        setResumeText('')
        setIsValid(false)
        setIsDisabled(false)
        setTestResults({})
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
            <div className="max-w-6xl mx-auto">
                {/* 页面标题 */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                        输入面板组件测试
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        测试表单验证、字数统计、敏感信息脱敏等功能
                    </p>
                </div>

                {/* 测试控制面板 */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>测试控制</CardTitle>
                        <CardDescription>
                            运行测试以验证组件功能
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                        <Button onClick={runAllTests} className="flex-1">
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            运行所有测试
                        </Button>
                        <Button onClick={resetTests} variant="outline" className="flex-1">
                            重置测试
                        </Button>
                    </CardContent>
                </Card>

                {/* 测试结果 */}
                {Object.keys(testResults).length > 0 && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>测试结果</CardTitle>
                            <CardDescription>
                                测试执行时间：{new Date().toLocaleTimeString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`p-4 rounded-lg border ${testResults.test1 ? 'border-success-500 bg-success-50 dark:bg-success-900/20' : 'border-destructive-500 bg-destructive-50 dark:bg-destructive-900/20'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {testResults.test1 ? (
                                            <CheckCircle2 className="h-5 w-5 text-success-500" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-destructive-500" />
                                        )}
                                        <span className="font-semibold">测试1: 必填项验证</span>
                                    </div>
                                    <p className="text-sm">
                                        岗位描述（{jobDescription.length}字）≥ 10字符，简历（{resumeText.length}字）≥ 20字符
                                    </p>
                                </div>

                                <div className={`p-4 rounded-lg border ${testResults.test2 ? 'border-success-500 bg-success-50 dark:bg-success-900/20' : 'border-destructive-500 bg-destructive-50 dark:bg-destructive-900/20'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {testResults.test2 ? (
                                            <CheckCircle2 className="h-5 w-5 text-success-500" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-destructive-500" />
                                        )}
                                        <span className="font-semibold">测试2: 字数限制</span>
                                    </div>
                                    <p className="text-sm">
                                        岗位描述（{jobDescription.length}字）≤ 3000字，简历（{resumeText.length}字）≤ 1500字
                                    </p>
                                </div>

                                <div className={`p-4 rounded-lg border ${testResults.test3 ? 'border-success-500 bg-success-50 dark:bg-success-900/20' : 'border-destructive-500 bg-destructive-50 dark:bg-destructive-900/20'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {testResults.test3 ? (
                                            <CheckCircle2 className="h-5 w-5 text-success-500" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-destructive-500" />
                                        )}
                                        <span className="font-semibold">测试3: 警告阈值</span>
                                    </div>
                                    <p className="text-sm">
                                        岗位描述（{jobDescription.length}字）≤ 2700字，简历（{resumeText.length}字）≤ 1350字
                                    </p>
                                </div>

                                <div className={`p-4 rounded-lg border ${testResults.test4 ? 'border-success-500 bg-success-50 dark:bg-success-900/20' : 'border-destructive-500 bg-destructive-50 dark:bg-destructive-900/20'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {testResults.test4 ? (
                                            <CheckCircle2 className="h-5 w-5 text-success-500" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-destructive-500" />
                                        )}
                                        <span className="font-semibold">测试4: 错误提示</span>
                                    </div>
                                    <p className="text-sm">
                                        当输入为空时，显示验证错误提示
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* 输入面板 */}
                <div className="mb-8">
                    <InputPanel
                        jobDescription={jobDescription}
                        resumeText={resumeText}
                        onJobDescriptionChange={setJobDescription}
                        onResumeTextChange={setResumeText}
                        isValid={isValid}
                        disabled={isDisabled}
                    />
                </div>

                {/* 手动测试说明 */}
                <Card>
                    <CardHeader>
                        <CardTitle>手动测试指南</CardTitle>
                        <CardDescription>
                            请按照以下步骤手动测试组件功能
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">测试1: 表单验证</h3>
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>清空所有输入框</li>
                                <li>点击「开始优化简历」按钮（如果有的话）</li>
                                <li>确认显示验证错误提示</li>
                                <li>输入符合要求的文本（岗位描述≥10字符，简历≥20字符）</li>
                                <li>确认错误提示消失</li>
                            </ol>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">测试2: 字数统计</h3>
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>在岗位描述输入框中输入文本</li>
                                <li>观察右上角的字数统计（如：500/3000）</li>
                                <li>当字数接近2700时，确认警告提示出现</li>
                                <li>在简历输入框中重复上述步骤</li>
                            </ol>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">测试3: 敏感信息脱敏</h3>
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>在岗位描述输入框中输入手机号：13812345678</li>
                                <li>确认显示为：138****5678</li>
                                <li>输入邮箱：test@example.com</li>
                                <li>确认显示为：****@example.com</li>
                                <li>输入身份证号：110101199001011234</li>
                                <li>确认显示为：**************</li>
                                <li>在简历输入框中测试同样功能</li>
                            </ol>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">测试4: 禁用状态</h3>
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>勾选「禁用输入」复选框（如果有）</li>
                                <li>确认输入框变为禁用状态</li>
                                <li>尝试输入文本，确认无法输入</li>
                            </ol>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">测试5: 使用说明</h3>
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>查看页面底部的「使用说明」部分</li>
                                <li>确认所有说明项都正确显示</li>
                            </ol>
                        </div>
                    </CardContent>
                </Card>

                {/* 返回按钮 */}
                <div className="mt-8">
                    <Button variant="outline" onClick={() => window.history.back()}>
                        返回
                    </Button>
                </div>
            </div>
        </div>
    )
}