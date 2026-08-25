'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { CompareView } from '@/src/components/CompareView/CompareView'

export default function CompareViewTestPage() {
    const [originalResume, setOriginalResume] = useState(`个人简历

工作经历：
2020-2022 ABC公司 前端开发工程师
- 熟悉JavaScript、HTML、CSS
- 了解React基础
- 使用过jQuery进行开发
- 参与公司内部管理系统开发

2022-至今 XYZ公司 前端开发工程师
- 使用React进行项目开发
- 了解Vue.js基础
- 参与移动端H5页面开发
- 使用Git进行版本控制

技能清单：
- JavaScript、HTML、CSS
- React基础
- jQuery
- Git基础`)

    const [rewrittenResume, setRewrittenResume] = useState(`个人简历

工作经历：
2020-2022 ABC公司 前端开发工程师
- 精通JavaScript、HTML5、CSS3，熟悉ES6+特性
- 熟练使用React进行单页应用开发，掌握Hooks和Context API
- 使用jQuery开发企业级管理系统，优化页面性能
- 主导前端架构设计，提升开发效率30%

2022-至今 XYZ公司 高级前端开发工程师
- 使用React+TypeScript开发复杂业务组件，提升代码质量
- 掌握Vue.js全家桶，参与多个项目的前端开发
- 负责移动端H5页面开发，优化用户体验和性能
- 建立Git工作流规范，提升团队协作效率

技术栈：
- 精通：JavaScript/TypeScript、React、HTML5、CSS3
- 熟练：Vue.js、Webpack、Git
- 了解：Node.js、Docker`)

    const [explanation, setExplanation] = useState(`本次优化主要针对以下几个方面：

1. 技能描述优化：将"熟悉"升级为"精通/熟练"，增加具体技术点
2. 项目经验量化：添加具体成果和数据，如"提升开发效率30%"
3. 技术栈整理：按熟练度分类，突出核心技术栈
4. 职位名称优化：从"前端开发工程师"升级为"高级前端开发工程师"
5. 增加技术深度：补充TypeScript、Hooks等现代React特性`)

    const [summary, setSummary] = useState([
        '优化技能描述，从"熟悉"升级为"精通/熟练"',
        '添加项目成果数据，提升说服力',
        '整理技术栈分类，突出核心技能',
        '升级职位名称，体现职业发展',
        '补充现代前端技术栈，如TypeScript、Hooks'
    ])

    const [modificationDetails, setModificationDetails] = useState([
        {
            type: 'modification' as const,
            location: '工作经历 - 技能描述',
            before: '熟悉JavaScript、HTML、CSS',
            after: '精通JavaScript、HTML5、CSS3，熟悉ES6+特性',
            reason: '升级技能描述，突出技术深度'
        },
        {
            type: 'addition' as const,
            location: '工作经历 - 项目成果',
            after: '主导前端架构设计，提升开发效率30%',
            reason: '添加量化成果，提升说服力'
        },
        {
            type: 'modification' as const,
            location: '职位名称',
            before: '前端开发工程师',
            after: '高级前端开发工程师',
            reason: '体现职业发展和技术能力'
        },
        {
            type: 'addition' as const,
            location: '技术栈分类',
            after: '精通：JavaScript/TypeScript、React、HTML5、CSS3\n熟练：Vue.js、Webpack、Git\n了解：Node.js、Docker',
            reason: '整理技术栈，按熟练度分类'
        }
    ])

    const [isExpanded, setIsExpanded] = useState(false)
    const [showExplanation, setShowExplanation] = useState(false)

    const handleToggleExpand = () => {
        setIsExpanded(!isExpanded)
    }

    const handleEditResume = (text: string) => {
        setRewrittenResume(text)
        alert('简历已更新！')
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">对比视图组件测试页面</h1>
                <p className="text-gray-600 text-lg">
                    测试CompareView组件的各种功能
                </p>
            </div>

            {/* 控制面板 */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>控制面板</CardTitle>
                    <CardDescription>调整组件参数进行测试</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">原版简历</label>
                            <Textarea
                                value={originalResume}
                                onChange={(e) => setOriginalResume(e.target.value)}
                                className="min-h-[150px]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">优化后简历</label>
                            <Textarea
                                value={rewrittenResume}
                                onChange={(e) => setRewrittenResume(e.target.value)}
                                className="min-h-[150px]"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">修改说明</label>
                        <Textarea
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            className="min-h-[80px]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">修改摘要（每行一条）</label>
                        <Textarea
                            value={summary.join('\n')}
                            onChange={(e) => setSummary(e.target.value.split('\n').filter(s => s.trim()))}
                            className="min-h-[80px]"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* 组件预览 */}
            <div className="mb-8">
                <CompareView
                    originalResume={originalResume}
                    rewrittenResume={rewrittenResume}
                    explanation={explanation}
                    summary={summary}
                    modificationDetails={modificationDetails}
                    isExpanded={isExpanded}
                    onToggleExpand={handleToggleExpand}
                    onEditResume={handleEditResume}
                />
            </div>

            {/* 测试用例 */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>测试用例</CardTitle>
                    <CardDescription>预设的测试场景</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Button
                            onClick={() => {
                                setIsExpanded(false)
                                setShowExplanation(false)
                            }}
                            variant="outline"
                        >
                            测试默认状态
                        </Button>
                        <Button
                            onClick={() => {
                                setIsExpanded(true)
                            }}
                            variant="outline"
                        >
                            测试展开状态
                        </Button>
                        <Button
                            onClick={() => {
                                setOriginalResume('')
                                setRewrittenResume('')
                                setExplanation('')
                                setSummary([])
                            }}
                            variant="outline"
                        >
                            测试空内容
                        </Button>
                        <Button
                            onClick={() => {
                                setShowExplanation(true)
                            }}
                            variant="outline"
                        >
                            测试显示说明
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* 测试说明 */}
            <Card>
                <CardHeader>
                    <CardTitle>测试说明</CardTitle>
                    <CardDescription>CompareView组件功能说明</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">组件功能</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                <li>左右分栏对比原版和改写后的简历</li>
                                <li>支持展开/收起视图</li>
                                <li>支持查看修改说明</li>
                                <li>支持查看详细修改逻辑</li>
                                <li>支持在线编辑改写后的简历</li>
                                <li>支持实时预览编辑内容</li>
                                <li>支持字数统计（最多1500字）</li>
                                <li>支持重置到原始内容</li>
                                <li>支持一键复制优化后简历</li>
                                <li>支持显示修改摘要</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">视觉特性</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                <li>原版简历使用灰色背景</li>
                                <li>优化后简历使用绿色背景</li>
                                <li>修改说明使用蓝色背景</li>
                                <li>支持响应式布局</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">测试重点</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                <li>左右分栏显示是否正确</li>
                                <li>展开/收起功能是否正常</li>
                                <li>修改说明显示是否正确</li>
                                <li>详细修改逻辑显示是否正确</li>
                                <li>编辑功能是否正常</li>
                                <li>实时预览功能是否正常</li>
                                <li>字数统计是否准确</li>
                                <li>重置功能是否正常</li>
                                <li>一键复制功能是否正常</li>
                                <li>复制成功提示是否正确</li>
                                <li>修改摘要显示是否正确</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}