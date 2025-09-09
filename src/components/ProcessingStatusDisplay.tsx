import React from 'react';
import { ProcessingStatus as ProcessingStatusType } from '@/types';

interface ProcessingStatusDisplayProps {
  isProcessing: boolean;
  processingStatus?: ProcessingStatusType;
}

export const ProcessingStatusDisplay: React.FC<
  ProcessingStatusDisplayProps
> = ({ isProcessing, processingStatus }) => {
  if (!isProcessing) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Simple Processing Status */}
      <div
        className={`p-3 border rounded-lg ${
          processingStatus?.isStopping
            ? 'bg-orange-50 border-orange-200'
            : 'bg-blue-50 border-blue-200'
        }`}
      >
        <div className="flex items-center space-x-2">
          <div
            className={`animate-spin rounded-full h-4 w-4 border-b-2 ${
              processingStatus?.isStopping
                ? 'border-orange-600'
                : 'border-blue-600'
            }`}
          ></div>
          <span
            className={`text-sm ${
              processingStatus?.isStopping ? 'text-orange-800' : 'text-blue-800'
            }`}
          >
            {processingStatus?.isStopping
              ? 'Stopping after current batch finishes...'
              : 'Processing URLs...'}
          </span>
        </div>
      </div>

      {/* Detailed Processing Status */}
      <div className="mt-4 space-y-2">
        <div
          className={`text-sm p-2 rounded ${
            processingStatus?.isStopping
              ? 'text-orange-600 bg-orange-50'
              : 'text-blue-600 bg-blue-50'
          }`}
        >
          {processingStatus?.isStopping ? 'Stopping' : 'Processing'} batch{' '}
          {processingStatus?.currentBatch || 0} of{' '}
          {processingStatus?.totalBatches || 0} •
          {processingStatus?.currentUrl &&
            ` Currently: ${processingStatus.currentUrl}`}
        </div>
        {!processingStatus?.isStopping && (
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            You can stop processing at any time using the "Stop Processing"
            button above, or press{' '}
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Esc</kbd>{' '}
            or{' '}
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">
              Ctrl+C
            </kbd>
            .
          </div>
        )}
        {processingStatus?.isStopping && (
          <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
            Stop request received. Processing will stop after the current batch
            completes.
          </div>
        )}
      </div>
    </div>
  );
};
