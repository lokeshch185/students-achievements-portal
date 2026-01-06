import axios from "axios"

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api"

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error.response?.data || { error: error.message })
  }
)

// Authentication APIs
export const authAPI = {
  login: async (email, password) => {
    const response = await apiClient.post("/auth/login", { email, password })
    if (response.success && response.data.token) {
      localStorage.setItem("token", response.data.token)
      localStorage.setItem("user", JSON.stringify(response.data.user))
    }
    return response
  },

  register: async (userData) => {
    return await apiClient.post("/auth/register", userData)
  },

  getMe: async () => {
    return await apiClient.get("/auth/me")
  },

  updateDetails: async (data) => {
    return await apiClient.put("/auth/updatedetails", data)
  },

  updatePassword: async (currentPassword, newPassword) => {
    return await apiClient.put("/auth/updatepassword", { currentPassword, newPassword })
  },

  logout: () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  },
}

// Department APIs
export const departmentAPI = {
  getDepartments: async () => {
    const response = await apiClient.get("/departments")
    return response.data || []
  },

  getDepartment: async (id) => {
    const response = await apiClient.get(`/departments/${id}`)
    return response.data
  },

  createDepartment: async (data) => {
    const response = await apiClient.post("/departments", data)
    return response.data
  },

  updateDepartment: async (id, data) => {
    const response = await apiClient.put(`/departments/${id}`, data)
    return response.data
  },

  deleteDepartment: async (id) => {
    return await apiClient.delete(`/departments/${id}`)
  },
}

// Program APIs
export const programAPI = {
  getPrograms: async (departmentId) => {
    const params = departmentId ? { department: departmentId } : {}
    const response = await apiClient.get("/programs", { params })
    return response.data || []
  },

  getProgram: async (id) => {
    const response = await apiClient.get(`/programs/${id}`)
    return response.data
  },

  createProgram: async (data) => {
    const response = await apiClient.post("/programs", data)
    return response.data
  },

  updateProgram: async (id, data) => {
    const response = await apiClient.put(`/programs/${id}`, data)
    return response.data
  },

  deleteProgram: async (id) => {
    return await apiClient.delete(`/programs/${id}`)
  },
}

// Academic Structure APIs
export const academicAPI = {
  getYears: async (programId) => {
    const params = programId ? { program: programId } : {}
    const response = await apiClient.get("/academic/years", { params })
    return response.data || []
  },

  getYear: async (id) => {
    const response = await apiClient.get(`/academic/years/${id}`)
    return response.data
  },

  createYear: async (data) => {
    const response = await apiClient.post("/academic/years", data)
    return response.data
  },

  updateYear: async (id, data) => {
    const response = await apiClient.put(`/academic/years/${id}`, data)
    return response.data
  },

  deleteYear: async (id) => {
    return await apiClient.delete(`/academic/years/${id}`)
  },

  getDivisions: async (yearId) => {
    const params = yearId ? { year: yearId } : {}
    const response = await apiClient.get("/academic/divisions", { params })
    return response.data || []
  },

  getDivision: async (id) => {
    const response = await apiClient.get(`/academic/divisions/${id}`)
    return response.data
  },

  createDivision: async (data) => {
    const response = await apiClient.post("/academic/divisions", data)
    return response.data
  },

  updateDivision: async (id, data) => {
    const response = await apiClient.put(`/academic/divisions/${id}`, data)
    return response.data
  },

  deleteDivision: async (id) => {
    return await apiClient.delete(`/academic/divisions/${id}`)
  },

  getBatches: async (divisionId) => {
    const params = divisionId ? { division: divisionId } : {}
    const response = await apiClient.get("/academic/batches", { params })
    return response.data || []
  },

  getBatch: async (id) => {
    const response = await apiClient.get(`/academic/batches/${id}`)
    return response.data
  },

  createBatch: async (data) => {
    const response = await apiClient.post("/academic/batches", data)
    return response.data
  },

  updateBatch: async (id, data) => {
    const response = await apiClient.put(`/academic/batches/${id}`, data)
    return response.data
  },

  deleteBatch: async (id) => {
    return await apiClient.delete(`/academic/batches/${id}`)
  },
}

// Category APIs
export const categoryAPI = {
  getCategories: async () => {
    const response = await apiClient.get("/categories")
    return response.data || []
  },

  createCategory: async (data) => {
    const response = await apiClient.post("/categories", data)
    return response.data
  },

  updateCategory: async (id, data) => {
    const response = await apiClient.put(`/categories/${id}`, data)
    return response.data
  },

  deleteCategory: async (id) => {
    return await apiClient.delete(`/categories/${id}`)
  },
}

