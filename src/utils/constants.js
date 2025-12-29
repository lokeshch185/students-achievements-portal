export const ROLES = {
  ADMIN: "admin",
  HOD: "hod",
  ADVISOR: "advisor",
  STUDENT: "student",
}

export const ACHIEVEMENT_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
}

export const ACHIEVEMENT_CATEGORIES = {
  TECHNICAL_COMPETITIONS: "technical-competitions",
  HACKATHONS: "hackathons",
  INTERNSHIPS: "internships",
  CERTIFICATIONS: "certifications",
  RESEARCH: "research",
  SPORTS_CULTURE: "sports-culture",
}

export const ACADEMIC_LEVELS = {
  FE: "fe",
  SE: "se",
  TE: "te",
  BE: "be",
  MTECH: "mtech",
  MCA: "mca",
}

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  ADMIN_PAGE_SIZE: 20,
  MOBILE_PAGE_SIZE: 5,
}

export const API_ENDPOINTS = {
  LOGIN: "/api/auth/login",
  LOGOUT: "/api/auth/logout",
  ACHIEVEMENTS: "/api/achievements",
  USERS: "/api/users",
  DEPARTMENTS: "/api/departments",
  REPORTS: "/api/reports",
}

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid email or password",
  UNAUTHORIZED: "You do not have permission to access this resource",
  SERVER_ERROR: "An error occurred. Please try again later.",
  NETWORK_ERROR: "Network error. Please check your connection.",
}

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Logged in successfully",
  ACHIEVEMENT_CREATED: "Achievement added successfully",
  ACHIEVEMENT_VERIFIED: "Achievement verified successfully",
  REPORT_GENERATED: "Report generated successfully",
}
