import { classNames } from '@/src/lib/util'
import { BlogStats } from '@/src/types/blog'
import React, { useState, useEffect } from 'react'
import { WidgetContainer } from './WidgetContainer'

// 硬编码的商家编号
const SHOP_CODE = "PRO-001A"

export const StatsWidget = ({ data }: { data: BlogStats }) => {
  const [showModal, setShowModal] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  // 复制功能
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
        
        {/* ================= 优雅的毛玻璃弹窗 (Modal) ================= */}
        {/* 移除了 Portal，直接使用 fixed 定位，效果一样且不需要 react-dom */}
        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in">
            {/* 1. 全屏遮罩：黑色半透明 + 强毛玻璃 */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
              onClick={() => setShowModal(false)}
            ></div>
            
            {/* 2. 弹窗主体：悬浮卡片 */}
            <div className="relative z-10 w-full max-w-sm transform overflow-hidden rounded-2xl bg-white/90 dark:bg-[#1a1a1a]/90 p-8 text-center shadow-2xl transition-all border border-white/20 dark:border-white/10 backdrop-blur-xl">
              
              {/* 图标装饰 */}
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <span className="text-2xl">🏷️</span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                当前商家编号
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                请复制下方编号以进行下一步操作
              </p>
              
              {/* 编号显示区域 (点击复制) */}
              <div 
                onClick={handleCopy}
                className="group relative cursor-pointer my-6 p-4 bg-gray-50 dark:bg-black/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <span className="text-3xl font-mono font-black text-gray-800 dark:text-gray-100 tracking-wider">
                  {SHOP_CODE}
                </span>
                {/* 复制提示气泡 */}
                <div className="absolute -top-3 right-4 bg-blue-600 text-white text-xs px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  {isCopied ? '已复制! ✅' : '点击复制'}
                </div>
              </div>

              {/* 关闭按钮 (简约风) */}
              <button
                type="button"
                className="w-full justify-center rounded-xl bg-gray-900 dark:bg-white px-4 py-3 text-sm font-bold text-white dark:text-black hover:opacity-90 transition-opacity"
                onClick={() => setShowModal(false)}
              >
                关闭
              </button>
            </div>
          </div>
        )}

        {/* ================= 组件主界面 (修复布局) ================= */}
        <div className="flex flex-col h-full p-6 justify-between">
          
          {/* 上半部分：视觉引导 */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-3 min-h-[100px]">
             <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 tracking-wide">
               查看商家编号
             </h2>
             {/* 动效手指 */}
             <div className="text-4xl animate-bounce pt-2 cursor-default select-none filter drop-shadow-md">
               👇
             </div>
          </div>

          {/* 下半部分：立体按钮组 */}
          <div className="flex flex-col gap-4 w-full mt-4"> 
              
              {/* 按钮 1：查看编号 (白灰渐变 + 3D立体) */}
              <button 
                onClick={() => setShowModal(true)} 
                type="button" 
                className="group relative w-full rounded-xl bg-gradient-to-b from-white to-gray-100 dark:from-gray-700 dark:to-gray-800 px-4 py-3 text-sm font-bold text-gray-800 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600 border-b-4 active:border-b-0 active:translate-y-1 transition-all"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>🔍</span>
                  <span>查看商家编号</span>
                </div>
              </button>

              {/* 按钮 2：前往一站式 (保持红色但增加立体感，保持风格统一) */}
              <button 
                onClick={() => window.open('https://login.1zs.top/')} 
                type="button" 
                className="group relative w-full rounded-xl bg-gradient-to-b from-red-500 to-red-600 px-4 py-3 text-sm font-bold text-white shadow-sm border border-red-600 border-b-4 active:border-b-0 active:translate-y-1 transition-all" 
              >
                <div className="flex items-center justify-center gap-2">
                  <span>🚀</span>
                  <span>前往一站式</span>
                </div>
              </button>

          </div>
        </div>
      </WidgetContainer>
    </React.StrictMode>
  )
}
