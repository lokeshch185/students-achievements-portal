

import { useState } from "react"

export default function DivisionManager() {
  const [divisions, setDivisions] = useState([
    { id: "div-001", code: "a", name: "Division A", batchCount: 4 },
    { id: "div-002", code: "b", name: "Division B", batchCount: 4 },
    { id: "div-003", code: "c", name: "Division C", batchCount: 4 },
    { id: "div-004", code: "d", name: "Division D", batchCount: 4 },
  ])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ code: "", name: "", batchCount: 4 })

  const handleSubmit = (e) => {
    e.preventDefault()
    const newDivision = {
      id: `div-${Date.now()}`,
      ...formData,
    }
    setDivisions([...divisions, newDivision])
    setFormData({ code: "", name: "", batchCount: 4 })
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowForm(!showForm)}
        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition"
      >
        + Add Division
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-slate-700/30 p-4 rounded-lg border border-slate-600">
          <input
            type="text"
            placeholder="Division Code (A, B, C, D)"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400"
            required
          />
          <input
            type="text"
            placeholder="Division Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400"
            required
          />
          <input
            type="number"
            placeholder="Number of Batches"
            value={formData.batchCount}
            onChange={(e) => setFormData({ ...formData, batchCount: Number.parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400"
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {divisions.map((div) => (
          <div
            key={div.id}
            className="bg-slate-700/30 p-4 rounded-lg border border-slate-600 hover:border-blue-500/50 transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white font-semibold">{div.name}</h3>
                <p className="text-slate-400 text-sm">Code: {div.code}</p>
                <p className="text-slate-500 text-xs mt-2">Batches: {div.batchCount}</p>
              </div>
              <button className="text-red-400 hover:text-red-300 text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
