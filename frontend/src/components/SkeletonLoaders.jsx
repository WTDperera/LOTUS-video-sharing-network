// Loading Skeleton Components
export const VideoCardSkeleton = () => (
  <div className="bg-dark-300 rounded-lg overflow-hidden animate-pulse">
    <div className="aspect-video bg-dark-200"></div>
    <div className="p-3">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-dark-200 flex-shrink-0"></div>
        <div className="flex-1">
          <div className="h-4 bg-dark-200 rounded mb-2 w-3/4"></div>
          <div className="h-3 bg-dark-200 rounded mb-2 w-1/2"></div>
          <div className="h-3 bg-dark-200 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  </div>
);

export const VideoGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <VideoCardSkeleton key={i} />
    ))}
  </div>
);

export const CommentSkeleton = () => (
  <div className="flex gap-3 animate-pulse">
    <div className="w-10 h-10 rounded-full bg-dark-200 flex-shrink-0"></div>
    <div className="flex-1">
      <div className="h-3 bg-dark-200 rounded mb-2 w-1/4"></div>
      <div className="h-4 bg-dark-200 rounded mb-2 w-full"></div>
      <div className="h-4 bg-dark-200 rounded w-3/4"></div>
    </div>
  </div>
);

export const CommentsSkeleton = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <CommentSkeleton key={i} />
    ))}
  </div>
);
