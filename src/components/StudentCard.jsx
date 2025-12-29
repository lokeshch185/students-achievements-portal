
import { ChevronRight, Award } from "lucide-react"

export const StudentCard = ({ student, onSelect }) => {
  const achievementCount = student.achievements?.length || 0

  return (
    <div
      onClick={() => onSelect(student)}
      className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10 transition cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition">{student.name}</h3>
          <p className="text-sm text-slate-400">{student.rollNo}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition" />
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-sm text-slate-300">
          <span className="text-slate-500">Program:</span> {student.program} • {student.year}
        </p>
        <p className="text-sm text-slate-300">
          <span className="text-slate-500">Division:</span> {student.division} • Batch {student.batch}
        </p>
        <p className="text-sm text-slate-300 truncate">
          <span className="text-slate-500">Email:</span> {student.email}
        </p>
      </div>

      <div className="flex items-center space-x-2 p-3 bg-blue-600/10 border border-blue-500/20 rounded-lg">
        <Award className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-semibold text-blue-400">
          {achievementCount} Achievement{achievementCount !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  )
}
