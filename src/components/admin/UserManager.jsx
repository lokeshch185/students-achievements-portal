import { useState, useEffect } from "react"
import { userAPI, departmentAPI, programAPI, academicAPI } from "../../services/api"
import { showError, showSuccess, showWarning } from "../../utils/toast"
import AdvancedPagination from "../AdvancedPagination"

export default function UserManager() {
  const [users, setUsers] = useState([])
  const [departments, setDepartments] = useState([])
  const [programs, setPrograms] = useState([])
  const [years, setYears] = useState([])
  const [divisions, setDivisions] = useState([])
  const [batches, setBatches] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pagination, setPagination] = useState(null)
  const [filters, setFilters] = useState({
    role: "",
    department: "",
    program: "",
    year: "",
    division: "",
    batch: "",
    search: "",
  })

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    rollNo: "",
    department: "",
    program: "",
    year: "",
    division: "",
    batch: "",
    assignedDivisions: [], // For advisors
  })

  useEffect(() => {
    fetchUsers()
    fetchDepartments()
  }, [page, pageSize, filters])

  useEffect(() => {
    if (formData.department) {
      fetchPrograms(formData.department)
    }
  }, [formData.department])

  useEffect(() => {
    if (formData.program) {
      fetchYears(formData.program)
    }
  }, [formData.program])

  useEffect(() => {
    if (formData.year) {
      fetchDivisions(formData.year)
    }
  }, [formData.year])

  useEffect(() => {
    if (formData.division) {
      fetchBatches(formData.division)
    }
  }, [formData.division])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = { page, limit: pageSize, ...filters }
      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === null) {
          delete params[key]
        }
      })
      const data = await userAPI.getUsers(params)
      setUsers(data.data || data || [])
      if (data.pagination) {
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const data = await departmentAPI.getDepartments()
      setDepartments(data)
    } catch (error) {
      console.error("Error fetching departments:", error)
    }
  }

  const fetchPrograms = async (departmentId) => {
    try {
      const data = await programAPI.getPrograms(departmentId)
      setPrograms(data)
    } catch (error) {
      console.error("Error fetching programs:", error)
    }
  }

  const fetchYears = async (programId) => {
    try {
      const data = await academicAPI.getYears(programId)
      setYears(data)
    } catch (error) {
      console.error("Error fetching years:", error)
    }
  }

  const fetchDivisions = async (yearId) => {
    try {
      const data = await academicAPI.getDivisions(yearId)
      setDivisions(data)
    } catch (error) {
      console.error("Error fetching divisions:", error)
    }
  }

  const fetchBatches = async (divisionId) => {
    try {
      const data = await academicAPI.getBatches(divisionId)
      setBatches(data)
    } catch (error) {
      console.error("Error fetching batches:", error)
    }
  }

  const fetchAllDivisionsForDepartment = async (departmentId) => {
    try {
      // Fetch all programs for department
      const deptPrograms = await programAPI.getPrograms(departmentId)
      // Fetch all years for all programs
      const allYears = []
      for (const prog of deptPrograms) {
        const years = await academicAPI.getYears(prog._id || prog.id)
        allYears.push(...years)
      }
      // Fetch all divisions for all years
      const allDivisions = []
      for (const year of allYears) {
        const divisions = await academicAPI.getDivisions(year._id || year.id)
        allDivisions.push(...divisions)
      }
      setDivisions(allDivisions)
    } catch (error) {
      console.error("Error fetching divisions:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const submitData = { ...formData }
      
      // Validate password for new users
      if (!editingId && !submitData.password) {
        showWarning("Password is required for new users")
        return
      }

      // Remove password if editing and not provided
      if (editingId && !submitData.password) {
        delete submitData.password
      }

      // Handle assignedDivisions - ensure it's an array
      if (submitData.assignedDivisions && !Array.isArray(submitData.assignedDivisions)) {
        submitData.assignedDivisions = [submitData.assignedDivisions].filter(Boolean)
      }

      // Remove empty fields (but keep arrays even if empty for assignedDivisions)
      Object.keys(submitData).forEach((key) => {
        if (key === "assignedDivisions") {
          // Keep assignedDivisions even if empty array
          if (submitData[key].length === 0 && formData.role !== "advisor") {
            delete submitData[key]
          }
        } else if (submitData[key] === "" || submitData[key] === null) {
          delete submitData[key]
        }
      })

      if (editingId) {
        await userAPI.updateUser(editingId, submitData)
        showSuccess("User updated successfully")
      } else {
        await userAPI.createUser(submitData)
        showSuccess("User created successfully")
      }
      resetForm()
      await fetchUsers()
    } catch (error) {
      console.error("Error saving user:", error)
      showError(error, "Failed to save user")
    }
  }

  const handleBulkUpload = async (e) => {
    e.preventDefault()
    const fileInput = e.target.elements.csvFile
    if (!fileInput.files || !fileInput.files[0]) {
      showWarning("Please select a CSV file")
      return
    }
    const file = fileInput.files[0]
    try {
      const response = await userAPI.bulkCreateStudents(file)
      const payload = response.data || response
      const summary = payload.data || payload
      showSuccess(
        `Bulk upload complete. Total: ${summary.total} | Success: ${summary.successCount} | Failed: ${summary.failureCount}`
      )
      fileInput.value = ""
      setShowBulkUpload(false)
      await fetchUsers()
    } catch (error) {
      console.error("Error uploading CSV:", error)
      showError(error, "Failed to upload CSV")
    }
  }

  const handleEdit = async (user) => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "student",
      rollNo: user.rollNo || "",
      department: user.department?._id || user.department || "",
      program: user.program?._id || user.program || "",
      year: user.year?._id || user.year || "",
      division: user.division?._id || user.division || "",
      batch: user.batch?._id || user.batch || "",
      assignedDivisions: user.assignedDivisions
        ? user.assignedDivisions.map((div) => div._id || div).filter(Boolean)
        : [],
    })
    setEditingId(user._id || user.id)
    setShowForm(true)
    
    // Fetch divisions if advisor
    if (user.role === "advisor" && user.department) {
      await fetchAllDivisionsForDepartment(user.department?._id || user.department)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return
    }
    try {
      await userAPI.deleteUser(id)
      await fetchUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      showError(error, "Failed to delete user")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "student",
      rollNo: "",
      department: "",
      program: "",
      year: "",
      division: "",
      batch: "",
      assignedDivisions: [],
    })
    setShowForm(false)
    setEditingId(null)
    setPrograms([])
    setYears([])
    setDivisions([])
    setBatches([])
  }

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value })
    setPage(1) // Reset to first page on filter change
  }

  const resetFilters = () => {
    setFilters({
      role: "",
      department: "",
      program: "",
      year: "",
      division: "",
      batch: "",
      search: "",
    })
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Users</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkUpload(true)}
            className="btn-secondary"
          >
            Bulk Upload Students (CSV)
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            + Add User
          </button>
        </div>
      </div>

      {/* Bulk upload panel */}
      {showBulkUpload && (
        <div className="card p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 text-sm">
              Bulk Student Upload (CSV)
            </h3>
            <button
              onClick={() => setShowBulkUpload(false)}
              className="text-xs text-gray-500 hover:text-gray-800"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-gray-600">
            CSV columns:&nbsp;
            <span className="font-mono">
              name, email, password, rollNo, departmentCode, programCode, yearCode, divisionCode, batchCode
            </span>
          </p>
          <form onSubmit={handleBulkUpload} className="flex flex-col sm:flex-row gap-3 items-start">
            <input
              type="file"
              name="csvFile"
              accept=".csv"
              className="input-base"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800"
            >
              Upload
            </button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="input-base"
          />
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
            className="input-base"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="hod">HOD</option>
            <option value="advisor">Advisor</option>
            <option value="student">Student</option>
          </select>
          <select
            value={filters.department}
            onChange={(e) => handleFilterChange("department", e.target.value)}
            className="input-base"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept._id || dept.id} value={dept._id || dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          <button onClick={resetFilters} className="btn-secondary">
            Reset Filters
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card p-4 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingId ? "Edit User" : "Add New User"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-base"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-base"
              required
              disabled={!!editingId}
            />
            <input
              type="password"
              placeholder={editingId ? "New Password (leave blank to keep current)" : "Password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-base"
              required={!editingId}
            />
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="input-base"
              required
            >
              <option value="student">Student</option>
              <option value="advisor">Advisor</option>
              <option value="hod">HOD</option>
              <option value="admin">Admin</option>
            </select>
            {formData.role === "student" && (
              <>
                <input
                  type="text"
                  placeholder="Roll Number"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  className="input-base"
                />
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value, program: "", year: "", division: "", batch: "" })}
                  className="input-base"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id || dept.id} value={dept._id || dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {formData.department && (
                  <select
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value, year: "", division: "", batch: "" })}
                    className="input-base"
                  >
                    <option value="">Select Program</option>
                    {programs.map((prog) => (
                      <option key={prog._id || prog.id} value={prog._id || prog.id}>
                        {prog.name}
                      </option>
                    ))}
                  </select>
                )}
                {formData.program && (
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value, division: "", batch: "" })}
                    className="input-base"
                  >
                    <option value="">Select Year</option>
                    {years.map((year) => (
                      <option key={year._id || year.id} value={year._id || year.id}>
                        {year.name}
                      </option>
                    ))}
                  </select>
                )}
                {formData.year && (
                  <select
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value, batch: "" })}
                    className="input-base"
                  >
                    <option value="">Select Division</option>
                    {divisions.map((div) => (
                      <option key={div._id || div.id} value={div._id || div.id}>
                        {div.name}
                      </option>
                    ))}
                  </select>
                )}
                {formData.division && (
                  <select
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    className="input-base"
                  >
                    <option value="">Select Batch</option>
                    {batches.map((batch) => (
                      <option key={batch._id || batch.id} value={batch._id || batch.id}>
                        Batch {batch.name}
                      </option>
                    ))}
                  </select>
                )}
              </>
            )}
            {(formData.role === "hod" || formData.role === "advisor") && (
              <>
                <select
                  value={formData.department}
                  onChange={async (e) => {
                    const deptId = e.target.value
                    setFormData({ ...formData, department: deptId, assignedDivisions: [] })
                    if (formData.role === "advisor" && deptId) {
                      await fetchAllDivisionsForDepartment(deptId)
                    }
                  }}
                  className="input-base"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept._id || dept.id} value={dept._id || dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {formData.role === "advisor" && formData.department && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign Divisions (Select multiple)
                    </label>
                    <select
                      multiple
                      value={formData.assignedDivisions}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, (option) => option.value)
                        setFormData({ ...formData, assignedDivisions: selected })
                      }}
                      className="input-base max-w-[300px]"
                      size="5"
                    >
                      {divisions.map((div) => (
                        <option key={div._id || div.id} value={div._id || div.id}>
                          Batch - {div.name} ( {div.year?.name || "Unknown Year"} - {div.year?.academicYear || "Unknown Academic Year"} )
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Hold Ctrl/Cmd to select multiple divisions
                    </p>
                    {formData.assignedDivisions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formData.assignedDivisions.map((divId) => {
                          const div = divisions.find((d) => (d._id || d.id) === divId)
                          return div ? (
                            <span
                              key={divId}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {div.name}
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    assignedDivisions: formData.assignedDivisions.filter((id) => id !== divId),
                                  })
                                }}
                                className="ml-2 text-red-600 hover:text-red-800"
                              >
                                ×
                              </button>
                            </span>
                          ) : null
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">
              {editingId ? "Update" : "Create"}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Users List */}
      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading users...</div>
      ) : (
        <>
          <div className="grid gap-4">
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-600">No users found</div>
            ) : (
              users.map((user) => (
                <div
                  key={user._id || user.id}
                  className="card p-4 hover:shadow-md transition flex justify-between items-center"
                >
                  <div className="flex-1">
                    <h3 className="text-gray-900 font-semibold">{user.name}</h3>
                    <p className="text-gray-600 text-sm">{user.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        {user.role.toUpperCase()}
                      </span>
                      {user.rollNo && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          Roll: {user.rollNo}
                        </span>
                      )}
                      {user.department && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {user.department.name || user.department}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user._id || user.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

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
        </>
      )}
    </div>
  )
}
