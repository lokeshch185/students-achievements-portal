export default function StudentStats({ achievements }) {
  const verified = achievements.filter((a) => a.status === "verified").length
  const pending = achievements.filter((a) => a.status === "pending").length

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-blue-600/20 to-blue-400/10 border border-blue-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm">Total Achievements</p>
        <p className="text-3xl font-bold text-blue-400">{achievements.length}</p>
      </div>
      <div className="bg-gradient-to-br from-green-600/20 to-green-400/10 border border-green-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm">Verified</p>
        <p className="text-3xl font-bold text-green-400">{verified}</p>
      </div>
      <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-400/10 border border-yellow-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm">Pending Review</p>
        <p className="text-3xl font-bold text-yellow-400">{pending}</p>
      </div>
    </div>
  )
}
