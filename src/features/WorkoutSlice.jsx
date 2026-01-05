import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy 
} from "firebase/firestore";
import { db } from "../firebase";

// Async thunk to fetch user workouts from Firebase
export const fetchUserWorkouts = createAsyncThunk(
  "workouts/fetchUserWorkouts",
  async (userId) => {
    const workoutsRef = collection(db, "workouts");
    const q = query(
      workoutsRef, 
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const workouts = [];
    querySnapshot.forEach((doc) => {
      workouts.push({ id: doc.id, ...doc.data() });
    });
    return workouts;
  }
);

// Async thunk to add a new workout
export const addWorkout = createAsyncThunk(
  "workouts/addWorkout",
  async ({ userId, workoutData }) => {
    const workoutsRef = collection(db, "workouts");
    const newWorkout = {
      ...workoutData,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const docRef = await addDoc(workoutsRef, newWorkout);
    return { id: docRef.id, ...newWorkout };
  }
);

// Async thunk to update a workout
export const updateWorkout = createAsyncThunk(
  "workouts/updateWorkout",
  async ({ workoutId, workoutData }) => {
    const workoutRef = doc(db, "workouts", workoutId);
    const updatedData = {
      ...workoutData,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(workoutRef, updatedData);
    return { id: workoutId, ...updatedData };
  }
);

// Async thunk to delete a workout
export const deleteWorkout = createAsyncThunk(
  "workouts/deleteWorkout",
  async (workoutId) => {
    const workoutRef = doc(db, "workouts", workoutId);
    await deleteDoc(workoutRef);
    return workoutId;
  }
);

const initialState = {
  workouts: [],
  currentWorkout: null,
  status: "idle",
  error: null,
};

const workoutSlice = createSlice({
  name: "workouts",
  initialState,
  reducers: {
    clearWorkouts: (state) => {
      state.workouts = [];
      state.currentWorkout = null;
      state.status = "idle";
      state.error = null;
    },
    setCurrentWorkout: (state, action) => {
      state.currentWorkout = action.payload;
    },
    setWorkoutStatus: (state, action) => {
      state.status = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserWorkouts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserWorkouts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.workouts = action.payload;
        state.error = null;
      })
      .addCase(fetchUserWorkouts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addWorkout.fulfilled, (state, action) => {
        state.workouts.unshift(action.payload);
        state.status = "succeeded";
      })
      .addCase(updateWorkout.fulfilled, (state, action) => {
        const index = state.workouts.findIndex(w => w.id === action.payload.id);
        if (index !== -1) {
          state.workouts[index] = action.payload;
        }
        state.status = "succeeded";
      })
      .addCase(deleteWorkout.fulfilled, (state, action) => {
        state.workouts = state.workouts.filter(w => w.id !== action.payload);
        state.status = "succeeded";
      });
  },
});

export const { clearWorkouts, setCurrentWorkout, setWorkoutStatus } = workoutSlice.actions;
export default workoutSlice.reducer;
