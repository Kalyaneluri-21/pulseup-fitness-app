import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Async thunk for fetching progress data from Firebase
export const fetchProgress = createAsyncThunk(
  'progress/fetchProgress',
  async (userId) => {
    const progressRef = collection(db, 'progress');
    const q = query(
      progressRef, 
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const progressHistory = [];
    let currentProgress = null;
    
    querySnapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() };
      progressHistory.push(data);
      if (!currentProgress) {
        currentProgress = data;
      }
    });
    
    return { currentProgress, progressHistory };
  }
);

// Async thunk for adding progress entry to Firebase
export const addProgressEntry = createAsyncThunk(
  'progress/addProgressEntry',
  async ({ userId, ...progressData }) => {
    const progressRef = collection(db, 'progress');
    const newEntry = {
      userId,
      date: serverTimestamp(),
      ...progressData
    };
    const docRef = await addDoc(progressRef, newEntry);
    return { id: docRef.id, ...newEntry };
  }
);

// Async thunk for updating progress in Firebase
export const updateProgress = createAsyncThunk(
  'progress/updateProgress',
  async ({ userId, progressId, progressData }) => {
    const progressRef = doc(db, 'progress', progressId);
    await updateDoc(progressRef, {
      ...progressData,
      updatedAt: serverTimestamp()
    });
    return { id: progressId, ...progressData };
  }
);

// Async thunk for updating goals in Firebase
export const updateGoals = createAsyncThunk(
  'progress/updateGoals',
  async ({ userId, goals }) => {
    // Check if user has a goals document, if not create one
    const goalsRef = collection(db, 'userGoals');
    const q = query(goalsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Create new goals document
      const newGoals = {
        userId,
        goals,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(goalsRef, newGoals);
      return { id: docRef.id, ...newGoals };
    } else {
      // Update existing goals document
      const goalsDoc = querySnapshot.docs[0];
      await updateDoc(goalsDoc.ref, {
        goals,
        updatedAt: serverTimestamp()
      });
      return { id: goalsDoc.id, goals, updatedAt: new Date() };
    }
  }
);

// Async thunk for fetching user goals from Firebase
export const fetchUserGoals = createAsyncThunk(
  'progress/fetchUserGoals',
  async (userId) => {
    const goalsRef = collection(db, 'userGoals');
    const q = query(goalsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const goalsDoc = querySnapshot.docs[0];
      return { id: goalsDoc.id, ...goalsDoc.data() };
    }
    return null;
  }
);

const initialState = {
  currentProgress: {
    weight: null,
    bodyFat: null,
    muscleMass: null,
    measurements: {
      chest: null,
      waist: null,
      hips: null,
      arms: null,
      thighs: null,
      calves: null
    },
    goals: {
      targetWeight: null,
      targetBodyFat: null,
      targetMuscleMass: null
    }
  },
  progressHistory: [],
  userGoals: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    // Update current progress locally
    setCurrentProgress: (state, action) => {
      state.currentProgress = { ...state.currentProgress, ...action.payload };
    },
    
    // Add new progress entry to history locally
    addProgressEntryLocal: (state, action) => {
      const newEntry = {
        id: Date.now(),
        date: new Date().toISOString(),
        ...action.payload
      };
      state.progressHistory.unshift(newEntry);
      
      // Update current progress with latest values
      if (action.payload.weight) state.currentProgress.weight = action.payload.weight;
      if (action.payload.bodyFat) state.currentProgress.bodyFat = action.payload.bodyFat;
      if (action.payload.muscleMass) state.currentProgress.muscleMass = action.payload.muscleMass;
      if (action.payload.measurements) {
        state.currentProgress.measurements = { 
          ...state.currentProgress.measurements, 
          ...action.payload.measurements 
        };
      }
    },
    
    // Update goals locally
    updateGoalsLocal: (state, action) => {
      if (state.userGoals) {
        state.userGoals.goals = { ...state.userGoals.goals, ...action.payload };
      } else {
        state.currentProgress.goals = { ...state.currentProgress.goals, ...action.payload };
      }
    },
    
    // Clear progress data
    clearProgress: (state) => {
      state.currentProgress = initialState.currentProgress;
      state.progressHistory = [];
      state.userGoals = null;
    },
    
    // Remove progress entry locally
    removeProgressEntry: (state, action) => {
      state.progressHistory = state.progressHistory.filter(
        entry => entry.id !== action.payload
      );
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProgress.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProgress.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload.currentProgress) {
          state.currentProgress = { ...state.currentProgress, ...action.payload.currentProgress };
        }
        state.progressHistory = action.payload.progressHistory || [];
      })
      .addCase(fetchProgress.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addProgressEntry.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addProgressEntry.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.progressHistory.unshift(action.payload);
        // Update current progress with latest values
        if (action.payload.weight) state.currentProgress.weight = action.payload.weight;
        if (action.payload.bodyFat) state.currentProgress.bodyFat = action.payload.bodyFat;
        if (action.payload.muscleMass) state.currentProgress.muscleMass = action.payload.muscleMass;
        if (action.payload.measurements) {
          state.currentProgress.measurements = { 
            ...state.currentProgress.measurements, 
            ...action.payload.measurements 
          };
        }
      })
      .addCase(addProgressEntry.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(updateProgress.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateProgress.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.progressHistory.findIndex(entry => entry.id === action.payload.id);
        if (index !== -1) {
          state.progressHistory[index] = { ...state.progressHistory[index], ...action.payload };
        }
      })
      .addCase(updateProgress.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(updateGoals.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateGoals.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userGoals = action.payload;
        state.currentProgress.goals = action.payload.goals;
      })
      .addCase(updateGoals.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchUserGoals.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserGoals.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload) {
          state.userGoals = action.payload;
          state.currentProgress.goals = action.payload.goals;
        }
      })
      .addCase(fetchUserGoals.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

// Export actions
export const { 
  setCurrentProgress, 
  addProgressEntryLocal, 
  updateGoalsLocal, 
  clearProgress, 
  removeProgressEntry 
} = progressSlice.actions;

// Export selectors
export const selectCurrentProgress = (state) => state.progress.currentProgress;
export const selectProgressHistory = (state) => state.progress.progressHistory;
export const selectProgressStatus = (state) => state.progress.status;
export const selectProgressError = (state) => state.progress.error;
export const selectGoals = (state) => state.progress.userGoals?.goals || state.progress.currentProgress.goals;
export const selectUserGoals = (state) => state.progress.userGoals;

// Export reducer
export default progressSlice.reducer;