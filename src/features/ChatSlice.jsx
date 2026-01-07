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
  onSnapshot,
  serverTimestamp,
  limit 
} from 'firebase/firestore';
import { db } from '../firebase';

// Async thunk for fetching chat conversations
export const fetchChatConversations = createAsyncThunk(
  'chat/fetchChatConversations',
  async (userId) => {
    try {
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef, 
        where('participants', 'array-contains', userId)
      );
      const querySnapshot = await getDocs(q);
      const conversations = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        conversations.push({ 
          id: doc.id, 
          ...data,
          lastMessageAt: data.lastMessageAt || data.createdAt || new Date()
        });
      });
      
      // Sort conversations by lastMessageAt or createdAt
      conversations.sort((a, b) => {
        const aTime = a.lastMessageAt?.toDate ? a.lastMessageAt.toDate() : new Date(a.lastMessageAt);
        const bTime = b.lastMessageAt?.toDate ? b.lastMessageAt.toDate() : new Date(b.lastMessageAt);
        return bTime - aTime;
      });
      
      return conversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }
);

// Async thunk for fetching messages for a conversation
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ conversationId, limit = 50 }) => {
    try {
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      const q = query(
        messagesRef, 
        orderBy('timestamp', 'asc')
      );
      const querySnapshot = await getDocs(q);
      const messages = [];
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      return { conversationId, messages };
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }
);

// Async thunk for sending a message
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, senderId, content, type = 'text' }) => {
    try {
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      const newMessage = {
        senderId,
        content,
        type,
        timestamp: serverTimestamp(),
        read: false
      };
      const docRef = await addDoc(messagesRef, newMessage);

      // Update conversation's last message
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        lastMessage: content,
        lastMessageAt: serverTimestamp(),
        lastSenderId: senderId
      });

      return { id: docRef.id, ...newMessage };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
);

// Async thunk for creating a new conversation
export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async ({ participants, initialMessage = null }) => {
    try {
      const conversationsRef = collection(db, 'conversations');
      const newConversation = {
        participants,
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        lastMessage: initialMessage || 'Conversation started',
        lastSenderId: participants[0]
      };
      const docRef = await addDoc(conversationsRef, newConversation);

      // If there's an initial message, add it
      if (initialMessage) {
        const messagesRef = collection(db, 'conversations', docRef.id, 'messages');
        await addDoc(messagesRef, {
          senderId: participants[0],
          content: initialMessage,
          type: 'text',
          timestamp: serverTimestamp(),
          read: false
        });
      }

      return { id: docRef.id, ...newConversation };
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }
);

// Async thunk for marking messages as read
export const markMessagesAsRead = createAsyncThunk(
  'chat/markMessagesAsRead',
  async ({ conversationId, userId }) => {
    try {
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      const q = query(
        messagesRef, 
        where('senderId', '!=', userId),
        where('read', '==', false)
      );
      const querySnapshot = await getDocs(q);
      
      const updatePromises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, { read: true })
      );
      await Promise.all(updatePromises);

      return { conversationId, userId };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }
);

const initialState = {
  conversations: [],
  currentConversation: null,
  messages: {},
  unreadCount: 0,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  realTimeListeners: {}
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Set current conversation
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    
    // Add message to conversation (for real-time updates)
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      // Check if message already exists
      const exists = state.messages[conversationId].find(m => m.id === message.id);
      if (!exists) {
        state.messages[conversationId].push(message);
      }
    },
    
    // Update conversation (for real-time updates)
    updateConversation: (state, action) => {
      const { conversationId, updates } = action.payload;
      const index = state.conversations.findIndex(conv => conv.id === conversationId);
      if (index !== -1) {
        state.conversations[index] = { ...state.conversations[index], ...updates };
      }
    },
    
    // Add new conversation
    addConversation: (state, action) => {
      const exists = state.conversations.find(conv => conv.id === action.payload.id);
      if (!exists) {
        state.conversations.unshift(action.payload);
      }
    },
    
    // Mark messages as read locally
    markMessagesAsReadLocal: (state, action) => {
      const { conversationId, userId } = action.payload;
      if (state.messages[conversationId]) {
        state.messages[conversationId].forEach(message => {
          if (message.senderId !== userId) {
            message.read = true;
          }
        });
      }
    },
    
    // Set real-time listener
    setRealTimeListener: (state, action) => {
      const { conversationId, unsubscribe } = action.payload;
      // Clean up existing listener if any
      if (state.realTimeListeners[conversationId]) {
        state.realTimeListeners[conversationId]();
      }
      state.realTimeListeners[conversationId] = unsubscribe;
    },
    
    // Clear real-time listeners
    clearRealTimeListeners: (state) => {
      Object.values(state.realTimeListeners).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      state.realTimeListeners = {};
    },
    
    // Clear chat data
    clearChat: (state) => {
      state.conversations = [];
      state.currentConversation = null;
      state.messages = {};
      state.unreadCount = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatConversations.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchChatConversations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.conversations = action.payload;
      })
      .addCase(fetchChatConversations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messages[action.payload.conversationId] = action.payload.messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(sendMessage.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const conversationId = state.currentConversation?.id;
        if (conversationId && state.messages[conversationId]) {
          state.messages[conversationId].push(action.payload);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createConversation.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.conversations.unshift(action.payload);
        state.currentConversation = action.payload;
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(markMessagesAsRead.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Messages are already marked as read in the reducer
      })
      .addCase(markMessagesAsRead.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

// Export actions
export const { 
  setCurrentConversation, 
  addMessage, 
  updateConversation, 
  addConversation, 
  markMessagesAsReadLocal,
  setRealTimeListener,
  clearRealTimeListeners,
  clearChat 
} = chatSlice.actions;

// Export selectors
export const selectConversations = (state) => state.chat.conversations;
export const selectCurrentConversation = (state) => state.chat.currentConversation;
export const selectMessages = (state) => state.chat.messages;
export const selectUnreadCount = (state) => state.chat.unreadCount;
export const selectChatStatus = (state) => state.chat.status;
export const selectChatError = (state) => state.chat.error;

// Export reducer
export default chatSlice.reducer;