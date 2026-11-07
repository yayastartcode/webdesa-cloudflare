import { useCallback, useEffect, useState } from 'react';
import type { ReportData } from './reports';
export function useReports() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/reports', { signal });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Gagal memuat laporan.');
      if (!signal?.aborted) setData(result.data);
    } catch (error) { if (!signal?.aborted) setError(error instanceof Error ? error.message : 'Gagal memuat laporan.'); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, []);
  useEffect(() => { const controller = new AbortController(); void refresh(controller.signal); return () => controller.abort(); }, [refresh]);
  return { data, loading, error, refresh };
}
