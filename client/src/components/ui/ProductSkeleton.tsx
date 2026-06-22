import React from "react";

export function ProductSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 flex flex-col justify-between overflow-hidden animate-pulse">
      <div className="w-full aspect-square bg-slate-100"></div>
      <div className="p-4 flex-grow flex flex-col justify-end">
        <div className="h-4 bg-slate-100 rounded w-full mb-2"></div>
        <div className="h-4 bg-slate-100 rounded w-2/3 mb-4"></div>
        
        <div className="flex flex-col gap-1.5 mb-3 mt-2">
          <div className="h-3 bg-slate-100 rounded w-16"></div>
          <div className="h-5 bg-slate-100 rounded w-24"></div>
        </div>

        <div className="h-3 bg-slate-100 rounded w-32 mt-auto"></div>
      </div>
    </div>
  );
}
