export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="h-5 bg-gray-200 rounded w-2/3" />
        <div className="h-5 w-14 bg-gray-200 rounded-full" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-4/5" />
      </div>
      <div className="flex justify-between items-end">
        <div>
          <div className="h-3 bg-gray-200 rounded w-16 mb-1" />
          <div className="h-5 bg-gray-200 rounded w-24" />
        </div>
        <div>
          <div className="h-3 bg-gray-200 rounded w-12 mb-1" />
          <div className="h-5 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </div>
  );
}
