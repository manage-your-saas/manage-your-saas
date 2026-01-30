"use client"

import { useState, useEffect } from "react"

const STORAGE_KEY = "dashboard-sidebar-collapsed"

const getInitialCollapsed = () => {
  if (typeof window === "undefined") return false
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === "true"
}

export function useSidebarState() {
  const [collapsed, setCollapsed] = useState(getInitialCollapsed())

  // Listen for custom events from sidebar component
  useEffect(() => {
    const handleSidebarChange = (event) => {
      const next = event.detail.collapsed
      setCollapsed(next)
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next))
      } catch (_) {
        /* noop */
      }
    }

    window.addEventListener('sidebarStateChanged', handleSidebarChange)

    return () => {
      window.removeEventListener('sidebarStateChanged', handleSidebarChange)
    }
  }, [])

  return collapsed
}
