

import { useEffect, useRef } from "react"

export default function InfiniteScroll({ children, onLoadMore, hasMore = true, isLoading = false }) {
  const observerTarget = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading) {
          onLoadMore?.()
        }
      },
      { threshold: 0.1 },
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, isLoading, onLoadMore])

  return (
    <div className="space-y-4">
      {children}

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {hasMore && <div ref={observerTarget} className="py-4" aria-label="Load more" />}

      {!hasMore && !isLoading && children && (
        <div className="text-center py-8 text-slate-400">No more items to load</div>
      )}
    </div>
  )
}
