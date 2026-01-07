import { useMemo, useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import Header from "../components/Header"
import RocketLoader from "../components/RocketLoader"
import { ArrowLeft, Plus, X } from "lucide-react"
import { addProgressEntry, fetchProgress, fetchUserGoals } from "../features/ProgressSlice"

function getMonthInfo(offset) {
  const base = new Date()
  const currentMonthIndex = base.getMonth()
  const currentYear = base.getFullYear()
  const targetMonthIndex = currentMonthIndex + offset
  const year = currentYear + Math.floor(targetMonthIndex / 12)
  const month = ((targetMonthIndex % 12) + 12) % 12
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startWeekday = firstDay.getDay()
  const label = firstDay.toLocaleDateString(undefined, { month: "long", year: "numeric" })
  return { year, month, daysInMonth, startWeekday, label }
}

export default function Progress() {
  const dispatch = useDispatch()
  const theme = useSelector((state) => state.theme.theme)
  const { user } = useSelector((state) => state.auth)
  const { currentProgress, progressHistory, status } = useSelector((state) => state.progress)
  const navigate = useNavigate()
  const [monthOffset, setMonthOffset] = useState(0)
  const [showProgressForm, setShowProgressForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [progressFormData, setProgressFormData] = useState({
    weight: "",
    bodyFat: "",
    muscleMass: "",
    measurements: {
      chest: "",
      waist: "",
      hips: "",
      arms: "",
      thighs: "",
      calves: ""
    },
    goals: [
      { name: "Workout", completed: false },
      { name: "Diet", completed: false },
      { name: "Hydration", completed: false }
    ],
    notes: "",
    mood: "good"
  })
  
  const info = useMemo(() => getMonthInfo(monthOffset), [monthOffset])

  // Load progress data when component mounts or user changes
  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchProgress(user.uid))
      dispatch(fetchUserGoals(user.uid))
    }
  }, [dispatch, user?.uid])

  const grid = []
  for (let i = 0; i < info.startWeekday; i++) grid.push(null)
  for (let d = 1; d <= info.daysInMonth; d++) grid.push(d)

  const formatDate = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
  
  // Get progress ratio for a specific date from progress history
  const getRatio = (dateStr) => {
    if (!progressHistory || progressHistory.length === 0) return 0
    
    const dayProgress = progressHistory.find(p => {
      // Handle both Firestore Timestamp and Date objects
      let progressDate
      if (p.date && p.date.toDate) {
        // Firestore Timestamp
        progressDate = p.date.toDate().toISOString().split('T')[0]
      } else if (p.date) {
        // Regular Date string
        progressDate = new Date(p.date).toISOString().split('T')[0]
      } else {
        return false
      }
      return progressDate === dateStr
    })
    
    if (!dayProgress) return 0
    
    // Calculate completion ratio based on progress data
    if (dayProgress.goals && Array.isArray(dayProgress.goals)) {
      const totalGoals = dayProgress.goals.length
      const completedGoals = dayProgress.goals.filter(g => g.completed).length
      return totalGoals > 0 ? completedGoals / totalGoals : 0
    }
    
    // Fallback: check if any progress data exists
    return dayProgress.weight || dayProgress.bodyFat || dayProgress.muscleMass || 
           (dayProgress.measurements && Object.values(dayProgress.measurements).some(v => v)) ? 0.3 : 0
  }

  // Handle adding progress for a specific date
  const handleAddProgress = (dateStr) => {
    if (!user?.uid) return
    
    setSelectedDate(dateStr)
    setShowProgressForm(true)
  }

  // Handle progress form submission
  const handleProgressFormSubmit = (e) => {
    e.preventDefault()
    if (!user?.uid || !selectedDate) return

    const formData = {
      ...progressFormData,
      weight: progressFormData.weight ? parseFloat(progressFormData.weight) : null,
      bodyFat: progressFormData.bodyFat ? parseFloat(progressFormData.bodyFat) : null,
      muscleMass: progressFormData.muscleMass ? parseFloat(progressFormData.muscleMass) : null,
      measurements: Object.fromEntries(
        Object.entries(progressFormData.measurements).map(([key, value]) => [
          key, 
          value ? parseFloat(value) : null
        ])
      )
    }

    dispatch(addProgressEntry({
      userId: user.uid,
      ...formData,
      date: selectedDate
    }))

    setShowProgressForm(false)
    setSelectedDate("")
    setProgressFormData({
      weight: "",
      bodyFat: "",
      muscleMass: "",
      measurements: {
        chest: "",
        waist: "",
        hips: "",
        arms: "",
        thighs: "",
        calves: ""
      },
      goals: [
        { name: "Workout", completed: false },
        { name: "Diet", completed: false },
        { name: "Hydration", completed: false }
      ],
      notes: "",
      mood: "good"
    })
  }

  // Handle goal toggle
  const handleGoalToggle = (index) => {
    const newGoals = [...progressFormData.goals]
    newGoals[index].completed = !newGoals[index].completed
    setProgressFormData({
      ...progressFormData,
      goals: newGoals
    })
  }

  // Check if a date has any progress data
  const hasProgress = (dateStr) => {
    if (!progressHistory || progressHistory.length === 0) return false
    
    return progressHistory.some(p => {
      let progressDate
      if (p.date && p.date.toDate) {
        progressDate = p.date.toDate().toISOString().split('T')[0]
      } else if (p.date) {
        progressDate = new Date(p.date).toISOString().split('T')[0]
      } else {
        return false
      }
      return progressDate === dateStr
    })
  }

  // Theme-based styling
  const bgColor = theme === "light" ? "bg-gradient-to-br from-[#caf0f8] via-[#e0f2fe] to-[#f0fdfa]" : "bg-[#0a0a0a]"
  const cardBg = theme === "light" ? "bg-[#f0fdfa]" : "bg-[#1a1a2e]"
  const textColor = theme === "light" ? "text-gray-900" : "text-gray-100"
  const borderColor = theme === "light" ? "border-[#90e0ef]" : "border-gray-600"

  if (status === 'loading') {
    return (
      <div className={`min-h-screen ${bgColor} ${textColor} transition-colors duration-300`}>
        <Header />
        <div className="p-3 sm:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-20">
              <RocketLoader message="Loading progress data..." variant="light" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} transition-colors duration-300`}>
      <Header />
      
      <div className="p-3 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition hover:scale-105 shadow-md text-white"
              style={{
                background: theme === "light"
                  ? "linear-gradient(90deg, #6B54D3, #8C77E7)"
                  : "linear-gradient(90deg, #3CB14A, #2A6A28)",
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <button 
              className="px-2 py-1 sm:px-3 sm:py-1 rounded text-sm sm:text-base transition hover:scale-105"
              style={{
                background: theme === "light" ? "#E9E2F9" : "#1B1B1B",
                color: theme === "light" ? "#6B54D3" : "#3CB14A",
              }}
              onClick={() => setMonthOffset(monthOffset - 1)}
            >
              Prev
            </button>
            <h1 className="text-lg sm:text-2xl font-bold text-center">{info.label}</h1>
            <button 
              className="px-2 py-1 sm:px-3 sm:py-1 rounded text-sm sm:text-base transition hover:scale-105"
              style={{
                background: theme === "light" ? "#E9E2F9" : "#1B1B1B",
                color: theme === "light" ? "#6B54D3" : "#3CB14A",
              }}
              onClick={() => setMonthOffset(monthOffset + 1)}
            >
              Next
            </button>
          </div>

          <div className={`rounded-xl ${cardBg} p-4 sm:p-6 shadow-lg ${borderColor} border`}>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d)=> (
                <div key={d} className={`text-center ${theme === "light" ? "text-gray-600" : "text-gray-400"} text-xs sm:text-sm p-1 font-medium`}>{d}</div>
              ))}
              {grid.map((d, idx) => {
                const dateStr = d ? formatDate(info.year, info.month, d) : null
                const ratio = d ? getRatio(dateStr) : 0
                const complete = ratio >= 0.5
                const hasProgressData = d ? hasProgress(dateStr) : false
                
                return (
                  <div 
                    key={idx} 
                    className={`h-16 sm:h-20 md:h-24 rounded-lg border flex items-start justify-end p-1 sm:p-2 cursor-pointer transition-all hover:scale-105 ${
                      d ? (
                        complete 
                          ? "bg-green-800 border-green-600" 
                          : hasProgressData
                          ? "bg-yellow-600 border-yellow-500"
                          : `${theme === "light" ? "bg-gray-100" : "bg-gray-800"} ${theme === "light" ? "border-gray-300" : "border-gray-700"}`
                      ) : "bg-transparent"
                    }`}
                    onClick={() => d && handleAddProgress(dateStr)}
                    title={d ? `Click to add progress for ${dateStr}` : ""}
                  >
                    {d && (
                      <span className={`text-xs sm:text-sm ${complete ? "text-white" : hasProgressData ? "text-white" : theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                        {String(d).padStart(2, "0")}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            
            <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-800 rounded"></div>
                <span>Completed (50%+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-600 rounded"></div>
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <span>No Progress</span>
              </div>
            </div>
          </div>

          {/* Progress Summary */}
          {progressHistory.length > 0 && (
            <div className={`mt-6 rounded-xl ${cardBg} p-4 sm:p-6 shadow-lg ${borderColor} border`}>
              <h3 className="text-lg font-semibold mb-4">Progress Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {progressHistory.filter(p => {
                      if (!p.date) return false
                      const progressDate = p.date.toDate ? p.date.toDate().toISOString().split('T')[0] : new Date(p.date).toISOString().split('T')[0]
                      const today = new Date().toISOString().split('T')[0]
                      return progressDate === today
                    }).length}
                  </div>
                  <div className="text-sm text-gray-600">Today's Entries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {progressHistory.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Entries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((progressHistory.filter(p => {
                      if (!p.goals || !Array.isArray(p.goals)) return false
                      return p.goals.some(g => g.completed)
                    }).length / progressHistory.length) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Goal Completion</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Form Modal */}
      {showProgressForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${cardBg} rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Progress for {selectedDate}</h3>
              <button
                onClick={() => setShowProgressForm(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleProgressFormSubmit} className="space-y-4">
              {/* Basic Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={progressFormData.weight}
                    onChange={(e) => setProgressFormData({
                      ...progressFormData,
                      weight: e.target.value
                    })}
                    className="w-full p-2 border rounded-lg"
                    placeholder="70.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Body Fat (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={progressFormData.bodyFat}
                    onChange={(e) => setProgressFormData({
                      ...progressFormData,
                      bodyFat: e.target.value
                    })}
                    className="w-full p-2 border rounded-lg"
                    placeholder="15.0"
                  />
                </div>
              </div>

              {/* Measurements */}
              <div>
                <label className="block text-sm font-medium mb-2">Measurements (cm)</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(progressFormData.measurements).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-600 capitalize">{key}</label>
                      <input
                        type="number"
                        step="0.1"
                        value={value}
                        onChange={(e) => setProgressFormData({
                          ...progressFormData,
                          measurements: {
                            ...progressFormData.measurements,
                            [key]: e.target.value
                          }
                        })}
                        className="w-full p-2 border rounded text-sm"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Goals */}
              <div>
                <label className="block text-sm font-medium mb-2">Daily Goals</label>
                <div className="space-y-2">
                  {progressFormData.goals.map((goal, index) => (
                    <label key={index} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={goal.completed}
                        onChange={() => handleGoalToggle(index)}
                        className="rounded"
                      />
                      <span className="text-sm">{goal.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={progressFormData.notes}
                  onChange={(e) => setProgressFormData({
                    ...progressFormData,
                    notes: e.target.value
                  })}
                  className="w-full p-2 border rounded-lg"
                  rows="3"
                  placeholder="How was your day?"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
              >
                Save Progress
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}



