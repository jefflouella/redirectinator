import React, { useState } from 'react';
import { Play, RefreshCw, Trash2, Plus, Square } from 'lucide-react';
import { Project } from '@/types';
import { ConfirmationOverlay } from './ConfirmationOverlay';
import { useAnalytics } from '@/hooks/useAnalytics';

interface ProcessingOptionsProps {
  currentProject: Project | null;
  urlCount: number;
  resultCount: number;
  isProcessing: boolean;
  processingStatus?: {
    currentBatch: number;
    totalBatches: number;
    currentUrl?: string;
    isStopping?: boolean;
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
  progressStats,
}) => {
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const { trackDetailedUIInteraction } = useAnalytics();

  const newUrlCount = urlCount - resultCount;
  const hasNewUrls = newUrlCount > 0;
  const hasResults = resultCount > 0;
  const hasIncompleteProcessing =
    progressStats && !progressStats.isComplete && progressStats.remaining > 0;

  const handleClearResults = () => {
    trackDetailedUIInteraction('clear_results_button', 'click', 'processing_options', {
      result_count: resultCount,
      has_results: hasResults,
    });
    setShowClearConfirmation(true);
  };

  const handleConfirmClear = () => {
    trackDetailedUIInteraction('clear_results_confirm', 'click', 'processing_options', {
      result_count: resultCount,
    });
    onClearResults();
    setShowClearConfirmation(false);
  };

  const handleRunAllUrls = () => {
    trackDetailedUIInteraction('run_all_urls_button', 'click', 'processing_options', {
      url_count: urlCount,
      result_count: resultCount,
      has_incomplete: hasIncompleteProcessing,
    });
    onRunAllUrls();
  };

  const handleRunNewUrls = () => {
    trackDetailedUIInteraction('run_new_urls_button', 'click', 'processing_options', {
      new_url_count: newUrlCount,
      total_url_count: urlCount,
      result_count: resultCount,
    });
    onRunNewUrls();
  };

  const handleContinueProcessing = () => {
    trackDetailedUIInteraction('continue_processing_button', 'click', 'processing_options', {
      remaining_urls: progressStats?.remaining || 0,
      processed_urls: progressStats?.processed || 0,
    });
    onContinueProcessing();
  };

  const handleStopProcessing = () => {
    trackDetailedUIInteraction('stop_processing_button', 'click', 'processing_options', {
      current_batch: processingStatus?.currentBatch || 0,
      total_batches: processingStatus?.totalBatches || 0,
    });
    onStopProcessing();
  };

  if (!currentProject) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Processing Options
        </h3>
        <div className="text-sm text-gray-600">
          {urlCount} URLs • {resultCount} Results
          {progressStats && (
            <span className="ml-2 text-blue-600">
              • {progressStats.processed}/{urlCount} processed (
              {progressStats.percentage}%)
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Stop Processing */}
        {isProcessing && (
          <button
            onClick={handleStopProcessing}
            className="flex items-center justify-center space-x-2 p-4 border border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
          >
            <Square className="w-5 h-5 text-red-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Stop Processing</div>
              <div className="text-sm text-gray-600">
                Interrupt current batch
              </div>
            </div>
          </button>
        )}

        {/* Continue Processing */}
        {hasIncompleteProcessing && !isProcessing && (
          <button
            onClick={handleContinueProcessing}
            className="flex items-center justify-center space-x-2 p-4 border border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
          >
            <Play className="w-5 h-5 text-orange-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">
                Continue Processing
              </div>
              <div className="text-sm text-gray-600">
                {progressStats?.remaining} URLs remaining
              </div>
            </div>
          </button>
        )}

        {/* Run All URLs Again */}
        <button
          onClick={handleRunAllUrls}
          disabled={isProcessing || urlCount === 0}
          className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className="w-5 h-5 text-blue-600" />
          <div className="text-left">
            <div className="font-medium text-gray-900">Run All URLs Again</div>
            <div className="text-sm text-gray-600">
              Process all {urlCount} URLs
            </div>
          </div>
        </button>

        {/* Run New URLs Only */}
        <button
          onClick={handleRunNewUrls}
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
          onClick={handleClearResults}
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
              Ready to process {urlCount} URLs. Click "Run All URLs Again" to
              start.
            </div>
          )}
          {hasIncompleteProcessing && (
            <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
              Processing was interrupted. {progressStats?.remaining} URLs
              remaining. Click "Continue Processing" to resume.
            </div>
          )}
          {hasNewUrls && hasResults && !hasIncompleteProcessing && (
            <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
              {newUrlCount} new URLs available. Click "Run New URLs Only" to
              process just the new ones.
            </div>
          )}
          {!hasNewUrls && hasResults && !hasIncompleteProcessing && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              All URLs have been processed. Click "Run All URLs Again" to
              re-process everything.
            </div>
          )}
        </div>
      )}

      {/* Clear Results Confirmation Overlay */}
      <ConfirmationOverlay
        isOpen={showClearConfirmation}
        onClose={() => setShowClearConfirmation(false)}
        onConfirm={handleConfirmClear}
        title="Clear All Results"
        message={`Are you sure you want to clear all ${resultCount} results? This action cannot be undone and will remove all processed data for this project.`}
        confirmText="Clear Results"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
