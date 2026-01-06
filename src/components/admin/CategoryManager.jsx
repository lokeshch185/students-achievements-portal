

import { useState, useEffect } from "react"
import { categoryAPI } from "../../services/api"
import { showError, showSuccess } from "../../utils/toast"

export default function CategoryManager() {
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ code: "", name: "" })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const data = await categoryAPI.getCategories()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await categoryAPI.createCategory(formData)
      setFormData({ code: "", name: "" })
      setShowForm(false)
      await fetchCategories()
      showSuccess("Category created successfully")
    } catch (error) {
      console.error("Error creating category:", error)
      showError(error, "Failed to create category")
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowForm(!showForm)}
        className="btn-primary"
      >
        + Add Category
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 card p-4">
          <input
            type="text"
            placeholder="Category Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="input-base"
            required
          />
          <input
            type="text"
            placeholder="Category Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input-base"
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="btn-primary"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {categories.map((cat) => (
          <div
            key={cat._id || cat.id}
            className="card p-4 flex justify-between items-center hover:shadow-md transition"
          >
            <div>
              <h3 className="text-gray-900 font-semibold">{cat.name}</h3>
              <p className="text-gray-600 text-sm">Code: {cat.code}</p>
            </div>
            <button className="text-red-600 hover:text-red-700 text-sm font-medium">Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}
