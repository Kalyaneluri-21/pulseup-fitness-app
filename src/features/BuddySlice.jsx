import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Async thunk for fetching all users from Firebase
export const fetchAllUsers = createAsyncThunk(
  'buddies/fetchAllUsers',
  async (currentUserId) => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('uid', '!=', currentUserId));
    const querySnapshot = await getDocs(q);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  }
);

// Async thunk for fetching user's friends
export const fetchUserFriends = createAsyncThunk(
  'buddies/fetchUserFriends',
  async (userId) => {
    const friendsRef = collection(db, 'friends');
    const q = query(
      friendsRef, 
      where('status', '==', 'accepted'),
      where('participants', 'array-contains', userId)
    );
    const querySnapshot = await getDocs(q);
    const friends = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const friendId = data.participants.find(id => id !== userId);
      friends.push({ 
        id: doc.id, 
        friendId,
        ...data 
      });
    });
    return friends;
  }
);

// Async thunk for fetching friend requests
export const fetchFriendRequests = createAsyncThunk(
  'buddies/fetchFriendRequests',
  async (userId) => {
    const requestsRef = collection(db, 'friendRequests');
    const q = query(
      requestsRef, 
      where('toUserId', '==', userId),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);
    const requests = [];
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });
    return requests;
  }
);

// Async thunk for sending friend request
export const sendFriendRequest = createAsyncThunk(
  'buddies/sendFriendRequest',
  async ({ fromUserId, toUserId }) => {
    const requestsRef = collection(db, 'friendRequests');
    const newRequest = {
      fromUserId,
      toUserId,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const docRef = await addDoc(requestsRef, newRequest);
    return { id: docRef.id, ...newRequest };
  }
);

// Async thunk for accepting friend request
export const acceptFriendRequest = createAsyncThunk(
  'buddies/acceptFriendRequest',
  async ({ requestId, fromUserId, toUserId }) => {
    // Update request status
    const requestRef = doc(db, 'friendRequests', requestId);
    await updateDoc(requestRef, {
      status: 'accepted',
      updatedAt: serverTimestamp()
    });

    // Create friendship record
    const friendsRef = collection(db, 'friends');
    const friendship = {
      participants: [fromUserId, toUserId],
      status: 'accepted',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const friendDocRef = await addDoc(friendsRef, friendship);

    return { 
      requestId, 
      friendshipId: friendDocRef.id,
      friend: { id: fromUserId }
    };
  }
);

// Async thunk for rejecting friend request
export const rejectFriendRequest = createAsyncThunk(
  'buddies/rejectFriendRequest',
  async (requestId) => {
    const requestRef = doc(db, 'friendRequests', requestId);
    await updateDoc(requestRef, {
      status: 'rejected',
      updatedAt: serverTimestamp()
    });
    return requestId;
  }
);

// Async thunk for removing friend
export const removeFriend = createAsyncThunk(
  'buddies/removeFriend',
  async ({ userId, friendId, friendshipId }) => {
    // Delete friendship record
    const friendshipRef = doc(db, 'friends', friendshipId);
    await deleteDoc(friendshipRef);

    // Update any pending requests to rejected
    const requestsRef = collection(db, 'friendRequests');
    const q1 = query(
      requestsRef,
      where('fromUserId', '==', userId),
      where('status', '==', 'pending')
    );
    const q2 = query(
      requestsRef,
      where('toUserId', '==', userId),
      where('status', '==', 'pending')
    );
    const [querySnapshot1, querySnapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2)
    ]);
    const allDocs = [...querySnapshot1.docs, ...querySnapshot2.docs];
    const updatePromises = allDocs.map(doc => 
      updateDoc(doc.ref, { status: 'rejected', updatedAt: serverTimestamp() })
    );
    await Promise.all(updatePromises);

    return { friendId, friendshipId };
  }
);

const initialState = {
  allUsers: [],
  friends: [],
  friendRequests: [],
  pendingRequests: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

const buddySlice = createSlice({
  name: 'buddies',
  initialState,
  reducers: {
    // Set all users
    setAllUsers: (state, action) => {
      state.allUsers = action.payload;
    },
    
    // Add friend
    addFriend: (state, action) => {
      state.friends.push(action.payload);
    },
    
    // Remove friend
    removeFriendFromState: (state, action) => {
      state.friends = state.friends.filter(friend => friend.friendId !== action.payload);
    },
    
    // Add friend request
    addFriendRequest: (state, action) => {
      state.friendRequests.push(action.payload);
    },
    
    // Remove friend request
    removeFriendRequest: (state, action) => {
      state.friendRequests = state.friendRequests.filter(
        request => request.id !== action.payload
      );
    },
    
    // Set pending requests
    setPendingRequests: (state, action) => {
      state.pendingRequests = action.payload;
    },
    
    // Clear buddies data
    clearBuddies: (state) => {
      state.allUsers = [];
      state.friends = [];
      state.friendRequests = [];
      state.pendingRequests = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.allUsers = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchUserFriends.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserFriends.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.friends = action.payload;
      })
      .addCase(fetchUserFriends.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchFriendRequests.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFriendRequests.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.friendRequests = action.payload;
      })
      .addCase(fetchFriendRequests.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(sendFriendRequest.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Update user's friend request status
        const userIndex = state.allUsers.findIndex(user => user.uid === action.payload.toUserId);
        if (userIndex !== -1) {
          state.allUsers[userIndex].friendRequestSent = true;
        }
      })
      .addCase(sendFriendRequest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(acceptFriendRequest.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Remove from requests and add to friends
        state.friendRequests = state.friendRequests.filter(
          request => request.id !== action.payload.requestId
        );
        // Friend will be added when fetchUserFriends is called
      })
      .addCase(acceptFriendRequest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(rejectFriendRequest.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.friendRequests = state.friendRequests.filter(
          request => request.id !== action.payload
        );
      })
      .addCase(rejectFriendRequest.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(removeFriend.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(removeFriend.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.friends = state.friends.filter(friend => friend.friendId !== action.payload.friendId);
      })
      .addCase(removeFriend.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

// Export actions
export const { 
  setAllUsers, 
  addFriend, 
  removeFriendFromState, 
  addFriendRequest, 
  removeFriendRequest, 
  setPendingRequests, 
  clearBuddies 
} = buddySlice.actions;

// Export selectors
export const selectAllUsers = (state) => state.buddies.allUsers;
export const selectFriends = (state) => state.buddies.friends;
export const selectFriendRequests = (state) => state.buddies.friendRequests;
export const selectPendingRequests = (state) => state.buddies.pendingRequests;
export const selectBuddiesStatus = (state) => state.buddies.status;
export const selectBuddiesError = (state) => state.buddies.error;

// Export reducer
export default buddySlice.reducer;