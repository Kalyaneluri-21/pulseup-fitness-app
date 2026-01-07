import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  where,
  getDocs,
  doc,
  updateDoc,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import LoadingSpinner from "../components/LoadingSpinner";
import RocketLoader from "../components/RocketLoader";
import { fetchUserFriends } from "../features/BuddySlice";
import "./Chat.css";

const MESSAGES_PER_PAGE = 50;
const TYPING_TIMEOUT = 2000;

const Chat = () => {
  const { currentUser, userData, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const friends = useSelector((state) => state.buddies.friends);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Filter friends based on search query - define this before useEffect hooks
  const filteredFriends = useMemo(() => {
    if (!Array.isArray(friends)) return [];
    
    return friends.map(friend => {
      // Get friend data from the friendship record
      const friendData = friend.friendData;
      const friendId = friend.friendId || friend.id;
      
      // Use actual user data if available, otherwise fallback to ID
      const displayName = friendData?.name || friendData?.displayName || `@${friendId}`;
      const email = friendData?.email || friendId;
      const profilePicture = friendData?.profilePicture || null;
      
      return {
        id: friendId,
        email: email,
        name: displayName,
        profilePicture: profilePicture
      };
    }).filter(friend =>
      friend.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [friends, searchQuery]);

  // Fetch friends when component mounts
  useEffect(() => {
    if (currentUser?.uid) {
      dispatch(fetchUserFriends(currentUser.uid));
    }
  }, [currentUser?.uid, dispatch]);

  // Fetch available chat partners (friends)
  useEffect(() => {
    if (!currentUser) {
      console.log("No current user");
      setLoading(false);
      return;
    }

    // Check if friends array exists and has data
    if (!Array.isArray(friends) || friends.length === 0) {
      console.log("Friends not loaded yet or empty, waiting...");
      return;
    }

    // Only process if we haven't already set up partners
    if (selectedPartnerId) {
      return;
    }

    try {
      setLoading(true);
      console.log("Setting up chat partners:", friends.length);

      // Create partner structure with actual user data
      const partners = friends.map(friend => {
        const friendData = friend.friendData;
        const friendId = friend.friendId || friend.id;
        
        // Use actual user data if available, otherwise fallback to ID
        const displayName = friendData?.name || friendData?.displayName || `@${friendId}`;
        const email = friendData?.email || friendId;
        const profilePicture = friendData?.profilePicture || null;
        
        return {
          id: friendId,
          email: email,
          name: displayName,
          profilePicture: profilePicture
        };
      });

      console.log("Created partners:", partners);

      if (partners.length > 0) {
        // Auto-select the first friend
        setSelectedPartnerId(partners[0].id);
        setChatPartner(partners[0]);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error setting up chat partners:", error);
      setError("Failed to set up chat partners: " + error.message);
      setLoading(false);
    }
  }, [currentUser, friends, selectedPartnerId]);

  // Handle chat initialization
  useEffect(() => {
    if (!currentUser || !selectedPartnerId) {
      setLoading(false);
      return;
    }

    const findOrCreateChat = async () => {
      try {
        const chatsQuery = query(
          collection(db, "chats"),
          where("participants", "array-contains", currentUser.uid)
        );

        const chatsSnapshot = await getDocs(chatsQuery);
        let existingChat = null;

        chatsSnapshot.forEach((doc) => {
          const chatData = doc.data();
          if (chatData.participants.includes(selectedPartnerId)) {
            existingChat = { id: doc.id, ...chatData };
          }
        });

        if (existingChat) {
          setChatId(existingChat.id);
          // Find partner from the current friends array
          const partner = friends.find(friend => (friend.friendId || friend.id) === selectedPartnerId);
          if (partner) {
            const friendData = partner.friendData;
            const friendId = partner.friendId || partner.id;
            
            // Use actual user data if available, otherwise fallback to ID
            const displayName = friendData?.name || friendData?.displayName || `@${friendId}`;
            const email = friendData?.email || friendId;
            const profilePicture = friendData?.profilePicture || null;
            
            setChatPartner({
              id: friendId,
              email: email,
              name: displayName,
              profilePicture: profilePicture
            });
          }
        } else {
          const newChatRef = await addDoc(collection(db, "chats"), {
            participants: [currentUser.uid, selectedPartnerId],
            createdAt: Date.now(),
            lastMessageAt: Date.now(),
          });

          setChatId(newChatRef.id);
          // Find partner from the current friends array
          const partner = friends.find(friend => (friend.friendId || friend.id) === selectedPartnerId);
          if (partner) {
            const friendData = partner.friendData;
            const friendId = partner.friendId || partner.id;
            
            // Use actual user data if available, otherwise fallback to ID
            const displayName = friendData?.name || friendData?.displayName || `@${friendId}`;
            const email = friendData?.email || friendId;
            const profilePicture = friendData?.profilePicture || null;
            
            setChatPartner({
              id: friendId,
              email: email,
              name: displayName,
              profilePicture: profilePicture
            });
          }
        }
      } catch (error) {
        console.error("Error with chat:", error);
        setError("Failed to initialize chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    findOrCreateChat();
  }, [currentUser, selectedPartnerId, friends]);

  // Listen for messages and typing status
  useEffect(() => {
    if (!chatId || !currentUser) return;

    const messagesQuery = query(
      collection(db, "messages"),
      where("chatId", "==", chatId)
      // Removed orderBy and limit to avoid index requirements
    );

    const typingRef = doc(db, "chats", chatId);

    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => {
          // Handle both timestamp and regular date formats
          let timestampA, timestampB;
          
          if (a.createdAt && typeof a.createdAt === 'object' && a.createdAt.seconds) {
            timestampA = a.createdAt.seconds * 1000;
          } else if (a.createdAt) {
            timestampA = a.createdAt;
          } else {
            timestampA = 0;
          }
          
          if (b.createdAt && typeof b.createdAt === 'object' && b.createdAt.seconds) {
            timestampB = b.createdAt.seconds * 1000;
          } else if (b.createdAt) {
            timestampB = b.createdAt;
          } else {
            timestampB = 0;
          }
          
          return timestampA - timestampB;
        }); // Sort by timestamp

      setMessages(messagesData);

      // Calculate unread count
      const unreadMessages = messagesData.filter(
        (msg) => !msg.read && msg.senderId !== currentUser?.uid
      );
      const newUnreadCount = unreadMessages.length;
      setUnreadCount(newUnreadCount);

      // Show browser notification for new messages
      if (unreadMessages.length > 0) {
        const latestUnread = unreadMessages[unreadMessages.length - 1];
                 if (latestUnread && Notification.permission === "granted") {
           const senderName = latestUnread.senderName ? latestUnread.senderName.split("@")[0] : "Friend";
           new Notification(`New Message from ${senderName}`, {
            body: latestUnread.text,
            icon: "/logo.png",
            badge: "/logo.png",
            tag: "chat-notification",
            renotify: true,
          });
        }
      }
    });

    const unsubscribeTyping = onSnapshot(typingRef, (doc) => {
      const data = doc.data();
      if (data?.typing && data.typing !== currentUser?.uid) {
        setPartnerTyping(true);
      } else {
        setPartnerTyping(false);
      }
    });

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, [chatId, currentUser]);

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Handle typing indicator
  const handleTyping = async () => {
    if (!chatId || !currentUser) return;

    try {
      const typingRef = doc(db, "chats", chatId);
      await updateDoc(typingRef, { typing: currentUser.uid });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(async () => {
        await updateDoc(typingRef, { typing: null });
      }, TYPING_TIMEOUT);
    } catch (error) {
      console.error("Error updating typing status:", error);
    }
  };

  // Mark messages as read
  useEffect(() => {
    if (!chatId || !currentUser) return;

    const markMessagesAsRead = async () => {
      const unreadMessages = messages.filter(
        (msg) => !msg.read && msg.senderId !== currentUser.uid
      );

      for (const message of unreadMessages) {
        try {
          await updateDoc(doc(db, "messages", message.id), { read: true });
        } catch (error) {
          console.error("Error marking message as read:", error);
        }
      }
    };

    markMessagesAsRead();
  }, [messages, chatId, currentUser]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!currentUser || !chatId || !newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSendingMessage(true);

    try {
      const messageDoc = await addDoc(collection(db, "messages"), {
        chatId,
        senderId: currentUser.uid,
        senderName: currentUser.email,
        text: messageText,
        createdAt: Date.now(),
        read: false,
        delivered: false,
      });

      // Mark as delivered
      await updateDoc(doc(db, "messages", messageDoc.id), {
        delivered: true,
      });

      // Update chat's lastMessageAt
      await updateDoc(doc(db, "chats", chatId), {
        lastMessageAt: Date.now(),
      });

      setSendingMessage(false);
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
      setSendingMessage(false);
    }
  };



  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = {};
    messages.forEach(message => {
      // Handle both timestamp and regular date formats
      let timestamp;
      if (message.createdAt && typeof message.createdAt === 'object' && message.createdAt.seconds) {
        // Firebase Timestamp
        timestamp = message.createdAt.seconds * 1000;
      } else if (message.createdAt) {
        // Regular timestamp
        timestamp = message.createdAt;
      } else {
        timestamp = Date.now();
      }
      
      const date = new Date(timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  }, [messages]);

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#caf0f8] via-[#e0f2fe] to-[#f0fdfa] dark:bg-[#0a0a0a] transition-colors duration-300">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <RocketLoader message="Loading user..." variant="light" />
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Authentication Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please sign in to access the chat feature.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !Array.isArray(friends)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <RocketLoader 
            message={
              authLoading 
                ? "Loading user..." 
                : !Array.isArray(friends) 
                  ? "Loading friends..." 
                  : "Setting up chat..."
            }
            variant="light"
          />
        </div>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              No Friends Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Add some friends to start chatting! You can find and add friends in the Buddies section.
            </p>
            <button
              onClick={() => navigate('/buddies')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Go to Buddies
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#caf0f8] via-[#e0f2fe] to-[#f0fdfa] dark:bg-[#0a0a0a] transition-colors duration-300">
      <Header />
      
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Chat List */}
        <div className="w-80 bg-gradient-to-b from-[#f0fdfa] to-[#e0f2fe] dark:bg-[#1a1a2e] border-r border-[#90e0ef] dark:border-gray-600 flex flex-col">
          {/* Header */}
                      <div className="p-4 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Chats</h1>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
              </button>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search or start a new chat"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#90e0ef] dark:border-gray-600 rounded-lg bg-[#f0fdfa] dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

                     {/* Chat List */}
           <div className="flex-1 overflow-y-auto friend-list">
            {filteredFriends.map((friend) => (
                             <div
                 key={friend.id}
                 onClick={() => {
                   setSelectedPartnerId(friend.id);
                   setChatPartner(friend);
                 }}
                 className={`flex items-center p-3 hover:bg-[#e0f2fe] dark:hover:bg-gray-700 cursor-pointer transition-colors friend-item ${
                   selectedPartnerId === friend.id ? 'selected' : ''
                 }`}
               >
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mr-3">
                  {friend.profilePicture ? (
                    <img src={friend.profilePicture} alt={friend.name} className="w-12 h-12 rounded-full" />
                  ) : (
                    <span className="text-gray-600 dark:text-gray-400 font-semibold text-lg">
                      {friend.name ? friend.name.charAt(0).toUpperCase() : friend.email.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {friend.name || friend.email}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    Tap to start chatting
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Chat Area */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-[#caf0f8] via-[#e0f2fe] to-[#f0fdfa] dark:bg-[#0a0a0a]">
          {error && (
            <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 mx-4 mt-4 rounded">
              {error}
              <button
                onClick={() => setError(null)}
                className="float-right font-bold"
              >
                ×
              </button>
            </div>
          )}

          {!selectedPartnerId ? (
            // Welcome Screen
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📱</div>
                <h2 className="text-2xl font-bold mb-2 text-black dark:text-white">
                  Welcome to Chat
                </h2>
                <p className="text-black font-semibold dark:text-gray-400 mb-4">
                  Select a friend from the list to start chatting
                </p>
              </div>
            </div>
          ) : (
            // Active Chat
            <>
              {/* Chat Header */}
              <div className="bg-[#f0fdfa] dark:bg-[#1a1a2e] border-b border-[#90e0ef] dark:border-gray-600 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mr-3">
                      {chatPartner?.profilePicture ? (
                        <img src={chatPartner.profilePicture} alt={chatPartner.name} className="w-10 h-10 rounded-full" />
                      ) : (
                        <span className="text-gray-600 dark:text-gray-400 font-semibold">
                          {chatPartner?.name ? chatPartner.name.charAt(0).toUpperCase() : chatPartner?.email.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-black dark:text-white">
                        {chatPartner?.name || chatPartner?.email}
                      </h3>
                      <p className="text-sm text-black font-semibold dark:text-gray-400">
                        {partnerTyping ? '✍️ typing...' : '🟢 online'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-[#e0f2fe] dark:hover:bg-gray-600 rounded-full">
                      <svg className="w-5 h-5 text-black dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

                             {/* Messages Area */}
               <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-[#caf0f8] via-[#e0f2fe] to-[#f0fdfa] dark:bg-[#0a0a0a] chat-messages">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">💭</div>
                    <p className="text-black font-semibold dark:text-gray-400">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                      <div key={date}>
                        {/* Date Separator */}
                        <div className="flex justify-center mb-4">
                          <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-3 py-1 rounded-full">
                            {new Date(date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        
                        {/* Messages for this date */}
                        {dateMessages.map((message) => (
                    <div
                      key={message.id}
                            className={`flex ${
                              message.senderId === currentUser?.uid ? "justify-end" : "justify-start"
                            }`}
                    >
                                                   <div
                               className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg message-bubble ${
                                 message.senderId === currentUser?.uid
                                   ? "bg-green-500 text-white"
                                   : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm"
                               }`}
                             >
                              <p className="text-sm">{message.text}</p>
                              <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                                message.senderId === currentUser?.uid ? "text-green-100" : "text-gray-500"
                              }`}>
                                                                 <span>
                                   {(() => {
                                     let timestamp;
                                     if (message.createdAt && typeof message.createdAt === 'object' && message.createdAt.seconds) {
                                       // Firebase Timestamp
                                       timestamp = message.createdAt.seconds * 1000;
                                     } else if (message.createdAt) {
                                       // Regular timestamp
                                       timestamp = message.createdAt;
                                     } else {
                                       timestamp = Date.now();
                                     }
                                     return new Date(timestamp).toLocaleTimeString([], {
                                       hour: "2-digit",
                                       minute: "2-digit",
                                     });
                                   })()}
                                 </span>
                                {message.senderId === currentUser?.uid && (
                                                                   <span
                                   className={`message-status ${
                                     message.read
                                       ? "read"
                                       : message.delivered
                                       ? "delivered"
                                       : "sent"
                                   }`}
                                 >
                                    {message.read ? "✓✓" : message.delivered ? "✓" : "·"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                    
                    {partnerTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
                                                  <span className="text-sm text-black font-semibold dark:text-gray-400">
                          ✍️ typing<span className="dots">...</span>
                        </span>
                      </div>
                    </div>
                    )}
                    
                <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
                              <div className="bg-[#f0fdfa] dark:bg-[#1a1a2e] border-t border-[#90e0ef] dark:border-gray-600 p-4">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                     <input
                     type="text"
                     value={newMessage}
                     onChange={(e) => {
                       setNewMessage(e.target.value);
                       handleTyping();
                     }}
                     placeholder="Type a message..."
                     disabled={sendingMessage}
                     required
                                           className="flex-1 p-3 border border-[#90e0ef] dark:border-gray-600 rounded-full bg-[#f0fdfa] dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-transparent chat-input"
                   />
                  
                                     <button
                     type="submit"
                     disabled={sendingMessage || !newMessage.trim()}
                                           className="p-3 bg-gradient-to-r from-[#00b4d8] to-[#48bfe3] text-white rounded-full hover:from-[#0099cc] hover:to-[#3da8d4] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors send-button"
                   >
                    {sendingMessage ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;