'use client'

import { useEffect, useState } from 'react'
import { PrivacyModal } from './PrivacyModal'

export function GlobalPrivacyModal() {
    const [showPrivacy, setShowPrivacy] = useState(false)

    // 页面加载时检查 localStorage
    useEffect(() => {
        const hasAccepted = localStorage.getItem('has_accepted_privacy')
        if (!hasAccepted) {
            setShowPrivacy(true)
        }
    }, [])

    // 点击“我已了解”
    const handleAccept = () => {
        localStorage.setItem('has_accepted_privacy', 'true')
        setShowPrivacy(false)
    }

    // 开发环境下的重置功能（可选）
    const handleReset = () => {
        localStorage.removeItem('has_accepted_privacy')
        setShowPrivacy(true)
    }

    return (
        <PrivacyModal
            isOpen={showPrivacy}
            onAccept={handleAccept}
            onReset={process.env.NODE_ENV === 'development' ? handleReset : undefined}
        />
    )
}