import { isMockMode, MOCK_ACTIVITIES } from '@/mock/data';
import HeatmapClient from './HeatmapClient';

async function getPolylines(): Promise<string[]> {
  if (isMockMode) {
    // Return mock polylines (in real usage these would be encoded polylines from Strava)
    // Using a simple Raleigh-area encoded polyline for demo
    return [
      'wqwfEzravNkBtA}CxBqBjBoCtBqAnAs@n@cCxBkCxBgBdBwAbBmAxB_AzBo@lCc@hC',
      '_nwfEzravNsBtAmCxByBjByBtBoAnAcAn@kCxBiCxBeBdBqBbBwAxBeAtBo@lCe@hC',
      'oqwfE`savNqBtAuCxBoChB{BtBuAnA{@n@eCxB{BxBgBdBwAbBsAxBo@lCc@hC',
      'sqwfEfravNiBrA{BxBoCfByBrBoAnAs@n@cCxBkCxBgBdBwAbBmAxB_AzBo@lCc@hC',
      'cqwfEpravNkBtA}CxBqBjBoCtBqAnAs@n@cCxBkCxBgBdBwAbBmAxB_AzBo@lCc@hC',
      'uqwfE~qavNqBtAuCxBoChB{BtBuAnA{@n@eCxB{BxBgBdBwAbBsAxBo@lCc@hC',
      'mqwfEjravNsBtAmCxByBjByBtBoAnAcAn@kCxBiCxBeBdBqBbBwAxBeAtBo@lCe@hC',
    ];
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data } = await supabase
    .from('activities')
    .select('summary_polyline')
    .not('summary_polyline', 'is', null)
    .not('summary_polyline', 'eq', '');

  return (data ?? [])
    .map((a: { summary_polyline: string | null }) => a.summary_polyline)
    .filter(Boolean) as string[];
}

export default async function HeatmapPage() {
  const polylines = await getPolylines();

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-medium text-gray-900">Community Heatmap</h1>

      {/* Add NEXT_PUBLIC_MAPBOX_TOKEN to .env to enable map */}
      <HeatmapClient polylines={polylines} />

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-2xl font-medium text-gray-900">{polylines.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">total routes</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-2xl font-medium text-gray-900">{new Set(polylines).size}</div>
          <div className="text-xs text-gray-500 mt-0.5">unique polylines</div>
        </div>
      </div>
    </div>
  );
}
