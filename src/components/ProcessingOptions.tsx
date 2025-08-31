import React from 'react';
import { Play, RefreshCw, Trash2, Plus, Square } from 'lucide-react';
import { Project } from '@/types';

interface ProcessingOptionsProps {
  currentProject: Project | null;
  urlCount: number;
  resultCount: number;
  isProcessing: boolean;
  processingStatus?: {
    currentBatch: number;
    totalBatches: number;
    currentUrl?: string;
  };
  onRunAllUrls: () => void;
  onRunNewUrls: () => void;
  onContinueProcessing: () => void;
  onStopProcessing: () => void;
  onClearResults: () => void;
  progressStats?: {
    processed: number;
    remaining: number;
    percentage: number;
    isComplete: boolean;
  };
}

export const ProcessingOptions: React.FC<ProcessingOptionsProps> = ({
  currentProject,
  urlCount,
  resultCount,
  isProcessing,
  processingStatus,
  onRunAllUrls,
  onRunNewUrls,
  onContinueProcessing,
  onStopProcessing,
  onClearResults,
  progressStats
}) => {
  const newUrlCount = urlCount - resultCount;
  const hasNewUrls = newUrlCount > 0;
  const hasResults = resultCount > 0;
  const hasIncompleteProcessing = progressStats && !progressStats.isComplete && progressStats.remaining > 0;

  if (!currentProject) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Processing Options</h3>
        <div className="text-sm text-gray-600">
          {urlCount} URLs • {resultCount} Results
          {progressStats && (
            <span className="ml-2 text-blue-600">
              • {progressStats.processed}/{urlCount} processed ({progressStats.percentage}%)
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Stop Processing */}
        {isProcessing && (
          <button
            onClick={onStopProcessing}
            className="flex items-center justify-center space-x-2 p-4 border border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
          >
            <Square className="w-5 h-5 text-red-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Stop Processing</div>
              <div className="text-sm text-gray-600">Interrupt current batch</div>
            </div>
          </button>
        )}

        {/* Continue Processing */}
        {hasIncompleteProcessing && !isProcessing && (
          <button
            onClick={onContinueProcessing}
            className="flex items-center justify-center space-x-2 p-4 border border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
          >
            <Play className="w-5 h-5 text-orange-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Continue Processing</div>
              <div className="text-sm text-gray-600">{progressStats?.remaining} URLs remaining</div>
            </div>
          </button>
        )}

        {/* Run All URLs Again */}
        <button
          onClick={onRunAllUrls}
          disabled={isProcessing || urlCount === 0}
          className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className="w-5 h-5 text-blue-600" />
          <div className="text-left">
            <div className="font-medium text-gray-900">Run All URLs Again</div>
            <div className="text-sm text-gray-600">Process all {urlCount} URLs</div>
          </div>
        </button>

        {/* Run New URLs Only */}
        <button
          onClick={onRunNewUrls}
          disabled={isProcessing || !hasNewUrls}
          className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5 text-green-600" />
          <div className="text-left">
            <div className="font-medium text-gray-900">Run New URLs Only</div>
            <div className="text-sm text-gray-600">
              {hasNewUrls ? `${newUrlCount} new URLs` : 'No new URLs'}
            </div>
          </div>
        </button>

        {/* Clear Results */}
        <button
          onClick={onClearResults}
          disabled={isProcessing || !hasResults}
          className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-5 h-5 text-red-600" />
          <div className="text-left">
            <div className="font-medium text-gray-900">Clear Results</div>
            <div className="text-sm text-gray-600">
              {hasResults ? `${resultCount} results` : 'No results'}
            </div>
          </div>
        </button>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-800">Processing URLs...</span>
          </div>
        </div>
      )}

      {/* Info Messages */}
      {!isProcessing && (
        <div className="mt-4 space-y-2">
          {urlCount === 0 && (
            <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
              No URLs added yet. Add URLs to start processing.
            </div>
          )}
          {urlCount > 0 && !hasResults && (
            <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
              Ready to process {urlCount} URLs. Click "Run All URLs Again" to start.
            </div>
          )}
          {hasIncompleteProcessing && (
            <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
              Processing was interrupted. {progressStats?.remaining} URLs remaining. Click "Continue Processing" to resume.
            </div>
          )}
          {hasNewUrls && hasResults && !hasIncompleteProcessing && (
            <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
              {newUrlCount} new URLs available. Click "Run New URLs Only" to process just the new ones.
            </div>
          )}
          {!hasNewUrls && hasResults && !hasIncompleteProcessing && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              All URLs have been processed. Click "Run All URLs Again" to re-process everything.
            </div>
          )}
        </div>
      )}
      
      {/* Processing Status */}
      {isProcessing && (
        <div className="mt-4 space-y-2">
          <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
            Processing batch {processingStatus.currentBatch} of {processingStatus.totalBatches} • 
            {processingStatus.currentUrl && ` Currently: ${processingStatus.currentUrl}`}
          </div>
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            You can stop processing at any time using the "Stop Processing" button above, or press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Esc</kbd> or <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl+C</kbd>.
          </div>
        </div>
      )}
    </div>
  );
};
