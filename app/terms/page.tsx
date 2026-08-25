import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const TERMS_ITEMS = [
    {
        title: "服务说明",
        content:
            "ResumeVibe 提供基于 AI 的简历分析与优化服务。用户需自行提供岗位描述和简历内容，服务结果仅供参考，不构成任何录用或求职保证。",
    },
    {
        title: "使用规范",
        content:
            "用户应确保提交内容不违反法律法规，不包含侵犯他人权益的信息。请勿提交真实的敏感个人信息用于测试。",
    },
    {
        title: "服务限制",
        content:
            "为保证服务质量，每位用户每小时有调用次数限制。如超过限制，将提示稍后重试。",
    },
    {
        title: "免责声明",
        content:
            "AI 生成的分析与优化建议可能存在不准确之处，用户在使用前应自行判断。我们对因使用本服务产生的任何直接或间接损失不承担责任。",
    },
    {
        title: "条款变更",
        content:
            "我们保留随时修改本使用条款的权利。重大变更将通过在网站发布通知的方式告知用户。",
    },
];

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background py-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-primary mb-4 flex items-center justify-center gap-2">
                        <FileText className="h-8 w-8" />
                        使用条款
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        请在使用本服务前仔细阅读以下条款
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>使用条款</CardTitle>
                        <CardDescription>
                            最后更新：2026 年 8 月
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {TERMS_ITEMS.map((item, index) => (
                                <div key={item.title}>
                                    <h3 className="font-semibold text-foreground mb-2">
                                        {index + 1}. {item.title}
                                    </h3>
                                    <p className="text-foreground/80 leading-relaxed">{item.content}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
