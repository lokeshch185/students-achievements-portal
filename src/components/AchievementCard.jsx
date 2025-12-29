import { Award, CheckCircle, Clock, Calendar } from "lucide-react"

export const AchievementCard = ({ achievement }) => {
  const statusConfig = {
    verified: {
      icon: CheckCircle,
      color: "text-green-400",
      bgColor: "bg-green-600/10",
      borderColor: "border-green-500/20",
      label: "Verified",
    },
    submitted: {
      icon: Clock,
      color: "text-yellow-400",
      bgColor: "bg-yellow-600/10",
      borderColor: "border-yellow-500/20",
      label: "Submitted",
    },
  }

  const config = statusConfig[achievement.status] || statusConfig.submitted
  const StatusIcon = config.icon

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10 transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className="bg-cyan-600/20 border border-cyan-500/20 rounded-lg p-3">
            <Award className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{achievement.title}</h3>
            <p className="text-sm text-slate-400 mt-1">{achievement.category}</p>
          </div>
        </div>
        <div
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-full ${config.bgColor} border ${config.borderColor}`}
        >
          <StatusIcon className={`w-4 h-4 ${config.color}`} />
          <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
        </div>
      </div>

      <p className="text-slate-300 mb-4">{achievement.description}</p>

      <div className="flex items-center space-x-4 text-sm text-slate-400">
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(achievement.date)}</span>
        </div>
        {achievement.certificate && (
          <a
            href={`/data/${achievement.certificate}`}
            className="text-cyan-400 hover:text-cyan-300 transition flex items-center space-x-1"
          >
            <span>View Certificate</span>
          </a>
        )}
      </div>
    </div>
  )
}
