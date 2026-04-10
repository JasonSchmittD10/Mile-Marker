import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

type Entry = {
  title?: string;
  description?: string;
  url?: string;
  h1?: string[];
  h2?: string[];
  h3?: string[];
  p?: string[];
};

async function fetchEntry(slug: string): Promise<Entry | null> {
  try {
    const html = await fetch('https://www.miletwentylabs.com/the-lab', {
      next: { revalidate: 3600 },
    }).then((r) => r.text());

    const metaMatch = html.match(/<meta[^>]+name="framer-search-index"[^>]+content="([^"]+)"/i)
      ?? html.match(/<meta[^>]+content="([^"]+)"[^>]+name="framer-search-index"/i);
    const urlMatch = html.match(/https:\/\/framerusercontent\.com\/[^"'\s]*searchIndex[^"'\s]*\.json/);
    const indexUrl = metaMatch ? metaMatch[1] : (urlMatch ? urlMatch[0] : null);
    if (!indexUrl) return null;

    const raw: unknown = await fetch(indexUrl, { next: { revalidate: 3600 } }).then((r) => r.json());
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

    const index = raw as Record<string, Entry>;
    return index[`/the-lab/${slug}`] ?? null;
  } catch {
    return null;
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const entry = await fetchEntry(slug);
  if (!entry || !entry.title) notFound();

  const externalUrl = entry.url ?? `https://www.miletwentylabs.com/the-lab/${slug}`;

  // Interleave headings and paragraphs in order
  type Block = { type: 'h1' | 'h2' | 'h3' | 'p'; text: string };
  const blocks: Block[] = [
    ...(entry.h1 ?? []).map((t) => ({ type: 'h1' as const, text: t })),
    ...(entry.h2 ?? []).map((t) => ({ type: 'h2' as const, text: t })),
    ...(entry.h3 ?? []).map((t) => ({ type: 'h3' as const, text: t })),
    ...(entry.p ?? []).map((t) => ({ type: 'p' as const, text: t })),
  ];
  // Paragraphs are the main content — filter headings that duplicate the page title
  const paragraphs = (entry.p ?? []).filter((t) => t !== entry.title);
  const subheadings = [
    ...(entry.h2 ?? []).map((t) => ({ type: 'h2' as const, text: t })),
    ...(entry.h3 ?? []).map((t) => ({ type: 'h3' as const, text: t })),
  ];

  void blocks; // used above for reference

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
        <h1 className="text-lg font-semibold text-gray-900 leading-snug mb-4">{entry.title}</h1>

        {entry.description && (
          <p className="text-sm text-gray-500 leading-relaxed mb-5 pb-5 border-b border-gray-100">
            {entry.description}
          </p>
        )}

        <div className="space-y-4">
          {subheadings.length > 0 && paragraphs.length === 0 ? (
            // Only headings available — render them as an outline
            subheadings.map((h, i) => (
              <p key={i} className="text-sm font-medium text-gray-700">{h.text}</p>
            ))
          ) : (
            paragraphs.map((text, i) => (
              <p key={i} className="text-sm text-gray-600 leading-relaxed">{text}</p>
            ))
          )}

          {paragraphs.length === 0 && subheadings.length === 0 && (
            <p className="text-sm text-gray-400">Full article available on the site below.</p>
          )}
        </div>
      </div>

      {/* Read on site */}
      <div className="text-center">
        <a
          href={externalUrl}
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
