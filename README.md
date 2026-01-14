# 🚀 Pulse Up Fitness Buddy App

**Pulse Up Fitness Buddy App** is a web-based fitness platform that connects users with similar fitness goals. Users can find workout partners, track progress, follow personalized exercise plans, chat with buddies, shop for fitness products, and stay motivated in a supportive community.

🌐 Live Demo: [https://pulseup-fitness-app.vercel.app/](https://pulseup-fitness-app.vercel.app/)

---

## 📌 Project Goal

Create an application where users can:

* Set fitness goals
* Track their progress
* Connect with workout buddies who share similar interests
* Access workout plans and fitness resources
* Engage in a collaborative and supportive fitness environment

---

## 🏋️ Features

### ✅ Minimum Expected Features Implemented

* **User Authentication** 🔒
  * Secure registration and login with email/password
  * Firebase authentication for secure access

* **Profile Creation & Customization** 👤
  * Name, location, preferred workouts, and fitness goals
  * Example: Run 5 miles a week, preference: weightlifting

* **Buddy Matching** 🤝
  * Basic algorithm matches users with similar goals and workouts
  * Location-based suggestions for nearby buddies

* **In-App Messaging** 💬
  * Chat functionality with matched buddies
  * Share workout tips, arrange meetups, or provide motivation

* **Workout Tracking** 📊
  * Log workouts including type, duration, and milestones
  * Track weekly activity and progress

* **Weekly Progress Reports** 🗓️
  * Summaries of workouts completed, calories burned, and goals achieved

* **Goal Setting & Notifications** ⏰
  * Users can set targets like “Run 10 miles a week”
  * Reminders for accountability

* **Virtual Fitness Library** 📚
  * Access workout videos and articles to enhance routines

---

### 🌟 Unique Features Already Implemented

* **Progress Sharing with Buddies** 🔗
  * Share workout logs and achievements with friends

* **Personalized Exercise Plans** 🏃‍♂️
  * Plans for Weight Gain, Weight Loss, Balance, and more

* **Shop for Fitness Products** 🛒
  * Browse proteins and exercise-related products

* **Chat System** 💬
  * Communicate with workout buddies in real-time

* **Responsive Design & Dark Mode** 🌙
  * Mobile-friendly and visually customizable

* **Generate Personalized Workout Plans** 📝
  * Advanced routines based on user goals and preferences

---

## ⚙️ Tech Stack

**Frontend:**
- JavaScript
- React.js
- Vite
- Tailwind CSS
- CSS

**Backend / Database:**
- Firebase
- Firestore

**Deployment:**
- Vercel

---

## 🛠 Installation & Setup

1. **Clone the repository**

```bash
git clone https://github.com/Kalyaneluri-21/pulseup-fitness-app.git
cd pulseup-fitness-app
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the development server**

```bash
npm run dev
```

4. **Build for production**

```bash
npm run build
```

---

## 🌐 Deployment on Vercel

1. Import the GitHub repo in [Vercel](https://vercel.com/)
2. Set the Framework Preset to Vite
3. Set the **Root Directory** to ./
4. Vercel will detect React automatically and build the app
5. Access the live app: [https://pulseup-fitness-app.vercel.app/](https://pulseup-fitness-app.vercel.app/)

---

## 📂 Project Structure

```
pulseup-fitness-app/
│
├── node_modules/                 
├── public/                       
├── src/                          
│   ├── assets/                   
│   ├── components/               
│   ├── features/                 
│   ├── pages/                    
│   ├── hooks/                    
│   ├── store/                    
│   ├── styles/                   
│   ├── App.jsx                   
│   ├── main.jsx                  
│   └── firebase.js               
├── .gitignore
├── eslint.config.js              
├── index.html                    
├── package.json
├── package-lock.json
├── postcss.config.js             
├── tailwind.config.js            
├── vite.config.js                                
└── README.md
```





