import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';

const notion = new Client({
  auth: process.env.NOTION_KEY || process.env.NOTION_TOKEN,
});
const n2m = new NotionToMarkdown({ notionClient: notion });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// === 1. 强力解析器 (保留链接转图片功能) ===
function parseLinesToChildren(text) {
  const lines = text.split(/\r?\n/);
  const blocks = [];
  
  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // 媒体识别
    const mdMatch = trimmed.match(/^!\[.*?\]\((.*?)\)$/) || trimmed.match(/^\[.*?\]\((.*?)\)$/);
    let potentialUrl = mdMatch ? mdMatch[1] : trimmed;
    const urlMatch = potentialUrl.match(/https?:\/\/[^\s)\]"]+/);
    const cleanUrl = urlMatch ? urlMatch[0] : null;

    if (cleanUrl && /\.(jpg|jpeg|png|gif|webp|bmp|svg|mp4|mov|webm|ogg|mkv)(\?|$)/i.test(cleanUrl)) {
      const isVideo = /\.(mp4|mov|webm|ogg|mkv)(\?|$)/i.test(cleanUrl);
      if (isVideo) blocks.push({ object: 'block', type: 'video', video: { type: 'external', external: { url: cleanUrl } } });
      else blocks.push({ object: 'block', type: 'image', image: { type: 'external', external: { url: cleanUrl } } });
      continue;
    }

    if (trimmed.startsWith('# ')) { blocks.push({ object: 'block', type: 'heading_1', heading_1: { rich_text: [{ text: { content: trimmed.replace('# ', '') } }] } }); continue; } 
    if (trimmed.startsWith('`') && trimmed.endsWith('`') && trimmed.length > 1) { blocks.push({ object: 'block', type: 'paragraph', paragraph: { rich_text: [{ text: { content: trimmed.slice(1, -1) }, annotations: { code: true, color: 'red' } }] } }); continue; }
    blocks.push({ object: 'block', type: 'paragraph', paragraph: { rich_text: [{ text: { content: trimmed } }] } });
  }
  return blocks;
}

// === 2. 积木转换器 (写入时的状态机) ===
function mdToBlocks(markdown) {
  if (!markdown) return [];
  const rawChunks = markdown.split(/\n{2,}/);
  const blocks = [];
  let mergedChunks = [];
  let buffer = "";
  let isLocking = false;

  for (let chunk of rawChunks) {
    const t = chunk.trim();
    if (!t) continue;
    if (!isLocking && t.startsWith(':::lock')) {
      if (t.endsWith(':::')) mergedChunks.push(t);
      else { isLocking = true; buffer = t; }
    } else if (isLocking) {
      buffer += "\n\n" + t;
      if (t.endsWith(':::')) { isLocking = false; mergedChunks.push(buffer); buffer = ""; }
    } else { mergedChunks.push(t); }
  }
  if (buffer) mergedChunks.push(buffer);

  for (let content of mergedChunks) {
    if (content.startsWith(':::lock')) {
        const firstLineEnd = content.indexOf('\n');
        const header = content.substring(0, firstLineEnd > -1 ? firstLineEnd : content.length);
        let pwd = header.replace(':::lock', '').replace(/[>*\s🔒]/g, '').trim(); 
        const body = content.replace(/^:::lock.*?\n/, '').replace(/\n:::$/, '').trim();
        blocks.push({ object: 'block', type: 'callout', callout: { rich_text: [{ text: { content: `LOCK:${pwd}` }, annotations: { bold: true } }], icon: { type: "emoji", emoji: "🔒" }, color: "gray_background", children: [ { object: 'block', type: 'divider', divider: {} }, ...parseLinesToChildren(body) ] } });
    } else {
        blocks.push(...parseLinesToChildren(content));
    }
  }
  return blocks;
}

export default async function handler(req, res) {
  const { id } = req.query;
  const databaseId = process.env.NOTION_DATABASE_ID || process.env.NOTION_PAGE_ID;

  try {
    // === GET: 获取详情 (核心修复：二次编辑回显逻辑) ===
    if (req.method === 'GET') {
      const page = await notion.pages.retrieve({ page_id: id });
      const mdblocks = await n2m.pageToMarkdown(id);
      
      // 🛡️ 防御性编程：确保 mdblocks 是数组
      const safeMdBlocks = Array.isArray(mdblocks) ? mdblocks : [];

      safeMdBlocks.forEach(b => {
        // 检测到是加密 Callout 块
        if (b.type === 'callout' && b.parent && b.parent.includes('LOCK:')) {
          // 1. 提取密码
          const pwdMatch = b.parent.match(/LOCK:(.*?)(\n|$|\*)/); // 兼容 **LOCK:1**
          const pwd = pwdMatch ? pwdMatch[1].replace(/\*/g, '').trim() : '';

          // 2. 提取并清洗正文 (这是防止炸裂的关键！)
          // NotionToMD 返回的 parent 格式通常是:
          // > 🔒 **LOCK:1**
          // > 
          // > 正文内容...
          
          const lines = b.parent.split('\n');
          // 去掉第一行(标题行)
          lines.shift(); 
          
          // 逐行清洗 '> ' 前缀
          const cleanBody = lines.map(line => {
             return line.replace(/^> ?/, ''); 
          }).join('\n').trim();

          // 3. 重组为标准积木格式
          b.parent = `:::lock ${pwd}\n\n${cleanBody}\n\n:::`; 
        }
      });

      const mdStringObj = n2m.toMarkdownString(safeMdBlocks);
      const cleanContent = mdStringObj.parent ? mdStringObj.parent.trim() : '';
      const p = page.properties;
      let rawBlocks = [];
      try { const blocksRes = await notion.blocks.children.list({ block_id: id }); rawBlocks = blocksRes.results; } catch (e) {}

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
          content: cleanContent, // 现在的 content 里已经是干净的 :::lock 了
          rawBlocks: rawBlocks
        }
      });
    }

    // === POST: 极速写入 ===
    if (req.method === 'POST') {
      const body = JSON.parse(req.body);
      const { id, title, content, slug, excerpt, category, tags, status, date, type, cover } = body;
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
        const children = await notion.blocks.children.list({ block_id: id });
        if (children.results.length > 0) {
            const chunks = [];
            for (let i = 0; i < children.results.length; i += 3) { chunks.push(children.results.slice(i, i + 3)); }
            for (const chunk of chunks) { await Promise.all(chunk.map(b => notion.blocks.delete({ block_id: b.id }))); }
        }
        for (let i = 0; i < newBlocks.length; i += 100) {
          await notion.blocks.children.append({ block_id: id, children: newBlocks.slice(i, i + 100) });
          if (i + 100 < newBlocks.length) await sleep(100); 
        }
      } else {
        await notion.pages.create({
          parent: { database_id: databaseId },
          properties: props,
          children: newBlocks.slice(0, 100)
        });
      }
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      await notion.pages.update({ page_id: id, archived: true });
      return res.status(200).json({ success: true });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
}