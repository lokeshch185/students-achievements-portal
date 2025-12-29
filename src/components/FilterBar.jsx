

import { useState } from "react"
import { Search, Filter, X } from "lucide-react"

export const FilterBar = ({ onFilterChange }) => {
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState({
    department: "",
    program: "",
    year: "",
    division: "",
  })
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange({ ...newFilters, search })
  }

  const handleSearch = (value) => {
    setSearch(value)
    onFilterChange({ ...filters, search: value })
  }

  const clearFilters = () => {
    setSearch("")
    setFilters({
      department: "",
      program: "",
      year: "",
      division: "",
    })
    onFilterChange({ search: "" })
  }

  const hasActiveFilters = search || Object.values(filters).some((v) => v)

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
        <input
          type="text"
          placeholder="Search by name, roll no, or email..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition"
        />
      </div>

      {/* Filter Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 text-slate-300 hover:text-cyan-400 transition"
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm font-semibold">Advanced Filters</span>
        {hasActiveFilters && (
          <span className="bg-cyan-500 text-white text-xs px-2 py-1 rounded-full">
            {Object.values(filters).filter((v) => v).length + (search ? 1 : 0)}
          </span>
        )}
      </button>

      {/* Filter Options */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={filters.department}
            onChange={(e) => handleFilterChange("department", e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 transition"
          >
            <option value="">All Departments</option>
            <option value="Computer Engineering">Computer Engineering</option>
            <option value="EXTC">EXTC</option>
            <option value="CSE">CSE</option>
          </select>

          <select
            value={filters.program}
            onChange={(e) => handleFilterChange("program", e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 transition"
          >
            <option value="">All Programs</option>
            <option value="UG">Undergraduate</option>
            <option value="PG">Postgraduate</option>
          </select>

          <select
            value={filters.year}
            onChange={(e) => handleFilterChange("year", e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 transition"
          >
            <option value="">All Years</option>
            <option value="FE">FE</option>
            <option value="SE">SE</option>
            <option value="TE">TE</option>
            <option value="BE">BE</option>
            <option value="M.Tech">M.Tech</option>
          </select>

          <select
            value={filters.division}
            onChange={(e) => handleFilterChange("division", e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400 transition"
          >
            <option value="">All Divisions</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </div>
      )}

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center space-x-2 text-sm text-red-400 hover:text-red-300 transition"
        >
          <X className="w-4 h-4" />
          <span>Clear all filters</span>
        </button>
      )}
    </div>
  )
}
