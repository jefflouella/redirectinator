import React from 'react';
import { SummaryStats, ProcessingStatus } from '@/types';
import { ProcessingStatus as ProcessingStatusComponent } from './ProcessingStatus';
import { SummaryStatistics } from './SummaryStatistics';
import { ExportSection } from './ExportSection';
import { ModeSelector } from './ModeSelector';

interface DashboardProps {
  summaryStats: SummaryStats;
  processingStatus: ProcessingStatus;
  onExport: (format: 'csv' | 'json' | 'excel' | 'report') => void;
  mode: 'default' | 'advanced';
  onModeChange: (mode: 'default' | 'advanced') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  summaryStats,
  processingStatus,
  onExport,
  mode,
  onModeChange,
}) => {
  return (
    <div className="space-y-6">
      <ModeSelector mode={mode} onModeChange={onModeChange} />

      <ProcessingStatusComponent processingStatus={processingStatus} />
      <SummaryStatistics summaryStats={summaryStats} />
      <ExportSection
        onExport={onExport}
        hasResults={summaryStats.totalUrls > 0}
      />
    </div>
  );
};
