'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from './actions';

const CREW_CARDS = [
  { value: 'syllabus_weekers', label: 'The Syllabus Weekers', emoji: '📖', tagline: 'Always studying the course', bg: '#EEEDFE', text: '#3C3489', borderColor: '#9B96D4' },
  { value: 'quarter_lifers',   label: 'The Quarter-Lifers',   emoji: '🌱', tagline: 'Finding our stride',         bg: '#E6F1FB', text: '#0C447C', borderColor: '#7AB0DC' },
  { value: 'minivan_mafia',    label: 'The Minivan Mafia',    emoji: '🚐', tagline: 'Rolling deep',               bg: '#FAEEDA', text: '#633806', borderColor: '#D4A96A' },
  { value: 'the_legends',      label: 'The Legends',          emoji: '🏆', tagline: 'Running since forever',      bg: '#FAECE7', text: '#712B13', borderColor: '#D4876A' },
];

interface Props {
  athleteId: string;
  initial: {
    motivating_verse: string | null;
    motivating_verse_ref: string | null;
    bio: string | null;
    ministry_group: string | null;
  };
}

export default function ProfileEditForm({ athleteId, initial }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verse, setVerse] = useState(initial.motivating_verse ?? '');
  const [verseRef, setVerseRef] = useState(initial.motivating_verse_ref ?? '');
  const [bio, setBio] = useState(initial.bio ?? '');
  const [crew, setCrew] = useState(initial.ministry_group ?? '');

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateProfile(athleteId, {
        motivating_verse: verse,
        motivating_verse_ref: verseRef,
        bio,
        ministry_group: crew,
      });
      setOpen(false);
      router.refresh();
    } catch (e) {
      console.error(e);
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-[#1D9E75] hover:underline"
      >
        Edit profile
      </button>
    );
  }

  return (
    <div className="space-y-4 pt-2 border-t border-gray-100">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Verse</label>
        <textarea
          value={verse}
          onChange={(e) => setVerse(e.target.value)}
          maxLength={500}
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1D9E75]"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Reference</label>
        <input
          type="text"
          value={verseRef}
          onChange={(e) => setVerseRef(e.target.value)}
          maxLength={100}
          placeholder="e.g. Isaiah 40:31"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1D9E75]"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Why I run</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1D9E75]"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Your crew</label>
        <div className="grid grid-cols-2 gap-2">
          {CREW_CARDS.map((c) => {
            const selected = crew === c.value;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => setCrew(c.value)}
                className="text-left p-3 rounded-xl border-2 transition-all"
                style={{
                  borderColor: selected ? c.borderColor : '#e5e7eb',
                  backgroundColor: selected ? c.bg : '#f9fafb',
                }}
              >
                <div className="text-2xl mb-1">{c.emoji}</div>
                <div className="text-xs font-medium leading-tight" style={{ color: selected ? c.text : '#374151' }}>{c.label}</div>
                <div className="text-[10px] mt-0.5" style={{ color: selected ? c.text : '#9ca3af' }}>{c.tagline}</div>
              </button>
            );
          })}
        </div>
        {crew && (
          <button
            type="button"
            onClick={() => setCrew('')}
            className="mt-2 text-xs text-gray-400 hover:text-gray-600"
          >
            — No crew yet
          </button>
        )}
        <p className="text-xs text-gray-400 mt-1">Used in the weekly crew battle leaderboard.</p>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={() => setOpen(false)}
          className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-[#1D9E75] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#178a65] transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
