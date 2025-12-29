

export default function AchievementChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-700/30 rounded-lg border border-slate-600">
        <p className="text-slate-400">No data available</p>
      </div>
    )
  }

  const maxValue = Math.max(...data.map((d) => d.value || 0))

  return (
    <div className="space-y-4">
      {data.map((item, idx) => (
        <div key={idx} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-medium text-sm">{item.label}</span>
            <span className="text-white font-bold">{item.value}</span>
          </div>
          <div className="h-3 bg-slate-600 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${
                idx % 3 === 0
                  ? "from-blue-500 to-blue-400"
                  : idx % 3 === 1
                    ? "from-green-500 to-green-400"
                    : "from-purple-500 to-purple-400"
              } transition-all duration-300`}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  )
}
