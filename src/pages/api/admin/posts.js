import { Client } from '@notionhq/client';

export default async function handler(req, res) {
  const notion = new Client({ auth: process.env.NOTION_KEY || process.env.NOTION_TOKEN });
  const databaseId = process.env.NOTION_DATABASE_ID || process.env.NOTION_PAGE_ID;

  try {
    let allResults = [];
    let hasMore = true;
    let startCursor = undefined;

    // 🔄 循环抓取所有数据 (解决数据遗失问题)
    while (hasMore) {
      const response = await notion.databases.query({
        database_id: databaseId,
        sorts: [{ property: 'date', direction: 'descending' }],
        start_cursor: startCursor,
        page_size: 100, // 每次抓取最大数量
      });

      allResults = [...allResults, ...response.results];
      hasMore = response.has_more;
      startCursor = response.next_cursor;
    }

    const categories = new Set();
    const tags = new Set();

    const posts = allResults.map((page) => {
      const p = page.properties;
      
      const catName = p.category?.select?.name || p.Category?.select?.name || '';
      if (catName) categories.add(catName);
      
      const tagList = p.tags?.multi_select || p.Tags?.multi_select || [];
      const tagNames = tagList.map(t => t.name);
      tagNames.forEach(t => tags.add(t));

      // 宽容度处理：Slug 缺失时回退到 ID
      const slugVal = p.slug?.rich_text?.[0]?.plain_text || p.Slug?.rich_text?.[0]?.plain_text || page.id;

      return {
        id: page.id,
        title: p.title?.title?.[0]?.plain_text || p.Page?.title?.[0]?.plain_text || '无标题',
        slug: slugVal,
        category: catName,
        tags: tagNames.join(','),
        status: p.status?.select?.name || p.status?.status?.name || 'Published',
        type: p.type?.select?.name || p.Type?.select?.name || 'Post',
        date: p.date?.date?.start || p.Date?.date?.start || '',
        cover: p.cover?.url || p.cover?.file?.url || p.cover?.external?.url || ''
      };
    });

    res.status(200).json({ 
      success: true, 
      posts,
      options: {
        categories: Array.from(categories),
        tags: Array.from(tags)
      }
    });

  } catch (error) {
    console.error('Posts API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
