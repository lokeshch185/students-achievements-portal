

export default function AchievementListCard({ achievement, onEdit }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "pending":
        return "bg-gray-200 text-gray-800 border-gray-400"
      default:
        return "bg-gray-50 text-gray-700 border-gray-300"
    }
  }

  const getCategoryIcon = (category) => {
    const icons = {
      "technical-competitions": "🏆",
      hackathons: "💻",
      internships: "💼",
      certifications: "📜",
      research: "📚",
      "sports-culture": "⚽",
    }
    return icons[category] || "✨"
  }

  const categoryName = achievement.category?.name || achievement.category || ""
  const categoryCode = achievement.category?.code || achievement.category || ""
  const canEdit = achievement.status === "pending" && onEdit

  const handleViewCertificate = async () => {
    const fileId = achievement.certificate?._id || achievement.certificate
    if (!fileId) return

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"
      const token = localStorage.getItem("token")
      
      const response = await fetch(`${API_URL}/api/files/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch certificate")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      // Determine file extension from content type
      const contentType = blob.type
      let extension = "pdf"
      if (contentType.includes("jpeg") || contentType.includes("jpg")) {
        extension = "jpg"
      } else if (contentType.includes("png")) {
        extension = "png"
      }

      // Create download link
      const a = document.createElement("a")
      a.href = url
      a.download = `certificate-${achievement.title.replace(/\s+/g, "-")}.${extension}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Error downloading certificate:", err)
      alert("Failed to download certificate. Please try again.")
    }
  }

  return (
    <div className="card p-5 hover:shadow-md transition group">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{getCategoryIcon(categoryCode)}</span>
            <div className="flex-1">
              <h3 className="text-gray-900 font-semibold group-hover:text-black transition">{achievement.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{achievement.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(achievement.status)}`}>
              {achievement.status.charAt(0).toUpperCase() + achievement.status.slice(1)}
            </span>
            <span className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-medium border border-gray-300">
              {categoryName || categoryCode.replace("-", " ")}
            </span>
            <span className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-xs border border-gray-300">
              {new Date(achievement.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          {achievement.verifiedDate && (
            <p className="text-xs text-gray-500 mt-3">
              Verified on {new Date(achievement.verifiedDate).toLocaleDateString()}
            </p>
          )}
          {achievement.rejectionReason && (
            <p className="text-xs text-red-600 mt-2">
              Rejected: {achievement.rejectionReason}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {achievement.certificate && (
            <button
              onClick={handleViewCertificate}
              className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition whitespace-nowrap"
            >
              View Certificate
            </button>
          )}
          {canEdit && (
            <button
              onClick={() => onEdit(achievement)}
              className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 transition whitespace-nowrap"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
