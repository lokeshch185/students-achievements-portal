

export default function AchievementList({ achievements, pagination, page, onPageChange, loading }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (achievements.length === 0) {
    return <div className="text-center py-12 text-slate-400">No achievements yet. Add your first one!</div>
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className="bg-slate-700/30 p-4 rounded-lg border border-slate-600 hover:border-blue-500/50 transition"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-white font-semibold">{achievement.title}</h3>
                <p className="text-slate-400 text-sm mt-2">{achievement.description}</p>
                <div className="flex gap-3 mt-3 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(achievement.status)}`}
                  >
                    {achievement.status.toUpperCase()}
                  </span>
                  <span className="text-slate-500 text-xs">Category: {achievement.category}</span>
                  <span className="text-slate-500 text-xs">Date: {achievement.date}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-700">
          <p className="text-slate-400 text-sm">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-2 rounded-lg transition ${
                  page === pageNum ? "bg-blue-600 text-white" : "bg-slate-700/50 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === pagination.totalPages}
              className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
