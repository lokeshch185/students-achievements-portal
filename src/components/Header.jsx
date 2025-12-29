
import { useAuth } from "../context/AuthContext"
import { LogOut, User, Menu, X } from "lucide-react"
import { useState } from "react"
import logo from "../assests/spit_logo.png"

export const Header = () => {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const getRoleColor = (role) => {
    const colors = {
      student: "bg-blue-600/20 text-blue-400",
      classAdvisor: "bg-purple-600/20 text-purple-400",
      hod: "bg-orange-600/20 text-orange-400",
      admin: "bg-red-600/20 text-red-400",
    }
    return colors[role] || "bg-slate-600/20 text-slate-400"
  }

  const getRoleName = (role) => {
    const names = {
      student: "Student",
      classAdvisor: "Class Advisor",
      hod: "HOD",
      admin: "Administrator",
    }
    return names[role] || role
  }

  return (
    <header className="bg-slate-800 border-b border-slate-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <img src={logo} alt="SPIT Logo" className="w-10 h-10" />
            </div>
          </div>

          {/* User Info */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">
                {user.firstName} {user.lastName}
              </p>
              <span
                className={`inline-block text-xs px-2.5 py-1 rounded-full font-semibold ${getRoleColor(user.role)}`}
              >
                {getRoleName(user.role)}
              </span>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-slate-400 hover:text-white">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-slate-700">
            <div className="pt-4 space-y-3">
              <div className="flex items-center space-x-2 px-2">
                <User className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    {user.firstName} {user.lastName}
                  </p>
                  <span
                    className={`inline-block text-xs px-2.5 py-1 rounded-full font-semibold ${getRoleColor(user.role)}`}
                  >
                    {getRoleName(user.role)}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
