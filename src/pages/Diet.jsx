import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import Header from "../components/Header"

const DIET_PLANS = {
  healthy_lifestyle: {
    name: "Healthy Lifestyle",
    icon: "🌱",
    description: "Maintain a balanced diet for overall wellness",
    color: "from-green-400 to-emerald-500",
    dailyCalories: 2000
  },
  weight_loss: {
    name: "Weight Loss",
    icon: "⚖️",
    description: "Calorie deficit diet for healthy weight reduction",
    color: "from-blue-400 to-cyan-500",
    dailyCalories: 1500
  },
  weight_gain: {
    name: "Weight Gain",
    icon: "💪",
    description: "Calorie surplus diet for muscle building",
    color: "from-orange-400 to-red-500",
    dailyCalories: 2500
  },
  balanced_life: {
    name: "Balanced Life",
    icon: "⚖️",
    description: "Moderate approach for sustainable health",
    color: "from-purple-400 to-pink-500",
    dailyCalories: 1800
  },
  muscle_building: {
    name: "Muscle Building",
    icon: "🏋️",
    description: "High protein diet for muscle growth",
    color: "from-indigo-400 to-purple-500",
    dailyCalories: 2200
  },
  energy_boost: {
    name: "Energy Boost",
    icon: "⚡",
    description: "Nutrient-rich foods for sustained energy",
    color: "from-yellow-400 to-orange-500",
    dailyCalories: 1900
  },
  detox_cleanse: {
    name: "Detox & Cleanse",
    icon: "🧘",
    description: "Clean eating for body detoxification",
    color: "from-teal-400 to-green-500",
    dailyCalories: 1600
  }
}

const MEAL_CATEGORIES = {
  breakfast: {
    title: "Breakfast",
    icon: "🌅",
    color: "from-orange-400 to-yellow-400"
  },
  lunch: {
    title: "Lunch", 
    icon: "☀️",
    color: "from-yellow-500 to-orange-500"
  },
  dinner: {
    title: "Dinner",
    icon: "🌙", 
    color: "from-purple-500 to-pink-500"
  },
  snacks: {
    title: "Snacks",
    icon: "🍎",
    color: "from-green-400 to-blue-400"
  }
}

