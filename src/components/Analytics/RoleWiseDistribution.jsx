

export default function RoleWiseDistribution() {
  const roleData = [
    { role: "Students", count: 2000, percentage: 76, color: "from-blue-500 to-blue-400" },
    { role: "Class Advisors", count: 128, percentage: 15, color: "from-green-500 to-green-400" },
    { role: "HOD", count: 32, percentage: 6, color: "from-purple-500 to-purple-400" },
    { role: "Admin", count: 8, percentage: 3, color: "from-yellow-500 to-yellow-400" },
  ]

  return (
    <div className="space-y-4">
      {roleData.map((item, idx) => (
        <div key={idx} className="space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-300 font-medium">{item.role}</p>
              <p className="text-xs text-slate-500">{item.count} users</p>
            </div>
            <span className="text-white font-bold">{item.percentage}%</span>
          </div>
          <div className="h-3 bg-slate-600 rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${item.color}`} style={{ width: `${item.percentage}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  )
}
