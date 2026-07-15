import React from "react";
import { Skeleton, SkeletonText } from "../Skeleton";

export function BlogSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 w-full">
      <Skeleton className="w-full aspect-[21/9] rounded-3xl mb-8" />
      
      <div className="max-w-3xl mx-auto">
        <Skeleton className="w-32 h-6 rounded-full mb-6" />
        <Skeleton className="w-full h-12 mb-4" />
        <Skeleton className="w-4/5 h-12 mb-8" />
        
        <div className="flex items-center gap-4 mb-12 py-6 border-y border-slate-100">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div>
            <Skeleton className="w-32 h-5 mb-2" />
            <Skeleton className="w-24 h-4" />
          </div>
          <div className="ml-auto flex gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </div>

        <div className="space-y-8">
          <SkeletonText lines={4} className="h-5" />
          <Skeleton className="w-full h-64 rounded-2xl my-8" />
          <SkeletonText lines={6} className="h-5" />
          <Skeleton className="w-2/3 h-8 my-6" />
          <SkeletonText lines={3} className="h-5" />
        </div>
      </div>
    </div>
  );
}
