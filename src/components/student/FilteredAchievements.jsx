

import { useState, useEffect } from "react"
import SearchFilter from "../SearchFilter"
import AchievementListCard from "./AchievementListCard"
import LoadingSpinner from "../LoadingSpinner"
import EmptyState from "../EmptyState"

export default function FilteredAchievements({ achievements = [], categories = [], loading = false, onEdit }) {
  const [filteredAchievements, setFilteredAchievements] = useState(achievements)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    setFilteredAchievements(achievements)
  }, [achievements])

  const handleSearch = (term) => {
    setSearchTerm(term)
    filterAchievements(term, "")
  }

  const handleFilter = (filters) => {
    filterAchievements(searchTerm, filters.category || "")
  }

  const filterAchievements = (search, category) => {
    let filtered = achievements

    if (search) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(search.toLowerCase()) ||
          a.description.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (category) {
      filtered = filtered.filter((a) => {
        const catId = a.category?._id || a.category
        return catId === category || a.category?.code === category
      })
    }

    setFilteredAchievements(filtered)
  }

  if (loading) return <LoadingSpinner message="Loading achievements..." />

  return (
    <div className="space-y-4">
      <SearchFilter onSearch={handleSearch} onFilter={handleFilter} categories={categories} />

      {filteredAchievements.length === 0 ? (
        <EmptyState
          title={searchTerm ? "No Matches Found" : "No Achievements Yet"}
          description={
            searchTerm ? "Try adjusting your search filters" : "Create your first achievement to get started"
          }
        />
      ) : (
        <div className="grid gap-4">
          {filteredAchievements.map((achievement) => (
            <AchievementListCard
              key={achievement._id || achievement.id}
              achievement={achievement}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  )
}
