import { useState, useEffect } from "react"
import { academicAPI, departmentAPI, programAPI } from "../../services/api"

export default function AcademicStructureManager() {
  const [departments, setDepartments] = useState([])
  const [programs, setPrograms] = useState([])
  const [selectedDept, setSelectedDept] = useState("")
  const [selectedProgram, setSelectedProgram] = useState("")
  const [selectedYear, setSelectedYear] = useState(null)
  const [selectedDivision, setSelectedDivision] = useState(null)
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [years, setYears] = useState([])
  const [divisions, setDivisions] = useState([])
  const [batches, setBatches] = useState([])
  const [showYearForm, setShowYearForm] = useState(false)
  const [showDivisionForm, setShowDivisionForm] = useState(false)
  const [showBatchForm, setShowBatchForm] = useState(false)
  const [editingYearId, setEditingYearId] = useState(null)
  const [editingDivisionId, setEditingDivisionId] = useState(null)
  const [editingBatchId, setEditingBatchId] = useState(null)
  const [yearForm, setYearForm] = useState({ code: "", name: "", academicYear: "", semester: "" })
  const [divisionForm, setDivisionForm] = useState({ code: "", name: "" })
  const [batchForm, setBatchForm] = useState({ name: "" })

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    if (selectedDept) {
      fetchPrograms()
    }
  }, [selectedDept])

  useEffect(() => {
    if (selectedProgram) {
      fetchYears()
    }
  }, [selectedProgram])

  useEffect(() => {
    if (selectedYear) {
      fetchDivisions(selectedYear._id || selectedYear.id)
    }
  }, [selectedYear])

  useEffect(() => {
    if (selectedDivision) {
      fetchBatches(selectedDivision._id || selectedDivision.id)
    }
  }, [selectedDivision])

  const fetchDepartments = async () => {
    try {
      const data = await departmentAPI.getDepartments()
      setDepartments(data)
    } catch (error) {
      console.error("Error fetching departments:", error)
    }
  }

  const fetchPrograms = async () => {
    try {
      const data = await programAPI.getPrograms(selectedDept)
      setPrograms(data)
    } catch (error) {
      console.error("Error fetching programs:", error)
    }
  }

  const fetchYears = async () => {
    try {
      const data = await academicAPI.getYears(selectedProgram)
      setYears(data)
    } catch (error) {
      console.error("Error fetching years:", error)
    }
  }

  const fetchDivisions = async (yearId) => {
    try {
      const data = await academicAPI.getDivisions(yearId)
      setDivisions(data)
    } catch (error) {
      console.error("Error fetching divisions:", error)
    }
  }

  const fetchBatches = async (divisionId) => {
    try {
      const data = await academicAPI.getBatches(divisionId)
      setBatches(data)
    } catch (error) {
      console.error("Error fetching batches:", error)
    }
  }

  const handleCreateYear = async (e) => {
    e.preventDefault()
    try {
      const submitData = {
        code: yearForm.code,
        name: yearForm.name,
        program: selectedProgram,
      }
      if (yearForm.academicYear) submitData.academicYear = yearForm.academicYear
      if (yearForm.semester) submitData.semester = parseInt(yearForm.semester)

      if (editingYearId) {
        await academicAPI.updateYear(editingYearId, submitData)
      } else {
        await academicAPI.createYear(submitData)
      }
      setShowYearForm(false)
      setYearForm({ code: "", name: "", academicYear: "", semester: "" })
      setEditingYearId(null)
      await fetchYears()
    } catch (error) {
      console.error("Error saving year:", error)
      alert(error.error || "Failed to save year")
    }
  }

  const handleEditYear = (year) => {
    setYearForm({
      code: year.code || "",
      name: year.name || "",
      academicYear: year.academicYear || "",
      semester: year.semester || "",
    })
    setEditingYearId(year._id || year.id)
    setShowYearForm(true)
  }

  const handleDeleteYear = async (id) => {
    if (!window.confirm("Are you sure you want to delete this year?")) return
    try {
      await academicAPI.deleteYear(id)
      if (selectedYear?._id === id || selectedYear?.id === id) {
        setSelectedYear(null)
        setDivisions([])
        setSelectedDivision(null)
        setBatches([])
        setSelectedBatch(null)
      }
      await fetchYears()
    } catch (error) {
      console.error("Error deleting year:", error)
      alert(error.error || "Failed to delete year")
    }
  }

  const handleCreateDivision = async (e) => {
    e.preventDefault()
    try {
      const submitData = {
        ...divisionForm,
        year: selectedYear._id || selectedYear.id,
      }
      if (editingDivisionId) {
        await academicAPI.updateDivision(editingDivisionId, submitData)
      } else {
        await academicAPI.createDivision(submitData)
      }
      setShowDivisionForm(false)
      setDivisionForm({ code: "", name: "" })
      setEditingDivisionId(null)
      await fetchDivisions(selectedYear._id || selectedYear.id)
    } catch (error) {
      console.error("Error saving division:", error)
      alert(error.error || "Failed to save division")
    }
  }

  const handleEditDivision = (div) => {
    setDivisionForm({
      code: div.code || "",
      name: div.name || "",
    })
    setEditingDivisionId(div._id || div.id)
    setShowDivisionForm(true)
  }

  const handleDeleteDivision = async (id) => {
    if (!window.confirm("Are you sure you want to delete this division?")) return
    try {
      await academicAPI.deleteDivision(id)
      if (selectedDivision?._id === id || selectedDivision?.id === id) {
        setSelectedDivision(null)
        setBatches([])
        setSelectedBatch(null)
      }
      await fetchDivisions(selectedYear._id || selectedYear.id)
    } catch (error) {
      console.error("Error deleting division:", error)
      alert(error.error || "Failed to delete division")
    }
  }

  const handleCreateBatch = async (e) => {
    e.preventDefault()
    try {
      const submitData = {
        name: batchForm.name,
        division: selectedDivision._id || selectedDivision.id,
      }
      if (editingBatchId) {
        await academicAPI.updateBatch(editingBatchId, submitData)
      } else {
        await academicAPI.createBatch(submitData)
      }
      setShowBatchForm(false)
      setBatchForm({ name: "" })
      setEditingBatchId(null)
      await fetchBatches(selectedDivision._id || selectedDivision.id)
    } catch (error) {
      console.error("Error saving batch:", error)
      alert(error.error || "Failed to save batch")
    }
  }

  const handleEditBatch = (batch) => {
    setBatchForm({
      name: batch.name || "",
    })
    setEditingBatchId(batch._id || batch.id)
    setShowBatchForm(true)
  }

  const handleDeleteBatch = async (id) => {
    if (!window.confirm("Are you sure you want to delete this batch?")) return
    try {
      await academicAPI.deleteBatch(id)
      if (selectedBatch?._id === id || selectedBatch?.id === id) {
        setSelectedBatch(null)
      }
      await fetchBatches(selectedDivision._id || selectedDivision.id)
    } catch (error) {
      console.error("Error deleting batch:", error)
      alert(error.error || "Failed to delete batch")
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Structure Hierarchy</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <span className="font-medium">Department</span>
            <span className="text-gray-400">→</span>
            <span className="font-medium">Program</span>
            <span className="text-gray-400">→</span>
            <span className="font-medium">Year/Class</span>
            <span className="text-gray-400">→</span>
            <span className="font-medium">Division</span>
            <span className="text-gray-400">→</span>
            <span className="font-medium">Batch</span>
            <span className="text-gray-400">→</span>
            <span className="font-medium">Student</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Department</label>
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value)
              setSelectedProgram("")
              setYears([])
            }}
            className="input-base"
          >
            <option value="">Choose Department</option>
            {departments.map((dept) => (
              <option key={dept._id || dept.id} value={dept._id || dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div className="card p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Program</label>
          <select
            value={selectedProgram}
            onChange={(e) => {
              setSelectedProgram(e.target.value)
              setYears([])
            }}
            className="input-base"
            disabled={!selectedDept}
          >
            <option value="">Choose Program</option>
            {programs.map((prog) => (
              <option key={prog._id || prog.id} value={prog._id || prog.id}>
                {prog.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedProgram && (
        <div className="card p-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-900">Years/Classes</h4>
            <button
              onClick={() => {
                setShowYearForm(true)
                setEditingYearId(null)
                setYearForm({ code: "", name: "", academicYear: "", semester: "" })
              }}
              className="btn-primary text-sm"
            >
              + Add Year
            </button>
          </div>

          {showYearForm && (
            <form onSubmit={handleCreateYear} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h5 className="font-medium text-gray-900 mb-3">
                {editingYearId ? "Edit Year" : "Add New Year"}
              </h5>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Year Code (e.g., fe, se)"
                  value={yearForm.code}
                  onChange={(e) => setYearForm({ ...yearForm, code: e.target.value.toLowerCase() })}
                  className="input-base"
                  required
                  disabled={!!editingYearId}
                />
                <input
                  type="text"
                  placeholder="Year Name (e.g., FE, SE)"
                  value={yearForm.name}
                  onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
                  className="input-base"
                  required
                />
                <input
                  type="text"
                  placeholder="Academic Year (e.g., 2024-2025)"
                  value={yearForm.academicYear}
                  onChange={(e) => setYearForm({ ...yearForm, academicYear: e.target.value })}
                  className="input-base"
                />
                <input
                  type="number"
                  placeholder="Semester (1-8)"
                  value={yearForm.semester}
                  onChange={(e) => setYearForm({ ...yearForm, semester: e.target.value })}
                  className="input-base"
                  min="1"
                  max="8"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary text-sm">
                  {editingYearId ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowYearForm(false)
                    setEditingYearId(null)
                    setYearForm({ code: "", name: "", academicYear: "", semester: "" })
                  }}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {years.length === 0 ? (
              <div className="col-span-full text-center py-4 text-gray-600 text-sm">No years found</div>
            ) : (
              years.map((year) => (
                <div
                  key={year._id || year.id}
                  className={`p-3 border rounded-lg transition cursor-pointer ${
                    selectedYear?._id === year._id || selectedYear?.id === year.id
                      ? "bg-black text-white border-black"
                      : "bg-gray-50 border-gray-200 hover:shadow-sm"
                  }`}
                  onClick={() => {
                    setSelectedYear(year)
                    setSelectedDivision(null)
                    setSelectedBatch(null)
                    setDivisions([])
                    setBatches([])
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-medium ${selectedYear?._id === year._id || selectedYear?.id === year.id ? "text-white" : "text-gray-900"}`}>
                        {year.name}
                      </p>
                      <p className={`text-xs mt-1 ${selectedYear?._id === year._id || selectedYear?.id === year.id ? "text-gray-200" : "text-gray-600"}`}>
                        Code: {year.code}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditYear(year)
                        }}
                        className={`px-2 py-1 rounded text-xs ${selectedYear?._id === year._id || selectedYear?.id === year.id ? "bg-white text-black hover:bg-gray-100" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteYear(year._id || year.id)
                        }}
                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                      >
                        Del
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {selectedYear && (
        <div className="card p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-semibold text-gray-900">Divisions for {selectedYear.name}</h4>
              <p className="text-xs text-gray-600 mt-1">Click on a division to view batches</p>
            </div>
            <button
              onClick={() => {
                setShowDivisionForm(true)
                setEditingDivisionId(null)
                setDivisionForm({ code: "", name: "" })
              }}
              className="btn-primary text-sm"
            >
              + Add Division
            </button>
          </div>

          {showDivisionForm && (
            <form onSubmit={handleCreateDivision} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h5 className="font-medium text-gray-900 mb-3">
                {editingDivisionId ? "Edit Division" : "Add New Division"}
              </h5>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Division Code (e.g., A, B)"
                  value={divisionForm.code}
                  onChange={(e) => setDivisionForm({ ...divisionForm, code: e.target.value.toUpperCase() })}
                  className="input-base"
                  required
                  disabled={!!editingDivisionId}
                />
                <input
                  type="text"
                  placeholder="Division Name (e.g., Division A)"
                  value={divisionForm.name}
                  onChange={(e) => setDivisionForm({ ...divisionForm, name: e.target.value })}
                  className="input-base"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary text-sm">
                  {editingDivisionId ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDivisionForm(false)
                    setEditingDivisionId(null)
                    setDivisionForm({ code: "", name: "" })
                  }}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {divisions.length === 0 ? (
              <div className="col-span-full text-center py-4 text-gray-600 text-sm">No divisions found</div>
            ) : (
              divisions.map((div) => (
                <div
                  key={div._id || div.id}
                  className={`p-3 border rounded-xl transition cursor-pointer ${
                    selectedDivision?._id === div._id || selectedDivision?.id === div.id
                      ? "bg-black text-white border-black"
                      : "bg-gray-50 border-gray-200 hover:shadow-sm"
                  }`}
                  onClick={() => {
                    setSelectedDivision(div)
                    setSelectedBatch(null)
                    setBatches([])
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-medium ${selectedDivision?._id === div._id || selectedDivision?.id === div.id ? "text-white" : "text-gray-900"}`}>
                        {div.name}
                      </p>
                      <p className={`text-xs mt-1 ${selectedDivision?._id === div._id || selectedDivision?.id === div.id ? "text-gray-200" : "text-gray-600"}`}>
                        Code: {div.code}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditDivision(div)
                        }}
                        className={`px-2 py-1 rounded text-xs ${selectedDivision?._id === div._id || selectedDivision?.id === div.id ? "bg-white text-black hover:bg-gray-100" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteDivision(div._id || div.id)
                        }}
                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                      >
                        Del
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {selectedDivision && (
        <div className="card p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-semibold text-gray-900">
                Batches for {selectedDivision.name}
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                {selectedYear?.name} → {selectedDivision.name}
              </p>
            </div>
            <button
              onClick={() => {
                setShowBatchForm(true)
                setEditingBatchId(null)
                setBatchForm({ name: "" })
              }}
              className="btn-primary text-sm"
            >
              + Add Batch
            </button>
          </div>

          {showBatchForm && (
            <form onSubmit={handleCreateBatch} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h5 className="font-medium text-gray-900 mb-3">
                {editingBatchId ? "Edit Batch" : "Add New Batch"}
              </h5>
              <input
                type="text"
                placeholder="Batch Number"
                value={batchForm.name}
                onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
                className="input-base mb-3"
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary text-sm">
                  {editingBatchId ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBatchForm(false)
                    setEditingBatchId(null)
                    setBatchForm({ name: "" })
                  }}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {batches.length === 0 ? (
              <div className="col-span-full text-center py-4 text-gray-600 text-sm">No batches found</div>
            ) : (
              batches.map((batch) => (
                <div
                  key={batch._id || batch.id}
                  className={`p-3 border rounded-lg transition ${
                    selectedBatch?._id === batch._id || selectedBatch?.id === batch.id
                      ? "bg-black text-white border-black"
                      : "bg-gray-50 border-gray-200 hover:shadow-sm"
                  }`}
                  onClick={() => setSelectedBatch(batch)}
                >
                  <div className="flex justify-between items-center">
                    <p className={`font-medium ${selectedBatch?._id === batch._id || selectedBatch?.id === batch.id ? "text-white" : "text-gray-900"}`}>
                      Batch {batch.name}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditBatch(batch)
                        }}
                        className={`px-2 py-1 rounded text-xs ${selectedBatch?._id === batch._id || selectedBatch?.id === batch.id ? "bg-white text-black hover:bg-gray-100" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteBatch(batch._id || batch.id)
                        }}
                        className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                      >
                        Del
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

