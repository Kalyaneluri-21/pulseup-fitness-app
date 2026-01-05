import { useMemo, useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import Header from "../components/Header"
import { ArrowLeft } from "lucide-react"
import { addProgressEntry, fetchProgress } from "../features/ProgressSlice"

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
  const info = useMemo(() => getMonthInfo(monthOffset), [monthOffset])

  // Load progress data when component mounts or user changes
  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchProgress(user.uid))
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
      const progressDate = new Date(p.date).toISOString().split('T')[0]
      return progressDate === dateStr
    })
    
    if (!dayProgress) return 0
    
    // Calculate completion ratio based on progress data
    const totalGoals = dayProgress.goals?.length || 1
    const completedGoals = dayProgress.goals?.filter(g => g.completed)?.length || 0
    return completedGoals / totalGoals
  }

  // Handle adding progress for a specific date
  const handleAddProgress = (dateStr) => {
    if (!user?.uid) return
    
    const progressData = {
      goals: [
        { name: "Workout", completed: false },
        { name: "Diet", completed: false },
        { name: "Hydration", completed: false }
      ],
      notes: "",
      mood: "good"
    }
    
    dispatch(addProgressEntry({
      ...progressData,
      date: dateStr
    }))
  }

  // Theme-based styling
  const bgColor = theme === "light" ? "bg-gray-50" : "bg-gray-900"
  const cardBg = theme === "light" ? "bg-white" : "bg-gray-800"
  const textColor = theme === "light" ? "text-gray-900" : "text-gray-100"
  const borderColor = theme === "light" ? "border-gray-200" : "border-gray-700"

  if (status === 'loading') {
    return (
      <div className={`min-h-screen ${bgColor} ${textColor} transition-colors duration-300`}>
        <Header />
        <div className="p-3 sm:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-20">
              <div className="text-lg">Loading progress data...</div>
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
                const hasProgress = d && progress?.some(p => {
                  const progressDate = new Date(p.date).toISOString().split('T')[0]
                  return progressDate === dateStr
                })
                
                return (
                  <div 
                    key={idx} 
                    className={`h-16 sm:h-20 md:h-24 rounded-lg border flex items-start justify-end p-1 sm:p-2 cursor-pointer transition-all hover:scale-105 ${
                      d ? (
                        complete 
                          ? "bg-green-800 border-green-600" 
                          : hasProgress
                          ? "bg-yellow-600 border-yellow-500"
                          : `${theme === "light" ? "bg-gray-100" : "bg-gray-800"} ${theme === "light" ? "border-gray-300" : "border-gray-700"}`
                      ) : "bg-transparent"
                    }`}
                    onClick={() => d && handleAddProgress(dateStr)}
                    title={d ? `Click to add progress for ${dateStr}` : ""}
                  >
                    {d && (
                      <span className={`text-xs sm:text-sm ${complete ? "text-white" : hasProgress ? "text-white" : theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
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
        </div>
      </div>
    </div>
  )
}

