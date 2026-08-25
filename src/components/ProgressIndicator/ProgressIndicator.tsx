'use client'

/**
 * 分析进度指示组件
 * 由父组件传入真实进度（progress）与当前阶段（stageKey），
 * 组件负责渲染进度条、阶段文案、已用时间与动态预估剩余时间
 */

import React, { useEffect, useState } from 'react'
import { Loader2, Timer } from 'lucide-react'

/**
 * 分析阶段配置
 * 语义分析与简历改写在后端并行执行，合并为一个阶段展示，避免出现永不点亮的徽章
 */
const STAGES = [
  { key: 'init', label: '初始化分析' },
  { key: 'keywords', label: '提取关键词' },
  { key: 'semantic', label: '语义匹配与简历改写' },
  { key: 'suggestions', label: '生成优化建议' },
  { key: 'done', label: '完成' },
]

/**
 * ProgressIndicator 组件 Props
 */
export interface ProgressIndicatorProps {
  /**
   * 当前进度（0-100），由父组件基于真实步骤推进
   */
  progress: number

  /**
   * 当前阶段 key（init / keywords / semantic / suggestions / done）
   */
  stageKey: string

  /**
   * 阶段自定义文案（可选，覆盖默认）
   */
  stageLabel?: string
}

/**
 * 格式化时间（秒 → "X分Y秒" 或 "Y秒"）
 */
function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  if (s < 60) return `${s} 秒`
  const m = Math.floor(s / 60)
  const rest = s % 60
  return rest > 0 ? `${m} 分 ${rest} 秒` : `${m} 分钟`
}

/**
 * 分析进度指示组件
 */
export function ProgressIndicator({ progress, stageKey, stageLabel }: ProgressIndicatorProps) {
  const [elapsedMs, setElapsedMs] = useState(0)

  // 已用时间计时
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedMs((prev) => prev + 1000)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const currentStage = STAGES.find((s) => s.key === stageKey) ?? STAGES[0]
  const label = stageLabel ?? currentStage.label
  const clamped = Math.min(100, Math.max(0, progress))

  const elapsedSec = elapsedMs / 1000

  const stageIndex = STAGES.findIndex((s) => s.key === stageKey)

  return (
    <div className="w-full max-w-lg">
      {/* 旋转图标 + 主文案 */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <p className="text-lg font-medium text-foreground">{label}...</p>
      </div>

      {/* 进度条 */}
      <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>

      {/* 百分比 + 已用时间 */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm font-semibold text-foreground">{clamped}%</span>
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <Timer className="h-3.5 w-3.5" />
          已用 {formatDuration(elapsedSec)}
        </span>
      </div>

      {/* 阶段步骤提示 */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {STAGES.slice(0, -1).map((stage, i) => (
          <span
            key={stage.key}
            className={`px-2 py-1 rounded-md text-xs transition-colors ${
              i <= stageIndex
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {stage.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default ProgressIndicator
