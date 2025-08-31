import React from 'react';
import { ProcessingStatus as ProcessingStatusType } from '@/types';
import { Activity, Clock, AlertCircle } from 'lucide-react';

interface ProcessingStatusProps {
  processingStatus: ProcessingStatusType;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ processingStatus }) => {
  const getProgressPercentage = () => {
    if (processingStatus.totalUrls === 0) return 0;
    return Math.round((processingStatus.processedUrls / processingStatus.totalUrls) * 100);
  };

  const getEstimatedTimeRemaining = () => {
    if (!processingStatus.startTime || processingStatus.processedUrls === 0) return null;

    const elapsed = Date.now() - processingStatus.startTime;
    const rate = processingStatus.processedUrls / elapsed;
    const remaining = (processingStatus.totalUrls - processingStatus.processedUrls) / rate;

    return Math.round(remaining / 1000); // Convert to seconds
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (!processingStatus.isProcessing) return null;

  return (
    <div className="card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="animate-spin-slow">
            <Activity className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary-900">
              Processing URLs
            </h3>
            <p className="text-sm text-primary-700">
              Batch {processingStatus.currentBatch} of {processingStatus.totalBatches}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-primary-900">
            {getProgressPercentage()}%
          </div>
          <div className="text-sm text-primary-700">
            {processingStatus.processedUrls} / {processingStatus.totalUrls}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-primary-200 rounded-full h-3 mb-4">
        <div
          className="bg-primary-600 h-3 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>

      {/* Current URL */}
      {processingStatus.currentUrl && (
        <div className="flex items-center space-x-2 text-sm text-primary-700">
          <Clock className="w-4 h-4" />
          <span className="font-mono truncate">{processingStatus.currentUrl}</span>
        </div>
      )}

      {/* Estimated Time */}
      {getEstimatedTimeRemaining() && (
        <div className="text-sm text-primary-600 mt-2">
          Estimated time remaining: {formatTime(getEstimatedTimeRemaining()!)}
        </div>
      )}

      {/* Errors */}
      {processingStatus.errors.length > 0 && (
        <div className="mt-4 p-3 bg-error-50 border border-error-200 rounded-lg">
          <div className="flex items-center space-x-2 text-error-700 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Errors ({processingStatus.errors.length})</span>
          </div>
          <div className="text-sm text-error-600 space-y-1">
            {processingStatus.errors.slice(-3).map((error, index) => (
              <div key={index} className="font-mono text-xs">{error}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
