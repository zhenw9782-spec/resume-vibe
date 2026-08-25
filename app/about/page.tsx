import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background py-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-primary mb-4">关于我们</h1>
                    <p className="text-xl text-muted-foreground">
                        ResumeVibe - 简历极速打磨专家
                    </p>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>我们的使命</CardTitle>
                            <CardDescription>
                                帮助求职者快速提升简历与目标岗位的匹配度
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-foreground leading-relaxed">
                                ResumeVibe 致力于为求职者提供智能、高效的简历优化服务。
                                通过 AI 技术分析岗位描述与简历内容的匹配度，给出针对性的改进建议，
                                帮助用户在求职过程中脱颖而出。
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>核心功能</CardTitle>
                            <CardDescription>三大核心能力</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3 text-foreground">
                                <li className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span><strong>智能匹配</strong>：基于岗位 JD 自动分析简历匹配度，精准识别关键词与技能要求</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-success-500 mt-1">•</span>
                                    <span><strong>极速优化</strong>：AI 驱动的简历改写，15-30 秒完成，提升简历针对性</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-warning-500 mt-1">•</span>
                                    <span><strong>多格式导出</strong>：支持多种 PDF 模板，一键下载优化后的简历</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>联系我们</CardTitle>
                            <CardDescription>有任何问题欢迎与我们联系</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-foreground">
                                邮箱：<a href="mailto:hello@resumevibe.com" className="text-primary hover:underline">hello@resumevibe.com</a>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
