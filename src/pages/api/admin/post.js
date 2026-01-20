import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';

export default async function handler(req, res) {
  const notion = new Client({ auth: process.env.NOTION_KEY || process.env.NOTION_TOKEN });
  const n2m = new NotionToMarkdown({ notionClient: notion });
  const { id } = req.query;

  try {
    // --- 1. 获取文章详情 (GET) ---
    if (req.method === 'GET') {
      if (!id) return res.status(400).json({ success: false, error: 'Missing ID' });
      const page = await notion.pages.retrieve({ page_id: id });
      const mdblocks = await n2m.pageToMarkdown(id);
      const mdString = n2m.toMarkdownString(mdblocks);
      
      const props = page.properties;
      const post = {
        id: page.id,
        title: props.title?.title?.[0]?.plain_text || props.Page?.title?.[0]?.plain_text || '无标题',
        slug: props.slug?.rich_text?.[0]?.plain_text || '',
        status: props.status?.select?.name || 'Published',
        date: props.date?.date?.start || '',
        content: mdString.parent || ''
      };
      return res.status(200).json({ success: true, post });
    }

    // --- 2. 删除文章 (DELETE) ---
    if (req.method === 'DELETE') {
      if (!id) return res.status(400).json({ success: false, error: 'Missing ID' });
      await notion.pages.update({ page_id: id, archived: true });
      return res.status(200).json({ success: true });
    }

    // --- 3. 更新或创建 (POST) ---
    if (req.method === 'POST') {
      // 以后扩展保存逻辑时在此编写
      return res.status(200).json({ success: true });
    }

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}