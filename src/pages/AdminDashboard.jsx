

import { useState, useEffect } from "react"
import { analyticsAPI } from "../services/api"
import DepartmentManager from "../components/admin/DepartmentManager"
import ProgramManager from "../components/admin/ProgramManager"
import UserManager from "../components/admin/UserManager"
import AcademicStructureManager from "../components/admin/AcademicStructureManager"
import CategoryManager from "../components/admin/CategoryManager"
import AnalyticsOverview from "../components/AnalyticsOverview"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await analyticsAPI.getAnalytics()
        setAnalytics(data)
      } catch (error) {
        console.error("Error fetching analytics:", error)
      }
    }
    fetchAnalytics()
  }, [])

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "departments", label: "Departments", icon: "🏢" },
    { id: "programs", label: "Programs", icon: "📚" },
    { id: "structure", label: "Academic Structure", icon: "🏗️" },
    { id: "categories", label: "Categories", icon: "📋" },
    { id: "users", label: "Users", icon: "👥" },
  ]

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage departments, programs, and users.</p>
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
        {activeTab === "overview" && analytics && <AnalyticsOverview data={analytics} />}
        {activeTab === "departments" && <DepartmentManager />}
        {activeTab === "programs" && <ProgramManager />}
        {activeTab === "structure" && <AcademicStructureManager />}
        {activeTab === "categories" && <CategoryManager />}
        {activeTab === "users" && <UserManager />}
      </div>
    </div>
  )
}
