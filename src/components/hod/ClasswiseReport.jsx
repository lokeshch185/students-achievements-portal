
import { useState, useEffect } from "react"
import { analyticsAPI } from "../../services/api"

export default function ClasswiseReport() {
  const [reportData, setReportData] = useState({})
  const [selectedClass, setSelectedClass] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchClasswiseReport()
  }, [])

  const fetchClasswiseReport = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await analyticsAPI.getClasswiseReport()
      // Backend returns: { success: true, data: { fe: {...}, se: {...} } }
      // Axios interceptor extracts response.data, so we get: { success: true, data: {...} }
      const data = response.data || response || {}
      setReportData(data)
      
      // Set first available year as selected
      const yearKeys = Object.keys(data)
      if (yearKeys.length > 0 && !selectedClass) {
        setSelectedClass(yearKeys[0])
      }
    } catch (err) {
      console.error("Error fetching classwise report:", err)
      setError(err.message || "Failed to load classwise report data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={fetchClasswiseReport} className="btn-primary">
          Retry
        </button>
      </div>
    )
  }

  const yearKeys = Object.keys(reportData)
  if (yearKeys.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No class data available</p>
      </div>
    )
  }

  // Use first year if none selected
  const activeYear = selectedClass || yearKeys[0]
  const currentData = reportData[activeYear]

  if (!currentData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No data available for selected class</p>
      </div>
    )
  }

  const verificationRate = currentData.totalAchievements > 0
    ? Math.round((currentData.verifiedAchievements / currentData.totalAchievements) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {yearKeys.map((key) => {
          const yearData = reportData[key]
          if (!yearData) return null
          return (
            <button
              key={key}
              onClick={() => setSelectedClass(key)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeYear === key
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {yearData.name}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-gray-600 text-sm">Total Students</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{currentData.totalStudents || 0}</p>
        </div>
        <div className="card p-4">
          <p className="text-gray-600 text-sm">Total Achievements</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{currentData.totalAchievements || 0}</p>
        </div>
        <div className="card p-4">
          <p className="text-gray-600 text-sm">Verification Rate</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{verificationRate}%</p>
        </div>
      </div>

      <div className="card p-6 overflow-x-auto">
        <h3 className="text-gray-900 font-semibold mb-4">Division-wise Breakdown</h3>
        {currentData.divisions && currentData.divisions.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-3 px-4 text-gray-700 font-medium">Division</th>
                <th className="text-right py-3 px-4 text-gray-700 font-medium">Students</th>
                <th className="text-right py-3 px-4 text-gray-700 font-medium">Achievements</th>
                <th className="text-right py-3 px-4 text-gray-700 font-medium">Verified</th>
                <th className="text-right py-3 px-4 text-gray-700 font-medium">Rate</th>
              </tr>
            </thead>
            <tbody>
              {currentData.divisions.map((div, idx) => {
                const divVerificationRate = div.achievements > 0
                  ? Math.round((div.verified / div.achievements) * 100)
                  : 0
                return (
                  <tr key={div._id || idx} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="py-3 px-4 text-gray-700">{div.name}</td>
                    <td className="text-right py-3 px-4 text-gray-700">{div.students || 0}</td>
                    <td className="text-right py-3 px-4 text-gray-900 font-semibold">{div.achievements || 0}</td>
                    <td className="text-right py-3 px-4 text-gray-900 font-semibold">{div.verified || 0}</td>
                    <td className="text-right py-3 px-4 text-gray-900 font-semibold">
                      {divVerificationRate}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-600">
            <p>No divisions found for this year</p>
          </div>
        )}
      </div>
    </div>
  )
}
