

import { useState, useCallback } from "react"

/**
 * Custom hook for managing pagination
 * @param {number} initialPage - Starting page
 * @param {number} pageSize - Items per page
 */
export const usePagination = (initialPage = 1, pageSize = 10) => {
  const [page, setPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(1)

  const goToPage = useCallback(
    (pageNumber) => {
      if (pageNumber >= 1 && pageNumber <= totalPages) {
        setPage(pageNumber)
      }
    },
    [totalPages],
  )

  const nextPage = useCallback(() => {
    setPage((prev) => (prev < totalPages ? prev + 1 : prev))
  }, [totalPages])

  const prevPage = useCallback(() => {
    setPage((prev) => (prev > 1 ? prev - 1 : prev))
  }, [])

  const updateTotalPages = useCallback(
    (total) => {
      setTotalPages(Math.ceil(total / pageSize))
    },
    [pageSize],
  )

  return {
    page,
    pageSize,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    updateTotalPages,
  }
}
