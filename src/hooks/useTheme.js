import { useState, useEffect } from 'react'

function resolve(pref) {
  if (pref === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return pref
}

export function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('pacer_theme') || 'dark'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolve(theme))
    localStorage.setItem('pacer_theme', theme)

    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () =>
      document.documentElement.setAttribute('data-theme', mq.matches ? 'dark' : 'light')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  return { theme, setTheme }
}
