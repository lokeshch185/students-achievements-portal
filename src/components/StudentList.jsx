

import { useState, useEffect } from "react"
import { fetchStudents } from "../services/studentService"
import { StudentCard } from "./StudentCard"
import { Pagination } from "./Pagination"
import { FilterBar } from "./FilterBar"
import { Loader } from "lucide-react"

export const StudentList = ({ onSelectStudent }) => {
  const [students, setStudents] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({})

  useEffect(() => {
    loadStudents()
  }, [currentPage, filters])

  const loadStudents = async () => {
    setLoading(true)
    try {
      const result = await fetchStudents(currentPage, filters)
      setStudents(result.data)
      setPagination(result.pagination)
    } catch (error) {
      console.error("Failed to load students:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  return (
    <div className="space-y-6">
      <FilterBar onFilterChange={handleFilterChange} />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : students.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
          <p className="text-slate-400 text-lg">No students found</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <StudentCard key={student.id} student={student} onSelect={onSelectStudent} />
            ))}
          </div>

          {pagination && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  )
}
