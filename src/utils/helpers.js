/**
 * Format date to readable format
 */
export const formatDate = (date) => {
  const options = { year: "numeric", month: "long", day: "numeric" }
  return new Date(date).toLocaleDateString(undefined, options)
}

/**
 * Get role display name
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    admin: "Administrator",
    hod: "Head of Department",
    advisor: "Class Advisor",
    student: "Student",
  }
  return roleNames[role] || role
}

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
  switch (status) {
    case "verified":
      return "bg-green-500/20 text-green-400 border-green-500/30"
    case "pending":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    case "rejected":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/30"
  }
}

/**
 * Get category display name
 */
export const getCategoryName = (category) => {
  const categories = {
    "technical-competitions": "Technical Competitions",
    hackathons: "Hackathons",
    internships: "Internships",
    certifications: "Certifications",
    research: "Research & Publications",
    "sports-culture": "Sports & Cultural",
  }
  return categories[category] || category
}

/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength = 100) => {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "..."
  }
  return text
}

/**
 * Check if user has permission
 */
export const hasPermission = (user, permission) => {
  const rolePermissions = {
    admin: ["*"],
    hod: ["view_department", "verify_achievements", "generate_reports"],
    advisor: ["view_division", "verify_achievements"],
    student: ["view_own", "create_achievement"],
  }

  const permissions = rolePermissions[user?.role] || []
  return permissions.includes("*") || permissions.includes(permission)
}

/**
 * Generate pagination array
 */
export const generatePageNumbers = (currentPage, totalPages, maxVisible = 5) => {
  const pages = []
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  const endPage = Math.min(totalPages, startPage + maxVisible - 1)

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }

  if (startPage > 1) {
    pages.push(1)
    if (startPage > 2) {
      pages.push("...")
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push("...")
    }
    pages.push(totalPages)
  }

  return pages
}
