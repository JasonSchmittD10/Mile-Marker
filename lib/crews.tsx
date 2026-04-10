export const CREW_SLUGS = ['syllabus_weekers', 'quarter_lifers', 'minivan_mafia', 'the_legends'] as const;
export type CrewSlug = typeof CREW_SLUGS[number];

export interface CrewInfo {
  label: string;
  bg: string;
  text: string;
}

export const CREW_MAP: Record<string, CrewInfo> = {
  syllabus_weekers: { label: 'The Syllabus Weekers', bg: '#EEEDFE', text: '#3C3489' },
  quarter_lifers:   { label: 'The Quarter-Lifers',   bg: '#E6F1FB', text: '#0C447C' },
  minivan_mafia:    { label: 'The Minivan Mafia',     bg: '#FAEEDA', text: '#633806' },
  the_legends:      { label: 'The Legends',           bg: '#FAECE7', text: '#712B13' },
};

export const NO_CREW: CrewInfo = { label: '— No crew yet', bg: '#F1EFE8', text: '#444441' };

export function getCrewInfo(slug: string | null | undefined): CrewInfo {
  if (!slug) return NO_CREW;
  return CREW_MAP[slug] ?? NO_CREW;
}

export function CrewPill({ slug }: { slug: string | null | undefined }) {
  const crew = getCrewInfo(slug);
  return (
    <span
      className="inline-block text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ backgroundColor: crew.bg, color: crew.text }}
    >
      {crew.label}
    </span>
  );
}
