import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ResponsiveTest() {
    return (
        <main className="flex-1 flex flex-col">
            {/* 响应式测试页面 */}
            <section className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-success-50 p-4">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        {/* 页面标题 */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl md:text-5xl font-bold text-primary-600 mb-4">
                                响应式设计测试
                            </h1>
                            <p className="text-xl text-gray-700">
                                测试不同屏幕尺寸下的显示效果
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                建议使用浏览器开发者工具的设备模拟功能进行测试
                            </p>
                        </div>

                        {/* 测试网格 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {/* 测试1: 导航栏响应式 */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="font-semibold text-gray-800 mb-4 text-lg">测试1: 导航栏响应式</h2>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">桌面端 (≥768px): 显示完整导航</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">移动端 (&lt;768px): 显示汉堡菜单</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">主题切换按钮: 在所有设备显示</span>
                                    </div>
                                </div>
                            </div>

                            {/* 测试2: 布局响应式 */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="font-semibold text-gray-800 mb-4 text-lg">测试2: 布局响应式</h2>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">单列布局: 移动端</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">双列布局: 平板端 (md:)</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">三列布局: 桌面端 (lg:)</span>
                                    </div>
                                </div>
                            </div>

                            {/* 测试3: 字体大小响应式 */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="font-semibold text-gray-800 mb-4 text-lg">测试3: 字体大小响应式</h2>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">小字体: 移动端</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">中等字体: 平板端</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">大字体: 桌面端</span>
                                    </div>
                                </div>
                            </div>

                            {/* 测试4: 间距响应式 */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="font-semibold text-gray-800 mb-4 text-lg">测试4: 间距响应式</h2>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">紧凑间距: 移动端</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">中等间距: 平板端</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">宽松间距: 桌面端</span>
                                    </div>
                                </div>
                            </div>

                            {/* 测试5: 深色模式切换 */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="font-semibold text-gray-800 mb-4 text-lg">测试5: 深色模式切换</h2>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">浅色模式: 点击月亮图标</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">深色模式: 点击太阳图标</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">系统偏好: 自动检测</span>
                                    </div>
                                </div>
                            </div>

                            {/* 测试6: 组件响应式 */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h2 className="font-semibold text-gray-800 mb-4 text-lg">测试6: 组件响应式</h2>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">按钮尺寸: sm, default, lg</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">卡片间距: 适应屏幕</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">输入框宽度: 全宽/自适应</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 实际测试区域 */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-12">
                            <h2 className="font-semibold text-gray-800 mb-4 text-lg">实际测试区域</h2>
                            <p className="text-sm text-gray-600 mb-4">
                                以下组件在不同屏幕尺寸下应该有正确的显示效果
                            </p>

                            {/* 响应式按钮 */}
                            <div className="mb-6">
                                <h3 className="font-medium text-gray-700 mb-2">响应式按钮</h3>
                                <div className="flex flex-wrap gap-3">
                                    <Button size="sm">小尺寸按钮</Button>
                                    <Button size="default">默认按钮</Button>
                                    <Button size="lg">大尺寸按钮</Button>
                                </div>
                            </div>

                            {/* 响应式卡片 */}
                            <div className="mb-6">
                                <h3 className="font-medium text-gray-700 mb-2">响应式卡片网格</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-primary-50 p-4 rounded-lg text-center">
                                        <div className="text-2xl mb-2">📱</div>
                                        <div className="font-medium text-sm">移动端</div>
                                    </div>
                                    <div className="bg-success-50 p-4 rounded-lg text-center">
                                        <div className="text-2xl mb-2">💻</div>
                                        <div className="font-medium text-sm">平板端</div>
                                    </div>
                                    <div className="bg-warning-50 p-4 rounded-lg text-center">
                                        <div className="text-2xl mb-2">🖥️</div>
                                        <div className="font-medium text-sm">桌面端</div>
                                    </div>
                                    <div className="bg-destructive-50 p-4 rounded-lg text-center">
                                        <div className="text-2xl mb-2">📺</div>
                                        <div className="font-medium text-sm">大屏端</div>
                                    </div>
                                </div>
                            </div>

                            {/* 响应式输入框 */}
                            <div className="mb-6">
                                <h3 className="font-medium text-gray-700 mb-2">响应式输入框</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                                            短输入框
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="短输入框 (100%宽度)"
                                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                                            长输入框 (占满宽度)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="长输入框 (占满宽度)"
                                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 响应式文本 */}
                            <div>
                                <h3 className="font-medium text-gray-700 mb-2">响应式文本</h3>
                                <div className="space-y-3">
                                    <p className="text-sm text-gray-600">
                                        小号文本 (text-sm) - 移动端
                                    </p>
                                    <p className="text-base text-gray-600">
                                        中号文本 (text-base) - 平板端
                                    </p>
                                    <p className="text-lg text-gray-600">
                                        大号文本 (text-lg) - 桌面端
                                    </p>
                                    <p className="text-xl text-gray-600">
                                        大大号文本 (text-xl) - 大屏端
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 测试说明 */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                            <h2 className="font-semibold text-blue-800 mb-4 text-lg">测试说明</h2>
                            <div className="space-y-3 text-sm text-blue-700">
                                <p>
                                    <strong>测试步骤：</strong>
                                </p>
                                <ol className="list-decimal list-inside space-y-2">
                                    <li>打开浏览器开发者工具（F12）</li>
                                    <li>点击设备模拟按钮（Ctrl+Shift+M 或 Cmd+Shift+M）</li>
                                    <li>选择不同的设备预设（iPhone, iPad, Desktop等）</li>
                                    <li>或者手动调整浏览器窗口宽度</li>
                                    <li>测试导航栏、布局、字体大小、间距等响应式效果</li>
                                    <li>测试深色模式切换功能</li>
                                    <li>检查所有组件在不同尺寸下的显示效果</li>
                                </ol>
                            </div>
                        </div>

                        {/* 返回按钮 */}
                        <div className="text-center">
                            <Button asChild size="lg">
                                <Link href="/">返回首页</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}