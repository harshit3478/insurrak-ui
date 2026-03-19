import React from "react";

interface LoadingProps {
  minHeight?: string;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({ 
  minHeight = "500px", 
  className = "" 
}) => {
  return (
    <div 
      className={`flex h-full w-full items-center justify-center ${className}`} 
      style={{ minHeight }}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
    </div>
  );
};
