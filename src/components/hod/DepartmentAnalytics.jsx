

import { useState, useEffect } from "react"
import { api } from "../../services/api"
import { useAuth } from "../../context/AuthContext"

export default function DepartmentAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState("overall")
  const { user } = useAuth()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const data = await api.getAnalytics()
      console.log(data)
      setAnalyticsData(data)
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-gray-600 text-sm">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{analyticsData?.total_students || 0}</p>
            </div>
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2zm0 0h6v-2a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          {/* <p className="text-xs text-gray-500">↑ 8% from last semester</p> */}
        </div>

        <div className="card p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-gray-600 text-sm">Total Achievements</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{analyticsData?.total_achievements || 450}</p>
            </div>
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
          {/* <p className="text-xs text-gray-500">↑ 15% from last month</p> */}
        </div>

        <div className="card p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-gray-600 text-sm">Verification Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {Math.round(
                  ((analyticsData?.verified_achievements || 0) / (analyticsData?.total_achievements || 10)) * 100,
                )}
                %
              </p>
            </div>
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          {/* <p className="text-xs text-gray-500">Above target rate</p> */}
        </div>

        <div className="card p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-gray-600 text-sm">Pending Review</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{analyticsData?.pending_achievements}</p>
            </div>
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          {/* <p className="text-xs text-gray-500">16% of total</p> */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-gray-900 font-semibold mb-4">Top Achievement Categories</h3>
          <div className="space-y-4">
            {analyticsData?.top_categories?.map((cat, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm font-medium">{cat.category}</span>
                  <span className="text-gray-900 font-bold">{cat.count}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black"
                    style={{ width: `${(cat.count / 120) * 100}%` }}
                  ></div>
                </div>
              </div>
            )) || <p className="text-gray-600 text-sm">Loading...</p>}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-gray-900 font-semibold mb-4">Program Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-gray-900 font-semibold"> Total Students: {analyticsData?.total_students}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-gray-900 font-semibold"> Students with Achievements: {analyticsData?.students_with_achievements}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
