export const dynamic = 'force-dynamic';
export const revalidate = 3600;

import Link from 'next/link';

interface Article {
  title: string;
  description: string;
  date: string;
  slug: string;
}

async function fetchArticles(): Promise<Article[]> {
  try {
    const html = await fetch('https://www.miletwentylabs.com/the-lab', {
      next: { revalidate: 3600 },
    }).then((r) => r.text());

    // Framer puts the search index URL in a <meta name="framer-search-index"> tag
    const metaMatch = html.match(/<meta[^>]+name="framer-search-index"[^>]+content="([^"]+)"/i)
      ?? html.match(/<meta[^>]+content="([^"]+)"[^>]+name="framer-search-index"/i);

    // Also try finding the URL directly anywhere in the HTML
    const urlMatch = metaMatch
      ? [metaMatch[0], metaMatch[1]]
      : html.match(/https:\/\/framerusercontent\.com\/[^"'\s]*searchIndex[^"'\s]*\.json/);

    const indexUrl = metaMatch ? metaMatch[1] : (urlMatch ? urlMatch[0] : null);

    if (indexUrl) {
      // Framer search index is a path-keyed object: { "/the-lab/slug": { title, description, url, p[], ... } }
      const raw: unknown = await fetch(indexUrl, {
        next: { revalidate: 3600 },
      }).then((r) => r.json());

      if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        type Entry = { title?: string; description?: string; url?: string; h1?: string[]; p?: string[] };
        const index = raw as Record<string, Entry>;

        const pages = Object.entries(index)
          .filter(([path]) => path.startsWith('/the-lab/') && path !== '/the-lab/')
          .map(([path, entry]) => ({
            title: (entry.h1 as string[] | undefined)?.[0] ?? entry.title ?? '',
            description: entry.description ?? (entry.p as string[] | undefined)?.[0] ?? '',
            date: '',
            slug: path.split('/').pop() ?? '',
          }))
          .filter((a) => a.title && a.slug);

        if (pages.length > 0) return pages;
      }
    }

    return [];
  } catch (err) {
    console.error('Failed to fetch articles:', err);
    return [];
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default async function ResourcesPage() {
  const articles = await fetchArticles();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">The Lab</h1>
        <p className="text-sm text-gray-500 mt-1">Training insights from Mile Twenty Labs</p>
      </div>

      {articles.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-sm text-gray-500">No articles found. Check back soon.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/resources/${article.slug}`}
              className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-[#1D9E75] transition-colors">
                    {article.title}
                  </h2>
                  {article.description && (
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">
                      {article.description}
                    </p>
                  )}
                  {article.date && (
                    <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-wider">
                      {formatDate(article.date)}
                    </p>
                  )}
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-300 group-hover:text-[#1D9E75] flex-shrink-0 mt-0.5 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
