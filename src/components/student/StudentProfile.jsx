import { useState } from "react"
import { authAPI, departmentAPI, programAPI, academicAPI } from "../../services/api"
import { useAuth } from "../../context/AuthContext"
import { showError, showSuccess, showWarning } from "../../utils/toast"

export default function StudentProfile() {
  const { user, login } = useAuth()
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await authAPI.updateDetails({ name: profileData.name })
      showSuccess("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      showError(error, "Failed to update profile")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      showWarning("Please fill all password fields")
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showWarning("New password and confirmation do not match")
      return
    }
    setSavingPassword(true)
    try {
      await authAPI.updatePassword(passwordData.currentPassword, passwordData.newPassword)
      showSuccess("Password updated successfully")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Error updating password:", error)
      showError(error, "Failed to update password")
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form onSubmit={handleSaveProfile} className="card p-4 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleProfileChange}
              className="input-base"
              required
            />
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </form>

        <form onSubmit={handleChangePassword} className="card p-4 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="input-base"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="input-base"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="input-base"
              required
            />
          </div>
          <button
            type="submit"
            disabled={savingPassword}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {savingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  )
}


