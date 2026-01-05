import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching progress data
export const fetchProgress = createAsyncThunk(
  'progress/fetchProgress',
  async (userId) => {
    // Simulate API call - replace with actual API endpoint
    const response = await fetch(`/api/progress/${userId}`);
    const data = await response.json();
    return data;
  }
);

// Async thunk for updating progress
export const updateProgress = createAsyncThunk(
  'progress/updateProgress',
  async ({ userId, progressData }) => {
    // Simulate API call - replace with actual API endpoint
    const response = await fetch(`/api/progress/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(progressData),
    });
    const data = await response.json();
    return data;
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
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    // Update current progress
    setCurrentProgress: (state, action) => {
      state.currentProgress = { ...state.currentProgress, ...action.payload };
    },
    
    // Add new progress entry to history
    addProgressEntry: (state, action) => {
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
    
    // Update goals
    updateGoals: (state, action) => {
      state.currentProgress.goals = { ...state.currentProgress.goals, ...action.payload };
    },
    
    // Clear progress data
    clearProgress: (state) => {
      state.currentProgress = initialState.currentProgress;
      state.progressHistory = [];
    },
    
    // Remove progress entry
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
        state.currentProgress = action.payload.currentProgress || state.currentProgress;
        state.progressHistory = action.payload.progressHistory || state.progressHistory;
      })
      .addCase(fetchProgress.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(updateProgress.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateProgress.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentProgress = { ...state.currentProgress, ...action.payload };
      })
      .addCase(updateProgress.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

// Export actions
export const { 
  setCurrentProgress, 
  addProgressEntry, 
  updateGoals, 
  clearProgress, 
  removeProgressEntry 
} = progressSlice.actions;

// Export selectors
export const selectCurrentProgress = (state) => state.progress.currentProgress;
export const selectProgressHistory = (state) => state.progress.progressHistory;
export const selectProgressStatus = (state) => state.progress.status;
export const selectProgressError = (state) => state.progress.error;
export const selectGoals = (state) => state.progress.currentProgress.goals;

// Export reducer
export default progressSlice.reducer;