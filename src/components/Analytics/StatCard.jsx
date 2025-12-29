

export default function StatCard({ title, value, trend, icon, color = "blue" }) {
  const colorClasses = {
    blue: "from-blue-600/20 to-blue-400/10 border-blue-500/30 text-blue-400",
    green: "from-green-600/20 to-green-400/10 border-green-500/30 text-green-400",
    yellow: "from-yellow-600/20 to-yellow-400/10 border-yellow-500/30 text-yellow-400",
    purple: "from-purple-600/20 to-purple-400/10 border-purple-500/30 text-purple-400",
    red: "from-red-600/20 to-red-400/10 border-red-500/30 text-red-400",
  }

  const classes = colorClasses[color] || colorClasses.blue

  return (
    <div className={`bg-gradient-to-br ${classes} border rounded-xl p-5`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${classes.split(" ").pop()}`}>{value}</p>
          {trend && <p className="text-xs text-slate-500 mt-2">{trend}</p>}
        </div>
        {icon && <span className="text-3xl opacity-50">{icon}</span>}
      </div>
    </div>
  )
}
