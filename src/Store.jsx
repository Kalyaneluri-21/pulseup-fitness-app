import {configureStore} from "@reduxjs/toolkit";
import authReducer from "./features/AuthSlice";
import themeReducer from "./features/ThemeSlice";
import profileReducer from "./features/ProfileSlice";
import workoutReducer from "./features/WorkoutSlice";
import progressReducer from "./features/ProgressSlice";
import buddyReducer from "./features/BuddySlice";
import chatReducer from "./features/ChatSlice";

export const Store = configureStore({
    reducer:{
        auth: authReducer,
        theme: themeReducer,
        profile: profileReducer,
        workouts: workoutReducer,
        progress: progressReducer,
        buddies: buddyReducer,
        chat: chatReducer
    }
})