import axios from "axios"

const ITEMS_PER_PAGE = 5

export const fetchStudents = async (page = 1, filters = {}) => {
  try {
    const response = await axios.get("/data/students.json")
    let students = response.data.students

    // Apply filters
    if (filters.department) {
      students = students.filter((s) => s.department === filters.department)
    }
    if (filters.program) {
      students = students.filter((s) => s.program === filters.program)
    }
    if (filters.year) {
      students = students.filter((s) => s.year === filters.year)
    }
    if (filters.division) {
      students = students.filter((s) => s.division === filters.division)
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      students = students.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.rollNo.toLowerCase().includes(searchLower) ||
          s.email.toLowerCase().includes(searchLower),
      )
    }

    // Pagination
    const totalItems = students.length
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
    const startIndex = (page - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const paginatedStudents = students.slice(startIndex, endIndex)

    return {
      data: paginatedStudents,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: ITEMS_PER_PAGE,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    }
  } catch (error) {
    throw new Error("Failed to fetch students: " + error.message)
  }
}

export const fetchStudentById = async (id) => {
  try {
    const response = await axios.get("/data/students.json")
    const student = response.data.students.find((s) => s.id === Number.parseInt(id))

    if (!student) {
      throw new Error("Student not found")
    }

    return student
  } catch (error) {
    throw new Error("Failed to fetch student: " + error.message)
  }
}

export const fetchAchievements = async (studentId, page = 1) => {
  try {
    const student = await fetchStudentById(studentId)
    const achievements = student.achievements || []

    const totalItems = achievements.length
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
    const startIndex = (page - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const paginatedAchievements = achievements.slice(startIndex, endIndex)

    return {
      data: paginatedAchievements,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: ITEMS_PER_PAGE,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    }
  } catch (error) {
    throw new Error("Failed to fetch achievements: " + error.message)
  }
}
