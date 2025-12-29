import { api } from "./api"

export const authService = {
  /**
   * Login user with email and password
   */
  login: async (email, password) => {
    try {
      const result = await api.login(email, password)
      if (!result.success) {
        throw new Error(result.error)
      }
      return result.user
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (userId) => {
    try {
      const user = await api.getUser(userId)
      return user
    } catch (error) {
      console.error("Error fetching user:", error)
      throw error
    }
  },

  /**
   * Check user permissions based on role
   */
  hasPermission: (user, permission) => {
    const rolePermissions = {
      admin: ["manage_all", "view_all", "verify_achievements", "generate_reports"],
      hod: ["view_department", "verify_achievements", "generate_reports"],
      advisor: ["view_division", "verify_achievements", "generate_reports"],
      student: ["view_own", "create_achievement"],
    }

    return rolePermissions[user?.role]?.includes(permission) || false
  },

  /**
   * Verify user access to specific resource
   */
  canAccessResource: (user, resourceType, resourceData) => {
    if (user.role === "admin") return true

    switch (resourceType) {
      case "student":
        return user.role === "student" ? user.id === resourceData.id : user.id === resourceData.advisorId
      case "department":
        return user.department === resourceData.code
      case "division":
        return user.division === resourceData.code
      default:
        return false
    }
  },
}
