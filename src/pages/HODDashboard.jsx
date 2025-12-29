

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { achievementAPI } from "../services/api"
import DepartmentAnalytics from "../components/hod/DepartmentAnalytics"
import ClasswiseReport from "../components/hod/ClasswiseReport"
import AchievementVerification from "../components/hod/AchievementVerification"
import ReportGenerator from "../components/hod/ReportGenerator"

export default function HODDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("analytics")
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchAchievements = async () => {
    setLoading(true)
    try {
      // Fetch all achievements for HOD's department
      const result = await achievementAPI.getAchievementsPaginated(1, 100, {})
      setAchievements(result.data || [])
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
    { id: "analytics", label: "Department Analytics", icon: "📊" },
    { id: "classwise", label: "Class-wise Report", icon: "📋" },
    { id: "verification", label: "Verify Achievements", icon: "✓" },
    { id: "reports", label: "Generate Reports", icon: "📄" },
  ]

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">HOD - {user?.name} <span className="text-gray-600 text-md">({user?.department?.name})</span></h1>
        <p className="text-gray-600">Manage achievements and generate reports for {user?.department.name}</p>
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
        {activeTab === "analytics" && <DepartmentAnalytics />}
        {activeTab === "classwise" && <ClasswiseReport />}
        {activeTab === "verification" && (
          <AchievementVerification achievements={achievements} onUpdate={fetchAchievements} />
        )}
        {activeTab === "reports" && <ReportGenerator />}
      </div>
    </div>
  )
}
