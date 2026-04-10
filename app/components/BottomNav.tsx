'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  initials: string | null;
  profileImageUrl: string | null;
}

/* ── Running-themed stroke icons ─────────────────────────────── */

function ShoeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 18h15a2 2 0 002-2v-.5a1.5 1.5 0 00-1.5-1.5H10l-2-4H6L3.5 13 2 18z" />
      <path d="M8.5 10l1.5-4.5h4L16 10" />
    </svg>
  );
}

function PodiumIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V15h4.5v6H3zM9.5 21V10.5H15V21H9.5zM17.5 21V13h4v8h-4z" />
    </svg>
  );
}

function RunnersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="5" r="1.5" />
      <path d="M5 9L3.5 12.5l2 .8L5 17h2l1.5-3.5L10 15.5V20h2v-5.5L9.5 12l.5-3" />
      <circle cx="17" cy="5" r="1.5" />
      <path d="M15 9l-1.5 3.5 2 .8L15 17h2l1.5-3.5 1.5 2V20h2v-5.5L19.5 12l.5-3" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6.5V20M12 6.5C12 6.5 8.5 5 5 6.5V20c3.5-1.5 7 0 7 0M12 6.5C12 6.5 15.5 5 19 6.5V20c-3.5-1.5-7 0-7 0" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="3.5" />
      <path d="M4.5 21c0-4.1 3.4-7 7.5-7s7.5 2.9 7.5 7" />
    </svg>
  );
}

/* ── Nav config ──────────────────────────────────────────────── */

const navItems = [
  { href: '/',            label: 'Home',      Icon: ShoeIcon },
  { href: '/leaderboards', label: 'Board',     Icon: PodiumIcon },
  { href: '/club',         label: 'Club',      Icon: RunnersIcon },
  { href: '/resources',    label: 'Resources', Icon: BookIcon },
];

export default function BottomNav({ initials, profileImageUrl }: Props) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-2xl mx-auto flex items-stretch">
        {navItems.map(({ href, label, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors ${
                active ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon />
              <span className={`text-[10px] ${active ? 'font-semibold' : 'font-normal'}`}>{label}</span>
              {active && <span className="absolute top-0 h-[2px] w-8 bg-[#1D9E75] rounded-b-full" />}
            </Link>
          );
        })}

        {/* Me / Profile tab */}
        <Link
          href="/profile"
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors ${
            pathname === '/profile' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {profileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profileImageUrl}
              alt="Profile"
              className={`h-6 w-6 rounded-full object-cover ${pathname === '/profile' ? 'ring-2 ring-gray-900' : 'ring-1 ring-gray-200'}`}
            />
          ) : initials ? (
            <div className={`h-6 w-6 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-[9px] font-bold ${pathname === '/profile' ? 'ring-2 ring-gray-900' : ''}`}>
              {initials}
            </div>
          ) : (
            <PersonIcon />
          )}
          <span className={`text-[10px] ${pathname === '/profile' ? 'font-semibold' : 'font-normal'}`}>Me</span>
          {pathname === '/profile' && <span className="absolute top-0 h-[2px] w-8 bg-[#1D9E75] rounded-b-full" />}
        </Link>
      </div>
    </nav>
  );
}
