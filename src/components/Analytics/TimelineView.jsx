

import { useState } from "react"

export default function TimelineView({ achievements = [] }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const getMonthAchievements = (monthIndex) => {
    return achievements.filter((a) => new Date(a.date).getMonth() === monthIndex)
  }

  const currentMonthAchievements = getMonthAchievements(selectedMonth)
  const maxAchievements = Math.max(...months.map((_, idx) => getMonthAchievements(idx).length), 1)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
        {months.map((month, idx) => {
          const count = getMonthAchievements(idx).length
          const isSelected = idx === selectedMonth
          const percentage = (count / maxAchievements) * 100

          return (
            <button key={idx} onClick={() => setSelectedMonth(idx)} className="space-y-2 cursor-pointer">
              <div
                className={`h-12 rounded-lg transition ${
                  isSelected ? "bg-gradient-to-t from-blue-600 to-blue-500" : "bg-slate-700/30 hover:bg-slate-700/50"
                }`}
                style={{ height: `${Math.max(percentage * 0.8 + 20, 48)}px` }}
              ></div>
              <p className={`text-xs font-medium text-center ${isSelected ? "text-blue-400" : "text-slate-400"}`}>
                {month}
              </p>
              <p className="text-xs text-slate-500 text-center">{count}</p>
            </button>
          )
        })}
      </div>

      {currentMonthAchievements.length > 0 && (
        <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
          <h4 className="text-white font-semibold mb-3">
            {months[selectedMonth]} - {currentMonthAchievements.length} Achievements
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {currentMonthAchievements.map((achievement) => (
              <div key={achievement.id} className="text-sm p-2 bg-slate-700/50 rounded-lg border border-slate-600">
                <p className="text-slate-300">{achievement.title}</p>
                <p className="text-xs text-slate-500 mt-1">{achievement.category}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
