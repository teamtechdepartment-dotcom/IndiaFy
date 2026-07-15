import React from "react";
import { Skeleton } from "../Skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <Skeleton className="w-48 h-8 mb-2" />
          <Skeleton className="w-64 h-4" />
        </div>
        <Skeleton className="w-32 h-10 rounded-lg" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-10 h-10 rounded-xl" />
            </div>
            <Skeleton className="w-32 h-8 mb-2" />
            <Skeleton className="w-40 h-4" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <Skeleton className="w-48 h-6 mb-6" />
          <Skeleton className="w-full h-[300px] rounded-xl" />
        </div>

        {/* Side Widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <Skeleton className="w-32 h-6 mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1">
                  <Skeleton className="w-3/4 h-4 mb-2" />
                  <Skeleton className="w-1/2 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <Skeleton className="w-40 h-6 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-50">
              <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
              <Skeleton className="w-1/4 h-4" />
              <Skeleton className="w-1/4 h-4" />
              <Skeleton className="w-1/6 h-4" />
              <Skeleton className="w-20 h-8 rounded-lg ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
