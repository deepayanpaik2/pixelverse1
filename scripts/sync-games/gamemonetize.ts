import { createClient } from '@supabase/supabase-js';

const feedUrl = process.env.GAMEMONETIZE_FEED_URL || '';
const maxPages = Number(process.env.MAX_PAGES || 10);

async function main() {
  if (!feedUrl) { console.log('GAMEMONETIZE_FEED_URL not set'); return; }
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  let added = 0, updated = 0, failed = 0;
  const seen = new Set<string>();
  for (let page = 1; page <= maxPages; page++) {
    const url = feedUrl + (feedUrl.includes('?') ? '&' : '?') + `format=0&num=50&page=${page}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;
      for (const g of data) {
        seen.add(String(g.id));
        const slug = String(g.title).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
        const { error } = await supabase.from('games').upsert({
          slug, source: 'gamemonetize', external_id: String(g.id), title: g.title,
          description: g.description, instructions: g.instructions, category: g.category,
          tags: String(g.tags||'').split(',').map((t:string)=>t.trim()).filter(Boolean),
          thumbnail_url: g.thumb, embed_url: g.url, width: g.width, height: g.height, status: 'active',
        }, { onConflict: 'source,external_id' });
        if (error) { failed++; console.error(error.message); } else { updated++; }
      }
      await new Promise(r=>setTimeout(r,500));
    } catch (e) { console.error(e); break; }
  }
  console.log('Report:', { added, updated, failed, totalSeen: seen.size });
}
main();
