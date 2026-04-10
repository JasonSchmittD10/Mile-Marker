'use client';

import { useState } from 'react';

export default function BackfillButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<{ inserted: number; skipped: number; total: number } | null>(null);

  async function handleBackfill() {
    setStatus('loading');
    try {
      const res = await fetch('/api/backfill', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setResult(data);
        setStatus('done');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done' && result) {
    return (
      <div className="bg-[#1D9E75]/10 border border-[#1D9E75]/30 rounded-lg px-4 py-3 text-sm text-[#1D9E75]">
        ✓ Imported {result.inserted} activities ({result.skipped} already existed)
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
        Something went wrong. Try again later.
      </div>
    );
  }

  return (
    <button
      onClick={handleBackfill}
      disabled={status === 'loading'}
      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {status === 'loading' ? 'Importing your Strava history…' : 'Import past Strava activities'}
    </button>
  );
}
