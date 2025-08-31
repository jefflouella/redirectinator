import React from 'react';
import { Download, FileText, BarChart3, Zap } from 'lucide-react';

interface ExportSectionProps {
  onExport: (format: 'csv' | 'json' | 'excel' | 'report') => void;
  hasResults: boolean;
}

export const ExportSection: React.FC<ExportSectionProps> = ({ onExport, hasResults }) => {
  if (!hasResults) return null;

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-tech-900">Export Results</h3>
          <p className="text-sm text-tech-600">
            Download your analysis results in various formats
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onExport('csv')}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => onExport('excel')}
            className="btn-secondary flex items-center space-x-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Excel</span>
          </button>

          <button
            onClick={() => onExport('json')}
            className="btn-secondary flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>JSON</span>
          </button>

          <button
            onClick={() => onExport('report')}
            className="btn-primary flex items-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
