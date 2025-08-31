import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatisticsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: 'primary' | 'success' | 'warning' | 'error' | 'tech';
  subtitle?: string;
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return {
          bg: 'bg-primary-100',
          text: 'text-primary-600',
          value: 'text-primary-600',
          title: 'text-tech-600'
        };
      case 'success':
        return {
          bg: 'bg-success-100',
          text: 'text-success-600',
          value: 'text-success-600',
          title: 'text-tech-600'
        };
      case 'warning':
        return {
          bg: 'bg-warning-100',
          text: 'text-warning-600',
          value: 'text-warning-600',
          title: 'text-tech-600'
        };
      case 'error':
        return {
          bg: 'bg-error-100',
          text: 'text-error-600',
          value: 'text-error-600',
          title: 'text-tech-600'
        };
      case 'tech':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-600',
          value: 'text-tech-900',
          title: 'text-tech-600'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-600',
          value: 'text-tech-900',
          title: 'text-tech-600'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${colors.title}`}>{title}</p>
          <p className={`text-2xl font-bold ${colors.value}`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-2 ${colors.bg} rounded-lg`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
      </div>
    </div>
  );
};
