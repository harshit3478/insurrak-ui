import React from 'react';
import { LucideProps, ArrowUp, ArrowDown } from 'lucide-react';

interface StatCardProps {
  icon: React.ElementType<LucideProps>;
  title: string;
  description: string;
  value: string;
  trend: 'up' | 'down';
  trendValue: string;
  trendLabel: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  description,
  value,
  trend,
  trendValue,
  trendLabel,
}) => {
  const trendColor = trend === 'up' ? 'text-green-500' : 'text-red-500';
  const TrendIcon = trend === 'up' ? ArrowUp : ArrowDown;

  return (
    <div className="bg-white dark:bg-gray-dark border border-gray-100 dark:border-dark-3 rounded-2xl p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-dark-2">
          <Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      </div>
      <div className="mt-6">
        <p className="text-4xl font-bold text-gray-900 dark:text-white">{value}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            {trendValue}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{trendLabel}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;