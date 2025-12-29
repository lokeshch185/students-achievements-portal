

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import logo from "../assests/spit_logo.png"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const user = await login(email, password)
      // Redirect to appropriate dashboard based on role
      navigate(`/${user.role}`, { replace: true })
    } catch (err) {
      setError(err.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const demoCredentials = [
    { role: "Admin", email: "admin@spit.ac.in", password: "admin123" },
    { role: "HOD", email: "hod@spit.ac.in", password: "hod123" },
    { role: "Class Advisor", email: "advisor@spit.ac.in", password: "advisor123" },
    { role: "Student", email: "student@spit.ac.in", password: "student123" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <img src={logo} alt="SPIT Logo" className="w-20 h-auto mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Student Achievement Management System</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-base"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600 mb-4 font-medium">Demo Credentials</p>
            <div className="space-y-2">
              {demoCredentials.map((cred, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setEmail(cred.email)
                    setPassword(cred.password)
                  }}
                  className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-sm transition group"
                >
                  <p className="font-medium text-gray-900 group-hover:text-black">{cred.role}</p>
                  <p className="text-gray-600 text-xs">{cred.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
