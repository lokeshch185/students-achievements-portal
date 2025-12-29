

import { useState, useEffect } from "react"
import { departmentAPI } from "../../services/api"

export default function DepartmentManager() {
  const [departments, setDepartments] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ code: "", name: "" })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    setLoading(true)
    try {
      const data = await departmentAPI.getDepartments()
      setDepartments(data)
    } catch (error) {
      console.error("Error fetching departments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await departmentAPI.updateDepartment(editingId, formData)
      } else {
        await departmentAPI.createDepartment(formData)
      }
      setFormData({ code: "", name: "" })
      setShowForm(false)
      setEditingId(null)
      await fetchDepartments()
    } catch (error) {
      console.error("Error saving department:", error)
      alert(error.error || "Failed to save department")
    }
  }

  const handleEdit = (dept) => {
    setFormData({ code: dept.code, name: dept.name })
    setEditingId(dept._id || dept.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) {
      return
    }
    try {
      await departmentAPI.deleteDepartment(id)
      await fetchDepartments()
    } catch (error) {
      console.error("Error deleting department:", error)
      alert(error.error || "Failed to delete department")
    }
  }

  const handleCancel = () => {
    setFormData({ code: "", name: "" })
    setShowForm(false)
    setEditingId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Departments</h2>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingId(null)
            setFormData({ code: "", name: "" })
          }}
          className="btn-primary"
        >
          + Add Department
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 card p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {editingId ? "Edit Department" : "Add New Department"}
          </h3>
          <input
            type="text"
            placeholder="Department Code (e.g., COMP)"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            className="input-base"
            required
            disabled={!!editingId}
          />
          <input
            type="text"
            placeholder="Department Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input-base"
            required
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">
              {editingId ? "Update" : "Create"}
            </button>
            <button type="button" onClick={handleCancel} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-600">Loading departments...</div>
      ) : (
        <div className="grid gap-4">
          {departments.length === 0 ? (
            <div className="text-center py-8 text-gray-600">No departments found</div>
          ) : (
            departments.map((dept) => (
              <div
                key={dept._id || dept.id}
                className="card p-4 hover:shadow-md transition flex justify-between items-center"
              >
                <div>
                  <h3 className="text-gray-900 font-semibold">{dept.name}</h3>
                  <p className="text-gray-600 text-sm">Code: {dept.code}</p>
                  {dept.hod && (
                    <p className="text-gray-500 text-xs mt-1">HOD: {dept.hod.name || "Not assigned"}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(dept)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(dept._id || dept.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
