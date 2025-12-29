

import { useEffect, useState } from "react"

export default function NotificationBanner({ type = "info", message, duration = 5000 }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), duration)
    return () => clearTimeout(timer)
  }, [duration])

  if (!isVisible) return null

  const typeClasses = {
    success: "bg-green-500/10 border-green-500/30 text-green-400",
    error: "bg-red-500/10 border-red-500/30 text-red-400",
    warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    info: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  }

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  }

  return (
    <div
      className={`fixed top-4 right-4 max-w-md p-4 rounded-lg border flex items-center gap-3 transition-opacity duration-300 ${typeClasses[type] || typeClasses.info}`}
      role="alert"
    >
      <span className="text-xl">{icons[type]}</span>
      <p className="flex-1">{message}</p>
      <button onClick={() => setIsVisible(false)} className="text-lg font-bold opacity-70 hover:opacity-100">
        ×
      </button>
    </div>
  )
}
