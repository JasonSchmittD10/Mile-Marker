'use client';

import { useState, useEffect } from 'react';
import { updateFeaturedRace } from '@/app/actions/race';

export interface RaceData {
  id: string;
  title: string;
  location: string | null;
  race_date: string;
  image_url: string | null;
  description: string | null;
}

interface Props {
  race: RaceData;
  isAdmin: boolean;
}

function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({ hrs: 0, min: 0, sec: 0, done: false, days: 0 });

  useEffect(() => {
    function calc() {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hrs: 0, min: 0, sec: 0, done: true, days: 0 });
        return;
      }
      const totalSec = Math.floor(diff / 1000);
      const days = Math.floor(totalSec / 86400);
      const hrs = Math.floor((totalSec % 86400) / 3600);
      const min = Math.floor((totalSec % 3600) / 60);
      const sec = totalSec % 60;
      setTimeLeft({ hrs, min, sec, done: false, days });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function RaceCard({ race, isAdmin }: Props) {
  const countdown = useCountdown(race.race_date);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: race.title,
    location: race.location ?? '',
    // datetime-local expects "YYYY-MM-DDTHH:mm" in local time
    race_date: new Date(race.race_date).toLocaleString('sv-SE', { timeZoneName: undefined }).slice(0, 16),
    image_url: race.image_url ?? '',
    description: race.description ?? '',
  });

  const raceDateTime = new Date(race.race_date);
  const formattedDate = raceDateTime.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
  const formattedTime = raceDateTime.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  });

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateFeaturedRace({ ...form, id: race.id });
      setEditing(false);
    } catch (e) {
      console.error(e);
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const segments = countdown.days > 0
    ? [
        { val: countdown.days, label: 'days' },
        { val: countdown.hrs, label: 'hrs' },
        { val: countdown.min, label: 'min' },
        { val: countdown.sec, label: 'sec' },
      ]
    : [
        { val: countdown.hrs, label: 'hrs' },
        { val: countdown.min, label: 'min' },
        { val: countdown.sec, label: 'sec' },
      ];

  return (
    <div className="relative overflow-hidden rounded-2xl min-h-[220px]">
      {/* Background */}
      {race.image_url ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${race.image_url})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a3d28] via-[#0f5c3a] to-[#1D9E75]" />
      )}
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Content */}
      <div className="relative z-10 p-5 text-white">
        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <div className="text-[10px] font-semibold text-white/50 uppercase tracking-widest mb-1">
              Featured Race
            </div>
            <div className="text-lg font-bold leading-tight">{race.title}</div>
            {race.location && (
              <div className="text-sm text-white/65 mt-0.5">{race.location}</div>
            )}
          </div>
          {isAdmin && (
            <button
              onClick={() => { setEditing(!editing); setError(null); }}
              className="text-xs bg-white/15 hover:bg-white/25 border border-white/20 rounded-lg px-3 py-1.5 transition-colors flex-shrink-0 ml-2"
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
          )}
        </div>

        <div className="text-xs text-white/50 mb-5">
          {formattedDate} · {formattedTime}
        </div>

        {/* Countdown */}
        {countdown.done ? (
          <div className="text-3xl font-bold text-center py-6">Race day! 🏁</div>
        ) : (
          <div className="flex items-end justify-center gap-2 py-4">
            {segments.map(({ val, label }, i) => (
              <div key={label} className="flex items-end gap-2">
                {i > 0 && (
                  <span className="text-5xl font-bold text-white/40 pb-7 leading-none">:</span>
                )}
                <div className="text-center">
                  <div className="text-6xl font-bold tabular-nums leading-none tracking-tight">
                    {pad(val)}
                  </div>
                  <div className="text-xs text-white/50 mt-3 tracking-widest uppercase">{label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {race.description && !editing && (
          <p className="text-sm text-white/60 text-center mt-4">{race.description}</p>
        )}

        {/* Admin edit form */}
        {editing && (
          <div className="mt-5 bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1">Race name</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/50"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1">Location</label>
                <input
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/50"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1">Date & time</label>
                <input
                  type="datetime-local"
                  value={form.race_date}
                  onChange={e => setForm(f => ({ ...f, race_date: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/50"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1">Image URL (optional)</label>
                <input
                  value={form.image_url}
                  onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/50"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-white/50 uppercase tracking-wider block mb-1">Description (optional)</label>
                <input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Let's all run together!"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/50"
                />
              </div>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-[#1D9E75] hover:bg-[#178a65] rounded-lg py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save race'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
