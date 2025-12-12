'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export function useNavigation() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isNavigating, setIsNavigating] = useState(false)

  const navigate = (path: string) => {
    setIsNavigating(true)
    startTransition(() => {
      router.push(path)
      // Reset after a short delay to allow navigation to complete
      setTimeout(() => setIsNavigating(false), 100)
    })
  }

  return {
    navigate,
    isNavigating: isNavigating || isPending,
  }
}

