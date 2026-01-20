import { Client } from '@notionhq/client';

export default async function handler(req, res) {
  const notion = new Client({ auth: process.env.NOTION_KEY || process.env.NOTION_TOKEN });
  const databaseId = process.env.NOTION_DATABASE_ID || process.env.NOTION_PAGE_ID;

  try {
    if (req.method === 'POST') {
      const { title } = JSON.parse(req.body);
      await notion.databases.update({
        database_id: databaseId,
        title: [{ text: { content: title } }]
      });
      return res.status(200).json({ success: true });
    }

    const response = await notion.databases.retrieve({ database_id: databaseId });
    const title = response.title?.[0]?.plain_text || 'PROBLOG';
    
    res.status(200).json({ success: true, siteInfo: { title } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}