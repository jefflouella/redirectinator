import React from 'react';
import { SummaryStats, ProcessingStatus } from '@/types';
import { ProcessingStatus as ProcessingStatusComponent } from './ProcessingStatus';
import { SummaryStatistics } from './SummaryStatistics';
import { ExportSection } from './ExportSection';

interface DashboardProps {
  summaryStats: SummaryStats;
  processingStatus: ProcessingStatus;
  onExport: (format: 'csv' | 'json' | 'excel' | 'report') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  summaryStats,
  processingStatus,
  onExport
}) => {
  return (
    <div className="space-y-6">
      <ProcessingStatusComponent processingStatus={processingStatus} />
      <SummaryStatistics summaryStats={summaryStats} />
      <ExportSection
        onExport={onExport}
        hasResults={summaryStats.totalUrls > 0}
      />
    </div>
  );
};