// Diet plan specific meal suggestions
const DIET_PLAN_MEALS = {
  healthy_lifestyle: {
    breakfast: [
      { id: 1, name: "Oatmeal with Berries & Nuts", calories: 280, protein: "10g", carbs: "45g", fat: "8g", done: false },
      { id: 2, name: "Greek Yogurt with Honey & Granola", calories: 220, protein: "18g", carbs: "25g", fat: "6g", done: false },
      { id: 3, name: "Whole Grain Toast with Avocado", calories: 240, protein: "8g", carbs: "28g", fat: "14g", done: false }
    ],
    lunch: [
      { id: 4, name: "Grilled Chicken Salad", calories: 380, protein: "38g", carbs: "18g", fat: "20g", done: false },
      { id: 5, name: "Quinoa Bowl with Vegetables", calories: 350, protein: "14g", carbs: "58g", fat: "10g", done: false },
      { id: 6, name: "Turkey Sandwich on Whole Wheat", calories: 420, protein: "28g", carbs: "48g", fat: "15g", done: false }
    ],
    dinner: [
      { id: 7, name: "Salmon with Roasted Vegetables", calories: 450, protein: "42g", carbs: "22g", fat: "24g", done: false },
      { id: 8, name: "Lean Beef Stir Fry", calories: 400, protein: "35g", carbs: "28g", fat: "20g", done: false },
      { id: 9, name: "Vegetarian Pasta", calories: 380, protein: "14g", carbs: "65g", fat: "10g", done: false }
    ],
    snacks: [
      { id: 10, name: "Almonds (1/4 cup)", calories: 170, protein: "7g", carbs: "7g", fat: "15g", done: false },
      { id: 11, name: "Apple with Peanut Butter", calories: 220, protein: "5g", carbs: "28g", fat: "12g", done: false },
      { id: 12, name: "Protein Smoothie", calories: 200, protein: "22g", carbs: "18g", fat: "4g", done: false }
    ]
  },
  weight_loss: {
    breakfast: [
      { id: 1, name: "Egg White Omelette with Spinach", calories: 180, protein: "20g", carbs: "8g", fat: "6g", done: false },
      { id: 2, name: "Protein Smoothie Bowl", calories: 220, protein: "25g", carbs: "22g", fat: "4g", done: false },
      { id: 3, name: "Cottage Cheese with Berries", calories: 160, protein: "18g", carbs: "15g", fat: "3g", done: false }
    ],
    lunch: [
      { id: 4, name: "Tuna Salad with Mixed Greens", calories: 280, protein: "32g", carbs: "12g", fat: "12g", done: false },
      { id: 5, name: "Chicken Breast with Broccoli", calories: 300, protein: "35g", carbs: "15g", fat: "10g", done: false },
      { id: 6, name: "Lentil Soup with Vegetables", calories: 250, protein: "18g", carbs: "35g", fat: "6g", done: false }
    ],
    dinner: [
      { id: 7, name: "Grilled Fish with Asparagus", calories: 320, protein: "38g", carbs: "12g", fat: "14g", done: false },
      { id: 8, name: "Lean Turkey with Cauliflower Rice", calories: 280, protein: "32g", carbs: "18g", fat: "8g", done: false },
      { id: 9, name: "Vegetable Stir Fry with Tofu", calories: 260, protein: "16g", carbs: "28g", fat: "10g", done: false }
    ],
    snacks: [
      { id: 10, name: "Celery with Hummus", calories: 120, protein: "4g", carbs: "12g", fat: "6g", done: false },
      { id: 11, name: "Hard Boiled Eggs (2)", calories: 140, protein: "12g", carbs: "2g", fat: "10g", done: false },
      { id: 12, name: "Protein Bar", calories: 180, protein: "20g", carbs: "15g", fat: "6g", done: false }
    ]
  },
  weight_gain: {
    breakfast: [
      { id: 1, name: "Protein Pancakes with Nut Butter", calories: 450, protein: "25g", carbs: "55g", fat: "18g", done: false },
      { id: 2, name: "Full Fat Greek Yogurt with Nuts", calories: 380, protein: "22g", carbs: "28g", fat: "20g", done: false },
      { id: 3, name: "Avocado Toast with Eggs", calories: 420, protein: "18g", carbs: "32g", fat: "24g", done: false }
    ],
    lunch: [
      { id: 4, name: "Beef Burger with Sweet Potato Fries", calories: 580, protein: "35g", carbs: "65g", fat: "28g", done: false },
      { id: 5, name: "Chicken Rice Bowl with Avocado", calories: 520, protein: "32g", carbs: "58g", fat: "22g", done: false },
      { id: 6, name: "Salmon with Quinoa and Nuts", calories: 480, protein: "38g", carbs: "45g", fat: "24g", done: false }
    ],
    dinner: [
      { id: 7, name: "Steak with Mashed Potatoes", calories: 620, protein: "42g", carbs: "55g", fat: "32g", done: false },
      { id: 8, name: "Pasta with Meat Sauce", calories: 580, protein: "28g", carbs: "75g", fat: "22g", done: false },
      { id: 9, name: "Chicken Alfredo", calories: 540, protein: "32g", carbs: "48g", fat: "28g", done: false }
    ],
    snacks: [
      { id: 10, name: "Mixed Nuts (1/2 cup)", calories: 320, protein: "12g", carbs: "12g", fat: "28g", done: false },
      { id: 11, name: "Peanut Butter Banana Sandwich", calories: 380, protein: "12g", carbs: "45g", fat: "18g", done: false },
      { id: 12, name: "Protein Shake with Banana", calories: 320, protein: "25g", carbs: "35g", fat: "8g", done: false }
    ]
  },
  balanced_life: {
    breakfast: [
      { id: 1, name: "Oatmeal with Berries", calories: 250, protein: "8g", carbs: "45g", fat: "5g", done: false },
      { id: 2, name: "Greek Yogurt with Honey", calories: 180, protein: "15g", carbs: "20g", fat: "3g", done: false },
      { id: 3, name: "Whole Grain Toast with Avocado", calories: 220, protein: "6g", carbs: "25g", fat: "12g", done: false }
    ],
    lunch: [
      { id: 4, name: "Grilled Chicken Salad", calories: 350, protein: "35g", carbs: "15g", fat: "18g", done: false },
      { id: 5, name: "Quinoa Bowl with Vegetables", calories: 320, protein: "12g", carbs: "55g", fat: "8g", done: false },
      { id: 6, name: "Turkey Sandwich on Whole Wheat", calories: 380, protein: "25g", carbs: "45g", fat: "12g", done: false }
    ],
    dinner: [
      { id: 7, name: "Salmon with Roasted Vegetables", calories: 420, protein: "38g", carbs: "20g", fat: "22g", done: false },
      { id: 8, name: "Lean Beef Stir Fry", calories: 380, protein: "32g", carbs: "25g", fat: "18g", done: false },
      { id: 9, name: "Vegetarian Pasta", calories: 340, protein: "12g", carbs: "60g", fat: "8g", done: false }
    ],
    snacks: [
      { id: 10, name: "Almonds (1/4 cup)", calories: 160, protein: "6g", carbs: "6g", fat: "14g", done: false },
      { id: 11, name: "Apple with Peanut Butter", calories: 200, protein: "4g", carbs: "25g", fat: "10g", done: false },
      { id: 12, name: "Protein Smoothie", calories: 180, protein: "20g", carbs: "15g", fat: "3g", done: false }
    ]
  },
  muscle_building: {
    breakfast: [
      { id: 1, name: "Protein Oatmeal with Eggs", calories: 420, protein: "32g", carbs: "48g", fat: "15g", done: false },
      { id: 2, name: "Cottage Cheese with Berries", calories: 280, protein: "25g", carbs: "22g", fat: "8g", done: false },
      { id: 3, name: "Protein Pancakes", calories: 380, protein: "28g", carbs: "42g", fat: "12g", done: false }
    ],
    lunch: [
      { id: 4, name: "Chicken Breast with Brown Rice", calories: 480, protein: "45g", carbs: "55g", fat: "12g", done: false },
      { id: 5, name: "Tuna Salad with Sweet Potato", calories: 420, protein: "38g", carbs: "45g", fat: "10g", done: false },
      { id: 6, name: "Lean Beef with Quinoa", calories: 460, protein: "42g", carbs: "48g", fat: "15g", done: false }
    ],
    dinner: [
      { id: 7, name: "Salmon with Rice and Vegetables", calories: 520, protein: "48g", carbs: "52g", fat: "18g", done: false },
      { id: 8, name: "Turkey with Sweet Potato", calories: 480, protein: "42g", carbs: "48g", fat: "16g", done: false },
      { id: 9, name: "Chicken Stir Fry with Rice", calories: 440, protein: "38g", carbs: "45g", fat: "14g", done: false }
    ],
    snacks: [
      { id: 10, name: "Protein Shake", calories: 220, protein: "25g", carbs: "18g", fat: "4g", done: false },
      { id: 11, name: "Greek Yogurt with Nuts", calories: 280, protein: "22g", carbs: "18g", fat: "15g", done: false },
      { id: 12, name: "Hard Boiled Eggs (3)", calories: 210, protein: "18g", carbs: "3g", fat: "15g", done: false }
    ]
  },
  energy_boost: {
    breakfast: [
      { id: 1, name: "Acai Bowl with Granola", calories: 320, protein: "12g", carbs: "52g", fat: "10g", done: false },
      { id: 2, name: "Smoothie with Spinach and Berries", calories: 280, protein: "15g", carbs: "45g", fat: "8g", done: false },
      { id: 3, name: "Chia Pudding with Fruits", calories: 260, protein: "10g", carbs: "42g", fat: "12g", done: false }
    ],
    lunch: [
      { id: 4, name: "Quinoa Salad with Chickpeas", calories: 380, protein: "18g", carbs: "58g", fat: "12g", done: false },
      { id: 5, name: "Brown Rice Bowl with Vegetables", calories: 360, protein: "14g", carbs: "62g", fat: "10g", done: false },
      { id: 6, name: "Lentil Soup with Whole Grain Bread", calories: 340, protein: "16g", carbs: "55g", fat: "8g", done: false }
    ],
    dinner: [
      { id: 7, name: "Salmon with Sweet Potato", calories: 420, protein: "35g", carbs: "45g", fat: "18g", done: false },
      { id: 8, name: "Chicken with Brown Rice", calories: 380, protein: "32g", carbs: "48g", fat: "12g", done: false },
      { id: 9, name: "Vegetable Curry with Quinoa", calories: 360, protein: "14g", carbs: "58g", fat: "10g", done: false }
    ],
    snacks: [
      { id: 10, name: "Banana with Almond Butter", calories: 240, protein: "6g", carbs: "32g", fat: "12g", done: false },
      { id: 11, name: "Energy Balls", calories: 200, protein: "8g", carbs: "28g", fat: "10g", done: false },
      { id: 12, name: "Green Smoothie", calories: 180, protein: "12g", carbs: "25g", fat: "6g", done: false }
    ]
  },
  detox_cleanse: {
    breakfast: [
      { id: 1, name: "Green Smoothie Bowl", calories: 220, protein: "12g", carbs: "35g", fat: "8g", done: false },
      { id: 2, name: "Chia Pudding with Berries", calories: 200, protein: "8g", carbs: "28g", fat: "10g", done: false },
      { id: 3, name: "Oatmeal with Cinnamon", calories: 180, protein: "6g", carbs: "32g", fat: "4g", done: false }
    ],
    lunch: [
      { id: 4, name: "Vegetable Soup", calories: 160, protein: "8g", carbs: "25g", fat: "6g", done: false },
      { id: 5, name: "Kale Salad with Lemon", calories: 140, protein: "6g", carbs: "18g", fat: "8g", done: false },
      { id: 6, name: "Quinoa with Vegetables", calories: 200, protein: "10g", carbs: "32g", fat: "6g", done: false }
    ],
    dinner: [
      { id: 7, name: "Steamed Fish with Vegetables", calories: 240, protein: "28g", carbs: "15g", fat: "10g", done: false },
      { id: 8, name: "Vegetable Stir Fry", calories: 180, protein: "8g", carbs: "28g", fat: "8g", done: false },
      { id: 9, name: "Lentil Soup", calories: 160, protein: "12g", carbs: "22g", fat: "4g", done: false }
    ],
    snacks: [
      { id: 10, name: "Celery Sticks", calories: 40, protein: "2g", carbs: "8g", fat: "0g", done: false },
      { id: 11, name: "Green Tea with Lemon", calories: 20, protein: "0g", carbs: "5g", fat: "0g", done: false },
      { id: 12, name: "Cucumber Slices", calories: 30, protein: "1g", carbs: "6g", fat: "0g", done: false }
    ]
  }
}

