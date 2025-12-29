

export default function AchievementStats({ achievements = [] }) {
  const stats = {
    total: achievements.length,
    verified: achievements.filter((a) => a.status === "verified").length,
    pending: achievements.filter((a) => a.status === "pending").length,
    categories: [...new Set(achievements.map((a) => a.category))].length,
  }

  const getProgressPercentage = (current, total) => {
    return total === 0 ? 0 : Math.round((current / total) * 100)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-gray-600 text-sm">Total Achievements</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
        <div className="card p-4">
          <p className="text-gray-600 text-sm">Verified</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.verified}</p>
          {stats.total > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {getProgressPercentage(stats.verified, stats.total)}% verified
            </p>
          )}
        </div>
        <div className="card p-4">
          <p className="text-gray-600 text-sm">Pending Review</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pending}</p>
          {stats.total > 0 && (
            <p className="text-xs text-gray-500 mt-1">{getProgressPercentage(stats.pending, stats.total)}% pending</p>
          )}
        </div>
        <div className="card p-4">
          <p className="text-gray-600 text-sm">Categories</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.categories}</p>
          <p className="text-xs text-gray-500 mt-1">Different types</p>
        </div>
      </div>

      {stats.total > 0 && (
        <div className="card p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-medium">Verification Progress</span>
            <span className="text-gray-900 font-semibold">{getProgressPercentage(stats.verified, stats.total)}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-300"
              style={{ width: `${getProgressPercentage(stats.verified, stats.total)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  )
}
