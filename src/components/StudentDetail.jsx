

import { useState, useEffect } from "react"
import { fetchStudentById, fetchAchievements } from "../services/studentService"
import { AchievementList } from "./AchievementList"
import { Loader, ArrowLeft, Mail, BookOpen, Users } from "lucide-react"

export const StudentDetail = ({ studentId, onBack }) => {
  const [student, setStudent] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadStudentData()
  }, [studentId, currentPage])

  const loadStudentData = async () => {
    setLoading(true)
    try {
      const studentData = await fetchStudentById(studentId)
      setStudent(studentData)

      const achievementsData = await fetchAchievements(studentId, currentPage)
      setAchievements(achievementsData.data)
      setPagination(achievementsData.pagination)
    } catch (error) {
      console.error("Failed to load student data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    )
  }

  if (!student) {
    return <div className="text-white">Student not found</div>
  }

  const verifiedCount = achievements.filter((a) => a.status === "verified").length
  const submittedCount = achievements.filter((a) => a.status === "submitted").length

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Students</span>
      </button>

      {/* Student Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{student.name}</h1>
            <p className="text-slate-400">{student.rollNo}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-slate-300">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>
                {student.program === "UG" ? "Undergraduate" : "Postgraduate"} • {student.year}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>
                Division {student.division} • Batch {student.batch}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Mail className="w-4 h-4 text-cyan-400" />
              <span className="truncate">{student.email}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{achievements.length}</p>
              <p className="text-xs text-slate-400 mt-1">Total</p>
            </div>
            <div className="bg-green-600/10 border border-green-500/20 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{verifiedCount}</p>
              <p className="text-xs text-slate-400 mt-1">Verified</p>
            </div>
            <div className="bg-yellow-600/10 border border-yellow-500/20 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">{submittedCount}</p>
              <p className="text-xs text-slate-400 mt-1">Submitted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Achievements</h2>
        <AchievementList
          achievements={achievements}
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}
