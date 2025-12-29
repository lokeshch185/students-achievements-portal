import { AchievementCard } from "./AchievementCard"
import { Pagination } from "./Pagination"

export const AchievementList = ({ achievements, pagination, currentPage, onPageChange }) => {
  if (achievements.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
        <p className="text-slate-400 text-lg">No achievements found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {achievements.map((achievement) => (
        <AchievementCard key={achievement.id} achievement={achievement} />
      ))}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination currentPage={currentPage} totalPages={pagination.totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  )
}
