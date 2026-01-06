import { BlogStats } from '@/src/types/blog'
import React, { useState, useEffect } from 'react'
// @ts-ignore
import { createPortal } from 'react-dom'
import { WidgetContainer } from './WidgetContainer'

// 硬编码的商家编号
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

  // 禁止背景滚动
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [showModal])

  // --- 弹窗组件 (Portal 到 Body) ---
  const Modal = () => {
    if (!mounted) return null
    
    // @ts-ignore
    return createPortal(
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        {/* 1. 全屏遮罩：极深色毛玻璃，彻底盖住后面内容 */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
          onClick={() => setShowModal(false)}
        ></div>
        
        {/* 2. 弹窗卡片：精致的浮动面板 */}
        <div className="relative z-10 w-full max-w-[280px] transform overflow-hidden rounded-2xl bg-[#1c1c1e] p-6 text-center shadow-2xl transition-all border border-white/10 animate-fade-in-up">
          
          {/* 顶部光效 */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-80"></div>

          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 border border-white/10">
            <span className="text-xl">🏷️</span>
          </div>

          <h3 className="text-lg font-bold text-white mb-1 tracking-wide">
            商家编号
          </h3>
          <p className="text-xs text-gray-400 mb-5">
            点击下方卡片复制编号
          </p>
          
          {/* 编号显示区 (拟物凹陷感) */}
          <div 
            onClick={handleCopy}
            className="group relative cursor-pointer mb-5 p-3 bg-black/40 rounded-xl border border-white/5 shadow-inner hover:border-blue-500/50 transition-colors"
          >
            <span className="text-xl font-mono font-black text-white tracking-widest">
              {SHOP_CODE}
            </span>
            {/* 复制成功提示 */}
            <div className={`absolute inset-0 flex items-center justify-center rounded-xl bg-blue-600 transition-all duration-200 ${isCopied ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
              <span className="text-xs font-bold text-white">已复制 ✅</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full py-2.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-gray-200 transition-colors"
            onClick={() => setShowModal(false)}
          >
            关闭
          </button>
        </div>
      </div>,
      document.body // 👈 关键：挂载到 body，突破组件限制
    )
  }

  return (
    <React.StrictMode>
      {/* 渲染 Portal 弹窗 */}
      {showModal && <Modal />}

      {/* 
          外部容器：不再使用 WidgetContainer，
          而是手写一个 iOS 风格的磨砂玻璃容器 
      */}
      <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl group">
        
        {/* 1. 背景层：深色磨砂 + 氛围光 */}
        <div className="absolute inset-0 bg-[#151516]/60 backdrop-blur-2xl z-0"></div>
        {/* 氛围光斑 */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/20 rounded-full blur-[40px] pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-600/20 rounded-full blur-[40px] pointer-events-none"></div>

        {/* 2. 内容层 */}
        <div className="relative z-10 flex flex-col h-full justify-between p-6">
          
          {/* 上半部分：标题 + 手指 */}
          <div className="flex-1 flex flex-col items-center justify-center">
             <div className="flex items-center justify-center gap-2 mb-2">
               <h2 className="text-base font-bold text-white tracking-wide drop-shadow-md">
                 查看商家编号
               </h2>
               <span className="text-xl animate-bounce cursor-default filter drop-shadow-lg">
                 👇
               </span>
             </div>
             {/* 装饰短线 */}
             <div className="w-8 h-1 bg-white/20 rounded-full"></div>
          </div>

          {/* 下半部分：按钮组 (紧凑堆叠) */}
          <div className="flex flex-col gap-3 w-full mt-2"> 
              
              {/* 按钮 1：查看编号 (高亮白) */}
              <button 
                onClick={() => setShowModal(true)} 
                type="button" 
                className="w-full py-2 rounded-lg bg-white text-black text-xs font-bold shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:bg-gray-100 hover:scale-[1.02] active:scale-95 transition-all duration-200"
              >
                查看商家编号
              </button>

              {/* 按钮 2：前往一站式 (深红磨砂) */}
              <button 
                onClick={() => window.open('https://login.1zs.top/')} 
                type="button" 
                className="w-full py-2 rounded-lg bg-red-600/90 text-white text-xs font-bold border border-red-500/30 hover:bg-red-600 hover:scale-[1.02] active:scale-95 transition-all duration-200" 
              >
                前往一站式
              </button>

          </div>
        </div>
      </div>
    </React.StrictMode>
  )
}
