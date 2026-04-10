import Link from 'next/link';

export const revalidate = 3600;

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const url = `https://www.miletwentylabs.com/the-lab/${slug}`;

  return (
    <div className="-mx-4 -mt-5 flex flex-col" style={{ height: 'calc(100dvh - 48px - 56px)' }}>
      {/* Back bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0">
        <Link
          href="/resources"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          The Lab
        </Link>
      </div>

      {/* iframe */}
      <iframe
        src={url}
        className="flex-1 w-full border-0"
        loading="lazy"
        title="Article"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
  );
}
