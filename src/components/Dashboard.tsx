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
  onModeChange
}) => {
  return (
    <div className="space-y-6">
      <ModeSelector mode={mode} onModeChange={onModeChange} />
      
      {/* Notice about Advanced mode coming soon */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-800">Advanced Mode Coming Soon!</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Currently, this tool only detects HTTP redirects (301, 302, etc.).</p>
              <p className="mt-1">Advanced mode will use Puppeteer to detect Meta Refresh and JavaScript redirects, but requires server hosting that supports browser automation.</p>
            </div>
          </div>
        </div>
      </div>
      
      <ProcessingStatusComponent processingStatus={processingStatus} />
      <SummaryStatistics summaryStats={summaryStats} />
      <ExportSection
        onExport={onExport}
        hasResults={summaryStats.totalUrls > 0}
      />
    </div>
  );
};
