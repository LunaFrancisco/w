export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-200"></div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        
        {/* Title */}
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded w-full"></div>
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        </div>
        
        {/* Price and Stock */}
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        
        {/* Button */}
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb skeleton */}
        <div className="h-8 bg-gray-200 rounded-full w-64 mb-8 animate-pulse"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Image section skeleton */}
          <div className="space-y-6">
            <div className="aspect-square bg-gray-200 rounded-3xl animate-pulse"></div>
            <div className="flex space-x-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-24 h-24 bg-gray-200 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          </div>
          
          {/* Content section skeleton */}
          <div className="space-y-6 animate-pulse">
            {/* Category */}
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            
            {/* Title */}
            <div className="space-y-3">
              <div className="h-12 bg-gray-200 rounded w-full"></div>
              <div className="h-12 bg-gray-200 rounded w-2/3"></div>
            </div>
            
            {/* Stock */}
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            
            {/* Price section */}
            <div className="bg-gray-100 rounded-3xl p-6">
              <div className="h-16 bg-gray-200 rounded w-48 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            
            {/* Description */}
            <div className="bg-gray-100 rounded-2xl p-6">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
            
            {/* Buttons */}
            <div className="space-y-4">
              <div className="h-14 bg-gray-200 rounded-2xl w-full"></div>
              <div className="h-12 bg-gray-200 rounded-2xl w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}