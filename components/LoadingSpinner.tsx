import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3" role="status" aria-live="polite">
      <div className={`${sizeClasses[size]} animate-spin`}>
        <svg viewBox="0 0 24 24" fill="none" className="text-current">
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="3"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      {text && (
        <span className="text-xs font-bold text-muted animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
};

export { LoadingSpinner };

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
    <div className="h-3 bg-white/10 rounded w-1/2" />
  </div>
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className = '' 
}) => (
  <div className={`animate-pulse space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div 
        key={i} 
        className="h-3 bg-white/10 rounded" 
        style={{ width: `${100 - i * 15}%` }}
      />
    ))}
  </div>
);

export default LoadingSpinner;
