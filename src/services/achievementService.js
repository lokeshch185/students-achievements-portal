import { api } from "./api"

export const achievementService = {
  /**
   * Fetch achievements with pagination and lazy loading
   */
  getAchievementsPaginated: async (page = 1, pageSize = 10, filters = {}) => {
    try {
      const result = await api.getAchievementsPaginated(page, pageSize, filters)
      return result
    } catch (error) {
      console.error("Error fetching achievements:", error)
      throw error
    }
  },

  /**
   * Get single achievement by ID
   */
  getAchievementById: async (id) => {
    try {
      const achievements = await api.getAchievements()
      return achievements.find((a) => a.id === id)
    } catch (error) {
      console.error("Error fetching achievement:", error)
      throw error
    }
  },

  /**
   * Create new achievement
   */
  createAchievement: async (achievementData) => {
    try {
      const achievement = await api.createAchievement(achievementData)
      return achievement
    } catch (error) {
      console.error("Error creating achievement:", error)
      throw error
    }
  },

  /**
   * Update achievement
   */
  updateAchievement: async (id, updates) => {
    try {
      const achievement = await api.updateAchievement(id, updates)
      return achievement
    } catch (error) {
      console.error("Error updating achievement:", error)
      throw error
    }
  },

  /**
   * Verify achievement (for advisors/HODs)
   */
  verifyAchievement: async (id, verifierInfo) => {
    try {
      const achievement = await api.verifyAchievement(id, verifierInfo)
      return achievement
    } catch (error) {
      console.error("Error verifying achievement:", error)
      throw error
    }
  },

  /**
   * Get achievements by student
   */
  getStudentAchievements: async (studentId, page = 1, pageSize = 10) => {
    try {
      const result = await api.getAchievementsPaginated(page, pageSize, { studentId })
      return result
    } catch (error) {
      console.error("Error fetching student achievements:", error)
      throw error
    }
  },

  /**
   * Get achievements by status
   */
  getAchievementsByStatus: async (status, page = 1, pageSize = 10) => {
    try {
      const result = await api.getAchievementsPaginated(page, pageSize, { status })
      return result
    } catch (error) {
      console.error("Error fetching achievements by status:", error)
      throw error
    }
  },

  /**
   * Get achievements by category
   */
  getAchievementsByCategory: async (category, page = 1, pageSize = 10) => {
    try {
      const result = await api.getAchievementsPaginated(page, pageSize, { category })
      return result
    } catch (error) {
      console.error("Error fetching achievements by category:", error)
      throw error
    }
  },

  /**
   * Get statistics for achievements
   */
  getAchievementStats: async () => {
    try {
      const achievements = await api.getAchievements()
      const categories = await api.getCategories()

      const stats = {
        total: achievements.length,
        verified: achievements.filter((a) => a.status === "verified").length,
        pending: achievements.filter((a) => a.status === "pending").length,
        byCategory: categories.map((cat) => ({
          category: cat.name,
          count: achievements.filter((a) => a.category === cat.code).length,
        })),
      }

      return stats
    } catch (error) {
      console.error("Error fetching achievement stats:", error)
      throw error
    }
  },
}
