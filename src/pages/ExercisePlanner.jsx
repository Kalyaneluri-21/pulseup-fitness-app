import { useEffect, useMemo, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useSelector } from "react-redux"
import Header from "../components/Header"
import { ArrowLeft } from "lucide-react"

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
    { id: "f1", title: "Jumping Jacks 3x30s", videoId: "iSSAk4XCsRA", duration: 30 },
    { id: "f2", title: "Mountain Climbers 3x30s", videoId: "nmwgirgXLYM", duration: 30 },
    { id: "f3", title: "Bodyweight Squats 3x15", videoId: "aclHkVaku9U", duration: 45 },
    { id: "f4", title: "Plank 3x45s", videoId: "ASdvN_XEl_c", duration: 45 },
  ],
  strength: [
    { id: "s1", title: "Push-ups 4x10", videoId: "IODxDxX7oi4", duration: 60 },
    { id: "s2", title: "Goblet Squats 4x12", videoId: "6xw4ikQbH48", duration: 90 },
    { id: "s3", title: "Bent-over Rows 4x10", videoId: "vT2GjY_Umpw", duration: 75 },
    { id: "s4", title: "Dead Bug 3x12", videoId: "g9N3q7t7pVY", duration: 60 },
  ],
  muscle: {
    day1: [
      { id: "m1_1", title: "Bench Press 4x8", videoId: "gRVjAtPip0Y", duration: 120 },
      { id: "m1_2", title: "Incline Dumbbell Press 3x10", videoId: "VmB1G1K7v94", duration: 90 },
      { id: "m1_3", title: "Cable Fly 3x12", videoId: "eozdVDA78K0", duration: 60 },
      { id: "m1_4", title: "Push-ups 3x15", videoId: "IODxDxX7oi4", duration: 45 },
    ],
    day2: [
      { id: "m2_1", title: "Pull-ups 4x8", videoId: "CAwf7n6Luuc", duration: 120 },
      { id: "m2_2", title: "Bent-over Rows 4x10", videoId: "vT2GjY_Umpw", duration: 90 },
      { id: "m2_3", title: "Lat Pulldown 3x12", videoId: "CAwf7n6Luuc", duration: 60 },
      { id: "m2_4", title: "Seated Row 3x12", videoId: "GZbfZ033f74", duration: 60 },
    ],
    day3: [
      { id: "m3_1", title: "Squats 4x10", videoId: "aclHkVaku9U", duration: 120 },
      { id: "m3_2", title: "Romanian Deadlift 4x10", videoId: "JCXUYuzwNrM", duration: 120 },
      { id: "m3_3", title: "Leg Press 3x12", videoId: "U3HlEF_E9fo", duration: 90 },
      { id: "m3_4", title: "Calf Raises 4x15", videoId: "aclHkVaku9U", duration: 60 },
    ],
    day4: [
      { id: "m4_1", title: "Overhead Press 4x8", videoId: "qEwKCR5JCog", duration: 120 },
      { id: "m4_2", title: "Lateral Raises 3x12", videoId: "qEwKCR5JCog", duration: 60 },
      { id: "m4_3", title: "Upright Rows 3x10", videoId: "vT2GjY_Umpw", duration: 75 },
      { id: "m4_4", title: "Shrugs 3x15", videoId: "vT2GjY_Umpw", duration: 60 },
    ],
    day5: [
      { id: "m5_1", title: "Barbell Curls 4x10", videoId: "IODxDxX7oi4", duration: 90 },
      { id: "m5_2", title: "Tricep Dips 4x12", videoId: "IODxDxX7oi4", duration: 90 },
      { id: "m5_3", title: "Hammer Curls 3x12", videoId: "IODxDxX7oi4", duration: 60 },
      { id: "m5_4", title: "Skull Crushers 3x10", videoId: "IODxDxX7oi4", duration: 75 },
    ],
    day6: [
      { id: "m6_1", title: "Plank 3x60s", videoId: "pSHjTRCQxIw", duration: 60 },
      { id: "m6_2", title: "Crunches 3x20", videoId: "Ix3PpUjfkMU", duration: 45 },
      { id: "m6_3", title: "Russian Twists 3x20", videoId: "Ix3PpUjfkMU", duration: 45 },
      { id: "m6_4", title: "Leg Raises 3x15", videoId: "Ix3PpUjfkMU", duration: 45 },
    ],
    day7: [
      { id: "m7_1", title: "Light Stretching", videoId: "pSHjTRCQxIw", duration: 300 },
      { id: "m7_2", title: "Walking 30 min", videoId: "QOVaHwm-Q6U", duration: 1800 },
      { id: "m7_3", title: "Yoga Flow", videoId: "pSHjTRCQxIw", duration: 600 },
    ],
  },
  weight_gain: [
    { id: "wg1", title: "Dumbbell Squats 4x12", videoId: "U3HlEF_E9fo", duration: 120 },
    { id: "wg2", title: "Dumbbell Bench 4x10", videoId: "VmB1G1K7v94", duration: 120 },
    { id: "wg3", title: "Seated Row 4x12", videoId: "GZbfZ033f74", duration: 90 },
    { id: "wg4", title: "Cable Fly 3x15", videoId: "eozdVDA78K0", duration: 60 },
  ],
  weight_loss: [
    { id: "wl1", title: "Burpees 3x12", videoId: "TU8QYVW0gDU", duration: 60 },
    { id: "wl2", title: "Kettlebell Swings 4x15", videoId: "YSx5n2Jf9JQ", duration: 90 },
    { id: "wl3", title: "Walking Lunges 3x20", videoId: "QOVaHwm-Q6U", duration: 120 },
    { id: "wl4", title: "Bicycle Crunch 3x20", videoId: "Ix3PpUjfkMU", duration: 45 },
  ],
}

