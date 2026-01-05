import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

// Async thunk to fetch user profile from Firebase
export const fetchUserProfile = createAsyncThunk(
  "profile/fetchUserProfile",
  async (userId) => {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // Create default profile if it doesn't exist
      const defaultProfile = {
        name: "",
        age: "",
        weight: "",
        height: "",
        fitnessGoals: [],
        experienceLevel: "beginner",
        interests: [],
        profilePicture: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(docRef, defaultProfile);
      return defaultProfile;
    }
  }
);

// Async thunk to update user profile in Firebase
export const updateUserProfile = createAsyncThunk(
  "profile/updateUserProfile",
  async ({ userId, profileData }) => {
    const docRef = doc(db, "users", userId);
    const updatedData = {
      ...profileData,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(docRef, updatedData);
    return updatedData;
  }
);

const initialState = {
  profile: null,
  status: "idle",
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.profile = null;
      state.status = "idle";
      state.error = null;
    },
    setProfileStatus: (state, action) => {
      state.status = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { clearProfile, setProfileStatus } = profileSlice.actions;
export default profileSlice.reducer;
