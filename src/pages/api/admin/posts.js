import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';

const notion = new Client({
  auth: process.env.NOTION_KEY || process.env.NOTION_TOKEN,
});
const n2m = new NotionToMarkdown({ notionClient: notion });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ==========================================
// 核心复原：旧版强大的解析逻辑
// ==========================================

// 1. 解析每一行内容 (包含正则清洗)
function parseLinesToChildren(text) {
  const lines = text.split(/\r?\n/);
  const blocks = [];
  
  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // A. 媒体识别 (正则清洗)
    const mediaMatch = trimmed.match(/(?:!|)?\[.*?\]\((.*?)\)/);
    if (mediaMatch) {
      let url = mediaMatch[1].trim();
      const safeUrl = url.includes('%') ? url : encodeURI(url);
      const isVideo = url.match(/\.(mp4|mov|webm|ogg|mkv)(\?|$)/i);
      if (isVideo) {
        blocks.push({ object: 'block', type: 'video', video: { type: 'external', external: { url: safeUrl } } });
      } else {
        blocks.push({ object: 'block', type: 'image', image: { type: 'external', external: { url: safeUrl } } });
      }
      continue;
    }

    // B. 标题
    if (trimmed.startsWith('# ')) {
      blocks.push({ object: 'block', type: 'heading_1', heading_1: { rich_text: [{ text: { content: trimmed.replace('# ', '') } }] } });
      continue;
    } 

    // C. 注释块 (反引号包裹)
    if (trimmed.startsWith('`') && trimmed.endsWith('`') && trimmed.length > 1) {
       const content = trimmed.slice(1, -1);
       blocks.push({ 
           object: 'block', type: 'paragraph', 
           paragraph: { rich_text: [{ text: { content: content }, annotations: { code: true, color: 'red' } }] } 
       });
       continue;
    }

    // D. 普通文本
    blocks.push({ object: 'block', type: 'paragraph', paragraph: { rich_text: [{ text: { content: trimmed } }] } });
  }
  return blocks;
}

// 2. 状态机解析器 (完美处理 :::lock 不被拆分)
function mdToBlocks(markdown) {
  if (!markdown) return [];
  const rawChunks = markdown.split(/\n{2,}/); // 初步按空行切分
  const blocks = [];
  
  let mergedChunks = [];
  let buffer = "";
  let isLocking = false;

  // --- 状态机循环 (核心) ---
  for (let chunk of rawChunks) {
    const t = chunk.trim();
    if (!t) continue;

    if (!isLocking && t.startsWith(':::lock')) {
      // 如果是一行写完的 lock (:::lock ... :::)
      if (t.endsWith(':::')) {
        mergedChunks.push(t);
      } else {
        // 开启录制模式
        isLocking = true;
        buffer = t;
      }
    } else if (isLocking) {
      // 录制中，拼接到 buffer
      buffer += "\n\n" + t;
      if (t.endsWith(':::')) {
        // 结束录制
        isLocking = false;
        mergedChunks.push(buffer);
        buffer = "";
      }
    } else {
      // 普通块
      mergedChunks.push(t);
    }
  }
  // 防止最后没闭合
  if (buffer) mergedChunks.push(buffer);

  // --- 生成 Notion 块 ---
  for (let content of mergedChunks) {
    // 加密块处理
    if (content.startsWith(':::lock')) {
        const firstLineEnd = content.indexOf('\n');
        const header = content.substring(0, firstLineEnd > -1 ? firstLineEnd : content.length);
        
        // 提取密码 (不再强制 123)
        let pwd = header.replace(':::lock', '').replace(/[>*\s🔒]/g, '').trim(); 
        
        // 提取正文并递归解析
        const body = content.replace(/^:::lock.*?\n/, '').replace(/\n:::$/, '').trim();
        
        blocks.push({ 
            object: 'block', type: 'callout', 
            callout: { 
                rich_text: [{ text: { content: `LOCK:${pwd}` }, annotations: { bold: true } }], 
                icon: { type: "emoji", emoji: "🔒" }, color: "gray_background", 
                children: [ { object: 'block', type: 'divider', divider: {} }, ...parseLinesToChildren(body) ] 
            } 
        });
        continue;
    }
    // 普通块处理
    blocks.push(...parseLinesToChildren(content));
  }
  return blocks;
}

