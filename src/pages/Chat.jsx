import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  MessageCircle, 
  User, 
  MoreVertical,
  Search,
  Phone,
  Video
} from 'lucide-react';
import Header from '../components/Header';
import { 
  fetchChatConversations,
  fetchMessages,
  sendMessage,
  createConversation,
  markMessagesAsRead,
  selectConversations,
  selectCurrentConversation,
  selectMessages,
  selectChatStatus,
  setCurrentConversation,
  addMessage,
  updateConversation,
  addConversation,
  markMessagesAsReadLocal,
  setRealTimeListener,
  clearRealTimeListeners
} from '../features/ChatSlice';
import { 
  selectFriends 
} from '../features/BuddySlice';
import { onSnapshot, query, orderBy, limit, where, collection } from 'firebase/firestore';
import { db } from '../firebase';

export default function Chat() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const theme = useSelector((state) => state.theme.theme);
  const { user } = useSelector((state) => state.auth);
  
  // Redux state
  const conversations = useSelector(selectConversations);
  const currentConversation = useSelector(selectCurrentConversation);
  const messages = useSelector(selectMessages);
  const friends = useSelector(selectFriends);
  const status = useSelector(selectChatStatus);
  
  // Local state
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConversationList, setShowConversationList] = useState(true);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Theme-based styling
  const bgColor = theme === "light" ? "bg-gray-50" : "bg-gray-900";
  const cardBg = theme === "light" ? "bg-white" : "bg-gray-800";
  const textColor = theme === "light" ? "text-gray-900" : "text-gray-100";
  const borderColor = theme === "light" ? "border-gray-200" : "border-gray-700";

  // Load conversations on component mount
  useEffect(() => {
    if (user?.uid) {
      setLoading(true);
      dispatch(fetchChatConversations(user.uid))
        .finally(() => setLoading(false));
    }
  }, [dispatch, user?.uid]);

  // Set up real-time listeners for conversations
  useEffect(() => {
    if (!user?.uid) return;

    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef, 
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          dispatch(addConversation({ id: change.doc.id, ...change.doc.data() }));
        } else if (change.type === 'modified') {
          dispatch(updateConversation({ 
            conversationId: change.doc.id, 
            updates: change.doc.data() 
          }));
        }
      });
    });

    return () => unsubscribe();
  }, [dispatch, user?.uid]);

  // Set up real-time listener for current conversation messages
  useEffect(() => {
    if (!conversationId || !user?.uid) return;

    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          dispatch(addMessage({ 
            conversationId, 
            message: { id: change.doc.id, ...change.doc.data() } 
          }));
        }
      });
    });

    dispatch(setRealTimeListener({ conversationId, unsubscribe }));

    return () => unsubscribe();
  }, [dispatch, conversationId, user?.uid]);

  // Load messages for current conversation
  useEffect(() => {
    if (conversationId && user?.uid) {
      dispatch(fetchMessages({ conversationId }));
      dispatch(markMessagesAsRead({ conversationId, userId: user.uid }));
    }
  }, [dispatch, conversationId, user?.uid]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, conversationId]);

  // Clean up listeners on unmount
  useEffect(() => {
    return () => {
      dispatch(clearRealTimeListeners());
    };
  }, [dispatch]);

  // Handle sending message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || !user?.uid) return;

    try {
      await dispatch(sendMessage({
        conversationId,
        senderId: user.uid,
        content: newMessage.trim()
      })).unwrap();
      setNewMessage('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Handle starting new conversation
  const handleStartConversation = async (friendId) => {
    if (!user?.uid) return;

    try {
      const result = await dispatch(createConversation({
        participants: [user.uid, friendId]
      })).unwrap();
      navigate(`/chat/${result.id}`);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  // Get conversation participant info
  const getConversationParticipant = (conversation) => {
    if (!conversation || !user?.uid) return null;
    const participantId = conversation.participants.find(id => id !== user.uid);
    return friends.find(friend => friend.friendId === participantId);
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conversation => {
    const participant = getConversationParticipant(conversation);
    if (!participant) return false;
    
    return participant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           conversation.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Get current conversation participant
  const currentParticipant = currentConversation ? 
    getConversationParticipant(currentConversation) : null;

  // Get current conversation messages
  const currentMessages = conversationId ? messages[conversationId] || [] : [];

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} transition-colors duration-300`}>
      <Header />
      
      <main className="flex h-[calc(100vh-80px)]">
        {/* Conversation List */}
        <div className={`w-full md:w-80 ${cardBg} border-r ${borderColor} flex flex-col`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Messages</h2>
              <button
                onClick={() => navigate('/buddies')}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <User className="w-5 h-5" />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full p-2 pl-8 rounded-lg border ${theme === "light" ? "border-gray-300" : "border-gray-600"} ${theme === "light" ? "bg-white" : "bg-gray-700"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">Loading conversations...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No conversations found' : 'No conversations yet'}
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const participant = getConversationParticipant(conversation);
                if (!participant) return null;

                const isActive = conversation.id === conversationId;
                
                return (
                  <div
                    key={conversation.id}
                    onClick={() => navigate(`/chat/${conversation.id}`)}
                    className={`p-4 border-b ${borderColor} cursor-pointer transition ${
                      isActive ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={participant.profilePicture || `https://ui-avatars.com/api/?name=${participant.name}&background=random&size=40`}
                        alt={participant.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{participant.name}</h3>
                        <p className={`text-sm truncate ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                          {conversation.lastMessage}
                        </p>
                      </div>
                      {conversation.lastMessageAt && (
                        <span className="text-xs text-gray-500">
                          {new Date(conversation.lastMessageAt.toDate()).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {conversationId && currentParticipant ? (
            <>
              {/* Chat Header */}
              <div className={`p-4 border-b ${borderColor} ${cardBg} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('/chat')}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <img
                    src={currentParticipant.profilePicture || `https://ui-avatars.com/api/?name=${currentParticipant.name}&background=random&size=40`}
                    alt={currentParticipant.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{currentParticipant.name}</h3>
                    <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                      {currentParticipant.interests?.slice(0, 2).join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentMessages.map((message) => {
                  const isOwnMessage = message.senderId === user?.uid;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwnMessage
                            ? 'bg-blue-600 text-white'
                            : `${theme === "light" ? "bg-gray-200" : "bg-gray-700"}`
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        {message.timestamp && (
                          <p className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.timestamp.toDate()).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className={`p-4 border-t ${borderColor} ${cardBg}`}>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className={`flex-1 p-3 rounded-lg border ${theme === "light" ? "border-gray-300" : "border-gray-600"} ${theme === "light" ? "bg-white" : "bg-gray-700"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Welcome Screen */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Welcome to Messages</h3>
                <p className={`${theme === "light" ? "text-gray-600" : "text-gray-400"} mb-4`}>
                  Select a conversation to start messaging with your fitness buddies!
                </p>
                <button
                  onClick={() => navigate('/buddies')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Find Buddies
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}