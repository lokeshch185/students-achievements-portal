import { useState } from "react"
import { achievementAPI } from "../../services/api"

export default function ReportGenerator() {
  const [reportType, setReportType] = useState("monthly")
  const [format, setFormat] = useState("csv")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [generating, setGenerating] = useState(false)

  const handleGenerateReport = async () => {
    if (reportType === "monthly" || reportType === "semester") {
      if (!startDate || !endDate) {
        alert("Please select start and end dates")
        return
      }
      if (new Date(startDate) > new Date(endDate)) {
        alert("Start date must be before end date")
        return
      }
    }

    setGenerating(true)
    try {
      // Build query parameters
      const params = {}
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      // Fetch achievements based on filters
      const result = await achievementAPI.getAchievements(params)
      const achievements = result.data || result || []

      if (achievements.length === 0) {
        alert("No data available for the selected criteria")
        setGenerating(false)
        return
      }

      // Generate report based on format
      if (format === "csv") {
        generateCSV(achievements)
      } else if (format === "excel") {
        generateExcel(achievements)
      } else {
        // PDF generation would typically be done on the backend
        alert("PDF generation will be available soon. Please use CSV or Excel format.")
      }
    } catch (error) {
      console.error("Error generating report:", error)
      alert("Failed to generate report. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  const generateCSV = (data) => {
    const headers = ["Title", "Student", "Category", "Date", "Status", "Description"]
    const rows = data.map((item) => [
      item.title || "",
      item.student?.name || item.student?.email || "",
      item.category?.name || item.category || "",
      new Date(item.date).toLocaleDateString(),
      item.status || "",
      (item.description || "").replace(/,/g, ";"), // Replace commas in description
    ])

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${reportType}-report-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generateExcel = (data) => {
    // Simple Excel-like CSV generation (Excel can open CSV files)
    generateCSV(data)
  }

  const reportTypes = [
    { id: "monthly", label: "Monthly Report", requiresDate: true },
    { id: "semester", label: "Semester Report", requiresDate: true },
    { id: "category", label: "Category-wise Report", requiresDate: false },
    { id: "all", label: "All Achievements", requiresDate: false },
  ]

  const currentReportType = reportTypes.find((type) => type.id === reportType)

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Generate Report</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-3">Report Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setReportType(type.id)
                    if (!type.requiresDate) {
                      setStartDate("")
                      setEndDate("")
                    }
                  }}
                  className={`p-3 rounded-lg text-sm font-medium transition ${
                    reportType === type.id
                      ? "bg-black text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {currentReportType?.requiresDate && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-base w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-base w-full"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-3">Export Format</label>
            <div className="flex gap-3">
              {["csv", "excel", "pdf"].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition ${
                    format === fmt
                      ? "bg-black text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
            {format === "pdf" && (
              <p className="text-xs text-gray-500 mt-2">
                PDF generation will be available soon. Please use CSV or Excel format.
              </p>
            )}
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={generating || (currentReportType?.requiresDate && (!startDate || !endDate))}
            className="w-full px-4 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? "Generating Report..." : "Generate Report"}
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Information</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <span className="font-medium">Report Type:</span>
            <span>{currentReportType?.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Format:</span>
            <span>{format.toUpperCase()}</span>
          </div>
          {startDate && endDate && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Date Range:</span>
              <span>
                {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
