import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

interface Block {
  type: 'h1' | 'h2' | 'h3' | 'p';
  text: string;
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, ' ')
    .trim();
}

function extractContent(html: string): { title: string; date: string; blocks: Block[] } {
  // Page title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = decodeEntities((titleMatch?.[1] ?? '').replace(/\s*[|\-–]\s*.*$/, ''));

  // Date: look for common date patterns in the HTML text
  const dateMatch = html.match(/(\w+ \d{1,2},?\s+\d{4})/);
  const date = dateMatch?.[1] ?? '';

  // Extract headings and paragraphs
  const blocks: Block[] = [];
  const tagPattern = /<(h[1-3]|p)(?:\s[^>]*)?>( [\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = tagPattern.exec(html)) !== null) {
    const type = m[1].toLowerCase() as Block['type'];
    const text = decodeEntities(m[2].replace(/<[^>]+>/g, ' '));
    if (text.length > 3) blocks.push({ type, text });
  }

  // Deduplicate consecutive identical blocks (Framer sometimes dupes content)
  const deduped = blocks.filter((b, i) => i === 0 || b.text !== blocks[i - 1].text);

  return { title, date, blocks: deduped };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const url = `https://www.miletwentylabs.com/the-lab/${slug}`;

  let html: string;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) notFound();
    html = await res.text();
  } catch {
    notFound();
  }

  const { title, date, blocks } = extractContent(html);

  if (!title && blocks.length === 0) notFound();

  return (
    <div className="space-y-5">
      {/* Back */}
      <Link
        href="/resources"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        The Lab
      </Link>

      {/* Article */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        {title && <h1 className="text-lg font-semibold text-gray-900 leading-snug mb-1">{title}</h1>}
        {date && <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-5">{date}</p>}

        <div className="space-y-3">
          {blocks.map((block, i) => {
            if (block.type === 'h1') {
              return <h2 key={i} className="text-base font-semibold text-gray-900 mt-5">{block.text}</h2>;
            }
            if (block.type === 'h2') {
              return <h3 key={i} className="text-sm font-semibold text-gray-800 mt-4">{block.text}</h3>;
            }
            if (block.type === 'h3') {
              return <h4 key={i} className="text-sm font-medium text-gray-700 mt-3">{block.text}</h4>;
            }
            return <p key={i} className="text-sm text-gray-600 leading-relaxed">{block.text}</p>;
          })}
        </div>

        {blocks.length === 0 && (
          <p className="text-sm text-gray-400">Could not load article content.</p>
        )}
      </div>

      {/* Read on site */}
      <div className="text-center">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Read on miletwentylabs.com ↗
        </a>
      </div>
    </div>
  );
}
