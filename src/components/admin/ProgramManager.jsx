

import { useState, useEffect } from "react"
import { programAPI, departmentAPI } from "../../services/api"
import { showError } from "../../utils/toast"

export default function ProgramManager() {
  const [programs, setPrograms] = useState([])
  const [departments, setDepartments] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ code: "", name: "", department: "" })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPrograms()
    fetchDepartments()
  }, [])

  const fetchPrograms = async () => {
    setLoading(true)
    try {
      const data = await programAPI.getPrograms()
      setPrograms(data)
    } catch (error) {
      console.error("Error fetching programs:", error)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const submitData = {
        code: formData.code,
        name: formData.name,
        department: formData.department,
      }
      if (editingId) {
        await programAPI.updateProgram(editingId, submitData)
      } else {
        await programAPI.createProgram(submitData)
      }
      setFormData({ code: "", name: "", department: "" })
      setShowForm(false)
      setEditingId(null)
      await fetchPrograms()
    } catch (error) {
      console.error("Error saving program:", error)
      showError(error, "Failed to save program")
    }
  }

  const handleEdit = (prog) => {
    setFormData({
      code: prog.code,
      name: prog.name,
      department: prog.department?._id || prog.department || "",
    })
    setEditingId(prog._id || prog.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this program?")) {
      return
    }
    try {
      await programAPI.deleteProgram(id)
      await fetchPrograms()
    } catch (error) {
      console.error("Error deleting program:", error)
      showError(error, "Failed to delete program")
    }
  }

  const handleCancel = () => {
    setFormData({ code: "", name: "", department: "" })
    setShowForm(false)
    setEditingId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Programs</h2>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingId(null)
            setFormData({ code: "", name: "", department: "" })
          }}
          className="btn-primary"
        >
          + Add Program
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 card p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {editingId ? "Edit Program" : "Add New Program"}
          </h3>
          <input
            type="text"
            placeholder="Program Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="input-base"
            required
          />
          <input
            type="text"
            placeholder="Program Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input-base"
            required
          />
          <select
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="input-base"
            required
            disabled={!!editingId}
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept._id || dept.id} value={dept._id || dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
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
        <div className="text-center py-8 text-gray-600">Loading programs...</div>
      ) : (
        <div className="grid gap-4">
          {programs.length === 0 ? (
            <div className="text-center py-8 text-gray-600">No programs found</div>
          ) : (
            programs.map((prog) => (
              <div
                key={prog._id || prog.id}
                className="card p-4 hover:shadow-md transition flex justify-between items-center"
              >
                <div>
                  <h3 className="text-gray-900 font-semibold">{prog.name}</h3>
                  <p className="text-gray-600 text-sm">Code: {prog.code.toUpperCase()}</p>
                  {prog.department && (
                    <p className="text-gray-500 text-xs mt-1">
                      Department: {prog.department.name || prog.department}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(prog)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(prog._id || prog.id)}
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
