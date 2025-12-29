import { api } from "./api"

export const reportService = {
  /**
   * Generate monthly report
   */
  generateMonthlyReport: async (month, year, filters = {}) => {
    try {
      const achievements = await api.getAchievements(filters)

      const monthStart = new Date(year, month - 1, 1)
      const monthEnd = new Date(year, month, 0)

      const monthlyAchievements = achievements.filter((a) => {
        const date = new Date(a.date)
        return date >= monthStart && date <= monthEnd
      })

      return {
        month,
        year,
        totalAchievements: monthlyAchievements.length,
        verified: monthlyAchievements.filter((a) => a.status === "verified").length,
        pending: monthlyAchievements.filter((a) => a.status === "pending").length,
        achievements: monthlyAchievements,
      }
    } catch (error) {
      console.error("Error generating monthly report:", error)
      throw error
    }
  },

  /**
   * Generate semester report
   */
  generateSemesterReport: async (semester, year, filters = {}) => {
    try {
      const achievements = await api.getAchievements(filters)

      const startMonth = semester === 1 ? 0 : 6
      const endMonth = semester === 1 ? 6 : 12

      const semesterAchievements = achievements.filter((a) => {
        const date = new Date(a.date)
        return date.getFullYear() === year && date.getMonth() >= startMonth && date.getMonth() < endMonth
      })

      return {
        semester,
        year,
        totalAchievements: semesterAchievements.length,
        verified: semesterAchievements.filter((a) => a.status === "verified").length,
        pending: semesterAchievements.filter((a) => a.status === "pending").length,
        achievements: semesterAchievements,
      }
    } catch (error) {
      console.error("Error generating semester report:", error)
      throw error
    }
  },

  /**
   * Generate category-wise report
   */
  generateCategoryReport: async (filters = {}) => {
    try {
      const achievements = await api.getAchievements(filters)
      const categories = await api.getCategories()

      const categoryReport = categories.map((cat) => {
        const catAchievements = achievements.filter((a) => a.category === cat.code)
        return {
          category: cat.name,
          code: cat.code,
          total: catAchievements.length,
          verified: catAchievements.filter((a) => a.status === "verified").length,
          pending: catAchievements.filter((a) => a.status === "pending").length,
        }
      })

      return categoryReport
    } catch (error) {
      console.error("Error generating category report:", error)
      throw error
    }
  },

  /**
   * Export report to PDF/Excel format
   */
  exportReport: async (reportData, format = "pdf") => {
    try {
      // In a real app, this would use a library like pdfkit or xlsx
      console.log(`Exporting report as ${format}:`, reportData)
      return {
        success: true,
        format,
        message: `Report exported as ${format.toUpperCase()}`,
      }
    } catch (error) {
      console.error("Error exporting report:", error)
      throw error
    }
  },
}
