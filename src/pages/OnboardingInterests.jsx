import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import Header from "../components/Header"
import { ArrowLeft } from "lucide-react"

const ALL_INTERESTS = [
  "Yoga",
  "Exercise",
  "Gym",
  "Running",
  "Cycling",
  "Swimming",
  "Pilates",
  "HIIT",
  "CrossFit",
  "Zumba",
  "Strength Training",
  "Cardio",
  "Hiking",
  "Meditation",
]

export default function OnboardingInterests() {
  const user = useSelector((state) => state.auth.user)
  const theme = useSelector((state) => state.theme.theme)
  const navigate = useNavigate()
  const storageKey = useMemo(() => (user?.uid ? `fb_interests_${user.uid}` : null), [user])
  const [selected, setSelected] = useState([])

  useEffect(() => {
    if (!storageKey) return
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          navigate("/dashboard", { replace: true })
        }
      } catch {}
    }
  }, [storageKey, navigate])

  const toggleInterest = (interest) => {
    const isSelected = selected.includes(interest)
    if (isSelected) {
      setSelected(selected.filter((i) => i !== interest))
      return
    }
    if (selected.length >= 6) return
    setSelected([...selected, interest])
  }

  const handleSave = () => {
    if (!storageKey) return
    localStorage.setItem(storageKey, JSON.stringify(selected))
    navigate("/dashboard", { replace: true })
  }

  // Theme-based styling
  const bgColor = theme === "light" ? "bg-gray-50" : "bg-gray-900"
  const cardBg = theme === "light" ? "bg-white" : "bg-gray-800"
  const textColor = theme === "light" ? "text-gray-900" : "text-gray-100"
  const borderColor = theme === "light" ? "border-gray-200" : "border-gray-700"
  const interestButtonActive = theme === "light"
    ? "bg-gradient-to-r from-purple-600 to-blue-600 border-purple-500 text-white"
    : "bg-gradient-to-r from-green-600 to-teal-600 border-green-500 text-white"
  const interestButtonInactive = theme === "light"
    ? "bg-white border-gray-300 text-gray-700 hover:border-gray-400"
    : "bg-gray-700 border-gray-600 text-gray-200 hover:border-gray-500"
  const interestButtonDisabled = theme === "light"
    ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
    : "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed"

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} transition-colors duration-300`}>
      <Header />
      
      <div className="flex items-center justify-center p-3 sm:p-6">
        <div className="w-full max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate("/")}
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

          <div className={`rounded-xl ${cardBg} p-6 sm:p-8 shadow-lg ${borderColor} border`}>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center sm:text-left">Choose your fitness interests</h1>
            <p className={`mb-4 sm:mb-6 text-sm sm:text-base text-center sm:text-left ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>Select up to 6 to personalize matches and plans.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
              {ALL_INTERESTS.map((item) => {
                const active = selected.includes(item)
                const disabled = !active && selected.length >= 6
                return (
                  <button
                    key={item}
                    onClick={() => toggleInterest(item)}
                    className={`px-2 py-2 sm:px-3 sm:py-2 rounded-lg border transition text-xs sm:text-sm ${
                      active ? interestButtonActive : disabled ? interestButtonDisabled : interestButtonInactive
                    }`}
                  >
                    {item}
                  </button>
                )
              })}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <span className={`text-xs sm:text-sm text-center sm:text-left ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>{selected.length} / 6 selected</span>
              <button
                onClick={handleSave}
                disabled={selected.length === 0}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold transition text-sm sm:text-base ${
                  selected.length === 0
                    ? `${theme === "light" ? "bg-gray-200" : "bg-gray-700"} ${theme === "light" ? "text-gray-400" : "text-gray-500"} cursor-not-allowed`
                    : "text-white transition hover:scale-105 shadow-md"
                }`}
                style={selected.length > 0 ? {
                  background: theme === "light"
                    ? "linear-gradient(90deg, #10B981, #059669)"
                    : "linear-gradient(90deg, #3CB14A, #2A6A28)",
                } : {}}
              >
                Save and continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

