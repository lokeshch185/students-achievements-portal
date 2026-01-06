

import { useState, useEffect } from "react"
import { categoryAPI, userAPI, fileAPI } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import { useDebounce } from "../../hooks/useDebounce"
import { showWarning } from "../../utils/toast"

export default function AchievementForm({ onSubmit, achievement = null, onCancel }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    date: "",
    certificate: null,
    photo: null,
    type: "solo",
    participants: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [certificatePreview, setCertificatePreview] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [categories, setCategories] = useState(null)
  const isEditing = !!achievement
  const [studentSearch, setStudentSearch] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const debouncedSearch = useDebounce(studentSearch, 400)
  const [participantFiles, setParticipantFiles] = useState({})

  const MAX_TEAM_SIZE = 5 // including the creator

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await categoryAPI.getCategories()
      setCategories(data)
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    if (achievement) {
      // Format date for input (YYYY-MM-DD)
      const dateStr = achievement.date ? new Date(achievement.date).toISOString().split("T")[0] : ""
      setFormData({
        title: achievement.title || "",
        category: achievement.category?._id || achievement.category || "",
        description: achievement.description || "",
        date: dateStr,
        certificate: null, // Don't pre-fill files
        photo: null,
        type: achievement.type || "solo",
        participants: achievement.participants || [],
      })
    }
  }, [achievement])

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await categoryAPI.getCategories();
      setCategories(data);
    };
  
    fetchCategories();
  }, []);
  
  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (files && files[0]) {
      const file = files[0]

      const maxSize = 500 * 1024; // 500 KB

      if (file.size > maxSize) {
        showWarning("File size must be under 500 KB")
        e.target.value = ""
        return
      }

      if (name === "certificate") {
        setFormData((prev) => ({ ...prev, [name]: file }))
        if (file.type.startsWith("image/")) {
          const reader = new FileReader()
          reader.onloadend = () => setCertificatePreview(reader.result)
          reader.readAsDataURL(file)
        } else {
          setCertificatePreview(null)
        }
      } else if (name === "photo") {
        setFormData((prev) => ({ ...prev, [name]: file }))
        const reader = new FileReader()
        reader.onloadend = () => setPhotoPreview(reader.result)
        reader.readAsDataURL(file)
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
    setError("")
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Achievement title is required")
      return false
    }
    if (!formData.description.trim()) {
      setError("Description is required")
      return false
    }
    if (formData.description.length < 30) {
      setError("Description must be at least 30 characters")
      return false
    }
    if (!formData.date) {
      setError("Date is required")
      return false
    }
    if (!formData.category) {
      setError("Please select a category")
      return false
    }
    if (formData.type === "group" && formData.participants.length === 0) {
      setError("Please add at least one other student for a group achievement")
      return false
    }
    return true
  }

  // Debounced student search (name/email only, minimal payload)
  useEffect(() => {
    const runSearch = async () => {
      const query = debouncedSearch.trim()
      if (!query) {
        setSearchResults([])
        return
      }
      setSearchLoading(true)
      try {
        const results = await userAPI.searchStudents(query, 10)
        // Exclude current user
        const filtered = results.filter((u) => u._id !== user?._id)
        setSearchResults(filtered)
      } catch (err) {
        console.error("Error searching students:", err)
      } finally {
        setSearchLoading(false)
      }
    }

    runSearch()
  }, [debouncedSearch, user?._id])

  const handleSearchStudents = (query) => {
    setStudentSearch(query)
  }

  const handleParticipantFileChange = (studentId, file) => {
    if (!file) {
      setParticipantFiles((prev) => {
        const updated = { ...prev }
        delete updated[studentId]
        return updated
      })
      return
    }
    const maxSize = 500 * 1024
    if (file.size > maxSize) {
      showWarning("Participant certificate must be under 500 KB")
      return
    }
    setParticipantFiles((prev) => ({
      ...prev,
      [studentId]: file,
    }))
  }

  const viewExistingFile = async (fileId) => {
    if (!fileId) return
    try {
      const token = localStorage.getItem("token")
      const url = fileAPI.getFileUrl(fileId)
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
      window.open(objectUrl, "_blank")
    } catch (err) {
      console.error("Error viewing file:", err)
    }
  }

  const handleAddParticipant = (student) => {
    const currentCount = (formData.participants?.length || 0) + 1 // + creator
    if (currentCount >= MAX_TEAM_SIZE) {
      showWarning(`Team size cannot exceed ${MAX_TEAM_SIZE} including you`)
      return
    }
    setFormData((prev) => {
      const exists = prev.participants?.some((p) => (p._id || p.id) === (student._id || student.id))
      if (exists) return prev
      return {
        ...prev,
        participants: [...(prev.participants || []), student],
      }
    })
  }

  const handleRemoveParticipant = (id) => {
    setFormData((prev) => ({
      ...prev,
      participants: (prev.participants || []).filter((p) => (p._id || p.id) !== id),
    }))
    setParticipantFiles((prev) => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!validateForm()) return

    setLoading(true)
    try {
      // Prepare files for upload
      const files = {}
      if (formData.certificate) {
        files.certificate = formData.certificate
      }
      if (formData.photo) {
        files.photo = formData.photo
      }
      if (Object.keys(participantFiles).length) {
        files.participantCertificates = participantFiles
      }

      // Prepare achievement data
      const participantIds = (formData.participants || []).map((p) => p._id || p.id)
      const achievementData = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        date: formData.date,
        type: formData.type,
        participants: participantIds,
      }

      await onSubmit(achievementData, files, achievement?._id || achievement?.id)
      
      if (!isEditing) {
        // Reset form only if creating new
        setFormData({
          title: "",
          category: "",
          description: "",
          date: "",
          certificate: null,
          photo: null,
        })
        setCertificatePreview(null)
        setPhotoPreview(null)
        setParticipantFiles({})
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || `Failed to ${isEditing ? "update" : "add"} achievement`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {isEditing && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          Editing achievement. You can only edit pending achievements.
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          Achievement {isEditing ? "updated" : "added"} successfully! {!isEditing && "It is now pending verification."}
        </div>
      )}

      {/* Solo / Group toggle */}
      <div>
        <label className="block text-gray-700 text-sm font-medium mb-2">Achievement Type</label>
        <div className="flex gap-3">
          {["solo", "group"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  type,
                }))
              }
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                formData.type === type
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {type === "solo" ? "Solo" : "Group"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-gray-700 text-sm font-medium mb-2">Achievement Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., National AI Competition Winner"
          className="input-base"
          required
        />
      </div>

      <div>
        <label className="block text-gray-700 text-sm font-medium mb-3">Category</label>
        {categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((cat) => (
              <label
                key={cat._id || cat.id}
                className={`flex items-center p-4 rounded-lg border cursor-pointer transition ${
                  formData.category === (cat._id || cat.id)
                    ? "bg-gray-100 border-black"
                    : "bg-white border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={cat._id || cat.id}
                  checked={formData.category === (cat._id || cat.id)}
                  onChange={handleChange}
                  className="w-4 h-4 accent-black"
                />
                <span className="ml-3 text-sm font-medium text-gray-900">{cat.name}</span>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Loading categories...</p>
        )}
      </div>

      <div>
        <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your achievement in detail... (What did you do? What was the outcome? Any learnings?)"
          rows="5"
          className="input-base resize-none"
          required
        ></textarea>
        <p className="text-xs text-gray-500 mt-1">Minimum 30 characte required</p>
      </div>

      <div>
        <label className="block text-gray-700 text-sm font-medium mb-2">Date of Achievement</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="input-base"
          required
        />
      </div>

      {/* Group participants selection */}
      {formData.type === "group" && (
        <div className="space-y-3">
          <label className="block text-gray-700 text-sm font-medium">Group Members</label>
          <p className="text-xs text-gray-500 mb-1">
            Search and add other students from your class / department who are part of this achievement.
          </p>
          <input
            type="text"
            value={studentSearch}
            onChange={(e) => handleSearchStudents(e.target.value)}
            placeholder="Search by name or email..."
            className="input-base"
          />
          {studentSearch && (
            <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto bg-white">
              {searchLoading ? (
                <div className="p-3 text-sm text-gray-500">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-3 text-sm text-gray-500">No students found</div>
              ) : (
                searchResults.map((s) => (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => handleAddParticipant(s)}
                    className="w-full flex justify-between items-center px-4 py-2 text-sm hover:bg-gray-50 border-b last:border-b-0 border-gray-100"
                  >
                    <span className="text-gray-900">{s.name}</span>
                    <span className="text-gray-500 text-xs">{s.rollNo || s.email}</span>
                  </button>
                ))
              )}
            </div>
          )}

          {formData.participants && formData.participants.length > 0 && (
            <div className="flex flex-col gap-3 mt-2">
              {formData.participants.map((p) => {
                const pid = p._id || p.id
                const existingFile = participantFiles[pid]
                return (
                  <div
                    key={pid}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-lg border border-gray-200 bg-gray-50"
                  >
                    <div className="flex-1 text-sm text-gray-900">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-gray-600 text-xs">{p.rollNo || p.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleParticipantFileChange(pid, e.target.files?.[0])}
                        className="text-xs"
                      />
                      {existingFile && <span className="text-xs text-gray-600 truncate max-w-[120px]">{existingFile.name}</span>}
                      <button
                        type="button"
                        onClick={() => handleRemoveParticipant(pid)}
                        className="text-gray-500 hover:text-black text-sm"
                        aria-label={`Remove ${p.name}`}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )
              })}
              <p className="text-xs text-gray-500">
                Team size max {MAX_TEAM_SIZE} (including you). Certificates are optional but can be added per member.
              </p>
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-gray-700 text-sm font-medium mb-2">
          Certificate (PDF/JPG | Max 500KB) {isEditing && "(Leave empty to keep current)"}
        </label>
        <input
          type="file"
          name="certificate"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleChange}
          className="input-base"
        />
        {certificatePreview && (
          <div className="mt-2">
            <img src={certificatePreview} alt="Certificate preview" className="max-w-xs rounded-lg border border-gray-300" />
          </div>
        )}
        {formData.certificate && !certificatePreview && (
          <p className="text-sm text-gray-600 mt-1">File: {formData.certificate.name}</p>
        )}
        {isEditing && achievement.certificate && !formData.certificate && !certificatePreview && (
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
            <span>Existing certificate attached.</span>
            <button
              type="button"
              onClick={() => viewExistingFile(achievement.certificate._id || achievement.certificate)}
              className="text-blue-600 hover:underline"
            >
              View
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-gray-700 text-sm font-medium mb-2">
          Photo (Individual/Group - JPG/PNG | Max 500KB) {isEditing && "(Leave empty to keep current)"}
        </label>
        <input
          type="file"
          name="photo"
          accept=".jpg,.jpeg,.png"
          onChange={handleChange}
          className="input-base"
        />
        {photoPreview && (
          <div className="mt-2">
            <img src={photoPreview} alt="Photo preview" className="max-w-xs rounded-lg border border-gray-300" />
          </div>
        )}
        {isEditing && achievement.photo && !formData.photo && !photoPreview && (
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
            <span>Existing photo attached.</span>
            <button
              type="button"
              onClick={() => viewExistingFile(achievement.photo._id || achievement.photo)}
              className="text-blue-600 hover:underline"
            >
              View
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? isEditing
              ? "Updating Achievement..."
              : "Adding Achievement..."
            : isEditing
            ? "Update Achievement"
            : "Add Achievement"}
        </button>
        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
