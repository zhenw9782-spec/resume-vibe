import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Shield } from "lucide-react";

const PRIVACY_ITEMS = [
    {
        title: "数据收集说明",
        content: "我们仅收集您主动提供的岗位描述和简历内容，不会收集任何个人身份信息。",
    },
    {
        title: "数据使用范围",
        content: "您提供的数据仅用于AI简历分析和优化，不会被用于其他任何目的。",
    },
    {
        title: "数据安全措施",
        content: "我们采用加密技术保护您的数据，确保信息在传输和存储过程中的安全。",
    },
    {
        title: "用户权利",
        content: "您有权随时删除您的数据，也可以选择不使用本服务。",
    },
    {
        title: "联系方式",
        content: "如有任何隐私相关问题，请通过邮箱 privacy@resumevibe.com 联系我们。",
    },
];

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background py-16">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-primary mb-4 flex items-center justify-center gap-2">
                        <Shield className="h-8 w-8" />
                        隐私政策
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        我们重视您的隐私和数据安全
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>隐私声明</CardTitle>
                        <CardDescription>
                            最后更新：2026 年 8 月
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {PRIVACY_ITEMS.map((item) => (
                                <div key={item.title} className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-success-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <strong className="text-foreground">{item.title}：</strong>
                                        <span className="text-foreground/80">{item.content}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
