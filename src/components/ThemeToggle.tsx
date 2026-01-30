"use client"

import { useTheme } from '@/contexts/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  const getLabel = () => {
    if (theme === 'light') return 'Light'
    if (theme === 'dark') return 'Dark'
    return 'Black'
  }

  const getThemeEmoji = () => {
    if (theme === 'light') return '🌞'
    if (theme === 'dark') return '🌙'
    return '🖥️'
  }

  return (
    <div className="flex items-center gap-3">
      {/* Theme label as clickable button */}
      <button
        onClick={toggleTheme}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border-2 border-black/50 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer hover:bg-muted hover:shadow-md"
        title={`Current theme: ${getLabel()}. Click to toggle.`}
      >
        <span className="text-lg">{getThemeEmoji()}</span>
        <span className="text-sm font-medium text-foreground">
          {getLabel()}
        </span>
        
        {/* Theme indicator dot */}
        <div className="w-2 h-2 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 animate-pulse" />
      </button>
    </div>
  )
}
