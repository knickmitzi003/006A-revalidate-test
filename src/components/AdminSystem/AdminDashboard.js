'use client';
import React, { useState, useEffect } from 'react';

// --- 1. 核心图标库 ---
const Icons = {
  Edit: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path></svg>,
  Trash: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Settings: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
};

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [siteTitle, setSiteTitle] = useState('PRO+');
  const [view, setView] = useState('list'); // 'list' or 'edit'
  const [currentPost, setCurrentPost] = useState(null);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/posts');
      const d = await r.json();
      if (d.success) setPosts(d.posts);
      
      const rConf = await fetch('/api/admin/config');
      const dConf = await rConf.json();
      if (dConf.success) setSiteTitle(dConf.siteInfo.title);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("确定删除这篇文章吗？")) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/post?id=${id}`, { method: 'DELETE' });
      const d = await r.json();
      if (d.success) fetchData();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (!mounted) return null;

  return (
    <div className="admin-root">
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-root { min-height: 100vh; background: #1a1a1a; color: #fff; font-family: sans-serif; padding: 40px 20px; }
        .container { max-width: 900px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .site-info { display: flex; align-items: center; gap: 15px; }
        .site-title { font-size: 28px; font-weight: 800; background: linear-gradient(to right, #fff, #888); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        
        /* 3D 按钮样式 */
        .btn-create { 
          position: relative; padding: 12px 30px; background: #adff2f; color: #000; 
          border-radius: 15px; font-weight: bold; cursor: pointer; border: none;
          transition: 0.3s; box-shadow: 0 4px 0 #76b31a; 
          display: flex; align-items: center; gap: 8px;
        }
        .btn-create:hover { transform: translateY(-2px); box-shadow: 0 6px 0 #76b31a; }
        .btn-create:active { transform: translateY(2px); box-shadow: 0 2px 0 #76b31a; }

        /* 文章卡片 - 毛玻璃 */
        .post-card { 
          background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px;
          padding: 24px; margin-bottom: 16px; display: flex; 
          justify-content: space-between; align-items: center;
          transition: 0.3s;
        }
        .post-card:hover { background: rgba(255, 255, 255, 0.08); border-color: #adff2f; }
        .post-title { font-size: 18px; font-weight: 600; margin-bottom: 6px; }
        .post-meta { font-size: 13px; color: #888; }
        
        .actions { display: flex; gap: 12px; }
        .icon-btn { 
          width: 40px; height: 40px; border-radius: 10px; display: flex; 
          align-items: center; justify-content: center; cursor: pointer; transition: 0.2s;
        }
        .btn-edit { color: #adff2f; background: rgba(173, 255, 47, 0.1); }
        .btn-edit:hover { background: #adff2f; color: #000; }
        .btn-delete { color: #ff4d4f; background: rgba(255, 77, 79, 0.1); }
        .btn-delete:hover { background: #ff4d4f; color: #fff; }

        /* 加载动画 */
        .loader { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(5px); z-index: 100; display: flex; align-items: center; justify-content: center; }
      `}} />

      {loading && <div className="loader">处理中...</div>}

      <div className="container">
        <header className="header">
          <div className="site-info">
            <div style={{width: 60, height: 60, borderRadius: '50%', border: '4px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30}}>Q</div>
            <h1 className="site-title">{siteTitle}</h1>
            <Icons.Settings />
          </div>
          <button className="btn-create" onClick={() => alert('新建功能开发中')}>
            <Icons.Plus /> 发布内容
          </button>
        </header>

        <main>
          {posts.length === 0 ? (
            <div style={{textAlign: 'center', padding: 100, color: '#666'}}>暂无文章数据</div>
          ) : (
            posts.map(p => (
              <div key={p.id} className="post-card">
                <div>
                  <div className="post-title">{p.title}</div>
                  <div className="post-meta">{p.date} · {p.status}</div>
                </div>
                <div className="actions">
                  <div className="icon-btn btn-edit" title="编辑"><Icons.Edit /></div>
                  <div className="icon-btn btn-delete" title="删除" onClick={() => handleDelete(p.id)}><Icons.Trash /></div>
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}