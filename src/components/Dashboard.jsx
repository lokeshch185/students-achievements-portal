

import { useState } from "react"
import { StudentList } from "./StudentList"
import { StudentDetail } from "./StudentDetail"

export const Dashboard = () => {
  const [selectedStudentId, setSelectedStudentId] = useState(null)

  if (selectedStudentId) {
    return <StudentDetail studentId={selectedStudentId} onBack={() => setSelectedStudentId(null)} />
  }

  return <StudentList onSelectStudent={(student) => setSelectedStudentId(student.id)} />
}
