'use client';
import React, { useState, useEffect } from 'react';

// --- 图标组件 (保持不变) ---
const Icons = {
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  Edit: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path></svg>,
  Trash: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Settings: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  ArrowUp: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>,
  ArrowDown: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>,
  ChevronDown: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>,
  Tutorial: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
};

const GlobalStyle = () => (
  <style dangerouslySetInnerHTML={{__html: `
    body { background-color: #303030; color: #ffffff; margin: 0; font-family: system-ui, sans-serif; }
    .admin-container { padding: 40px 20px; min-height: 100vh; }
    .card-item { background: #424242; border-radius: 12px; margin-bottom: 12px; padding: 20px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #555; transition: 0.2s; }
    .card-item:hover { border-color: greenyellow; }
    .glow-input { width: 100%; padding: 12px; background: #18181c; border: 1px solid #444; border-radius: 8px; color: #fff; margin-bottom: 10px; }
    .glow-input:focus { border-color: greenyellow; outline: none; }
    .neo-btn { background: #333; color: #fff; border: 1px solid #555; padding: 8px 16px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 5px; }
    .neo-btn:hover { background: greenyellow; color: #000; }
    .block-card { background: #2a2a2e; border: 1px solid #333; border-radius: 10px; padding: 15px; margin-bottom: 10px; position: relative; }
    .block-del { position: absolute; right: 10px; top: 10px; color: #ff4d4f; cursor: pointer; }
    .loader { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  `}} />
);

// 工具函数
const cleanAndFormat = (input) => {
  if (!input) return "";
  try {
    return input.split('\n').map(line => {
      let raw = line.trim();
      if (!raw) return "";
      const mdMatch = raw.match(/(?:!|)?\[.*?\]\((.*?)\)/);
      if(mdMatch) raw = mdMatch[1];
      if (/\.(jpg|jpeg|png|gif|webp|bmp|svg|mp4|mov|webm|ogg|mkv)(\?|$)/i.test(raw)) return `![](${raw})`;
      return raw;
    }).filter(l=>l).join('\n');
  } catch (e) { return input; }
};

