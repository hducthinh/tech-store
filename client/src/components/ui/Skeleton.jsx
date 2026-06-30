import React from 'react';

/**
 * Skeleton Loading Component
 * @param {Object} props
 * @param {string} props.className - Tailwind classes for size, border-radius, margins
 */
export function Skeleton({ className = "", ...props }) {
  return (
    <div 
      className={`animate-pulse bg-gray-200/80 rounded-md ${className}`} 
      {...props} 
    />
  );
}

export function SkeletonText({ lines = 1, className = "", lineClassName = "h-4 w-full mb-2" }) {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={lineClassName} />
      ))}
    </div>
  );
}
