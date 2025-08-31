import React from 'react';
import { SummaryStats } from '@/types';
import { StatisticsCard } from './StatisticsCard';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  TrendingUp
} from 'lucide-react';

interface SummaryStatisticsProps {
  summaryStats: SummaryStats;
}

export const SummaryStatistics: React.FC<SummaryStatisticsProps> = ({ summaryStats }) => {
  return (
    <div className="space-y-6">
      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticsCard
          title="Total URLs"
          value={summaryStats.totalUrls}
          icon={FileText}
          color="tech"
        />

        <StatisticsCard
          title="Good"
          value={summaryStats.good}
          icon={CheckCircle}
          color="success"
        />

        <StatisticsCard
          title="Bad"
          value={summaryStats.bad}
          icon={XCircle}
          color="error"
        />

        <StatisticsCard
          title="Not Redirected"
          value={summaryStats.notRedirected}
          icon={Clock}
          color="warning"
        />
      </div>

      {/* Response Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatisticsCard
          title="Redirect Chain"
          value={summaryStats.redirectChain}
          icon={TrendingUp}
          color="primary"
        />

        <StatisticsCard
          title="Contains only 301"
          value={summaryStats.containsOnly301}
          icon={CheckCircle}
          color="success"
        />

        <StatisticsCard
          title="Contains a 302"
          value={summaryStats.contains302}
          icon={AlertCircle}
          color="warning"
        />

        <StatisticsCard
          title="Contains a 4xx"
          value={summaryStats.contains4xx}
          icon={XCircle}
          color="error"
        />

        <StatisticsCard
          title="Contains a 5xx"
          value={summaryStats.contains5xx}
          icon={XCircle}
          color="error"
        />
      </div>
    </div>
  );
};