const BlockBuilder = ({ blocks, setBlocks }) => {
  const addBlock = (type) => setBlocks([...blocks, { id: Math.random(), type, content: '', pwd: '' }]);
  const updateBlock = (id, val, key='content') => { setBlocks(blocks.map(b => b.id === id ? { ...b, [key]: val } : b)); };
  const removeBlock = (id) => { setBlocks(blocks.filter(b => b.id !== id)); };
  
  return (
    <div style={{marginTop: 20}}>
      <div style={{display:'flex', gap:10, marginBottom:15}}>
        <button className="neo-btn" onClick={()=>addBlock('h1')}>H1</button>
        <button className="neo-btn" onClick={()=>addBlock('text')}>Text</button>
        <button className="neo-btn" onClick={()=>addBlock('note')}>Note</button>
        <button className="neo-btn" onClick={()=>addBlock('lock')}>Lock</button>
      </div>
      {blocks.map((b) => (
        <div key={b.id} className="block-card">
          <div style={{color:'greenyellow', fontSize:11, marginBottom:5}}>{b.type.toUpperCase()}</div>
          {b.type === 'lock' && <input className="glow-input" placeholder="密码 (选填)" value={b.pwd} onChange={e=>updateBlock(b.id, e.target.value, 'pwd')} />}
          <textarea className="glow-input" value={b.content} onChange={e=>updateBlock(b.id, e.target.value)} placeholder="内容..." />
          <div className="block-del" onClick={()=>removeBlock(b.id)}><Icons.Trash /></div>
        </div>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [siteTitle, setSiteTitle] = useState('PROBLOG');
  const [view, setView] = useState('list');
  const [form, setForm] = useState({ title: '', slug: '', category: '', tags: '', date: '', status: 'Published' });
  const [editorBlocks, setEditorBlocks] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { setMounted(true); fetchPosts(); }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/posts');
      const d = await r.json();
      if (d.success) setPosts(d.posts || []);
      
      // ⚠️ 防崩溃关键：单独包裹 Config 请求
      try {
        const rConf = await fetch('/api/admin/config');
        const dConf = await rConf.json();
        // 只有当 siteInfo 存在时才读取 title
        if (dConf.success && dConf.siteInfo && dConf.siteInfo.title) {
          setSiteTitle(dConf.siteInfo.title);
        }
      } catch (e) { console.warn("Config 读取失败，使用默认标题"); }

    } catch (e) { console.error("API Error:", e); }
    finally { setLoading(false); }
  };

  const handleEdit = async (id) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/post?id=${id}`);
      const d = await r.json();
      if (d.success && d.post) {
        setForm(d.post);
        // 简单还原 Block 逻辑
        setEditorBlocks([{ id: 1, type: 'text', content: d.post.content }]);
        setCurrentId(id);
        setView('edit');
      }
    } catch (e) { alert("加载文章失败"); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setLoading(true);
    const fullContent = editorBlocks.map(b => {
      if (b.type === 'h1') return `# ${b.content}`;
      if (b.type === 'note') return `\`${b.content}\``;
      if (b.type === 'lock') return `:::lock ${b.pwd}\n${b.content}\n:::`;
      return b.content;
    }).join('\n\n');

    await fetch('/api/admin/post', {
      method: 'POST',
      body: JSON.stringify({ ...form, content: fullContent, id: currentId })
    });
    setView('list');
    fetchPosts();
  };

  const handleDelete = async (id) => {
    if(confirm('删除?')) {
      setLoading(true);
      await fetch(`/api/admin/post?id=${id}`, { method: 'DELETE' });
      fetchPosts();
    }
  };

  const updateSiteTitle = async () => {
    const t = prompt("新标题:", siteTitle);
    if(t) {
        setLoading(true);
        await fetch('/api/admin/config', { method: 'POST', body: JSON.stringify({ title: t }) });
        setSiteTitle(t);
        setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="admin-container">
      <GlobalStyle />
      {loading && <div className="loader">Loading...</div>}
      
      <div style={{maxWidth: 900, margin: '0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 30}}>
          <h1 style={{fontSize:24, display:'flex', alignItems:'center', gap:10}}>
            {siteTitle} 
            <span onClick={updateSiteTitle} style={{cursor:'pointer', opacity:0.5}}><Icons.Settings /></span>
          </h1>
          <button className="neo-btn" onClick={() => { 
            if (view==='list') { setForm({title:'', category:'', date:'', status:'Published'}); setEditorBlocks([]); setCurrentId(null); setView('edit'); }
            else setView('list');
          }}>
            {view === 'list' ? '发布新内容' : '返回列表'}
          </button>
        </div>

        {view === 'list' ? (
          <div>
            <input className="glow-input" placeholder="搜索文章..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} />
            {posts.filter(p=>p.title.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
              <div key={p.id} className="card-item">
                <div>
                  <div style={{fontWeight:'bold', fontSize:18}}>{p.title}</div>
                  <div style={{fontSize:12, color:'#888', marginTop:5}}>{p.date} · {p.category} · {p.status}</div>
                </div>
                <div style={{display:'flex', gap:10}}>
                  <div onClick={()=>handleEdit(p.id)} style={{cursor:'pointer', color:'greenyellow'}}><Icons.Edit /></div>
                  <div onClick={()=>handleDelete(p.id)} style={{cursor:'pointer', color:'#ff4d4f'}}><Icons.Trash /></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{background: '#424242', padding: 30, borderRadius: 20}}>
            <input className="glow-input" placeholder="标题" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} />
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
               <input className="glow-input" placeholder="分类" value={form.category} onChange={e=>setForm({...form, category:e.target.value})} />
               <input className="glow-input" type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} />
            </div>
            <BlockBuilder blocks={editorBlocks} setBlocks={setEditorBlocks} />
            <button onClick={handleSave} style={{width:'100%', padding:15, background:'greenyellow', border:'none', borderRadius:10, fontWeight:'bold', marginTop:20, cursor:'pointer'}}>确认提交</button>
          </div>
        )}
      </div>
    </div>
  );
}