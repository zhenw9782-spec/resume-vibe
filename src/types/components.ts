/**
 * ResumeVibe 组件类型定义文件
 * 包含组件Props和事件类型
 */

/**
 * InputPanel 组件 Props
 */
export interface InputPanelProps {
    /**
     * 岗位描述文本
     */
    jobDescription: string

    /**
     * 简历文本
     */
    resumeText: string

    /**
     * 岗位描述字数限制
     */
    jobDescriptionMaxChars?: number

    /**
     * 简历字数限制
     */
    resumeMaxChars?: number

    /**
     * 岗位描述字数变化回调
     */
    onJobDescriptionChange?: (text: string, count: number) => void

    /**
     * 简历字数变化回调
     */
    onResumeTextChange?: (text: string, count: number) => void

    /**
     * 表单验证状态
     */
    isValid?: boolean

    /**
     * 是否禁用
     */
    disabled?: boolean
}

/**
 * AnalysisResult 组件 Props
 */
export interface AnalysisResultProps {
    /**
     * 匹配度分数
     */
    matchScore: number

    /**
     * 缺失关键词列表
     */
    missingKeywords: string[]

    /**
     * 简历优化建议
     */
    suggestions: string[]

    /**
     * 匹配度等级
     */
    level: 'low' | 'medium' | 'high'

    /**
     * 详细分析报告
     */
    report: string

    /**
     * 加载状态
     */
    isLoading?: boolean

    /**
     * 错误信息
     */
    error?: string
}

/**
 * CompareView 组件 Props
 */
export interface CompareViewProps {
    /**
     * 原版简历文本
     */
    originalResume: string

    /**
     * 改写后的简历文本
     */
    rewrittenResume: string

    /**
     * 修改说明
     */
    explanation: string

    /**
     * 修改内容摘要
     */
    summary: string[]

    /**
     * 是否展开
     */
    isExpanded?: boolean

    /**
     * 切换展开/收起回调
     */
    onToggleExpand?: () => void

    /**
     * 编辑改写后的简历回调
     */
    onEditResume?: (text: string) => void
}

/**
 * PDFPreview 组件 Props
 */
export interface PDFPreviewProps {
    /**
     * 简历文本
     */
    resumeText: string

    /**
     * PDF模板类型
     */
    template: 'classic' | 'modern'

    /**
     * 是否加载中
     */
    isLoading?: boolean

    /**
     * 错误信息
     */
    error?: string

    /**
     * 切换模板回调
     */
    onTemplateChange?: (template: 'classic' | 'modern') => void

    /**
     * 下载PDF回调
     */
    onDownload?: () => void

    /**
     * 文件名
     */
    fileName?: string
}

/**
 * Button 组件 Props（扩展）
 */
export interface ButtonProps {
    /**
     * 按钮类型
     */
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'

    /**
     * 按钮大小
     */
    size?: 'default' | 'sm' | 'lg' | 'icon'

    /**
     * 是否禁用
     */
    disabled?: boolean

    /**
     * 加载状态
     */
    isLoading?: boolean

    /**
     * 图标（可选）
     */
    icon?: React.ReactNode

    /**
     * 图标位置
     */
    iconPosition?: 'left' | 'right'
}

/**
 * Dialog 组件 Props（扩展）
 */
export interface DialogProps {
    /**
     * 对话框标题
     */
    title: string

    /**
     * 对话框描述
     */
    description?: string

    /**
     * 是否显示对话框
     */
    open?: boolean

    /**
     * 关闭对话框回调
     */
    onClose?: () => void

    /**
     * 是否禁用遮罩
     */
    disableOverlay?: boolean
}

/**
 * Badge 组件 Props（扩展）
 */
export interface BadgeProps {
    /**
     * 徽章变体
     */
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'

    /**
     * 徽章大小
     */
    size?: 'default' | 'sm' | 'lg'

    /**
     * 是否可点击
     */
    clickable?: boolean

    /**
     * 点击回调
     */
    onClick?: () => void
}

/**
 * Card 组件 Props（扩展）
 */
export interface CardProps {
    /**
     * 卡片标题
     */
    title?: string

    /**
     * 卡片描述
     */
    description?: string

    /**
     * 卡片内容
     */
    children: React.ReactNode

    /**
     * 卡片额外内容
     */
    footer?: React.ReactNode

    /**
     * 卡片样式变体
     */
    variant?: 'default' | 'bordered' | 'elevated'
}

/**
 * Input 组件 Props（扩展）
 */
export interface InputProps {
    /**
     * 输入类型
     */
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'

    /**
     * 占位符
     */
    placeholder?: string

    /**
     * 输入值
     */
    value?: string

    /**
     * 输入变化回调
     */
    onChange?: (value: string) => void

    /**
     * 键盘按下回调
     */
    onKeyDown?: (e: React.KeyboardEvent) => void

    /**
     * 是否禁用
     */
    disabled?: boolean

    /**
     * 最大长度
     */
    maxLength?: number

    /**
     * 最小长度
     */
    minLength?: number

    /**
     * 是否必填
     */
    required?: boolean
}

/**
 * Textarea 组件 Props（扩展）
 */
export interface TextareaProps {
    /**
     * 占位符
     */
    placeholder?: string

    /**
     * 输入值
     */
    value?: string

    /**
     * 输入变化回调
     */
    onChange?: (value: string) => void

    /**
     * 键盘按下回调
     */
    onKeyDown?: (e: React.KeyboardEvent) => void

    /**
     * 是否禁用
     */
    disabled?: boolean

    /**
     * 最小高度
     */
    minHeight?: string

    /**
     * 最大长度
     */
    maxLength?: number

    /**
     * 最小长度
     */
    minLength?: number

    /**
     * 是否必填
     */
    required?: boolean
}

/**
 * 组件事件类型
 */
export interface ComponentEvents {
    /**
     * 点击事件
     */
    onClick?: (e: React.MouseEvent) => void

    /**
     * 双击事件
     */
    onDoubleClick?: (e: React.MouseEvent) => void

    /**
     * 输入事件
     */
    onInput?: (e: React.InputEvent) => void

    /**
     * 变更事件
     */
    onChange?: (e: React.ChangeEvent) => void

    /**
     * 聚焦事件
     */
    onFocus?: (e: React.FocusEvent) => void

    /**
     * 失焦事件
     */
    onBlur?: (e: React.FocusEvent) => void

    /**
     * 键盘事件
     */
    onKeyDown?: (e: React.KeyboardEvent) => void

    /**
     * 键盘抬起事件
     */
    onKeyUp?: (e: React.KeyboardEvent) => void

    /**
     * 滚动事件
     */
    onScroll?: (e: React.UIEvent) => void

    /**
     * 拖拽事件
     */
    onDragOver?: (e: React.DragEvent) => void

    /**
     * 拖拽进入事件
     */
    onDragEnter?: (e: React.DragEvent) => void

    /**
     * 拖拽离开事件
     */
    onDragLeave?: (e: React.DragEvent) => void

    /**
     * 拖拽放下事件
     */
    onDrop?: (e: React.DragEvent) => void
}