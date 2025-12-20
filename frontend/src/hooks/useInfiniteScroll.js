import { useState, useEffect, useCallback, useRef } from 'react'

function useInfiniteScroll(callback) {
  const [loading, setLoading] = useState(false)
  const observerRef = useRef()
  const lastElementRef = useCallback(
    (node) => {
      if (loading) return
      if (observerRef.current) observerRef.current.disconnect()

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          callback()
        }
      })

      if (node) observerRef.current.observe(node)
    },
    [loading, callback]
  )

  return { lastElementRef, loading, setLoading }
}

export default useInfiniteScroll