export default function ExercisePlanner() {
  const user = useSelector((state) => state.auth.user)
  const theme = useSelector((state) => state.theme.theme)
  const navigate = useNavigate()
  const goalKey = useMemo(() => (user?.uid ? `fb_goal_${user.uid}` : null), [user])

  const formatDate = (d) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  }
  const planKeyForDate = (dateStr) => (user?.uid ? `fb_plan_${user.uid}_${dateStr}` : null)

  const todayStr = formatDate(new Date())
  const todayPlanKey = planKeyForDate(todayStr)
  const [plan, setPlan] = useState(DEFAULT_PLAN)
  const [goal, setGoal] = useState("fitness")
  const [timers, setTimers] = useState({})
  const [activeTimer, setActiveTimer] = useState(null)

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
      const generated = base.map((i) => ({ id: i.id, title: i.title, done: false, videoId: i.videoId, duration: i.duration }))
      localStorage.setItem(todayPlanKey, JSON.stringify(generated.length ? generated : DEFAULT_PLAN))
      setPlan(generated.length ? generated : DEFAULT_PLAN)
    }
  }, [todayPlanKey, goal])

  const getMuscleDayPlan = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const dayKey = `day${dayOfWeek === 0 ? 7 : dayOfWeek}`
    return PLAN_BY_GOAL.muscle[dayKey] || PLAN_BY_GOAL.muscle.day1
  }

  const toggleItem = (id) => {
    console.log('Toggling item:', id, 'Current plan:', plan)
    const next = plan.map((i) => (i.id === id ? { ...i, done: !i.done } : i))
    console.log('Updated plan:', next)
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
      const generated = base.map((i) => ({ id: i.id, title: i.title, done: false, videoId: i.videoId, duration: i.duration }))
      localStorage.setItem(todayPlanKey, JSON.stringify(generated.length ? generated : DEFAULT_PLAN))
      setPlan(generated.length ? generated : DEFAULT_PLAN)
    }
  }

  const getDayLabel = () => {
    if (goal !== "muscle") return ""
    const today = new Date()
    const dayOfWeek = today.getDay()
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const muscleDays = ["Rest", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"]
    // Sunday = 0, Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4, Friday = 5, Saturday = 6
    // But our muscle days are: Rest, Chest, Back, Legs, Shoulders, Arms, Core
    // So we need to map: Sunday=Rest, Monday=Chest, Tuesday=Back, Wednesday=Legs, Thursday=Shoulders, Friday=Arms, Saturday=Core
    return `${days[dayOfWeek]} - ${muscleDays[dayOfWeek]}`
  }

  const startTimer = (exerciseId, duration) => {
    if (activeTimer && activeTimer !== exerciseId) {
      // Stop the currently active timer
      setTimers(prev => ({
        ...prev,
        [activeTimer]: { ...prev[activeTimer], isRunning: false }
      }))
    }
    
    setActiveTimer(exerciseId)
    setTimers(prev => ({
      ...prev,
      [exerciseId]: {
        timeLeft: duration,
        totalTime: duration,
        isRunning: true,
        isPaused: false
      }
    }))
  }

  const pauseTimer = (exerciseId) => {
    setTimers(prev => ({
      ...prev,
      [exerciseId]: { ...prev[exerciseId], isRunning: false, isPaused: true }
    }))
    setActiveTimer(null)
  }

  const resumeTimer = (exerciseId) => {
    if (activeTimer && activeTimer !== exerciseId) {
      setTimers(prev => ({
        ...prev,
        [activeTimer]: { ...prev[activeTimer], isRunning: false }
      }))
    }
    
    setActiveTimer(exerciseId)
    setTimers(prev => ({
      ...prev,
      [exerciseId]: { ...prev[exerciseId], isRunning: true, isPaused: false }
    }))
  }

  const resetTimer = (exerciseId) => {
    const exercise = plan.find(e => e.id === exerciseId)
    const duration = exercise?.duration || 60 // Default to 60 seconds if duration is undefined
    
    setTimers(prev => ({
      ...prev,
      [exerciseId]: {
        timeLeft: duration,
        totalTime: duration,
        isRunning: false,
        isPaused: false
      }
    }))
    if (activeTimer === exerciseId) {
      setActiveTimer(null)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Timer countdown effect
  useEffect(() => {
    if (!activeTimer) return

    const interval = setInterval(() => {
      setTimers(prev => {
        const timer = prev[activeTimer]
        if (!timer || !timer.isRunning) return prev

        if (timer.timeLeft <= 1) {
          // Timer finished
          setActiveTimer(null)
          return {
            ...prev,
            [activeTimer]: { ...timer, timeLeft: 0, isRunning: false }
          }
        }

        return {
          ...prev,
          [activeTimer]: { ...timer, timeLeft: timer.timeLeft - 1 }
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [activeTimer])

  const completedCount = plan.filter(item => item.done).length
  const totalCount = plan.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

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

  // Debug logging
  console.log('Plan state:', plan)
  console.log('Completed count:', completedCount, 'Total count:', totalCount, 'Progress:', progressPercent)

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} transition-colors duration-300`}>
      <Header />
      
      <main className="p-3 sm:p-6 max-w-6xl mx-auto">
        <div className="mb-4 sm:mb-6 flex items-center gap-3">
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
            Back to Dashboard
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Exercise Planner</h1>
        </div>

        <div className={`mb-6 rounded-2xl ${cardBg} p-4 sm:p-6 shadow-lg ${borderColor} border`}>
          <h2 className="text-lg font-semibold mb-3">What are you planning to do?</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {GOAL_OPTIONS.map((opt) => {
              const active = opt.id === goal
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectGoal(opt.id)}
                  className={`px-4 py-2 rounded-lg border text-sm transition ${
                    active ? goalButtonActive : goalButtonInactive
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
          
          {/* Weekly Overview moved here */}
          {goal === "muscle" && (
            <div className={`mt-4 p-4 rounded-lg ${theme === "light" ? "bg-gray-100" : "bg-gray-700"}`}>
              <h3 className="text-md font-semibold text-blue-400 mb-3">Weekly Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {Object.entries(PLAN_BY_GOAL.muscle).map(([dayKey, exercises]) => {
                  const dayNum = parseInt(dayKey.replace('day', ''))
                  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                  const muscleDays = ["Rest", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"]
                  const isToday = dayNum === (new Date().getDay() === 0 ? 7 : new Date().getDay())
                  
                  return (
                    <div key={dayKey} className={`p-2 rounded border text-center ${
                      isToday ? "bg-blue-900/30 border-blue-500/50" : `${theme === "light" ? "bg-gray-200" : "bg-gray-600"} border-gray-500`
                    }`}>
                      <div className={`text-xs font-medium ${isToday ? "text-blue-400" : theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                        {days[dayNum]}
                      </div>
                      <div className={`text-xs ${isToday ? "text-blue-300" : theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                        {muscleDays[dayNum]}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Progress Circular Bar */}
        <div className={`mb-6 rounded-2xl ${cardBg} p-6 shadow-lg ${borderColor} border`}>
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-4">Today's Progress</h3>
            <div className="relative">
              <svg width="160" height="160" viewBox="0 0 160 160" className="drop-shadow-lg">
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
                  strokeDasharray={`${(progressPercent / 100) * 2 * Math.PI * 70} ${2 * Math.PI * 70}`}
                  strokeLinecap="round"
                  transform="rotate(-90 80 80)"
                  style={{ transition: 'stroke-dasharray 0.5s ease-in-out' }}
                />
              </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className={`text-3xl font-bold ${theme === "light" ? "text-gray-800" : "text-gray-100"}`}>{progressPercent}%</div>
                    <div className={`text-sm mt-1 ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>{completedCount}/{totalCount} Completed</div>
                  </div>
            </div>
            <div className="text-center mt-4">
              <p className={`text-sm ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                {progressPercent < 100 ? "Almost there! Keep pushing to reach your goal!" : "Great job! You've completed today's plan!"}
              </p>
            </div>
          </div>
        </div>

        {goal === "muscle" && (
          <div className={`mb-6 rounded-2xl p-4 ${theme === "light" ? "bg-blue-50 border border-blue-200" : "bg-blue-900/20 border border-blue-500/30"}`}>
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Today's Focus</h3>
            <p className="text-blue-300">{getDayLabel()}</p>
          </div>
        )}

        <div className={`rounded-2xl ${cardBg} p-4 sm:p-6 shadow-lg ${borderColor} border`}>
          <h2 className="text-xl font-semibold mb-4">Today's Exercises</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.map((item, index) => {
              const timer = timers[item.id]
              const isActive = activeTimer === item.id
              const progress = timer ? (timer.totalTime - timer.timeLeft) / timer.totalTime : 0
              
              return (
                <div key={item.id} className={`${theme === "light" ? "bg-gray-50" : "bg-gray-700"} rounded-lg p-4 border ${theme === "light" ? "border-gray-200" : "border-gray-600"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        item.done ? "bg-green-600 text-white" : theme === "light" ? "bg-gray-300 text-gray-600" : "bg-gray-600 text-gray-300"
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className={`font-medium ${item.done ? "line-through text-gray-500" : ""}`}>
                          {item.title}
                        </h3>
                        <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                          Duration: {formatTime(item.duration || 60)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleWithConfirm(item.id, !item.done)}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          item.done
                            ? "bg-green-700 hover:bg-green-600 text-white"
                            : "bg-yellow-700 hover:bg-yellow-600 text-white"
                        }`}
                      >
                        {item.done ? "✓ Done" : "Mark Done"}
                      </button>
                    </div>
                  </div>

                  {/* Timer Section */}
                  <div className={`mb-3 p-3 rounded-lg ${theme === "light" ? "bg-white" : "bg-gray-800"} border ${theme === "light" ? "border-gray-200" : "border-gray-600"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Timer</span>
                      <div className="text-lg font-bold text-blue-400">
                        {timer ? formatTime(timer.timeLeft) : formatTime(item.duration || 60)}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className={`w-full rounded-full h-2 mb-3 ${theme === "light" ? "bg-gray-200" : "bg-gray-600"}`}>
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${progress * 100}%` }}
                      ></div>
                    </div>

                    {/* Timer Controls */}
                    <div className="flex gap-2">
                      {!timer || (!timer.isRunning && !timer.isPaused) ? (
                        <button
                          onClick={() => startTimer(item.id, item.duration || 60)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-sm"
                        >
                          Start
                        </button>
                      ) : timer.isRunning ? (
                        <button
                          onClick={() => pauseTimer(item.id)}
                          className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white rounded text-sm"
                        >
                          Pause
                        </button>
                      ) : (
                        <button
                          onClick={() => resumeTimer(item.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-sm"
                        >
                          Resume
                        </button>
                      )}
                      
                      {timer && (timer.isRunning || timer.isPaused || timer.timeLeft < timer.totalTime) && (
                        <button
                          onClick={() => resetTimer(item.id)}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  {item.videoId && (
                    <div className="mt-3">
                      <iframe
                        width="100%"
                        height="150"
                        src={`https://www.youtube.com/embed/${item.videoId}`}
                        title={item.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        className="rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}