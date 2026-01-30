"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

type Theme = "light" | "dark" | "black"

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const STORAGE_KEY = "dashboard-theme"
const THEME_CLASSES: Theme[] = ["light", "dark", "black"]

function applyThemeClass(theme: Theme) {
  const root = document.documentElement
  const body = document.body

  // remove previous theme classes
  THEME_CLASSES.forEach((t) => {
    root.classList.remove(`theme-${t}`)
    body.classList.remove(`theme-${t}`)
  })

  // add current theme class
  root.classList.add(`theme-${theme}`)
  body.classList.add(`theme-${theme}`)

  // set solid background fallback for dark/black
  if (theme === "light") {
    body.style.backgroundColor = "#ffffff"
    root.style.backgroundColor = "#ffffff"
  } else {
    body.style.backgroundColor = "#000000"
    root.style.backgroundColor = "#000000"
  }
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light"

  const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null
  if (stored && THEME_CLASSES.includes(stored)) return stored

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches
  return prefersDark ? "dark" : "light"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")

  useEffect(() => {
    const initial = getInitialTheme()
    setThemeState(initial)
    applyThemeClass(initial)

    // Cleanup styles when ThemeProvider unmounts
    return () => {
      const root = document.documentElement
      const body = document.body

      THEME_CLASSES.forEach((t) => {
        root.classList.remove(`theme-${t}`)
        body.classList.remove(`theme-${t}`)
      })

      // Reset inline styles
      body.style.backgroundColor = ""
      root.style.backgroundColor = ""
    }
  }, [])

  const setTheme = (next: Theme) => {
    setThemeState(next)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next)
      applyThemeClass(next)
    }
  }

  const toggleTheme = () => {
    setThemeState((prev) => {
      const order: Theme[] = ["light", "dark", "black"]
      const next = order[(order.indexOf(prev) + 1) % order.length]
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, next)
        applyThemeClass(next)
      }
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
