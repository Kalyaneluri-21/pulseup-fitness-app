import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import Header from "../components/Header"

const DEFAULT_PLAN = [
  { id: "w1", title: "Full-body warmup (10 min)", done: false },
  { id: "w2", title: "Push-ups 3x12", done: false },
  { id: "w3", title: "Squats 3x15", done: false },
  { id: "w4", title: "Plank 3x45s", done: false },
  { id: "w5", title: "Cool-down stretch (8 min)", done: false },
]

const GOAL_OPTIONS = [
  { id: "fitness", label: "Fitness" },
  { id: "strength", label: "Strength Building" },
  { id: "muscle", label: "Muscle Grow" },
  { id: "weight_gain", label: "Weight Gain" },
  { id: "weight_loss", label: "Weight Loss" },
]

const PLAN_BY_GOAL = {
  fitness: [
    { id: "f1", title: "Jumping Jacks 3x30s", videoId: "iSSAk4XCsRA" },
    { id: "f2", title: "Mountain Climbers 3x30s", videoId: "nmwgirgXLYM" },
    { id: "f3", title: "Bodyweight Squats 3x15", videoId: "aclHkVaku9U" },
    { id: "f4", title: "Plank 3x45s", videoId: "ASdvN_XEl_c" },
  ],
  strength: [
    { id: "s1", title: "Push-ups 4x10", videoId: "IODxDxX7oi4" },
    { id: "s2", title: "Goblet Squats 4x12", videoId: "6xw4ikQbH48" },
    { id: "s3", title: "Bent-over Rows 4x10", videoId: "vT2GjY_Umpw" },
    { id: "s4", title: "Dead Bug 3x12", videoId: "g9N3q7t7pVY" },
  ],
  muscle: {
    day1: [
      { id: "m1_1", title: "Bench Press 4x8", videoId: "gRVjAtPip0Y" },
      { id: "m1_2", title: "Incline Dumbbell Press 3x10", videoId: "VmB1G1K7v94" },
      { id: "m1_3", title: "Cable Fly 3x12", videoId: "eozdVDA78K0" },
      { id: "m1_4", title: "Push-ups 3x15", videoId: "IODxDxX7oi4" },
    ],
    day2: [
      { id: "m2_1", title: "Pull-ups 4x8", videoId: "CAwf7n6Luuc" },
      { id: "m2_2", title: "Bent-over Rows 4x10", videoId: "vT2GjY_Umpw" },
      { id: "m2_3", title: "Lat Pulldown 3x12", videoId: "CAwf7n6Luuc" },
      { id: "m2_4", title: "Seated Row 3x12", videoId: "GZbfZ033f74" },
    ],
    day3: [
      { id: "m3_1", title: "Squats 4x10", videoId: "aclHkVaku9U" },
      { id: "m3_2", title: "Romanian Deadlift 4x10", videoId: "JCXUYuzwNrM" },
      { id: "m3_3", title: "Leg Press 3x12", videoId: "U3HlEF_E9fo" },
      { id: "m3_4", title: "Calf Raises 4x15", videoId: "aclHkVaku9U" },
    ],
    day4: [
      { id: "m4_1", title: "Overhead Press 4x8", videoId: "qEwKCR5JCog" },
      { id: "m4_2", title: "Lateral Raises 3x12", videoId: "qEwKCR5JCog" },
      { id: "m4_3", title: "Upright Rows 3x10", videoId: "vT2GjY_Umpw" },
      { id: "m4_4", title: "Shrugs 3x15", videoId: "vT2GjY_Umpw" },
    ],
    day5: [
      { id: "m5_1", title: "Barbell Curls 4x10", videoId: "IODxDxX7oi4" },
      { id: "m5_2", title: "Tricep Dips 4x12", videoId: "IODxDxX7oi4" },
      { id: "m5_3", title: "Hammer Curls 3x12", videoId: "IODxDxX7oi4" },
      { id: "m5_4", title: "Skull Crushers 3x10", videoId: "IODxDxX7oi4" },
    ],
    day6: [
      { id: "m6_1", title: "Plank 3x60s", videoId: "ASdvN_XEl_c" },
      { id: "m6_2", title: "Crunches 3x20", videoId: "Ix3PpUjfkMU" },
      { id: "m6_3", title: "Russian Twists 3x20", videoId: "Ix3PpUjfkMU" },
      { id: "m6_4", title: "Leg Raises 3x15", videoId: "Ix3PpUjfkMU" },
    ],
    day7: [
      { id: "m7_1", title: "Light Stretching", videoId: "ASdvN_XEl_c" },
      { id: "m7_2", title: "Walking 30 min", videoId: "QOVaHwm-Q6U" },
      { id: "m7_3", title: "Yoga Flow", videoId: "ASdvN_XEl_c" },
    ],
  },
  weight_gain: [
    { id: "wg1", title: "Dumbbell Squats 4x12", videoId: "U3HlEF_E9fo" },
    { id: "wg2", title: "Dumbbell Bench 4x10", videoId: "VmB1G1K7v94" },
    { id: "wg3", title: "Seated Row 4x12", videoId: "GZbfZ033f74" },
    { id: "wg4", title: "Cable Fly 3x15", videoId: "eozdVDA78K0" },
  ],
  weight_loss: [
    { id: "wl1", title: "Burpees 3x12", videoId: "TU8QYVW0gDU" },
    { id: "wl2", title: "Kettlebell Swings 4x15", videoId: "YSx5n2Jf9JQ" },
    { id: "wl3", title: "Walking Lunges 3x20", videoId: "QOVaHwm-Q6U" },
    { id: "wl4", title: "Bicycle Crunch 3x20", videoId: "Ix3PpUjfkMU" },
  ],
}

