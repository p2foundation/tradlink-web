'use client'

import { useEffect } from 'react'

export function ThemeInitializer() {
  useEffect(() => {
    // Apply theme from localStorage on mount
    const savedTheme = localStorage.getItem('theme') || 'dark'
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
  }, [])

  return null
}
