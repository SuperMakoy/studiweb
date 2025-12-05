export default function Loading() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 w-40 bg-muted rounded animate-pulse" />
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </div>

        {/* Controls skeleton */}
        <div className="flex gap-4 mb-8">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="flex-1 h-10 bg-muted rounded-lg animate-pulse" />
        </div>

        {/* Grid skeleton - 4 columns */}
        <div className="grid grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-40 bg-muted rounded-lg animate-pulse" />
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
