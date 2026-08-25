'use client'

import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Shield, CheckCircle2 } from 'lucide-react'

interface PrivacyModalProps {
    isOpen: boolean
    onAccept: () => void
    onReset?: () => void
}

export function PrivacyModal({ isOpen, onAccept, onReset }: PrivacyModalProps) {
    return (
        // 如果希望用户必须点击“我已了解”才能关闭，可以在 DialogContent 上设置 prevent standard close
        <Dialog open={isOpen} onOpenChange={(open) => {
            // 如果用户通过按 Esc 或点击遮罩尝试关闭，直接触发同意或阻止
            if (!open) {
                onAccept()
            }
        }}>
            <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Shield className="h-5 w-5 text-primary" />
                        隐私声明
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        我们重视您的隐私和数据安全，请仔细阅读以下声明
                    </DialogDescription>
                </DialogHeader>

                {/* 增加 max-h 与 overflow-y-auto，防止小屏设备按钮被挤出屏幕 */}
                <div className="space-y-4 mt-4 overflow-y-auto max-h-[60vh] pr-2">
                    {/* 隐私声明内容 */}
                    <div className="space-y-3 text-sm text-muted-foreground">
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <strong className="text-foreground">数据收集说明：</strong>
                                我们仅收集您主动提供的岗位描述和简历内容，不会收集任何个人身份信息。
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <strong className="text-foreground">数据使用范围：</strong>
                                您提供的数据仅用于AI简历分析和优化，不会被用于其他任何目的。
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <strong className="text-foreground">数据安全措施：</strong>
                                我们采用加密技术保护您的数据，确保信息在传输和存储过程中的安全。
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <strong className="text-foreground">用户权利：</strong>
                                您有权随时删除您的数据，也可以选择不使用本服务。
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <strong className="text-foreground">联系方式：</strong>
                                如有任何隐私相关问题，请通过邮箱 privacy@resumevibe.com 联系我们。
                            </div>
                        </div>
                    </div>

                    {/* 使用说明 */}
                    <div className="bg-muted/50 p-3 rounded-lg text-sm">
                        <p className="text-muted-foreground">
                            <strong>使用说明：</strong>点击「我已了解」按钮后，您将可以正常使用本服务。
                            我们会记住您的选择，下次访问时不再显示此声明。
                        </p>
                    </div>
                </div>

                {/* 按钮区域 */}
                <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-2 border-t">
                    <Button
                        onClick={onAccept}
                        className="flex-1"
                        size="sm"
                    >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        我已了解
                    </Button>

                    {onReset && (
                        <Button
                            variant="outline"
                            onClick={onReset}
                            size="sm"
                            className="flex-1 sm:flex-none"
                        >
                            重置状态
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}