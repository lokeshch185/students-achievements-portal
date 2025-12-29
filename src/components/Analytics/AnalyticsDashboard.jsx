

import { useEffect, useState } from "react"
import { api } from "../../services/api"
import StatCard from "./StatCard"
import AchievementChart from "./AchievementChart"
import RoleWiseDistribution from "./RoleWiseDistribution"
import TimelineView from "./TimelineView"

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await api.getAnalytics()
        const achivements = await api.getAchievements()
        setAnalyticsData(data)
        setAchievements(achivements)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={analyticsData?.total_students || 2000}
          trend="↑ 8% from last term"
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Total Achievements"
          value={analyticsData?.total_achievements || 450}
          trend="↑ 15% from last month"
          icon="🏆"
          color="green"
        />
        <StatCard
          title="Verification Rate"
          value={`${Math.round(((analyticsData?.verified_achievements || 380) / (analyticsData?.total_achievements || 450)) * 100)}%`}
          trend="Above target"
          icon="✓"
          color="purple"
        />
        <StatCard
          title="Pending Review"
          value={analyticsData?.pending_achievements || 70}
          trend="16% of total"
          icon="⏳"
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600">
          <h3 className="text-white font-semibold mb-4">Top Achievement Categories</h3>
          <AchievementChart
            data={
              analyticsData?.top_categories?.map((cat) => ({
                label: cat.category,
                value: cat.count,
              })) || []
            }
          />
        </div>

        <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600">
          <h3 className="text-white font-semibold mb-4">User Distribution</h3>
          <RoleWiseDistribution />
        </div>
      </div>

      <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600">
        <h3 className="text-white font-semibold mb-4">Achievement Timeline</h3>
        <TimelineView achievements={achievements} />
      </div>
    </div>
  )
}
