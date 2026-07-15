import React from "react";
import { Skeleton } from "../ui/Skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-3 border border-zinc-100">
      <Skeleton className="w-full aspect-square rounded-xl mb-2.5" />
      <Skeleton className="w-4/5 h-3 mb-1.5" />
      <Skeleton className="w-1/2 h-2.5 mb-3" />
      <div className="flex justify-between items-end">
        <Skeleton className="w-12 h-4" />
        <Skeleton className="w-14 h-8 rounded-xl" />
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl" />
      <Skeleton className="w-12 h-2.5" />
    </div>
  );
}

export function BuyAgainSkeleton() {
  return (
    <div className="shrink-0 w-[130px] bg-white rounded-2xl p-3 border border-zinc-100">
      <Skeleton className="w-full aspect-square rounded-xl mb-2" />
      <Skeleton className="w-3/4 h-3 mb-1.5" />
      <div className="flex justify-between items-center">
        <Skeleton className="w-10 h-3.5" />
        <Skeleton className="w-8 h-7 rounded-lg" />
      </div>
    </div>
  );
}

export function FlashDealSkeleton() {
  return (
    <div className="shrink-0 w-[200px] bg-white rounded-2xl p-3 border border-zinc-100">
      <Skeleton className="w-full h-24 rounded-xl mb-2.5" />
      <Skeleton className="w-3/4 h-3.5 mb-1.5" />
      <Skeleton className="w-1/2 h-3 mb-2" />
      <div className="flex justify-between">
        <Skeleton className="w-14 h-4" />
        <Skeleton className="w-16 h-3" />
      </div>
    </div>
  );
}
