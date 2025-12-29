

import { useEffect, useRef, useState } from "react"

/**
 * Custom hook for lazy loading items as user scrolls
 * @param {Function} onLoadMore - Callback when more items should be loaded
 * @param {Object} options - Configuration options
 */
export const useLazyLoad = (onLoadMore, options = {}) => {
  const { threshold = 0.5, enabled = true } = options
  const containerRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!enabled || !containerRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading) {
          setIsLoading(true)
          onLoadMore().then(() => setIsLoading(false))
        }
      },
      { threshold },
    )

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [enabled, isLoading, onLoadMore, threshold])

  return { containerRef, isLoading }
}
