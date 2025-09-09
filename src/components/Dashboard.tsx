import React from 'react';
import { SummaryStats } from '@/types';
import { SummaryStatistics } from './SummaryStatistics';
import { ExportSection } from './ExportSection';
import { ModeSelector } from './ModeSelector';

interface DashboardProps {
  summaryStats: SummaryStats;
  onExport: (format: 'csv' | 'json' | 'excel' | 'report') => void;
  mode: 'default' | 'advanced';
  onModeChange: (mode: 'default' | 'advanced') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  summaryStats,
  onExport,
  mode,
  onModeChange,
}) => {
  return (
    <div className="space-y-6">
      <ModeSelector mode={mode} onModeChange={onModeChange} />

      <SummaryStatistics summaryStats={summaryStats} />
      <ExportSection
        onExport={onExport}
        hasResults={summaryStats.totalUrls > 0}
      />
    </div>
  );
};
