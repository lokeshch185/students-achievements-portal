

import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import logo from "../assests/spit_logo.png"

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }


  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          <div className="flex items-center gap-3">
            <img src={logo} alt="SPIT Logo" className="w-14 m-2 h-auto" />  
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Students' Achievements Portal</h1>

          <div className="flex justify-end items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-300">
                  {user?.role?.toUpperCase()}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
