export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Refresh articles hourly

interface Article {
  title: string;
  description: string;
  url: string;
  date: string;
  slug: string;
}

async function fetchArticles(): Promise<Article[]> {
  try {
    // Framer sites embed a search index reference in the page HTML
    const html = await fetch('https://www.miletwentylabs.com/the-lab', {
      next: { revalidate: 3600 },
    }).then((r) => r.text());

    const indexMatch = html.match(
      /https:\/\/framerusercontent\.com\/sites\/[A-Za-z0-9]+\/searchIndex-[A-Za-z0-9]+\.json/
    );
    if (!indexMatch) return [];

    const raw: unknown = await fetch(indexMatch[0], {
      next: { revalidate: 3600 },
    }).then((r) => r.json());

    type RawPage = { path?: string; title?: string; excerpt?: string; description?: string; date?: string };
    const data: RawPage[] = Array.isArray(raw) ? (raw as RawPage[]) : [];

    const pages: Article[] = data
      .filter(
        (p) =>
          typeof p.path === 'string' &&
          p.path.startsWith('/the-lab/') &&
          p.path !== '/the-lab'
      )
      .map((p) => ({
        title: p.title ?? '',
        description: p.excerpt ?? p.description ?? '',
        url: `https://www.miletwentylabs.com${p.path ?? ''}`,
        date: p.date ?? '',
        slug: (p.path ?? '').split('/').pop() ?? '',
      }))
      .filter((a) => a.title);

    return pages;
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
    return dateStr; // already formatted like "Jul 14, 2025"
  }
}

function slugToReadable(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
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
          <div className="text-3xl mb-3">📖</div>
          <p className="text-sm text-gray-500">No articles found. Check back soon.</p>
          <a
            href="https://www.miletwentylabs.com/the-lab"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm text-[#1D9E75] hover:underline"
          >
            Visit The Lab →
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <a
              key={article.slug}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-[#1D9E75] transition-colors">
                    {article.title || slugToReadable(article.slug)}
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
            </a>
          ))}
        </div>
      )}

      <div className="text-center pt-2">
        <a
          href="https://www.miletwentylabs.com/the-lab"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          miletwentylabs.com/the-lab ↗
        </a>
      </div>
    </div>
  );
}