// Achievement APIs
export const achievementAPI = {
  getAchievements: async (filters = {}) => {
    const response = await apiClient.get("/achievements", { params: filters })
    return response.data || response || []
  },

  getAchievementsPaginated: async (page = 1, pageSize = 10, filters = {}) => {
    const params = { page, limit: pageSize, ...filters }
    const response = await apiClient.get("/achievements", { params })
    return {
      data: response.data || [],
      pagination: response.pagination || {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      },
    }
  },

  getAchievement: async (id) => {
    const response = await apiClient.get(`/achievements/${id}`)
    return response.data
  },

  createAchievement: async (data, files) => {
    const formData = new FormData()
    
    // Add text fields
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key])
      }
    })

    // Add files
    if (files?.certificate) {
      formData.append("certificate", files.certificate)
    }
    if (files?.photo) {
      formData.append("photo", files.photo)
    }

    const response = await apiClient.post("/achievements", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  updateAchievement: async (id, data, files) => {
    const formData = new FormData()
    
    Object.keys(data).forEach((key) => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key])
      }
    })

    if (files?.certificate) {
      formData.append("certificate", files.certificate)
    }
    if (files?.photo) {
      formData.append("photo", files.photo)
    }

    const response = await apiClient.put(`/achievements/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  verifyAchievement: async (id) => {
    const response = await apiClient.put(`/achievements/${id}/verify`)
    return response.data
  },

  rejectAchievement: async (id, rejectionReason) => {
    const response = await apiClient.put(`/achievements/${id}/reject`, { rejectionReason })
    return response.data
  },

  deleteAchievement: async (id) => {
    return await apiClient.delete(`/achievements/${id}`)
  },
}

// User APIs
export const userAPI = {
  getUsers: async (filters = {}) => {
    const response = await apiClient.get("/users", { params: filters })
    return response
  },

  bulkCreateStudents: async (file) => {
    const formData = new FormData()
    formData.append("file", file)
    const response = await apiClient.post("/users/bulk", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response
  },

  getUser: async (id) => {
    const response = await apiClient.get(`/users/${id}`)
    return response.data
  },

  createUser: async (data) => {
    const response = await apiClient.post("/users", data)
    return response.data
  },

  updateUser: async (id, data) => {
    const response = await apiClient.put(`/users/${id}`, data)
    return response.data
  },

  assignAdvisor: async (id, data) => {
    const response = await apiClient.put(`/users/${id}/assign`, data)
    return response.data
  },

  deleteUser: async (id) => {
    return await apiClient.delete(`/users/${id}`)
  },
}

// Analytics APIs
export const analyticsAPI = {
  getAnalytics: async (filters = {}) => {
    const response = await apiClient.get("/analytics", { params: filters })
    return response.data || {}
  },
  getClasswiseReport: async (filters = {}) => {
    const response = await apiClient.get("/analytics/classwise", { params: filters })
    return response
  },
}

// File APIs
export const fileAPI = {
  getFileUrl: (fileId) => {
    return `${API_URL}/files/${fileId}`
  },

  deleteFile: async (id) => {
    return await apiClient.delete(`/files/${id}`)
  },
}

// Legacy API for backward compatibility
const createApiClient = () => {
  return {
    // Authentication
    login: async (email, password) => {
      try {
        const response = await authAPI.login(email, password)
        if (response.success) {
          return { success: true, user: response.data.user }
        }
        return { success: false, error: response.error || "Login failed" }
      } catch (error) {
        return { success: false, error: error.error || "Login failed" }
      }
    },

    // Departments
    getDepartments: departmentAPI.getDepartments,
    getDepartment: departmentAPI.getDepartment,
    createDepartment: departmentAPI.createDepartment,

    // Programs
    getPrograms: programAPI.getPrograms,
    getProgramsByDepartment: (departmentId) => programAPI.getPrograms(departmentId),

    // Achievements
    getAchievements: achievementAPI.getAchievements,
    getAchievementsPaginated: achievementAPI.getAchievementsPaginated,
    createAchievement: async (achievement) => {
      try {
        const data = await achievementAPI.createAchievement(achievement)
        return data
      } catch (error) {
        throw new Error(error.error || "Failed to create achievement")
      }
    },
    updateAchievement: achievementAPI.updateAchievement,
    verifyAchievement: async (id, advisorId) => {
      try {
        const data = await achievementAPI.verifyAchievement(id)
        return data
      } catch (error) {
        throw new Error(error.error || "Failed to verify achievement")
      }
    },

    // Categories
    getCategories: categoryAPI.getCategories,

    // Analytics
    getAnalytics: analyticsAPI.getAnalytics,
    getClasswiseReport: analyticsAPI.getClasswiseReport,
  }
}

export const api = createApiClient()
