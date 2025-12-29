

import { useState } from "react"

export default function SearchFilter({ onSearch, onFilter, categories = [] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearch?.(value)
  }

  const handleCategoryChange = (e) => {
    const value = e.target.value
    setSelectedCategory(value)
    onFilter?.({ category: value, status: selectedStatus })
  }

  const handleStatusChange = (e) => {
    const value = e.target.value
    setSelectedStatus(value)
    onFilter?.({ category: selectedCategory, status: value })
  }

  const handleReset = () => {
    setSearchTerm("")
    setSelectedCategory("")
    setSelectedStatus("")
    onSearch?.("")
    onFilter?.({ category: "", status: "" })
  }

  return (
    <div className="card p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search achievements..."
          value={searchTerm}
          onChange={handleSearch}
          className="input-base"
        />

        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="input-base"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id || cat.id} value={cat._id || cat.code}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={handleStatusChange}
          className="input-base"
        >
          <option value="">All Status</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
        </select>

        <button
          onClick={handleReset}
          className="btn-secondary"
        >
          Reset Filters
        </button>
      </div>
    </div>
  )
}
