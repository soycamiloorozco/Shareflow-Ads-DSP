import React from 'react';

interface ProgressBarProps {
  percentage: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ProgressBar({ 
  percentage, 
  color = 'primary',
  size = 'md',
  showLabel = false 
}: ProgressBarProps) {
  const height = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }[size];

  const bgColor = {
    primary: 'bg-primary',
    success: 'bg-success-500',
    error: 'bg-error-500',
    warning: 'bg-warning-500'
  }[color] || 'bg-primary';

  return (
    <div className="w-full">
      <div className={`w-full ${height} bg-neutral-100 rounded-full overflow-hidden`}>
        <div
          className={`${height} ${bgColor} rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${Math.min(100, Math.max(0, percentage * 100))}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-neutral-600 mt-1">
          {Math.round(percentage * 100)}%
        </p>
      )}
    </div>
  );
}