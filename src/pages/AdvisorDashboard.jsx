

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { achievementAPI } from "../services/api"
import AchievementVerification from "../components/hod/AchievementVerification"
import ReportGenerator from "../components/hod/ReportGenerator"

export default function AdvisorDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("verification")
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchAchievements = async () => {
    setLoading(true)
    try {
      const result = await achievementAPI.getAchievementsPaginated(1, 20, {})
      setAchievements(result.data)
    } catch (error) {
      console.error("Error fetching achievements:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAchievements()
  }, [])

  const tabs = [
    { id: "verification", label: "Verify Achievements", icon: "✓" },
    { id: "reports", label: "Generate Reports", icon: "📄" },
  ]

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Class Advisor Dashboard</h1>
        <p className="text-gray-600">
          Division {user?.assignedDivisions[0]?.name.toUpperCase()} • {user?.year?.name.toUpperCase()} • {user?.program?.name.toUpperCase()} - {user?.department?.name.toUpperCase()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-gray-600 text-sm">Pending Verification</p>
          <p className="text-2xl font-bold text-gray-900">
            {achievements.filter((a) => a.status === "pending").length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-gray-600 text-sm">Verified</p>
          <p className="text-2xl font-bold text-gray-900">
            {achievements.filter((a) => a.status === "verified").length}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-gray-600 text-sm">Total Achievements</p>
          <p className="text-2xl font-bold text-gray-900">{achievements.length}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition ${
              activeTab === tab.id
                ? "bg-black text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="card p-6">
        {activeTab === "verification" && (
          <AchievementVerification achievements={achievements} onUpdate={fetchAchievements} />
        )}
        {activeTab === "reports" && <ReportGenerator />}
      </div>
    </div>
  )
}
