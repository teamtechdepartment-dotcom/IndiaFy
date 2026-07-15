import React from "react";
import { Skeleton, SkeletonText, SkeletonButton } from "../Skeleton";

export function HeroSkeleton() {
  return (
    <div className="w-full relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Content Area */}
          <div className="space-y-8">
            <Skeleton className="h-8 w-40 rounded-full" />
            <div className="space-y-4">
              <Skeleton className="h-16 w-full lg:w-4/5" />
              <Skeleton className="h-16 w-3/4" />
            </div>
            <SkeletonText lines={3} className="text-lg max-w-xl" />
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <SkeletonButton className="h-14 w-full sm:w-48" />
              <SkeletonButton className="h-14 w-full sm:w-40 bg-slate-100" />
            </div>

            <div className="pt-8 flex items-center gap-6">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>

          {/* Right Content Area / Images */}
          <div className="relative">
            <Skeleton className="w-full aspect-[4/3] lg:aspect-square rounded-[2rem]" />
            <div className="absolute -bottom-8 -left-8 hidden md:block">
              <Skeleton className="w-64 h-48 rounded-2xl shadow-xl" />
            </div>
            <div className="absolute -top-8 -right-8 hidden md:block">
              <Skeleton className="w-48 h-48 rounded-2xl shadow-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
