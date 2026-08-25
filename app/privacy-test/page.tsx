'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PrivacyModal } from '@/src/components/PrivacyModal'
import { Shield, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react'

export default function PrivacyTestPage() {
    const [showModal, setShowModal] = useState(false)
    const [accepted, setAccepted] = useState(false)
    const [storedStatus, setStoredStatus] = useState<string | null>(null)
    const [testResults, setTestResults] = useState<Record<string, boolean>>({})

    // 检查localStorage中是否有接受记录
    useEffect(() => {
        const stored = localStorage.getItem('privacyAccepted')
        const hasAccepted = stored === 'true'
        setStoredStatus(stored)
        setAccepted(hasAccepted)
        setShowModal(!hasAccepted)
    }, [])

    // 处理用户接受隐私声明
    const handleAccept = () => {
        localStorage.setItem('privacyAccepted', 'true')
        setAccepted(true)
        setStoredStatus('true')
        setShowModal(false)
    }

    // 重置状态（用于测试）
    const handleReset = () => {
        localStorage.removeItem('privacyAccepted')
        setAccepted(false)
        setStoredStatus(null)
        setShowModal(true)
        setTestResults({})
    }

    // 运行测试
    const runTests = () => {
        const results: Record<string, boolean> = {}

        // 测试1: 首次访问时弹窗显示
        results.test1 = !accepted && showModal

        // 测试2: 接受后弹窗关闭
        results.test2 = accepted && !showModal

        // 测试3: 状态持久化
        const persisted = localStorage.getItem('privacyAccepted') === 'true'
        results.test3 = accepted === persisted

        // 测试4: 重置功能
        results.test4 = !accepted && showModal

        setTestResults(results)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                {/* 页面标题 */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                        隐私声明弹窗测试
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        测试隐私声明弹窗的显示、接受和状态持久化功能
                    </p>
                </div>

                {/* 测试控制面板 */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            测试控制
                        </CardTitle>
                        <CardDescription>
                            运行测试以验证隐私声明弹窗功能
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                        <Button onClick={runTests} className="flex-1">
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            运行所有测试
                        </Button>
                        <Button onClick={handleReset} variant="outline" className="flex-1">
                            <RotateCcw className="mr-2 h-4 w-4" />
                            重置状态
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
                                        <span className="font-semibold">测试1: 首次访问显示</span>
                                    </div>
                                    <p className="text-sm">
                                        首次访问时弹窗自动显示：{testResults.test1 ? '✅ 通过' : '❌ 失败'}
                                    </p>
                                </div>

                                <div className={`p-4 rounded-lg border ${testResults.test2 ? 'border-success-500 bg-success-50 dark:bg-success-900/20' : 'border-destructive-500 bg-destructive-50 dark:bg-destructive-900/20'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {testResults.test2 ? (
                                            <CheckCircle2 className="h-5 w-5 text-success-500" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-destructive-500" />
                                        )}
                                        <span className="font-semibold">测试2: 接受后关闭</span>
                                    </div>
                                    <p className="text-sm">
                                        用户接受后弹窗关闭：{testResults.test2 ? '✅ 通过' : '❌ 失败'}
                                    </p>
                                </div>

                                <div className={`p-4 rounded-lg border ${testResults.test3 ? 'border-success-500 bg-success-50 dark:bg-success-900/20' : 'border-destructive-500 bg-destructive-50 dark:bg-destructive-900/20'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {testResults.test3 ? (
                                            <CheckCircle2 className="h-5 w-5 text-success-500" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-destructive-500" />
                                        )}
                                        <span className="font-semibold">测试3: 状态持久化</span>
                                    </div>
                                    <p className="text-sm">
                                        状态持久化到localStorage：{testResults.test3 ? '✅ 通过' : '❌ 失败'}
                                    </p>
                                </div>

                                <div className={`p-4 rounded-lg border ${testResults.test4 ? 'border-success-500 bg-success-50 dark:bg-success-900/20' : 'border-destructive-500 bg-destructive-50 dark:bg-destructive-900/20'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {testResults.test4 ? (
                                            <CheckCircle2 className="h-5 w-5 text-success-500" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-destructive-500" />
                                        )}
                                        <span className="font-semibold">测试4: 重置功能</span>
                                    </div>
                                    <p className="text-sm">
                                        重置后弹窗再次显示：{testResults.test4 ? '✅ 通过' : '❌ 失败'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* 状态显示 */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>当前状态</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg border">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-semibold">接受状态：</span>
                                    <span className={`px-2 py-1 rounded text-sm ${accepted ? 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300' : 'bg-destructive-100 text-destructive-800 dark:bg-destructive-900/20 dark:text-destructive-300'}`}>
                                        {accepted ? '已接受' : '未接受'}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    localStorage中的状态：{storedStatus || '未设置'}
                                </p>
                            </div>

                            <div className="p-4 rounded-lg border">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-semibold">弹窗状态：</span>
                                    <span className={`px-2 py-1 rounded text-sm ${showModal ? 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300' : 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-300'}`}>
                                        {showModal ? '显示中' : '隐藏中'}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    当前是否显示弹窗：{showModal ? '是' : '否'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 隐私声明弹窗 */}
                <PrivacyModal
                    isOpen={showModal}
                    onAccept={handleAccept}
                    onReset={handleReset}
                />

                {/* 手动测试说明 */}
                <Card>
                    <CardHeader>
                        <CardTitle>手动测试指南</CardTitle>
                        <CardDescription>
                            请按照以下步骤手动测试隐私声明弹窗功能
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">测试1: 首次访问测试</h3>
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>清除浏览器localStorage（开发者工具 → Application → Storage）</li>
                                <li>刷新当前页面</li>
                                <li>确认隐私声明弹窗自动显示</li>
                                <li>点击「我已了解」按钮</li>
                                <li>确认弹窗关闭</li>
                            </ol>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">测试2: 状态持久化测试</h3>
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>刷新当前页面</li>
                                <li>确认弹窗不再显示</li>
                                <li>查看当前状态区域，确认「已接受」状态</li>
                                <li>查看localStorage，确认已保存接受状态</li>
                            </ol>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">测试3: 重置功能测试</h3>
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>点击「重置状态」按钮</li>
                                <li>确认弹窗再次显示</li>
                                <li>确认状态区域显示「未接受」</li>
                                <li>点击「我已了解」按钮</li>
                                <li>确认功能恢复正常</li>
                            </ol>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">测试4: 多页面测试</h3>
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>在隐私声明已接受的状态下</li>
                                <li>访问其他页面（如首页、分析页面）</li>
                                <li>确认隐私声明弹窗不再显示</li>
                                <li>返回测试页面，确认功能正常</li>
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