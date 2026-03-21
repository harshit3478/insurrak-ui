import React from 'react';

interface SkeletonRowsProps {
  columns?: number;
  rows?: number;
}

/**
 * Renders a set of animated skeleton rows specifically designed to act as
 * a placeholder inside a `<tbody>` element while data is fetching.
 * Preserves the actual table layout and headers for superior UX.
 */
export function SkeletonRows({ columns = 5, rows = 5 }: SkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse hover:bg-transparent">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="py-4 px-4 border-b border-gray-50 dark:border-dark-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full max-w-[80%] opacity-50"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
