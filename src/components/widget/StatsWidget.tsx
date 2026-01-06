import { BlogStats } from '@/src/types/blog'
import React, { useState, useEffect } from 'react'
import { WidgetContainer } from './WidgetContainer'

// 硬编码的商家编号
const SHOP_CODE = "PRO-001A"

export const StatsWidget = ({ data }: { data: BlogStats }) => {
  const [showModal, setShowModal] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  
  // 确保客户端渲染，避免水合错误
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(SHOP_CODE)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  // 禁止背景滚动
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [showModal])

  return (
    <React.StrictMode>
      <WidgetContainer>
        
        {/* ================= 纯 CSS 实现的全屏弹窗 (无需 Portal) ================= */}
        {/* 使用 fixed inset-0 z-[9999] 强制覆盖全屏，不受父容器限制 */}
        {showModal && mounted && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* 1. 全屏遮罩：黑色半透明 + 强毛玻璃 */}
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in"
              onClick={() => setShowModal(fals
