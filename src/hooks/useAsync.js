

import { useState, useEffect } from "react"

/**
 * Custom hook for handling async operations
 * @param {Function} asyncFunction - Async function to execute
 * @param {Array} dependencies - Dependency array
 * @param {*} initialValue - Initial value for data
 */
export const useAsync = (asyncFunction, dependencies = [], initialValue = null) => {
  const [data, setData] = useState(initialValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const execute = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await asyncFunction()
        if (isMounted) {
          setData(response)
        }
      } catch (err) {
        if (isMounted) {
          setError(err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    execute()

    return () => {
      isMounted = false
    }
  }, dependencies)

  return { data, loading, error }
}
