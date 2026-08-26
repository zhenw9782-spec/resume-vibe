import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-background py-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-primary mb-4">使用帮助</h1>
                    <p className="text-xl text-muted-foreground">
                        了解如何使用 ResumeVibe 优化你的简历
                    </p>
                </div>

                <div className="space-y-6">
                    {/* 快速开始 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>快速开始</CardTitle>
                            <CardDescription>3 步完成简历优化</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ol className="space-y-4 text-foreground">
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
                                    <div>
                                        <p className="font-medium">粘贴岗位描述（JD）</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            在左侧输入框粘贴你目标岗位的职位描述，包含岗位要求、技能需求等信息。
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
                                    <div>
                                        <p className="font-medium">粘贴你的简历内容</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            在右侧输入框粘贴你的简历文本内容。系统会自动对手机号、邮箱等敏感信息进行脱敏处理。
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</span>
                                    <div>
                                        <p className="font-medium">点击「AI 开始分析与改写」</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            AI 将在 15-30 秒内完成分析，生成匹配度评分、缺失关键词、优化建议和改写后的简历。
                                        </p>
                                    </div>
                                </li>
                            </ol>
                            <div className="mt-6">
                                <Button asChild>
                                    <Link href="/analyze">开始优化简历</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 功能说明 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>功能说明</CardTitle>
                            <CardDescription>了解各项功能的作用</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div>
                                <h3 className="font-medium text-foreground mb-1">匹配度分析</h3>
                                <p className="text-sm text-muted-foreground">
                                    AI 会分析你的简历与目标岗位的匹配程度，给出 0-100 的匹配度分数和等级（高度匹配 / 中度匹配 / 低度匹配），
                                    帮助你直观了解简历的针对性。
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-foreground mb-1">缺失关键词</h3>
                                <p className="text-sm text-muted-foreground">
                                    系统会列出岗位描述中要求但你的简历未提及的关键技能和关键词，按重要性分为「关键」「重要」「可选」三个等级，
                                    并给出补充建议。
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-foreground mb-1">简历改写</h3>
                                <p className="text-sm text-muted-foreground">
                                    AI 会根据岗位要求对你的简历进行针对性改写，突出匹配的技能和经验，提升简历的竞争力。
                                    改写后的简历可以在对比视图中查看差异。
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-foreground mb-1">对比视图</h3>
                                <p className="text-sm text-muted-foreground">
                                    左右分栏对比原版和优化后的简历，支持查看修改说明、在线编辑改写后的内容、一键复制到剪贴板。
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-foreground mb-1">PDF 导出</h3>
                                <p className="text-sm text-muted-foreground">
                                    支持两种 PDF 模板：经典专业版（ATS 友好）和现代设计版（视觉优先）。
                                    文件名自动根据简历内容生成，格式为「姓名_岗位_优化简历.pdf」。
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 输入要求 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>输入要求</CardTitle>
                            <CardDescription>确保输入内容符合要求以获得最佳结果</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border rounded-lg p-4">
                                    <h3 className="font-medium text-foreground mb-2">岗位描述（JD）</h3>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>最少 10 个字符，最多 3000 个字符</li>
                                        <li>建议包含：岗位名称、技能要求、经验要求、学历要求</li>
                                        <li>内容越详细，分析结果越准确</li>
                                    </ul>
                                </div>
                                <div className="border rounded-lg p-4">
                                    <h3 className="font-medium text-foreground mb-2">简历内容</h3>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        <li>最少 20 个字符，最多 1500 个字符</li>
                                        <li>建议包含：个人信息、工作经历、教育背景、技能列表</li>
                                        <li>粘贴纯文本即可，无需特定格式</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 隐私与安全 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>隐私与安全</CardTitle>
                            <CardDescription>你的数据安全是我们的首要关注</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <p>
                                <strong className="text-foreground">敏感信息自动脱敏</strong>：手机号、邮箱、身份证号、银行卡号在输入时会自动脱敏显示，但完整数据仅用于 AI 分析，不会被存储。
                            </p>
                            <p>
                                <strong className="text-foreground">数据不被存储</strong>：你输入的岗位描述和简历内容不会被永久保存。分析完成后，数据仅在缓存中保留 5 分钟用于相同请求的快速响应，之后自动清除。
                            </p>
                            <p>
                                <strong className="text-foreground">服务端处理</strong>：所有 AI 分析均在服务端完成，API 密钥不会暴露给浏览器端。
                            </p>
                            <p>
                                更多详情请查看 <Link href="/privacy" className="text-primary hover:underline">隐私政策</Link>。
                            </p>
                        </CardContent>
                    </Card>

                    {/* 使用限制 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>使用限制</CardTitle>
                            <CardDescription>为保障服务质量，我们设置了以下限制</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="text-sm text-muted-foreground space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-warning-500 mt-0.5">•</span>
                                    <span><strong className="text-foreground">请求频率限制</strong>：每个 IP 每小时最多 12 次分析请求</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-warning-500 mt-0.5">•</span>
                                    <span><strong className="text-foreground">提交冷却时间</strong>：两次提交之间需间隔 1 分钟</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-warning-500 mt-0.5">•</span>
                                    <span><strong className="text-foreground">字数限制</strong>：岗位描述不超过 3000 字，简历不超过 1500 字</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* 常见问题 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>常见问题</CardTitle>
                            <CardDescription>遇到问题时请先查看以下内容</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-medium text-foreground">AI 分析失败或报错怎么办？</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    请检查网络连接是否正常，然后重试。如果持续失败，可能是服务暂时繁忙，请稍后再试。
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-foreground">分析结果不够准确怎么办？</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    尝试提供更详细的岗位描述（包含具体技能要求和经验要求），以及更完整的简历内容（包含具体的工作成果和项目经验）。
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-foreground">PDF 下载后打不开？</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    确保使用现代浏览器（Chrome、Firefox、Edge、Safari）访问。如果仍有问题，可尝试切换到另一种 PDF 模板重新生成。
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-foreground">显示「请求过于频繁」？</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    你已达到每小时 12 次的使用上限，请等待 1 小时后再试。相同内容的重复提交会使用缓存结果，不会消耗额度。
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-foreground">语义相似度显示「本地降级」？</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    这是正常现象。语义相似度的高级分析需要额外的 AI 服务支持，当前使用本地算法进行计算，功能完全正常。
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 联系我们 */}
                    <Card>
                        <CardHeader>
                            <CardTitle>联系我们</CardTitle>
                            <CardDescription>还有其他问题？</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                如果以上内容未能解决你的问题，请通过邮箱联系我们：
                                <a href="823760612@qq.com" className="text-primary hover:underline">hello@resumevibe.com</a>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
