

import { useState } from "react"

export default function AcademicStructure() {
  const [structure, setStructure] = useState({
    ug: ["FE", "SE", "TE", "BE"],
    pg: ["M.Tech", "MCA"],
  })

  const [selectedProgram, setSelectedProgram] = useState("ug")

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {Object.keys(structure).map((prog) => (
          <button
            key={prog}
            onClick={() => setSelectedProgram(prog)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedProgram === prog ? "bg-blue-600 text-white" : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {prog === "ug" ? "Undergraduate" : "Postgraduate"}
          </button>
        ))}
      </div>

      <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
        <h3 className="text-white font-semibold mb-4">
          {selectedProgram === "ug" ? "Undergraduate" : "Postgraduate"} Structure
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {structure[selectedProgram].map((level) => (
            <div
              key={level}
              className="bg-gradient-to-br from-blue-600/20 to-blue-400/10 border border-blue-500/30 rounded-lg p-4 text-center"
            >
              <p className="text-white font-semibold">{level}</p>
              <p className="text-slate-400 text-xs mt-2">Active: 500 students</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
        <h3 className="text-white font-semibold mb-4">System Hierarchy</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-blue-400">▸</span> Department
          </div>
          <div className="flex items-center gap-2 text-slate-300 ml-4">
            <span className="text-blue-400">▸</span> Program (UG / PG)
          </div>
          <div className="flex items-center gap-2 text-slate-300 ml-8">
            <span className="text-blue-400">▸</span> Year/Level (FE, SE, TE, BE)
          </div>
          <div className="flex items-center gap-2 text-slate-300 ml-12">
            <span className="text-blue-400">▸</span> Division (A, B, C, D)
          </div>
          <div className="flex items-center gap-2 text-slate-300 ml-16">
            <span className="text-blue-400">▸</span> Batch (1, 2, 3, 4)
          </div>
          <div className="flex items-center gap-2 text-slate-300 ml-20">
            <span className="text-blue-400">▸</span> Student
          </div>
        </div>
      </div>
    </div>
  )
}
