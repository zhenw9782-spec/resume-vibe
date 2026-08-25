'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info, AlertCircle } from 'lucide-react'
import { InputPanelProps } from '@/src/types/components'

// 表单验证Schema
const inputPanelSchema = z.object({
    jobDescription: z.string().min(10, '岗位描述至少需要10个字符').max(3000, '岗位描述不能超过3000个字符'),
    resumeText: z.string().min(20, '简历内容至少需要20个字符').max(1500, '简历内容不能超过1500个字符'),
})

type InputPanelFormValues = z.infer<typeof inputPanelSchema>

export function InputPanel({
    jobDescription = '',
    resumeText = '',
    onJobDescriptionChange,
    onResumeTextChange,
    disabled
}: InputPanelProps) {
    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = useForm<InputPanelFormValues>({
        resolver: zodResolver(inputPanelSchema),
        mode: 'onChange', // 实时触发校验与错误提示
        defaultValues: {
            jobDescription: jobDescription,
            resumeText: resumeText,
        },
    })

    // 当外部传入值改变时（例如测试页面的重置/自动填充按钮），同步到表单内部
    useEffect(() => {
        setValue('jobDescription', jobDescription, { shouldValidate: true })
    }, [jobDescription, setValue])

    useEffect(() => {
        setValue('resumeText', resumeText, { shouldValidate: true })
    }, [resumeText, setValue])

    // 监听表单值
    const jobDescriptionValue = watch('jobDescription', '')
    const resumeTextValue = watch('resumeText', '')

    // 字数统计
    const jobDescriptionCount = jobDescriptionValue.length
    const resumeTextCount = resumeTextValue.length

    // 警告阈值
    const jobDescriptionWarning = jobDescriptionCount > 2700
    const resumeTextWarning = resumeTextCount > 1350

    // 敏感信息脱敏函数（已修正正则匹配）
    const maskSensitiveInfo = (text: string): string => {
        if (!text) return text
        return text
            // 手机号
            .replace(/(1[3-9]\d)\d{4}(\d{4})/g, '$1****$2')
            // 邮箱
            .replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '****@$2')
            // 身份证号（18位或15位）
            .replace(/\b(\d{6})\d{8}(\d{3}[\dXx])\b/g, '$1********$2')
            // 银行卡号（16-19位）
            .replace(/\b\d{16,19}\b/g, '************')
    }

    // 绑定 register 并重写 onChange，兼顾 React Hook Form 和 脱敏逻辑
    const jobRegister = register('jobDescription')
    const resumeRegister = register('resumeText')

    const handleJobChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const maskedValue = maskSensitiveInfo(e.target.value)
        setValue('jobDescription', maskedValue, { shouldValidate: true })
        onJobDescriptionChange?.(maskedValue, maskedValue.length)
    }

    const handleResumeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const maskedValue = maskSensitiveInfo(e.target.value)
        setValue('resumeText', maskedValue, { shouldValidate: true })
        onResumeTextChange?.(maskedValue, maskedValue.length)
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl">输入面板</CardTitle>
                <CardDescription>
                    请输入岗位描述和简历内容，系统将自动分析并生成优化建议
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* 岗位描述输入框 */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor="jobDescription" className="text-sm font-medium leading-none">
                            岗位描述 <span className="text-destructive">*</span>
                        </label>
                        <Badge variant={jobDescriptionWarning ? "destructive" : "default"} className="text-xs">
                            {jobDescriptionCount}/3000
                        </Badge>
                    </div>
                    <Textarea
                        id="jobDescription"
                        placeholder="请粘贴岗位描述（JD），例如：高级前端开发工程师..."
                        className={`min-h-[200px] resize-y ${errors.jobDescription ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        {...jobRegister}
                        onChange={handleJobChange}
                        disabled={disabled}
                    />
                    {errors.jobDescription && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{errors.jobDescription.message}</AlertDescription>
                        </Alert>
                    )}
                    {jobDescriptionWarning && !errors.jobDescription && (
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription className="text-destructive">
                                岗位描述已接近字数上限，建议精简内容
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                {/* 分隔线 */}
                <div className="border-t" />

                {/* 简历文本输入框 */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor="resumeText" className="text-sm font-medium leading-none">
                            简历内容 <span className="text-destructive">*</span>
                        </label>
                        <Badge variant={resumeTextWarning ? "destructive" : "default"} className="text-xs">
                            {resumeTextCount}/1500
                        </Badge>
                    </div>
                    <Textarea
                        id="resumeText"
                        placeholder="请粘贴简历内容..."
                        className={`min-h-[200px] resize-y ${errors.resumeText ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        {...resumeRegister}
                        onChange={handleResumeChange}
                        disabled={disabled}
                    />
                    {errors.resumeText && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{errors.resumeText.message}</AlertDescription>
                        </Alert>
                    )}
                    {resumeTextWarning && !errors.resumeText && (
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription className="text-destructive">
                                简历内容已接近字数上限，建议精简内容
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                {/* 使用说明 */}
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        <div className="font-medium mb-1">使用说明：</div>
                        <ul className="list-disc list-inside text-sm space-y-1">
                            <li>岗位描述和简历内容均为必填项</li>
                            <li>岗位描述最多3000字，简历最多1500字</li>
                            <li>系统会自动脱敏手机号、邮箱、身份证等敏感信息</li>
                            <li>输入内容将用于AI分析，不会保存到服务器</li>
                        </ul>
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    )
}