export default function Diet() {
  const theme = useSelector((state) => state.theme.theme)
  const user = useSelector((state) => state.auth.user)
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState("healthy_lifestyle")
  const [meals, setMeals] = useState(DIET_PLAN_MEALS.healthy_lifestyle)
  const [selectedCategory, setSelectedCategory] = useState("breakfast")
  const [showAddMeal, setShowAddMeal] = useState(false)
  const [showPlanSelector, setShowPlanSelector] = useState(false)
  const [newMeal, setNewMeal] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: ""
  })

  // Theme-based styling
  const bgColor = theme === "light" ? "bg-gray-50" : "bg-gray-900"
  const cardBg = theme === "light" ? "bg-white" : "bg-gray-800"
  const textColor = theme === "light" ? "text-gray-900" : "text-gray-100"
  const borderColor = theme === "light" ? "border-gray-200" : "border-gray-700"

  const handlePlanChange = (planKey) => {
    setSelectedPlan(planKey)
    setMeals(DIET_PLAN_MEALS[planKey])
    setShowPlanSelector(false)
  }

  const toggleMeal = (category, mealId) => {
    setMeals(prev => ({
      ...prev,
      [category]: prev[category].map(meal => 
        meal.id === mealId ? { ...meal, done: !meal.done } : meal
      )
    }))
  }

  const addMeal = () => {
    if (!newMeal.name || !newMeal.calories) return
    
    const meal = {
      id: Date.now(),
      name: newMeal.name,
      calories: parseInt(newMeal.calories),
      protein: newMeal.protein || "0g",
      carbs: newMeal.carbs || "0g", 
      fat: newMeal.fat || "0g",
      done: false
    }

    setMeals(prev => ({
      ...prev,
      [selectedCategory]: [...prev[selectedCategory], meal]
    }))

    setNewMeal({ name: "", calories: "", protein: "", carbs: "", fat: "" })
    setShowAddMeal(false)
  }

  const getTotalCalories = () => {
    return Object.values(meals).flat().reduce((total, meal) => total + (meal.done ? meal.calories : 0), 0)
  }

  const getTotalProtein = () => {
    return Object.values(meals).flat().reduce((total, meal) => {
      if (!meal.done) return total
      const protein = parseInt(meal.protein) || 0
      return total + protein
    }, 0)
  }

  const completedMeals = Object.values(meals).flat().filter(meal => meal.done).length
  const totalMeals = Object.values(meals).flat().length
  const progressPercent = totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0
  const selectedPlanData = DIET_PLANS[selectedPlan]

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
          <h1 className="text-xl sm:text-2xl font-bold">Diet Planner</h1>
        </div>

        {/* Diet Plan Selector */}
        <div className={`mb-6 rounded-2xl ${cardBg} p-6 shadow-lg ${borderColor} border`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Current Diet Plan</h3>
              <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                {selectedPlanData.description}
              </p>
            </div>
            <button
              onClick={() => setShowPlanSelector(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
            >
              Change Plan
            </button>
          </div>
          
          <div className={`p-4 rounded-lg bg-gradient-to-r ${selectedPlanData.color} text-white`}>
            <div className="flex items-center gap-3">
              <div className="text-3xl">{selectedPlanData.icon}</div>
              <div>
                <h4 className="text-xl font-semibold">{selectedPlanData.name}</h4>
                <p className="text-sm opacity-90">Daily Target: {selectedPlanData.dailyCalories} calories</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className={`mb-6 rounded-2xl ${cardBg} p-6 shadow-lg ${borderColor} border`}>
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-4">Today's Nutrition Progress</h3>
            <div className="relative">
              <svg width="160" height="160" viewBox="0 0 160 160" className="drop-shadow-lg">
                <circle 
                  cx="80" 
                  cy="80" 
                  r="70" 
                  stroke={theme === "light" ? "#F3F4F6" : "#374151"} 
                  strokeWidth="12" 
                  fill="none"
                />
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
                <div className={`text-3xl font-bold ${theme === "light" ? "text-gray-800" : "text-gray-100"}`}>
                  {progressPercent}%
                </div>
                <div className={`text-sm mt-1 ${theme === "light" ? "text-gray-600" : "text-gray-300"}`}>
                  {completedMeals}/{totalMeals} Meals
                </div>
              </div>
            </div>
            <div className="text-center mt-4">
              <p className={`text-sm ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                {progressPercent < 100 ? "Keep up the great work with your nutrition!" : "Excellent! You've completed your meal plan!"}
              </p>
            </div>
          </div>
        </div>

        {/* Nutrition Summary */}
        <div className={`mb-6 rounded-2xl ${cardBg} p-6 shadow-lg ${borderColor} border`}>
          <h3 className="text-lg font-semibold mb-4">Nutrition Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${theme === "light" ? "bg-orange-50" : "bg-orange-900/20"} border ${theme === "light" ? "border-orange-200" : "border-orange-700"}`}>
              <div className="text-2xl font-bold text-orange-600">{getTotalCalories()}</div>
              <div className="text-sm text-orange-600">Calories</div>
              <div className="text-xs text-orange-500">Target: {selectedPlanData.dailyCalories}</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === "light" ? "bg-blue-50" : "bg-blue-900/20"} border ${theme === "light" ? "border-blue-200" : "border-blue-700"}`}>
              <div className="text-2xl font-bold text-blue-600">{getTotalProtein()}g</div>
              <div className="text-sm text-blue-600">Protein</div>
            </div>
            <div className={`p-4 rounded-lg ${theme === "light" ? "bg-green-50" : "bg-green-900/20"} border ${theme === "light" ? "border-green-200" : "border-green-700"}`}>
              <div className="text-2xl font-bold text-green-600">{completedMeals}</div>
              <div className="text-sm text-green-600">Meals Completed</div>
            </div>
          </div>
        </div>

        {/* Meal Categories */}
        <div className={`mb-6 rounded-2xl ${cardBg} p-6 shadow-lg ${borderColor} border`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Meal Categories</h3>
            <button
              onClick={() => setShowAddMeal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition"
            >
              Add Meal
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(MEAL_CATEGORIES).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`p-4 rounded-lg border transition ${
                  selectedCategory === key
                    ? `bg-gradient-to-r ${category.color} text-white border-transparent`
                    : `${theme === "light" ? "bg-gray-50 border-gray-200" : "bg-gray-700 border-gray-600"} hover:border-gray-400`
                }`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="font-medium">{category.title}</div>
                <div className="text-sm opacity-75">
                  {meals[key].filter(meal => meal.done).length}/{meals[key].length} completed
                </div>
              </button>
            ))}
          </div>

          {/* Selected Category Meals */}
          <div className="space-y-3">
            <h4 className="text-md font-semibold">{MEAL_CATEGORIES[selectedCategory].title} Meals</h4>
            {meals[selectedCategory].map((meal) => (
              <div key={meal.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                meal.done 
                  ? `${theme === "light" ? "bg-green-50 border-green-200" : "bg-green-900/20 border-green-700"}`
                  : `${theme === "light" ? "bg-gray-50 border-gray-200" : "bg-gray-700 border-gray-600"}`
              }`}>
                <div className="flex-1">
                  <div className={`font-medium ${meal.done ? "line-through text-gray-500" : ""}`}>
                    {meal.name}
                  </div>
                  <div className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                    {meal.calories} cal • P: {meal.protein} • C: {meal.carbs} • F: {meal.fat}
                  </div>
                </div>
                <button
                  onClick={() => toggleMeal(selectedCategory, meal.id)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    meal.done
                      ? "bg-green-700 hover:bg-green-600 text-white"
                      : "bg-yellow-700 hover:bg-yellow-600 text-white"
                  }`}
                >
                  {meal.done ? "✓ Done" : "Mark Done"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Diet Plan Selector Modal */}
        {showPlanSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${cardBg} p-6 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto`}>
              <h3 className="text-lg font-semibold mb-4">Choose Your Diet Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(DIET_PLANS).map(([key, plan]) => (
                  <button
                    key={key}
                    onClick={() => handlePlanChange(key)}
                    className={`p-4 rounded-lg border transition text-left ${
                      selectedPlan === key
                        ? `bg-gradient-to-r ${plan.color} text-white border-transparent`
                        : `${theme === "light" ? "bg-gray-50 border-gray-200 hover:border-gray-400" : "bg-gray-700 border-gray-600 hover:border-gray-500"}`
                    }`}
                  >
                    <div className="text-2xl mb-2">{plan.icon}</div>
                    <div className="font-semibold">{plan.name}</div>
                    <div className={`text-sm mt-1 ${selectedPlan === key ? "opacity-90" : "opacity-70"}`}>
                      {plan.description}
                    </div>
                    <div className={`text-xs mt-2 ${selectedPlan === key ? "opacity-90" : "opacity-60"}`}>
                      Daily Target: {plan.dailyCalories} calories
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowPlanSelector(false)}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-400 text-white rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Meal Modal */}
        {showAddMeal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${cardBg} p-6 rounded-lg shadow-lg max-w-md w-full mx-4`}>
              <h3 className="text-lg font-semibold mb-4">Add New Meal</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Meal name"
                  value={newMeal.name}
                  onChange={(e) => setNewMeal({...newMeal, name: e.target.value})}
                  className={`w-full p-3 rounded border ${theme === "light" ? "border-gray-300" : "border-gray-600"} ${theme === "light" ? "bg-white" : "bg-gray-700"}`}
                />
                <input
                  type="number"
                  placeholder="Calories"
                  value={newMeal.calories}
                  onChange={(e) => setNewMeal({...newMeal, calories: e.target.value})}
                  className={`w-full p-3 rounded border ${theme === "light" ? "border-gray-300" : "border-gray-600"} ${theme === "light" ? "bg-white" : "bg-gray-700"}`}
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Protein (g)"
                    value={newMeal.protein}
                    onChange={(e) => setNewMeal({...newMeal, protein: e.target.value})}
                    className={`p-3 rounded border ${theme === "light" ? "border-gray-300" : "border-gray-600"} ${theme === "light" ? "bg-white" : "bg-gray-700"}`}
                  />
                  <input
                    type="text"
                    placeholder="Carbs (g)"
                    value={newMeal.carbs}
                    onChange={(e) => setNewMeal({...newMeal, carbs: e.target.value})}
                    className={`p-3 rounded border ${theme === "light" ? "border-gray-300" : "border-gray-600"} ${theme === "light" ? "bg-white" : "bg-gray-700"}`}
                  />
                  <input
                    type="text"
                    placeholder="Fat (g)"
                    value={newMeal.fat}
                    onChange={(e) => setNewMeal({...newMeal, fat: e.target.value})}
                    className={`p-3 rounded border ${theme === "light" ? "border-gray-300" : "border-gray-600"} ${theme === "light" ? "bg-white" : "bg-gray-700"}`}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={addMeal}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded"
                  >
                    Add Meal
                  </button>
                  <button
                    onClick={() => setShowAddMeal(false)}
                    className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-400 text-white rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
