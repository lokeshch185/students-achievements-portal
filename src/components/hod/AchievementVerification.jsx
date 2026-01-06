
import { useState, useEffect } from "react"
import { achievementAPI } from "../../services/api"
import { showError, showSuccess, showWarning } from "../../utils/toast"

export default function AchievementVerification({ achievements, onUpdate }) {
  const [verifying, setVerifying] = useState(null)
  const [rejecting, setRejecting] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [items, setItems] = useState(achievements)
  const [selectedAchievement, setSelectedAchievement] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all") // all, pending, verified, rejected
  const [certificatePreview, setCertificatePreview] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  useEffect(() => {
    setItems(achievements)
  }, [achievements])

  const handleVerify = async (id) => {
    setVerifying(id)
    try {
      const response = await achievementAPI.verifyAchievement(id)
      const updated = response.data || response
      const updatedItems = items.map((a) => {
        const aId = a._id || a.id
        return aId === id ? updated : a
      })
      setItems(updatedItems)
      setSelectedAchievement(updated)
      if (onUpdate) {
        onUpdate()
      }
      showSuccess("Achievement verified")
    } catch (error) {
      console.error("Error verifying achievement:", error)
      showError(error, "Failed to verify achievement")
    } finally {
      setVerifying(null)
    }
  }

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) {
      showWarning("Please provide a rejection reason")
      return
    }
    setRejecting(id)
    try {
      const response = await achievementAPI.rejectAchievement(id, rejectionReason)
      const updated = response.data || response
      const updatedItems = items.map((a) => {
        const aId = a._id || a.id
        return aId === id ? updated : a
      })
      setItems(updatedItems)
      setSelectedAchievement(updated)
      setRejectionReason("")
      setShowRejectForm(false)
      if (onUpdate) {
        onUpdate()
      }
      showSuccess("Achievement rejected")
    } catch (error) {
      console.error("Error rejecting achievement:", error)
      showError(error, "Failed to reject achievement")
    } finally {
      setRejecting(null)
    }
  }

  const handleAchievementClick = async (achievement) => {
    try {
      // Fetch full achievement details if not already loaded
      const response = await achievementAPI.getAchievement(achievement._id || achievement.id)
      // API returns { success: true, data: {...} } after interceptor extracts response.data
      const fullAchievement = response.data || response
      setSelectedAchievement(fullAchievement)
      setShowModal(true)
      
      // Load certificate and photo previews
      if (fullAchievement.certificate) {
        const fileId = fullAchievement.certificate._id || fullAchievement.certificate
        loadFilePreview(fileId, "certificate")
      }
      if (fullAchievement.photo) {
        const fileId = fullAchievement.photo._id || fullAchievement.photo
        loadFilePreview(fileId, "photo")
      }
    } catch (error) {
      console.error("Error fetching achievement details:", error)
      // Fallback to the achievement we have
      setSelectedAchievement(achievement)
      setShowModal(true)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedAchievement(null)
    setRejectionReason("")
    setShowRejectForm(false)
  }

  const getCertificateUrl = (fileId) => {
    if (!fileId) return null
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"
    return `${API_URL}/api/files/${fileId}`
  }

  const handleViewCertificate = async (fileId) => {
    try {
      const token = localStorage.getItem("token")
      const url = getCertificateUrl(fileId)
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch certificate")
      }

      const blob = await response.blob()
      const objectUrl = window.URL.createObjectURL(blob)
      window.open(objectUrl, "_blank")
    } catch (err) {
      console.error("Error viewing certificate:", err)
      showError(err, "Failed to view certificate. Please try again.")
    }
  }

  const handleViewPhoto = async (fileId) => {
    try {
      const token = localStorage.getItem("token")
      const url = getCertificateUrl(fileId)
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch photo")
      }

      const blob = await response.blob()
      const objectUrl = window.URL.createObjectURL(blob)
      window.open(objectUrl, "_blank")
    } catch (err) {
      console.error("Error viewing photo:", err)
      showError(err, "Failed to view photo. Please try again.")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this achievement? This action cannot be undone.")) {
      return
    }
    setDeleting(id)
    try {
      await achievementAPI.deleteAchievement(id)
      const updatedItems = items.filter((a) => {
        const aId = a._id || a.id
        return aId !== id
      })
      setItems(updatedItems)
      setShowModal(false)
      setSelectedAchievement(null)
      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      console.error("Error deleting achievement:", error)
      showError(error, "Failed to delete achievement")
    } finally {
      setDeleting(null)
    }
  }


  const loadFilePreview = async (fileId, type) => {
    if (!fileId) return
    try {
      const token = localStorage.getItem("token")
      const url = getCertificateUrl(fileId)
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch file")
      }

      const blob = await response.blob()
      const objectUrl = window.URL.createObjectURL(blob)
      
      if (type === "certificate") {
        setCertificatePreview(objectUrl)
      } else {
        setPhotoPreview(objectUrl)
      }
    } catch (err) {
      console.error(`Error loading ${type} preview:`, err)
      // Set error state but don't block modal
    }
  }


  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-700 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const filteredAchievements = items.filter((a) => {
    if (statusFilter === "all") return true
    return a.status === statusFilter
  })

  return (
    <>
      <div className="space-y-4">
        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "verified", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                statusFilter === status
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== "all" && (
                <span className="ml-2 text-xs">
                  ({items.filter((a) => a.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Achievements List */}
        {filteredAchievements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {statusFilter === "all"
                ? "No achievements found"
                : `No ${statusFilter} achievements found`}
            </p>
          </div>
        ) : (
          filteredAchievements.map((achievement) => {
            const achievementId = achievement._id || achievement.id
            return (
              <div
                key={achievementId}
                className="card p-4 hover:shadow-md transition cursor-pointer"
                onClick={() => handleAchievementClick(achievement)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-gray-900 font-semibold">{achievement.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          achievement.status
                        )}`}
                      >
                        {achievement.status.charAt(0).toUpperCase() + achievement.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{achievement.description}</p>
                    <div className="flex gap-4 mt-3 text-xs text-gray-500 flex-wrap">
                      <span>Category: {achievement.category?.name || achievement.category}</span>
                      <span>Date: {new Date(achievement.date).toLocaleDateString()}</span>
                      {achievement.student && (
                        <span>Student: {achievement.student.name || achievement.student.email}</span>
                      )}
                      {achievement.verifiedDate && (
                        <span>
                          Verified: {new Date(achievement.verifiedDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {achievement.rejectionReason && (
                      <p className="text-xs text-red-600 mt-2">
                        Rejection Reason: {achievement.rejectionReason}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 text-sm text-gray-500">Click to view details →</div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal */}
      {showModal && selectedAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">{selectedAchievement.title}</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Student Info */}
                {selectedAchievement.student && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Student Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-1">
                      <p className="text-gray-900 font-medium">
                        {selectedAchievement.student.name || null}
                      </p>
                      <p className="text-gray-600 text-sm">Email: {selectedAchievement.student.email || null}</p>
                      {selectedAchievement.student.rollNo && (
                        <p className="text-gray-600 text-sm">Roll No: {selectedAchievement.student.rollNo || null}</p>
                      )}
                      {(selectedAchievement.student.year || selectedAchievement.student.division) && (
                        <p className="text-gray-600 text-xs">
                          {selectedAchievement.student.year &&
                            `Year: ${
                              selectedAchievement.student.year.name || null
                            }`}
                          {selectedAchievement.student.division &&
                            ` • Division: ${
                              selectedAchievement.student.division.name || null
                            }`}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Solo / Group Type */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Achievement Type</h3>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-gray-900 capitalize">{selectedAchievement.type || "solo"}</p>
                  </div>
                </div>

                {/* Group Members */}
                {selectedAchievement.participants && selectedAchievement.participants.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Group Members</h3>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-2">
                      {selectedAchievement.participants.map((p) => (
                        <div key={p._id || p.id} className="text-sm text-gray-900">
                          <span className="font-medium">{p.name || p.email}</span>
                          {p.rollNo && <span className="text-gray-600 text-xs"> • {p.rollNo}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedAchievement.description}</p>
                  </div>
                </div>

                {/* Category & Date & Academic Year */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-900">
                        {selectedAchievement.category?.name || selectedAchievement.category}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Date</h3>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-900">
                        {new Date(selectedAchievement.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div>
                   
                  </div>
                </div>

                {/* Per-participant Certificates */}
                {selectedAchievement.participantCertificates &&
                  selectedAchievement.participantCertificates.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Member Certificates</h3>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
                        {selectedAchievement.participantCertificates.map((pc, idx) => (
                          <div
                            key={pc._id || `${pc.student?._id || pc.student}-${pc.certificate?._id || pc.certificate}-${idx}`}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="text-gray-900">
                              <span className="font-medium">
                                {pc.student?.name || pc.student?.email || "Student"}
                              </span>
                              {pc.student?.rollNo && (
                                <span className="text-gray-600 text-xs"> • {pc.student.rollNo}</span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleViewCertificate(pc.certificate?._id || pc.certificate)
                              }
                              className="px-3 py-1 bg-black text-white rounded-lg text-xs hover:bg-gray-800 transition"
                            >
                              View Certificate
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Certificate */}
                {selectedAchievement.certificate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Certificate</h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                      {certificatePreview ? (
                        <div>
                          {selectedAchievement.certificate?.mimeType?.includes("pdf") ||
                          selectedAchievement.certificate?.mimeType === "application/pdf" ? (
                            <embed
                              src={certificatePreview}
                              type="application/pdf"
                              className="w-full h-96 rounded-lg border border-gray-300"
                            />
                          ) : (
                            <img
                              src={certificatePreview}
                              alt="Certificate"
                              className="w-full max-h-96 object-contain rounded-lg border border-gray-300"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">Loading certificate...</div>
                      )}
                      <button
                        onClick={() =>
                          handleViewCertificate(
                            selectedAchievement.certificate?._id || selectedAchievement.certificate
                          )
                        }
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium"
                      >
                        Open Certificate in New Tab
                      </button>
                    </div>
                  </div>
                )}

                {/* Photo */}
                {selectedAchievement.photo && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Photo</h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                      {photoPreview ? (
                        <div>
                          <img
                            src={photoPreview}
                            alt="Achievement Photo"
                            className="w-full max-h-96 object-contain rounded-lg border border-gray-300"
                          />
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">Loading photo...</div>
                      )}
                      <button
                        onClick={() =>
                          handleViewPhoto(selectedAchievement.photo?._id || selectedAchievement.photo)
                        }
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition font-medium"
                      >
                        Open Photo in New Tab
                      </button>
                    </div>
                  </div>
                )}

                {/* Rejection Reason Form */}
                {showRejectForm && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Rejection Reason</h3>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a reason for rejection..."
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                      required
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer with Actions */}
            <div className="p-6 border-t border-gray-200 flex flex-wrap gap-3 justify-between">
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(selectedAchievement._id || selectedAchievement.id)}
                  disabled={deleting === (selectedAchievement._id || selectedAchievement.id)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 font-medium"
                >
                  {deleting === (selectedAchievement._id || selectedAchievement.id) ? "Deleting..." : "Delete"}
                </button>
                <button
                disabled={downloading}
                  onClick={async () => {
                    try {
                      setDownloading(true)
                      const token = localStorage.getItem("token")
                      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"
                      const id = selectedAchievement._id || selectedAchievement.id
                      const response = await fetch(`${API_URL}/api/achievements/${id}/pdf`, {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      })
                      if (!response.ok) {
                        throw new Error("Failed to generate PDF")
                      }
                      const blob = await response.blob()
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = `${selectedAchievement.title || "achievement"}.pdf`
                      document.body.appendChild(a)
                      a.click()
                      a.remove()
                      window.URL.revokeObjectURL(url)
                      setDownloading(false)
                    } catch (err) {
                      console.error("Error downloading PDF:", err)
                    showError(err, "Failed to download PDF. Please try again.")
                    setDownloading(false)
                    }
                  }}
                  className={`px-6 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium ${downloading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
                >
                  {downloading ? "Downloading..." : "Download PDF"}
                </button>
              </div>
              <div className="flex gap-3">
                {!showRejectForm ? (
                  <>
                    {selectedAchievement.status !== "rejected" && (
                      <button
                        onClick={() => setShowRejectForm(true)}
                        className="px-6 py-2 bg-red-100 text-red-700 border border-red-200 rounded-lg hover:bg-red-200 transition font-medium"
                      >
                        {selectedAchievement.status === "verified" ? "Reject (Undo Verification)" : "Reject"}
                      </button>
                    )}
                    {selectedAchievement.status !== "verified" && (
                      <button
                        onClick={() => handleVerify(selectedAchievement._id || selectedAchievement.id)}
                        disabled={verifying === (selectedAchievement._id || selectedAchievement.id)}
                        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 font-medium"
                      >
                        {verifying === (selectedAchievement._id || selectedAchievement.id)
                          ? "Verifying..."
                          : "Approve"}
                      </button>
                    )}
                    {selectedAchievement.status === "verified" && (
                      <span className="px-6 py-2 bg-green-100 text-green-700 border border-green-200 rounded-lg font-medium flex items-center gap-2">
                        <span>✓</span> Verified
                      </span>
                    )}
                    {selectedAchievement.status === "rejected" && (
                      <span className="px-6 py-2 bg-red-100 text-red-700 border border-red-200 rounded-lg font-medium">
                        Rejected
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setShowRejectForm(false)
                        setRejectionReason("")
                      }}
                      className="px-6 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReject(selectedAchievement._id || selectedAchievement.id)}
                      disabled={rejecting === (selectedAchievement._id || selectedAchievement.id)}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 font-medium"
                    >
                      {rejecting === (selectedAchievement._id || selectedAchievement.id)
                        ? "Rejecting..."
                        : "Confirm Reject"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