export default function Dashboard() {
  const user = useSelector((state) => state.auth.user)
  const theme = useSelector((state) => state.theme.theme)
  const navigate = useNavigate()
  const interestsKey = useMemo(() => (user?.uid ? `fb_interests_${user.uid}` : null), [user])
  const startKey = useMemo(() => (user?.uid ? `fb_start_${user.uid}` : null), [user])
  const goalKey = useMemo(() => (user?.uid ? `fb_goal_${user.uid}` : null), [user])

  const formatDate = (d) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  }
  const planKeyForDate = (dateStr) => (user?.uid ? `fb_plan_${user.uid}_${dateStr}` : null)

  // Redirect to onboarding if no interests saved yet
  useEffect(() => {
    if (!interestsKey) return
    const saved = localStorage.getItem(interestsKey)
    if (!saved) {
      navigate("/onboarding", { replace: true })
    }
  }, [interestsKey, navigate])

  // ensure training start date saved
  const [startDate, setStartDate] = useState(null)
  useEffect(() => {
    if (!startKey) return
    let saved = localStorage.getItem(startKey)
    if (!saved) {
      const todayStr = formatDate(new Date())
      localStorage.setItem(startKey, todayStr)
      saved = todayStr
    }
    setStartDate(saved)
  }, [startKey])

  // daily plan for today
  const todayStr = formatDate(new Date())
  const todayPlanKey = planKeyForDate(todayStr)
  const [plan, setPlan] = useState(DEFAULT_PLAN)
  const [goal, setGoal] = useState("fitness")

  useEffect(() => {
    if (goalKey) {
      const savedGoal = localStorage.getItem(goalKey)
      if (savedGoal) setGoal(savedGoal)
    }
  }, [goalKey])

  useEffect(() => {
    if (!todayPlanKey) return
    const saved = localStorage.getItem(todayPlanKey)
    if (saved) {
      try { setPlan(JSON.parse(saved)) } catch {}
    } else {
      const base = goal === "muscle" ? getMuscleDayPlan() : (PLAN_BY_GOAL[goal] || [])
      const generated = base.map((i) => ({ id: i.id, title: i.title, done: false, videoId: i.videoId }))
      localStorage.setItem(todayPlanKey, JSON.stringify(generated.length ? generated : DEFAULT_PLAN))
      setPlan(generated.length ? generated : DEFAULT_PLAN)
    }
  }, [todayPlanKey, goal])

  const getMuscleDayPlan = () => {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    const dayKey = `day${dayOfWeek === 0 ? 7 : dayOfWeek}` // Convert Sunday to day7
    return PLAN_BY_GOAL.muscle[dayKey] || PLAN_BY_GOAL.muscle.day1
  }

  const toggleItem = (id) => {
    console.log('Dashboard - Toggling item:', id, 'Current plan:', plan)
    const next = plan.map((i) => (i.id === id ? { ...i, done: !i.done } : i))
    console.log('Dashboard - Updated plan:', next)
    setPlan(next)
    if (todayPlanKey) localStorage.setItem(todayPlanKey, JSON.stringify(next))
  }

  const handleToggleWithConfirm = (id, nextDone) => {
    if (!nextDone) {
      const ok = window.confirm("Are you sure? It can't be undone again.")
      if (!ok) return
    }
    toggleItem(id)
  }

  const handleSelectGoal = (g) => {
    if (g === goal) return
    setGoal(g)
    if (goalKey) localStorage.setItem(goalKey, g)
    if (todayPlanKey) {
      const base = g === "muscle" ? getMuscleDayPlan() : (PLAN_BY_GOAL[g] || [])
      const generated = base.map((i) => ({ id: i.id, title: i.title, done: false, videoId: i.videoId }))
      localStorage.setItem(todayPlanKey, JSON.stringify(generated.length ? generated : DEFAULT_PLAN))
      setPlan(generated.length ? generated : DEFAULT_PLAN)
    }
  }

  // compute monthly completion since training start date
  const getDayCompletionRatio = (dateObj) => {
    const key = planKeyForDate(formatDate(dateObj))
    const saved = key && localStorage.getItem(key)
    if (!saved) return 0
    try {
      const items = JSON.parse(saved)
      const total = items.length || 1
      const done = items.filter((i) => i.done).length
      return done / total
    } catch {
      return 0
    }
  }

  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const startBoundary = startDate ? new Date(startDate) : firstOfMonth
  const startWindow = startBoundary > firstOfMonth ? startBoundary : firstOfMonth
  const endWindow = today
  let consideredDays = 0
  let completedDays = 0
  for (
    let d = new Date(startWindow.getFullYear(), startWindow.getMonth(), startWindow.getDate());
    d <= endWindow;
    d.setDate(d.getDate() + 1)
  ) {
    consideredDays++
    const ratio = getDayCompletionRatio(d)
    if (ratio >= 0.5) completedDays++
  }
  const circumference = 2 * Math.PI * 70
  const percent = consideredDays > 0 ? Math.round((completedDays / consideredDays) * 100) : 0
  const dash = Math.max(0, (percent / 100) * circumference)
  
  const getProgressColor = (p) => {
    if (p < 20) return "#EF4444" // red
    if (p < 50) return "#F59E0B" // dark yellow
    return "#10B981" // green
  }

  const getDayLabel = () => {
    if (goal !== "muscle") return ""
    const today = new Date()
    const dayOfWeek = today.getDay()
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const muscleDays = ["Rest", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"]
    return `${days[dayOfWeek]} - ${muscleDays[dayOfWeek]}`
  }

  // Theme-based styling
  const bgColor = theme === "light" ? "bg-gray-50" : "bg-gray-900"
  const cardBg = theme === "light" ? "bg-white" : "bg-gray-800"
  const textColor = theme === "light" ? "text-gray-900" : "text-gray-100"
  const borderColor = theme === "light" ? "border-gray-200" : "border-gray-700"
  const goalButtonActive = theme === "light" 
    ? "bg-gradient-to-r from-purple-600 to-blue-600 border-purple-500 text-white"
    : "bg-gradient-to-r from-green-600 to-teal-600 border-green-500 text-white"
  const goalButtonInactive = theme === "light"
    ? "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
    : "bg-gray-700 border-gray-600 text-gray-200 hover:border-gray-500"

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} transition-colors duration-300`}>
      <Header />
      
      <main className="p-3 sm:p-6">
        <div className={`mb-4 sm:mb-6 rounded-2xl ${cardBg} p-4 sm:p-6 shadow-lg ${borderColor} border`}>
          <h2 className="text-base sm:text-lg font-semibold mb-3">What are you planning to do?</h2>
          <div className="flex flex-wrap gap-2">
            {GOAL_OPTIONS.map((opt) => {
              const active = opt.id === goal
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectGoal(opt.id)}
                  className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg border text-xs sm:text-sm transition ${
                    active ? goalButtonActive : goalButtonInactive
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Quick Links Section - Compact horizontal layout */}
        <div className={`mb-4 sm:mb-6 rounded-2xl ${cardBg} p-4 sm:p-6 shadow-lg ${borderColor} border`}>
          <h2 className="text-base sm:text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to="/diet" className="px-3 py-2 rounded-lg text-white font-medium transition-all transform hover:scale-105 text-sm shadow-lg text-center hover:shadow-xl"
              style={{
                background: theme === "light"
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              }}>
              🍎 Diet Plan
            </Link>
            <Link to="/workouts" className="px-3 py-2 rounded-lg text-white font-medium transition-all transform hover:scale-105 text-sm shadow-lg text-center hover:shadow-xl"
              style={{
                background: theme === "light"
                  ? "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                  : "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
              }}>
              💪 Workouts
            </Link>
            <Link to="/buddies" className="px-3 py-2 rounded-lg text-white font-medium transition-all transform hover:scale-105 text-sm shadow-lg text-center hover:shadow-xl"
              style={{
                background: theme === "light"
                  ? "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
                  : "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
              }}>
              👥 Buddies
            </Link>
            <Link to="/chat" className="px-3 py-2 rounded-lg text-white font-medium transition-all transform hover:scale-105 text-sm shadow-lg text-center hover:shadow-xl"
              style={{
                background: theme === "light"
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              }}>
              💬 Messages
            </Link>
            <Link to="/profile" className="px-3 py-2 rounded-lg text-white font-medium transition-all transform hover:scale-105 text-sm shadow-lg text-center hover:shadow-xl"
              style={{
                background: theme === "light"
                  ? "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)"
                  : "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
              }}>
              👤 Profile
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Daily Progress */}
          <div className={`rounded-2xl ${cardBg} p-4 sm:p-6 shadow-lg h-64 sm:h-80 ${borderColor} border`}>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Today's Progress</h2>
            <div className="flex flex-col items-center justify-center h-36 sm:h-48">
              <div className="relative">
                <svg width="120" height="120" className="sm:w-[140px] sm:h-[140px] drop-shadow-lg" viewBox="0 0 160 160">
                  {/* Background track */}
                  <circle 
                    cx="80" 
                    cy="80" 
                    r="70" 
                    stroke={theme === "light" ? "#F3F4F6" : "#374151"} 
                    strokeWidth="12" 
                    fill="none"
                  />
                  {/* Progress fill */}
                  <circle
                    cx="80" 
                    cy="80" 
                    r="70" 
                    fill="none" 
                    stroke="#F59E0B" 
                    strokeWidth="12"
                    strokeDasharray={`${(plan.filter(item => item.done).length / plan.length) * 2 * Math.PI * 70} ${2 * Math.PI * 70}`}
                    strokeLinecap="round"
                    transform="rotate(-90 80 80)"
                    style={{ transition: 'stroke-dasharray 0.5s ease-in-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`text-2xl sm:text-3xl font-bold ${theme === "light" ? "text-gray-800" : "text-gray-100"}`}>
                    {plan.length > 0 ? Math.round((plan.filter(item => item.done).length / plan.length) * 100) : 0}%
                  </div>
                  <div className={`text-xs sm:text-sm mt-1 ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
                    {plan.filter(item => item.done).length}/{plan.length} Completed
                  </div>
                </div>
              </div>
              <div className="text-center mt-3 sm:mt-4">
                <p className={`text-xs sm:text-sm ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
                  {plan.filter(item => item.done).length < plan.length 
                    ? "Almost there! Keep pushing to reach your goal!" 
                    : "Great job! You've completed today's plan!"}
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl ${cardBg} p-4 sm:p-6 shadow-lg h-64 sm:h-80 ${borderColor} border`}>
            <button
              onClick={() => navigate("/progress")}
              className="w-full h-full text-left focus:outline-none"
            >
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Monthly Progress</h2>
              <div className="flex flex-col items-center justify-center h-36 sm:h-48">
                <div className="relative">
                  <svg width="120" height="120" className="sm:w-[140px] sm:h-[140px] drop-shadow-lg" viewBox="0 0 160 160">
                    {/* Background track */}
                    <circle 
                      cx="80" 
                      cy="80" 
                      r="70" 
                      stroke={theme === "light" ? "#F3F4F6" : "#374151"} 
                      strokeWidth="12" 
                      fill="none"
                    />
                    {/* Progress fill */}
                    <circle
                      cx="80" 
                      cy="80" 
                      r="70" 
                      fill="none" 
                      stroke={getProgressColor(percent)} 
                      strokeWidth="12"
                      strokeDasharray={`${dash} ${circumference}`}
                      strokeLinecap="round"
                      transform="rotate(-90 80 80)"
                      style={{ transition: 'stroke-dasharray 0.5s ease-in-out' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={`text-2xl sm:text-3xl font-bold ${theme === "light" ? "text-gray-800" : "text-gray-100"}`}>{percent}%</div>
                    <div className={`text-xs sm:text-sm mt-1 ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>{completedDays}/{consideredDays} Completed</div>
                  </div>
                </div>
                <div className="text-center mt-3 sm:mt-4">
                  <p className={`text-xs sm:text-sm ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>From your start date this month</p>
                  <p className={`text-xs ${theme === "light" ? "text-gray-500" : "text-gray-400"} mt-1`}>{completedDays} of {consideredDays} days completed ({'\u2265'}50% of plan)</p>
                  <p className="text-xs text-blue-400 mt-2">Click to view calendar</p>
                </div>
              </div>
            </button>
          </div>

          <div className={`rounded-2xl ${cardBg} p-4 sm:p-6 shadow-lg h-64 sm:h-80 overflow-y-auto ${borderColor} border`}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg sm:text-xl font-semibold">Exercise Plan</h2>
              <Link 
                to="/exercise-planner" 
                className="px-2 py-1 sm:px-3 sm:py-1 rounded text-white text-xs sm:text-sm transition hover:scale-105"
                style={{
                  background: theme === "light"
                    ? "linear-gradient(90deg, #6B54D3, #8C77E7)"
                    : "linear-gradient(90deg, #3CB14A, #2A6A28)",
                }}
              >
                View Details
              </Link>
            </div>
            {goal === "muscle" && (
              <p className="text-xs sm:text-sm text-blue-400 mb-3">{getDayLabel()}</p>
            )}
            <div className="space-y-2">
              {plan.map((item, index) => (
                <div key={item.id} className={`flex items-center justify-between p-2 rounded ${theme === "light" ? "bg-gray-100" : "bg-gray-700"}`}>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      item.done ? "bg-green-600 text-white" : theme === "light" ? "bg-gray-300 text-gray-600" : "bg-gray-600 text-gray-300"
                    }`}>
                      {index + 1}
                    </span>
                    <span className={`text-xs sm:text-sm truncate ${item.done ? "line-through text-gray-500" : ""}`}>
                      {item.title}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleWithConfirm(item.id, !item.done)}
                    className={`px-2 py-1 rounded text-xs flex-shrink-0 ${
                      item.done
                        ? "bg-green-700 hover:bg-green-600 text-white"
                        : "bg-yellow-700 hover:bg-yellow-600 text-white"
                    }`}
                  >
                    {item.done ? "Done" : "Pending"}
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className={`text-xs ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                {plan.filter(item => item.done).length} of {plan.length} completed
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}