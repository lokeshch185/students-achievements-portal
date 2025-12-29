

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { achievementAPI, categoryAPI } from "../services/api"
import AchievementFormModal from "../components/student/AchievementForm"
import FilteredAchievements from "../components/student/FilteredAchievements"
import AchievementStats from "../components/student/AchievementStats"
import AdvancedPagination from "../components/AdvancedPagination"

export default function StudentDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("list")
  const [achievements, setAchievements] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [editingAchievement, setEditingAchievement] = useState(null)

  useEffect(() => {
    fetchData()
  }, [page, pageSize])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [achievementsResult, categoriesData] = await Promise.all([
        achievementAPI.getAchievementsPaginated(page, pageSize, {}),
        categoryAPI.getCategories(),
      ])
      setAchievements(achievementsResult.data)
      setPagination(achievementsResult.pagination)
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAchievement = async (newAchievement, files, achievementId = null) => {
    try {
      if (achievementId) {
        // Update existing achievement
        await achievementAPI.updateAchievement(achievementId, newAchievement, files)
      } else {
        // Create new achievement
        await achievementAPI.createAchievement(newAchievement, files)
      }
      setPage(1)
      await fetchData()
      setActiveTab("list")
      setEditingAchievement(null)
    } catch (error) {
      throw error
    }
  }

  const handleEditAchievement = (achievement) => {
    if (achievement.status !== "pending") {
      alert("You can only edit pending achievements")
      return
    }
    setEditingAchievement(achievement)
    setActiveTab("add")
  }

  const handleCancelEdit = () => {
    setEditingAchievement(null)
    setActiveTab("list")
  }

  const tabs = [
    { id: "list", label: "My Achievements", icon: "🏆" },
    { id: "add", label: "Add Achievement", icon: "➕" },
  ]

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.name}</h1>
            <p className="text-gray-600">
              {user?.rollNo} • {user?.year?.name?.toUpperCase()} • Division {user?.division?.name?.toUpperCase()}
            </p>
          </div>
          <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
            <p className="text-xs text-gray-600">Status</p>
            <p className="text-gray-900 font-semibold">Active</p>
          </div>
        </div>
      </div>

      <AchievementStats achievements={achievements} />

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
        {activeTab === "list" && (
          <div className="space-y-6">
            <FilteredAchievements
              achievements={achievements}
              categories={categories}
              loading={loading}
              onEdit={handleEditAchievement}
            />

            {pagination && pagination.totalPages > 1 && (
              <div className="pt-4 border-t border-gray-200">
                <AdvancedPagination
                  currentPage={page}
                  totalPages={pagination.totalPages}
                  pageSize={pageSize}
                  totalItems={pagination.total}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === "add" && (
          <AchievementFormModal
            onSubmit={handleAddAchievement}
            achievement={editingAchievement}
            onCancel={handleCancelEdit}
          />
        )}
      </div>
    </div>
  )
}
