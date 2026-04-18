import React from 'react';
import { cn } from "../layout/MainLayout";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-2xl bg-white/5 border border-white/5", className)}
      {...props}
    />
  )
}
