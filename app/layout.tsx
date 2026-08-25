import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Header from "@/components/Header";
import { GlobalPrivacyModal } from "@/src/components/GlobalPrivacyModal"; // 1. 导入全局隐私弹窗包裹组件

export const metadata: Metadata = {
    title: "ResumeVibe - 简历极速打磨专家",
    description: "智能匹配岗位要求，一键优化简历内容，提升面试通过率",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="zh">
            <body className="antialiased min-h-screen flex flex-col bg-background">
                {/* 导航栏组件 */}
                <Header />

                {/* 主要内容区域 */}
                <main className="flex-1">
                    {children}
                </main>

                {/* 全局挂载隐私弹窗 */}
                <GlobalPrivacyModal />

                {/* 页脚 */}
                <footer className="border-t">
                    <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
                        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                                © 2026 ResumeVibe. 保留所有权利。
                            </p>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Link
                                href="/privacy"
                                className="text-xs text-muted-foreground hover:text-foreground"
                            >
                                隐私政策
                            </Link>
                            <span className="text-muted-foreground">•</span>
                            <Link
                                href="/terms"
                                className="text-xs text-muted-foreground hover:text-foreground"
                            >
                                使用条款
                            </Link>
                        </div>
                    </div>
                </footer>
            </body>
        </html>
    );
}