import React from 'react';


interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}


export function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };


  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin`} />
      {message && <div className="text-gray-400 text-sm">{message}</div>}
    </div>
  );
}
