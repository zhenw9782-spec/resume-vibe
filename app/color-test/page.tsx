'use client'

import { useState } from 'react'

export default function ColorTestPage() {
    const [darkMode, setDarkMode] = useState(false)

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
            <div className="bg-background text-foreground min-h-screen p-8">
                {/* 顶部控制栏 */}
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-3xl font-bold">颜色方案测试</h1>
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                        {darkMode ? '切换到浅色模式' : '切换到深色模式'}
                    </button>
                </div>

                {/* 主要颜色测试 */}
                <div className="space-y-12">
                    {/* Primary 颜色 */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-6">Primary 颜色</h2>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="bg-primary text-primary-foreground p-6 rounded-lg text-center">
                                Primary Default
                            </div>
                            <div className="bg-primary-50 text-primary-900 p-6 rounded-lg text-center">
                                Primary 50
                            </div>
                            <div className="bg-primary-100 text-primary-900 p-6 rounded-lg text-center">
                                Primary 100
                            </div>
                            <div className="bg-primary-600 text-primary-foreground p-6 rounded-lg text-center">
                                Primary 600
                            </div>
                            <div className="bg-primary-900 text-primary-foreground p-6 rounded-lg text-center">
                                Primary 900
                            </div>
                        </div>
                    </section>

                    {/* Success 颜色 */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-6">Success 颜色</h2>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="bg-success text-success-foreground p-6 rounded-lg text-center">
                                Success Default
                            </div>
                            <div className="bg-success-50 text-success-900 p-6 rounded-lg text-center">
                                Success 50
                            </div>
                            <div className="bg-success-100 text-success-900 p-6 rounded-lg text-center">
                                Success 100
                            </div>
                            <div className="bg-success-500 text-success-foreground p-6 rounded-lg text-center">
                                Success 500
                            </div>
                            <div className="bg-success-900 text-success-foreground p-6 rounded-lg text-center">
                                Success 900
                            </div>
                        </div>
                    </section>

                    {/* Warning 颜色 */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-6">Warning 颜色</h2>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="bg-warning text-warning-foreground p-6 rounded-lg text-center">
                                Warning Default
                            </div>
                            <div className="bg-warning-50 text-warning-900 p-6 rounded-lg text-center">
                                Warning 50
                            </div>
                            <div className="bg-warning-100 text-warning-900 p-6 rounded-lg text-center">
                                Warning 100
                            </div>
                            <div className="bg-warning-500 text-warning-foreground p-6 rounded-lg text-center">
                                Warning 500
                            </div>
                            <div className="bg-warning-900 text-warning-foreground p-6 rounded-lg text-center">
                                Warning 900
                            </div>
                        </div>
                    </section>

                    {/* Error 颜色 */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-6">Error 颜色</h2>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="bg-destructive text-destructive-foreground p-6 rounded-lg text-center">
                                Error Default
                            </div>
                            <div className="bg-destructive-50 text-destructive-900 p-6 rounded-lg text-center">
                                Error 50
                            </div>
                            <div className="bg-destructive-100 text-destructive-900 p-6 rounded-lg text-center">
                                Error 100
                            </div>
                            <div className="bg-destructive-500 text-destructive-foreground p-6 rounded-lg text-center">
                                Error 500
                            </div>
                            <div className="bg-destructive-900 text-destructive-foreground p-6 rounded-lg text-center">
                                Error 900
                            </div>
                        </div>
                    </section>

                    {/* 组件样式测试 */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-6">组件样式测试</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">按钮样式</h3>
                                <div className="flex flex-wrap gap-4">
                                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                                        Primary Button
                                    </button>
                                    <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors">
                                        Secondary Button
                                    </button>
                                    <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive-90 transition-colors">
                                        Destructive Button
                                    </button>
                                    <button className="px-4 py-2 bg-success text-success-foreground rounded-md hover:bg-success-90 transition-colors">
                                        Success Button
                                    </button>
                                    <button className="px-4 py-2 bg-warning text-warning-foreground rounded-md hover:bg-warning-90 transition-colors">
                                        Warning Button
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">卡片样式</h3>
                                <div className="bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm">
                                    <h4 className="text-lg font-semibold mb-2">Card Title</h4>
                                    <p className="text-muted-foreground">This is a card component with proper styling.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 文本样式测试 */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-6">文本样式测试</h2>
                        <div className="space-y-4">
                            <p className="text-foreground">这是主要文本颜色</p>
                            <p className="text-muted-foreground">这是次要文本颜色</p>
                            <p className="text-primary-600">这是主色调文本颜色</p>
                            <p className="text-slate-600 dark:text-slate-300">这是次要色调文本颜色</p>
                            <p className="text-destructive-100 dark:text-red-400">这是错误文本颜色</p>
                            <p className="text-success-500 dark:text-emerald-400">这是成功文本颜色</p>
                            <p className="text-warning-600 dark:text-amber-400">这是警告文本颜色</p>
                        </div>
                    </section>

                    {/* 背景样式测试 */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-6">背景样式测试</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-background p-6 rounded-lg border border-border">
                                <p className="text-foreground">Background</p>
                            </div>
                            <div className="bg-card p-6 rounded-lg border border-border">
                                <p className="text-card-foreground">Card</p>
                            </div>
                            <div className="bg-popover p-6 rounded-lg border border-border">
                                <p className="text-popover-foreground">Popover</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* 底部信息 */}
                <div className="mt-16 p-8 bg-muted rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">测试说明</h3>
                    <ul className="space-y-2 text-muted-foreground">
                        <li>• 此页面用于测试所有颜色方案是否正确配置</li>
                        <li>• 点击右上角按钮可以切换浅色/深色模式</li>
                        <li>• 确保所有颜色在两种模式下都清晰可见</li>
                        <li>• 检查文本与背景的对比度是否足够</li>
                        <li>• 验证所有组件样式是否正确应用</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}