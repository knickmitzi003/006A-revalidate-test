import { BlogStats } from '@/src/types/blog'
import React, { useState, useEffect, memo } from 'react'
// @ts-ignore
import { createPortal } from 'react-dom'

// 硬编码配置
const SHOP_CODE = "PRO-001A"
const PLATFORM_URL = "https://pro-plus.top"
const ONE_STOP_URL = "https://login.1zs.top/"

/**
 * 提取 Modal 组件以保持清晰
 */
const MemberModal = ({ isOpen, onClose, isCopied, onCopy }: { 
  isOpen: boolean, 
  onClose: () => void, 
  isCopied: boolean, 
  onCopy: () => void 
}) => {
  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      {/* 遮罩层 - 增强毛玻璃 */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-500 ease-in-out"
        onClick={onClose}
      />
      
      {/* 弹窗主体 */}
      <div className="relative z-10 w-full max-w-[320px] overflow-hidden rounded-[32px] 
        bg-[#1c1c1e]/90 backdrop-blur-2xl border border-white/10 
        shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] animate-modal-in">
        
        {/* 顶部装饰条 */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="p-8 text-center flex flex-col items-center">
          {/* 标题 */}
          <div className="mb-2 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
            </span>
            <h3 className="text-xl font-bold text-white tracking-wide">永久会员方案</h3>
          </div>
          
          <p className="text-xs text-gray-400 mb-8 font-medium leading-relaxed px-2">
            请联系右下角客服发送站点编号<br/>完成注册及授权
          </p>
          
          {/* 复制卡片 */}
          <div 
            onClick={onCopy}
            className="group relative cursor-pointer w-full mb-8 p-5 rounded-2xl transition-all duration-300
              bg-white/[0.03] border border-white/10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)] 
              hover:bg-white/[0.06] active:scale-[0.98]"
          >
            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1 font-bold">Shop Code</div>
            <span className="text-3xl font-mono font-black text-white tracking-tighter block">
              {SHOP_CODE}
            </span>
            
            {/* 复制成功提示层 */}
            <div className={`
              absolute inset-0 flex items-center justify-center rounded-2xl 
              bg-blue-600/95 backdrop-blur-sm transition-all duration-300 
              ${isCopied ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}
            `}>
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                已复制到剪贴板
              </span>
            </div>
          </div>

          <button
            type="button"
            className="w-full py-3.5 rounded-xl text-sm font-bold text-black 
              bg-white hover:bg-gray-100 active:scale-[0.96] transition-all duration-200"
            onClick={onClose}
          >
            我已了解
          </button>

          {/* 底部链接 */}
          <div className="mt-6 flex flex-col items-center gap-1">
             <p className="text-[10px] text-gray-500/60 font-medium tracking-wide">
              PRO+ 寄售平台技术支持
            </p>
            <a 
              href={PLATFORM_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] text-blue-400/80 hover:text-blue-300 transition-colors underline decoration-blue-500/20 underline-offset-4"
            >
              {PLATFORM_URL.replace('https://', '')}
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

export const StatsWidget = ({ data }: { data: BlogStats }) => {
  const [showModal, setShowModal] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(SHOP_CODE)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  // 锁定滚动
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [showModal])

  return (
    <div className="relative w-full">
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(150%) skewX(-20deg); }
        }
        @keyframes borderFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes modal-in {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); filter: blur(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        .animate-shimmer { animation: shimmer 2s infinite linear; }
        .animate-border-flow { background-size: 200% 200%; animation: borderFlow 4s ease infinite; }
        .animate-modal-in { animation: modal-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {mounted && (
        <MemberModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          isCopied={isCopied} 
          onCopy={handleCopy}
        />
      )}

      {/* 主卡片容器 */}
      <div className="relative group/card transition-all duration-500 ease-out hover:translate-y-[-2px]">
        {/* 动态彩虹边框 */}
        <div className="absolute -inset-[1px] rounded-[24px] bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover/card:opacity-100 blur-[2px] transition-opacity duration-700 animate-border-flow"></div>
        
        <div className="relative overflow-hidden rounded-[23px] border border-white/10 shadow-2xl bg-[#09090b]/90 backdrop-blur-3xl px-5 py-6 flex flex-col gap-5">
          
          {/* 装饰性背景 */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl pointer-events-none group-hover/card:bg-blue-500/30 transition-all duration-700"></div>

          {/* 标题区域 */}
          <div className="relative flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">Service Plan</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight antialiased">
              会员服务
            </h2>
          </div>

          {/* 按钮区域 */}
          <div className="flex flex-col gap-3 relative z-10"> 
            <button 
              onClick={() => setShowModal(true)} 
              className="group/btn relative w-full h-11 rounded-xl overflow-hidden
                bg-white text-black text-[13px] font-extrabold tracking-tight transition-all duration-300
                hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-[0.97]"
            >
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                👑 会员价格
              </span>
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover/btn:animate-shimmer z-0"></div>
            </button>

            <button 
              onClick={() => window.open(ONE_STOP_URL, '_blank')} 
              className="group/btn relative w-full h-11 rounded-xl overflow-hidden
                bg-gradient-to-br from-red-600 to-red-700 text-white text-[13px] font-extrabold tracking-tight
                border border-white/10 shadow-[0_4px_12px_rgba(220,38,38,0.3)] transition-all duration-300
                hover:from-red-500 hover:to-red-600 active:scale-[0.97]" 
            </button>
          </div>

          {/* 补充信息：可以显示一点统计数据，呼应 StatsWidget 的名字 */}
          <div className="pt-2 border-t border-white/5 flex justify-between items-center px-1">
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Status</span>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
                正常运行
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Posts</span>
              <span className="text-[10px] text-gray-300 font-medium">{data?.postCount || 0} 篇文章</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default memo(StatsWidget)
