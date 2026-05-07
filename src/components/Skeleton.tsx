import { motion } from "motion/react";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-white/5 rounded ${className}`}>
      <motion.div
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent"
      />
    </div>
  );
}

export function PollCardSkeleton() {
  return (
    <div className="glass rounded-[2.5rem] overflow-hidden border border-white/5 p-0 flex flex-col h-full">
      <div className="aspect-[4/3] bg-zinc-900/50 relative overflow-hidden">
        <Skeleton className="absolute inset-0 w-full h-full" />
      </div>
      <div className="p-8 space-y-6">
        <div>
          <Skeleton className="h-8 w-3/4 mb-3 rounded-lg" />
          <Skeleton className="h-4 w-full mb-2 rounded-md" />
          <Skeleton className="h-4 w-5/6 rounded-md" />
        </div>
        
        <div className="flex gap-3">
          <Skeleton className="h-14 flex-grow rounded-2xl" />
          <Skeleton className="h-14 w-14 rounded-2xl" />
        </div>

        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
          <Skeleton className="h-3 w-12 rounded" />
        </div>
      </div>
    </div>
  );
}

export function MainPollSkeleton() {
  return (
    <div className="glass rounded-[2.5rem] border border-white/5 p-8 flex flex-col h-full">
       <div className="flex items-center justify-between mb-8">
         <Skeleton className="h-6 w-32 rounded-full" />
         <Skeleton className="h-10 w-10 rounded-xl" />
       </div>

       <div className="space-y-4 mb-10">
         <Skeleton className="h-12 w-full rounded-2xl" />
         <Skeleton className="h-12 w-2/3 rounded-2xl" />
       </div>

       <div className="aspect-video bg-zinc-900/50 rounded-3xl mb-10 overflow-hidden">
         <Skeleton className="w-full h-full" />
       </div>

       <div className="grid grid-cols-2 gap-4 mb-8">
         <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
           <Skeleton className="h-8 w-16" />
           <Skeleton className="h-3 w-24" />
         </div>
         <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
           <Skeleton className="h-8 w-16" />
           <Skeleton className="h-3 w-24" />
         </div>
       </div>

       <Skeleton className="h-16 w-full rounded-[1.25rem] mt-auto" />
    </div>
  );
}

export function NewsSkeleton() {
  return (
    <div className="glass p-6 rounded-3xl border border-white/5 flex gap-5">
      <Skeleton className="w-32 h-20 rounded-2xl flex-shrink-0" />
      <div className="flex-grow space-y-3">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-5 w-full rounded" />
        <Skeleton className="h-5 w-4/5 rounded" />
      </div>
    </div>
  );
}

export function RankingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="glass p-6 rounded-3xl border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Skeleton className="w-16 h-16 rounded-2xl flex-shrink-0" />
            <div className="space-y-3">
              <Skeleton className="h-6 w-32 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-8 w-24 rounded ml-auto" />
            <Skeleton className="h-3 w-32 rounded ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="glass p-6 rounded-3xl border border-white/5 flex gap-4">
          <Skeleton className="w-12 h-12 rounded-2xl flex-shrink-0" />
          <div className="flex-grow space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-32 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
