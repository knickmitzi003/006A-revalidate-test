import { BlogStats } from '@/src/types/blog'
import React, { useState, useEffect } from 'react'
// @ts-ignore
import { createPortal } from 'react-dom'
import { WidgetContainer } from './WidgetContainer'

// 硬编码商家编号
const SHOP_CODE = "PRO-001A"

export const StatsWidget = ({ data }: { data: BlogStats }) => {
  const [showModal, setShowModal] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(SHOP_CODE)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  // 弹窗组件 (Portal 挂载)
  const Modal = () => {
    if (!mounted) return null;

    // @ts-ignore
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* 自定义动画样式 */}
        <style jsx>{`
          @keyframes modalEnter {
            0% { opacity: 0; transform: scale(0.9); }
            100% { opacity: 1; transform: scale(1); }
          }
          .animate-modal-enter {
            animation: modalEnter 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>

        {/* 1. 全屏遮罩：平滑渐变 */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setShowModal(false)}
        ></div>
        
        {/* 2. 弹窗主体：iOS 风格 3D 毛玻璃 */}
        <div className="relative z-10 w-full max-w-[320px] overflow-hidden rounded-2xl animate-modal-enter
          bg-neutral-900/80 backdrop-blur-2xl 
          border border-white/10 
          shadow-2xl shadow-black/50"
        >
          {/* 顶部装饰条 */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <div className="p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-1 tracking-wide">
              当前商家编号
            </h3>
            <p className="text-xs text-gray-400 mb-6 font-medium">
              点击下方卡片即可复制
            </p>
            
            {/* 编号显示区域：立体浮雕毛玻璃 */}
            <div 
              onClick={handleCopy}
              className="group relative cursor-pointer my-6 p-4 rounded-xl transition-all duration-300
                bg-black/40 border border-white/5 
                shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.1)]
                hover:bg-black/60 hover:border-white/10"
            >
              <span className="text-3xl font-mono font-black text-white tracking-widest drop-shadow-md">
                {SHOP_CODE}
              </span>
              
              {/* 复制提示 Tag */}
              <div className={`
                absolute -top-3 right-0 left-0 mx-auto w-fit 
                px-2 py-0.5 rounded-full text-[10px] font-bold text-white
                transition-all duration-300 shad
