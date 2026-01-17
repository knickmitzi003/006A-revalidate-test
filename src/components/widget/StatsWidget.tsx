/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
// @ts-ignore
import { createPortal } from 'react-dom'

// 硬编码站长ID
const SHOP_CODE = "PRO-001A"

export const StatsWidget = ({ data }: { data: any }) => {
  const [showModal, setShowModal] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  // 1. 数据解析
  const post = data || {};
  
  // 🚫 移除封面读取逻辑，不再处理 cover
  
  const title = post.title || '暂无公告';
  const summary = post.summary || post.excerpt || '暂无详细内容...';
  const slug = post.slug ? `/post/${post.slug}` : null;

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(SHOP_CODE)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [showModal])

  // --- 💎 升级版弹窗组件 (高级质感) ---
  const Modal = () => {
    if (!mounted) return null
    // @ts-ignore
    return createPortal(
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        <style jsx>{`
          @keyframes modalEnter { 
            0% { opacity: 0; transform: scale(0.9) translateY(20px); filter: blur(10px); } 
            100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); } 
          }
          .animate-modal-enter { animation: modalEnter 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
          .glass-shine {
            background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.02) 100%);
          }
        `}</style>

        {/* 1. 遮罩层：加深黑色，突出主体 */}
        <div 
          className="absolute inset-0 bg-[#000000]/80 backdrop-blur-md transition-opacity duration-500"
          onClick={() => setShowModal(false)}
        ></div>
        
        {/* 2. 弹窗主体：全息玻璃质感 */}
        <div className="relative z-10 w-full max-w-[320px] rounded-[2rem] overflow-hidden animate-modal-enter shadow-[0_0_50px_-10px_rgba(124,58,237,0.3)]">
          
          {/* 背景构造 */}
          <div className="absolute inset-0 bg-[#121212]/90 backdrop-blur-3xl"></div>
          {/* 顶部微光 */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
          {/* 底部反光 */}
          <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          
          {/* 内容容器 */}
          <div className="relative p-8 flex flex-col items-center glass-shine">
            
            {/* 图标：使用发光背景 */}
            <div className="mb-5 w-14 h-14 rounded-full bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center border border-white/10 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <span className="text-2xl">🆔</span>
            </div>

            <h3 className="text-xl font-extrabold text-white mb-2 tracking-wide text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
              站长身份码
            </h3>
            <p className="text-xs text-gray-400 mb-8 text-center leading-relaxed font-medium">
              点击下方卡片即可一键复制<br/>用于身份验证或联系
            </p>
            
            {/* 编号显示区：增加凹陷感和内发光 */}
            <div 
              onClick={handleCopy}
              className="group relative w-full cursor-pointer mb-8 p-4 bg-black/40 rounded-2xl border border-white/5 
                shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] 
                hover:border-purple-500/30 hover:shadow-[inset_0_2px_20px_rgba(139,92,246,0.1)] 
                transition-all duration-300"
            >
              <div className="text-center">
                <span className="text-2xl font-mono font-black text-gray-200 tracking-[0.15em] group-hover:text-white transition-colors">
                  {SHOP_CODE}
                </span>
              </div>
              
              {/* 复制反馈遮罩 */}
              <div className={`
                absolute inset-0 flex items-center justify-center rounded-2xl 
                bg-purple-600/90 backdrop-blur-sm
                transition-all duration-300 
                ${isCopied ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}
              `}>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  复制成功
                </span>
              </div>
            </div>

            {/* 底部按钮 */}
            <button
              type="button"
              className="w-full py-3 rounded-xl bg-white text-black text-xs font-bold tracking-wide hover:bg-gray-200 active:scale-95 transition-all shadow-lg"
              onClick={() => setShowModal(false)}
            >
              关闭窗口
            </button>

          </div>
        </div>
      </div>,
      document.body
    )
  }

  // --- 动态渲染标签 ---
  // @ts-ignore
  const Wrapper = slug ? Link : 'div';
  // @ts-ignore
  const wrapperProps = slug 
    ? { href: slug, className: "flex-1 flex flex-col justify-center group/text cursor-pointer relative z-20" } 
    : { className: "flex-1 flex flex-col justify-center relative z-20 opacity-80" };

  return (
    <React.StrictMode>
      <style jsx global>{`
        @keyframes borderFlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-border-flow { background-size: 200% 200%; animation: borderFlow 3s ease infinite; }
      `}</style>

      {showModal && <Modal />}

      <div className="relative h-full w-full group/card transition-transform duration-500 ease-out hover:scale-[1.015]">
        
        {/* 流光边缘 */}
        <div className="absolute -inset-[1px] rounded-[26px] bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-0 group-hover/card:opacity-70 blur-sm transition-opacity duration-500 animate-border-flow"></div>

        {/* 主体容器 */}
        <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-[#151516] flex flex-col">
          
          {/* ================= 背景图层 (纯色流光版) ================= */}
          {/* 🚫 移除了图片逻辑，强制使用 CSS 背景 */}
          <div className="absolute inset-0 z-0">
             {/* 深邃背景 */}
             <div className="w-full h-full bg-gradient-to-br from-[#2e1065] via-[#1e1b4b] to-black">
                 {/* 动态光斑装饰 - 增加右上角紫色光晕 */}
                 <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-purple-600/20 rounded-full blur-[80px]"></div>
                 {/* 动态光斑装饰 - 增加左下角蓝色光晕 */}
                 <div className="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[60px]"></div>
             </div>
             
             {/* 纹理遮罩，增加质感 */}
             <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'}}></div>
             
             {/* 底部黑色渐变，保证文字清晰 */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          </div>

          {/* ================= 内容层 ================= */}
          <div className="relative z-10 flex flex-col h-full justify-between p-5 md:p-6">
            
            {/* 上半部分：公告内容 */}
            {/* @ts-ignore */}
            <Wrapper {...wrapperProps}>
               <div className="mb-2 flex items-center gap-1.5 opacity-90">
                 <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                 <span className="text-[10px] font-bold text-white/80 tracking-widest uppercase">公告</span>
               </div>

               <h2 className="text-xl md:text-2xl font-extrabold text-white leading-tight tracking-tight mb-2 group-hover/text:text-purple-300 transition-colors line-clamp-2 drop-shadow-md">
                 {title}
               </h2>

               <p className="text-xs text-gray-300/90 font-medium line-clamp-2 leading-relaxed">
                 {summary}
               </p>
            </Wrapper>

            {/* 下半部分：站长 ID 按钮 */}
            <div className="w-full mt-4 relative z-20">
              <button 
                onClick={(e) => {
                  e.preventDefault(); 
                  e.stopPropagation();
                  setShowModal(true);
                }} 
                type="button" 
                className="w-full h-9 rounded-xl flex items-center justify-center gap-2
                  bg-white/10 backdrop-blur-md border border-white/10
                  text-xs font-bold text-white tracking-wide
                  transition-all duration-300
                  hover:bg-white/20 hover:scale-[1.02] active:scale-95 active:bg-white/5
                  shadow-lg"
              >
                <span className="text-sm">🆔</span>
                <span>站长 ID</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </React.StrictMode>
  )
}
