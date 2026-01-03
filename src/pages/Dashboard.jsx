import React from "react"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300
                    light:bg-gray-100 light:text-gray-900">
      {/* Header */}
      <header className="bg-gray-800 light:bg-gray-200 shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white 
                           light:bg-blue-400 light:hover:bg-blue-500 light:text-gray-900 transition">
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card Example */}
        <div className="rounded-2xl bg-gray-800 light:bg-gray-200 p-6 shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Weekly Progress</h2>
          <p className="text-gray-400 light:text-gray-700">
            You completed <span className="font-bold text-blue-400">4 workouts</span> this week 🎉
          </p>
        </div>

        <div className="rounded-2xl bg-gray-800 light:bg-gray-200 p-6 shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Tasks</h2>
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span>Math Homework</span>
              <span className="text-green-400">✔ Done</span>
            </li>
            <li className="flex justify-between">
              <span>Science Project</span>
              <span className="text-yellow-400">⏳ Pending</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl bg-gray-800 light:bg-gray-200 p-6 shadow-lg transition">
          <h2 className="text-xl font-semibold mb-2">Upcoming Events</h2>
          <p className="text-gray-400 light:text-gray-700">
            Hackathon on <span className="font-bold text-blue-400">Saturday</span> 🚀
          </p>
        </div>
      </main>
    </div>
  )
}