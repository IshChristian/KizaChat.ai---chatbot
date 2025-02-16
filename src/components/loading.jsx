"use client"

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="text-2xl font-medium text-gray-900 mb-4">v0.dev</div>
      <div className="text-gray-600 flex items-center space-x-2">
        <span>is thinking</span>
        <span className="animate-pulse">...</span>
      </div>
    </div>
  )
}

