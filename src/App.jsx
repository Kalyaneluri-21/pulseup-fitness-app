import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Home from "./pages/Home";
import { useDispatch, useSelector } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { auth } from "./firebase";
import { setUser, clearUser } from "./features/AuthSlice";   
import { fetchUserProfile, clearProfile } from "./features/ProfileSlice";
import { fetchUserWorkouts, clearWorkouts } from "./features/WorkoutSlice";
import { fetchProgress } from "./features/ProgressSlice";
import Dashboard from "./pages/Dashboard";
import OnboardingInterests from "./pages/OnboardingInterests";
import Progress from "./pages/Progress";
import DietPlan from "./pages/Diet";
import Buddies from "./pages/Buddies";
import Chat from "./pages/Chat";
import ExercisePlanner from "./pages/ExercisePlanner";
import Workouts from "./pages/Workouts";
import Profile from "./pages/Profile";

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        dispatch(
          setUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL || "",
          })
        );
        
        // Load user data from Firebase
        dispatch(fetchUserProfile(user.uid));
        dispatch(fetchUserWorkouts(user.uid));
        dispatch(fetchProgress(user.uid));
      } else {
        // User is signed out
        dispatch(clearUser());
        dispatch(clearProfile());
        dispatch(clearWorkouts());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <Router>
      <Routes>
       
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<OnboardingInterests/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/progress" element={<Progress/>} />
        <Route path="/diet" element={<DietPlan/>} />
        <Route path="/buddies" element={<Buddies/>} />
        <Route path="/chat" element={<Chat/>} />
        <Route path="/chat/:conversationId" element={<Chat/>} />
        <Route path="/exercise-planner" element={<ExercisePlanner/>} />
        <Route path="/workouts" element={<Workouts/>} />
        <Route path="/profile" element={<Profile/>} />
      </Routes>
    </Router>
  );
};

export default App;

