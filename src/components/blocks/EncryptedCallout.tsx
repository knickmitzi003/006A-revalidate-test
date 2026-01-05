import React, { useState, useEffect } from 'react'
import { Callout } from './BasicBlock'

export const EncryptedCallout = ({ block, children }: { block: any; children: any }) => {
  // 1. 获取内容与解析
  const richText = block.callout?.rich_text || [];
  const rawText = richText.map((t: any) => t.plain_text).join('') || '';
  const lockMatch = rawText.match(/^LOCK:\s*(.+)$/);
  const isLockedBlock = !!lockMatch;

  if (!isLockedBlock) {
    return <Callout block={block}>{children}</Callout>;
  }

  const correctPassword = lockMatch[1].trim();
  const [input, setInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(`unlocked-${block.id}`) === 'true') {
      setIsUnlocked(true);
    }
  }, [block.id]);

  const handleUnlock = () => {
    if (input === correctPassword) {
      setIsUnlocked(true);
      setError(false);
      localStorage.setItem(`unlocked-${block.id}`, 'true');
    } else {
      setError(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
         navigator.vibrate(200);
      }
    }
  };

  // --- 状态 A: 已解锁 ---
  if (isUnlocked) {
    const cleanBlock = {
      ...block,
      callout: { ...block.callout, rich_text: [] }
    };

    return (
      <div className="relative animate-fade-in group">
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <button 
             onClick={() => {
               localStorage.removeItem(`unlocked-${block.id}`);
               setIsUnlocked(false);
             }}
             className="text-xs bg-neutral-200 dark:bg-neutral-800/80 hover:bg-red-500 hover:text-white px-2 py-1 rounded-md text-neutral-500 backdrop-blur-sm transition-colors shadow-sm"
           >
             🔒 重新上锁
           </button>
        </div>
        <Callout block={cleanBlock}>{children}</Callout>
      </div>
    );
  }

  // --- 状态 B: 未解锁 (毛玻璃特效版) ---
  return (
    // 容器：使用 backdrop-blur 实现毛玻璃，bg-opacity 实现半透明
    <div className="relative my-8 overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 shadow-2xl bg-white/70 dark:bg-[#121212]/60 backdrop-blur-xl">
      
      {/* 🌟 背景装饰光斑 (现在位于毛玻璃下方，会产生漂亮的晕染效果) */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500/20 blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-500/20 blur-[80px] pointer-events-none"></div>

      <div className="relative z-10 py-12 px-8 flex flex-col items-center justify-center text-center select-none">
        
        <h3 className="font-extrabold text-2xl mb-3 bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 to-neutral-500 dark:from-white dark:to-neutral-300 drop-shadow-sm">
          受保护的内容
        </h3>
        
        <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-8 max-w-xs leading-relaxed font-medium">
          该区域包含加密的图片或文字，请输入访问密码以解锁查看。
        </p>
        
        <div className="w-full max-w-sm flex flex-col sm:flex-row gap-4 items-stretch">
          {/* ⌨️ 输入框：半透明背景 */}
          <input 
            type="password" 
            placeholder="请输入密码..."
            className={`
              flex-1 px-5 py-3 rounded-xl 
              text-neutral-900 dark:text-white
              bg-white/50 dark:bg-black/30
              border-2 transition-all duration-300 outline-none backdrop-blur-sm
              placeholder-neutral-500 dark:placeholder-neutral-500
              ${error 
                ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
                : 'border-white/50 dark:border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:bg-white/80 dark:hover:bg-black/50'
              }
            `}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if(error) setError(false);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
          />

          {/* 🚀 3D 立体按钮 */}
          <button 
            onClick={handleUnlock}
            className={`
              group relative px-6 py-3 rounded-xl font-bold text-white transition-all duration-100
              bg-blue-600/90 hover:bg-blue-500
              border-b-[4px] border-blue-800 hover:border-blue-700
              active:border-b-0 active:translate-y-[4px]
              shadow-lg shadow-blue-500/30 backdrop-blur-md
              flex items-center justify-center gap-2 whitespace-nowrap
            `}
          >
            <span>解锁</span>
            <svg 
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        {/* 错误提示 */}
        <div className={`
          mt-4 text-sm font-bold text-red-500 flex items-center gap-2 transition-all duration-300 bg-red-100/80 dark:bg-red-900/30 px-3 py-1 rounded-full backdrop-blur-sm
          ${error ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none h-0'}
        `}>
          <span>🚫 密码错误</span>
        </div>
      </div>
    </div>
  );
};
