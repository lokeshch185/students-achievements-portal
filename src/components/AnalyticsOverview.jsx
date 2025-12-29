export default function AnalyticsOverview({ data }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-gray-600 text-sm">Total Achievements</p>
          <p className="text-3xl font-bold text-gray-900">{data.total_achievements || 0}</p>
          {/* <p className="text-xs text-gray-500 mt-2">↑ 12% from last month</p> */}
        </div>

        <div className="card p-4">
          <p className="text-gray-600 text-sm">Verified</p>
          <p className="text-3xl font-bold text-gray-900">{data.verified_achievements || 0}</p>
          {/* <p className="text-xs text-gray-500 mt-2">84% of total</p> */}
        </div>

        <div className="card p-4">
          <p className="text-gray-600 text-sm">Pending Review</p>
          <p className="text-3xl font-bold text-gray-900">{data.pending_achievements || 0}</p>
          {/* <p className="text-xs text-gray-500 mt-2">16% of total</p> */}
        </div>

        <div className="card p-4">
          <p className="text-gray-600 text-sm">Students</p>
          <p className="text-3xl font-bold text-gray-900">{data.total_students || 0}</p>
          {/* <p className="text-xs text-gray-500 mt-2">42% of total</p> */}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-gray-900 font-semibold mb-4">Top Achievement Categories</h3>
        <div className="space-y-3">
          {data.top_categories?.map((cat, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-700 text-sm">{cat.category}</span>
                <span className="text-gray-900 font-semibold">{cat.count}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black"
                  style={{ width: `${(cat.count / 120) * 100}%` }}
                ></div>
              </div>
            </div>
          )) || <p className="text-gray-600">Loading...</p>}
        </div>
      </div>
    </div>
  )
}
