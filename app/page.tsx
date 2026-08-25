import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
    return (
        <main className="flex-1 flex flex-col">
            {/* Hero Section */}
            <section className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-success-50">
                <div className="container mx-auto px-4 py-16 md:py-24">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Logo */}
                        <div className="mb-8">
                            <h1 className="text-4xl md:text-6xl font-bold text-primary-600 mb-4">
                                ResumeVibe
                            </h1>
                            <p className="text-xl md:text-2xl text-gray-700 font-medium">
                                简历极速打磨专家
                            </p>
                        </div>

                        {/* CTA Button */}
                        <div className="mb-12">
                            <Button asChild size="lg" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
                                <Link href="/analyze">开始优化简历</Link>
                            </Button>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                                <div className="text-3xl mb-4 text-primary-600">🎯</div>
                                <h3 className="font-semibold text-gray-800 mb-3 text-lg">智能匹配</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    基于岗位JD自动匹配简历内容，精准识别关键词和技能要求
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                                <div className="text-3xl mb-4 text-success-600">⚡</div>
                                <h3 className="font-semibold text-gray-800 mb-3 text-lg">极速优化</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    AI驱动的简历改写，15-30秒完成，提升简历与岗位的匹配度
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                                <div className="text-3xl mb-4 text-warning-600">📊</div>
                                <h3 className="font-semibold text-gray-800 mb-3 text-lg">精准分析</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    匹配度评分和缺失关键词分析，提供详细的修改建议
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Additional Info Section */}
            <section className="bg-gray-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">为什么选择 ResumeVibe？</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="text-left">
                                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                                    <span className="text-primary-600 mr-2">✓</span>
                                    AI 专业优化
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    基于 GPT-4o 的先进AI技术，理解岗位需求，针对性优化简历内容
                                </p>
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                                    <span className="text-primary-600 mr-2">✓</span>
                                    实时反馈
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    即时查看匹配度评分和改进建议，无需等待长时间处理
                                </p>
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                                    <span className="text-primary-600 mr-2">✓</span>
                                    多种格式支持
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    支持PDF、Word等多种简历格式，智能解析提取内容
                                </p>
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                                    <span className="text-primary-600 mr-2">✓</span>
                                    隐私保护
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    严格的数据保护措施，确保您的个人信息安全
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}