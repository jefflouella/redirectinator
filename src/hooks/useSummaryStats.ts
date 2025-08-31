import { useMemo } from 'react';
import { RedirectResult, SummaryStats } from '@/types';

export const useSummaryStats = (results: RedirectResult[]) => {
  const summaryStats = useMemo(() => {
    const stats: SummaryStats = {
      totalUrls: results.length,
      good: results.filter(r => r.result === 'redirect').length,
      bad: results.filter(r => r.result === 'error').length,
      notRedirected: results.filter(r => r.result === 'direct').length,
      redirectChain: results.filter(r => r.numberOfRedirects > 0).length,
      containsOnly301: results.filter(r => r.httpStatus.includes('301') && !r.httpStatus.includes('302')).length,
      contains302: results.filter(r => r.httpStatus.includes('302')).length,
      contains4xx: results.filter(r => r.finalStatusCode >= 400 && r.finalStatusCode < 500).length,
      contains5xx: results.filter(r => r.finalStatusCode >= 500).length,
    };
    return stats;
  }, [results]);

  return summaryStats;
};