// ==========================================
// 主处理函数
// ==========================================
export default async function handler(req, res) {
  const { id } = req.query;
  const databaseId = process.env.NOTION_DATABASE_ID || process.env.NOTION_PAGE_ID;

  try {
    // === GET ===
    if (req.method === 'GET') {
      const page = await notion.pages.retrieve({ page_id: id });
      const mdblocks = await n2m.pageToMarkdown(id);
      const mdString = n2m.toMarkdownString(mdblocks);
      const p = page.properties;

      // 获取原始块用于预览
      let rawBlocks = [];
      try { const blocksRes = await notion.blocks.children.list({ block_id: id }); rawBlocks = blocksRes.results; } catch (e) {}

      // 回显处理：把 Notion 的 callout 还原回 :::lock
      mdblocks.forEach(b => {
        if (b.type === 'callout' && b.parent.includes('LOCK:')) {
          const pwdMatch = b.parent.match(/LOCK:(.*?)(\n|$)/);
          const pwd = pwdMatch ? pwdMatch[1].trim() : '';
          
          const parts = b.parent.split('---');
          let body = parts.length > 1 ? parts.slice(1).join('---') : parts[0].replace(/LOCK:.*\n?/, '');
          body = body.replace(/^>[ \t]*/gm, '').trim(); 
          b.parent = `:::lock ${pwd}\n\n${body}\n\n:::`; 
        }
      });

      const cleanContent = n2m.toMarkdownString(mdblocks).parent.trim();

      return res.status(200).json({
        success: true,
        post: {
          id: page.id,
          title: p.title?.title?.[0]?.plain_text || '无标题',
          slug: p.slug?.rich_text?.[0]?.plain_text || '',
          excerpt: p.excerpt?.rich_text?.[0]?.plain_text || '',
          category: p.category?.select?.name || '',
          tags: (p.tags?.multi_select || []).map(t => t.name).join(','),
          status: p.status?.status?.name || p.status?.select?.name || 'Published',
          type: p.type?.select?.name || 'Post',
          date: p.date?.date?.start || '',
          cover: p.cover?.url || p.cover?.file?.url || p.cover?.external?.url || '',
          content: cleanContent,
          rawBlocks: rawBlocks
        }
      });
    }

    // === POST (保存) ===
    if (req.method === 'POST') {
      const body = JSON.parse(req.body);
      const { id, title, content, slug, excerpt, category, tags, status, date, type, cover } = body;
      
      // 调用状态机转换
      const newBlocks = mdToBlocks(content);

      const props = {};
      props["title"] = { title: [{ text: { content: title || "无标题" } }] };
      if (slug) props["slug"] = { rich_text: [{ text: { content: slug } }] };
      props["excerpt"] = { rich_text: [{ text: { content: excerpt || "" } }] };
      if (category) props["category"] = { select: { name: category } };
      if (tags) {
        const tagList = tags.split(',').filter(t => t.trim()).map(t => ({ name: t.trim() }));
        if (tagList.length > 0) props["tags"] = { multi_select: tagList };
      }
      props["status"] = { status: { name: status || "Published" } };
      props["type"] = { select: { name: type || "Post" } };
      if (date) props["date"] = { date: { start: date } };
      if (cover && cover.startsWith('http')) props["cover"] = { url: cover };

      if (id) {
        await notion.pages.update({ page_id: id, properties: props });
        // 先删旧
        const children = await notion.blocks.children.list({ block_id: id });
        if (children.results.length > 0) {
            await Promise.all(children.results.map(b => notion.blocks.delete({ block_id: b.id })));
        }
        // 后写新
        for (let i = 0; i < newBlocks.length; i += 10) {
          await notion.blocks.children.append({ block_id: id, children: newBlocks.slice(i, i + 10) });
          if (i + 10 < newBlocks.length) await sleep(200);
        }
        // 触发 Vercel 更新 (如果有 Hook)
        // fetch('YOUR_VERCEL_HOOK_URL'); 
      } else {
        await notion.pages.create({
          parent: { database_id: databaseId },
          properties: props,
          children: newBlocks.slice(0, 50)
        });
      }
      return res.status(200).json({ success: true });
    }

    // === DELETE ===
    if (req.method === 'DELETE') {
      await notion.pages.update({ page_id: id, archived: true });
      return res.status(200).json({ success: true });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
}