import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, UserMinus, Users, UserCheck, UserX, MessageCircle } from 'lucide-react';
import Header from '../components/Header';
import ProfileCard from '../components/ProfileCard';
import LoadingSpinner from '../components/LoadingSpinner';
import RocketLoader from '../components/RocketLoader';
import { 
  fetchAllUsers, 
  fetchUserFriends,
  fetchFriendRequests,
  sendFriendRequest, 
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend, 
  selectAllUsers, 
  selectFriends, 
  selectFriendRequests,
  selectBuddiesStatus 
} from '../features/BuddySlice';
import { 
  createConversation,
  selectConversations,
  fetchChatConversations
} from '../features/ChatSlice';

export default function Buddies() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useSelector((state) => state.theme.theme);
  const { user } = useSelector((state) => state.auth);
  
  // Redux state
  const allUsers = useSelector(selectAllUsers);
  const friends = useSelector(selectFriends);
  const friendRequests = useSelector(selectFriendRequests);
  const conversations = useSelector(selectConversations);
  const status = useSelector(selectBuddiesStatus);
  
  // Local state
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'friends' | 'requests'
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [removingFriend, setRemovingFriend] = useState(null);

  // Theme-based styling
  const bgColor = theme === "light" ? "bg-gradient-to-br from-[#caf0f8] via-[#e0f2fe] to-[#f0fdfa]" : "bg-[#0a0a0a]";
  const cardBg = theme === "light" ? "bg-[#f0fdfa]" : "bg-[#1a1a2e]";
  const textColor = theme === "light" ? "text-gray-900" : "text-gray-100";
  const borderColor = theme === "light" ? "border-[#90e0ef]" : "border-gray-600";

  // Load data on component mount
  useEffect(() => {
    if (user?.uid) {
      setLoading(true);
      Promise.all([
        dispatch(fetchAllUsers(user.uid)),
        dispatch(fetchUserFriends(user.uid)),
        dispatch(fetchFriendRequests(user.uid)),
        dispatch(fetchChatConversations(user.uid))
      ]).finally(() => setLoading(false));
    }
  }, [dispatch, user?.uid]);

  // Helper function to get user's friend status
  const getUserFriendStatus = (userId) => {
    // Check if they're already a friend
    const isFriend = friends.some(friend => friend.friendId === userId);
    if (isFriend) return 'friend';

    // Check if there's a pending request from them
    const hasRequestFromThem = friendRequests.some(request => 
      request.fromUserId === userId && request.type === 'received'
    );
    if (hasRequestFromThem) return 'request-received';

    // Check if we sent them a request
    const hasRequestToThem = friendRequests.some(request => 
      request.toUserId === userId && request.type === 'sent'
    );
    if (hasRequestToThem) return 'request-sent';

    return 'none';
  };

  // Helper function to get friend request object
  const getFriendRequest = (userId) => {
    return friendRequests.find(request => 
      (request.fromUserId === userId && request.type === 'received') ||
      (request.toUserId === userId && request.type === 'sent')
    );
  };



  // Helper function to get friendship object
  const getFriendship = (userId) => {
    return friends.find(friend => friend.friendId === userId);
  };

  // Filter users based on search term and active tab
  const filteredUsers = allUsers.filter(userItem => {
    const matchesSearch = userItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userItem.interests?.some(interest => 
                           interest.toLowerCase().includes(searchTerm.toLowerCase())
                         ) ||
                         userItem.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'friends') {
      return matchesSearch && getUserFriendStatus(userItem.uid) === 'friend';
    } else if (activeTab === 'requests') {
      return matchesSearch && getUserFriendStatus(userItem.uid) === 'request-received';
    }
    return matchesSearch;
  });

  // Handle sending friend request
  const handleSendFriendRequest = async (userId) => {
    if (!user?.uid) return;
    
    try {
      await dispatch(sendFriendRequest({ 
        fromUserId: user.uid, 
        toUserId: userId 
      })).unwrap();
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  // Handle accepting friend request
  const handleAcceptFriendRequest = async (requestId, fromUserId) => {
    if (!user?.uid) return;
    
    try {
      await dispatch(acceptFriendRequest({ 
        requestId, 
        fromUserId, 
        toUserId: user.uid 
      })).unwrap();
      
      // Create initial conversation with welcome message
      const friendName = allUsers.find(u => u.uid === fromUserId)?.name || 'User';
      const welcomeMessage = `Talk to your new friend ${friendName}! It will be an awesome experience! 🎉`;
      
      try {
        await dispatch(createConversation({
          participants: [user.uid, fromUserId],
          initialMessage: welcomeMessage
        })).unwrap();
      } catch (conversationError) {
        console.error('Failed to create welcome conversation:', conversationError);
      }
      
      // Refresh friends and requests to update UI immediately
      await Promise.all([
        dispatch(fetchUserFriends(user.uid)),
        dispatch(fetchFriendRequests(user.uid))
      ]);
      
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    }
  };

  // Handle rejecting friend request
  const handleRejectFriendRequest = async (requestId) => {
    try {
      await dispatch(rejectFriendRequest(requestId)).unwrap();
      // Refresh requests to update UI immediately
      if (user?.uid) {
        await dispatch(fetchFriendRequests(user.uid));
      }
    } catch (error) {
      console.error('Failed to reject friend request:', error);
    }
  };

  // Handle removing friend
  const handleRemoveFriend = async (userId) => {
    if (!user?.uid) {
      console.error('No user logged in');
      return;
    }
    
    if (removingFriend === userId) {
      console.log('Already removing this friend');
      return;
    }
    
    console.log('Attempting to remove friend:', userId);
    console.log('Current friends:', friends);
    
    const friendship = getFriendship(userId);
    console.log('Found friendship:', friendship);
    
    if (!friendship) {
      console.error('No friendship found for user:', userId);
      return;
    }
    
    setRemovingFriend(userId);
    
    try {
      console.log('Dispatching removeFriend with:', {
        userId: user.uid,
        friendId: userId,
        friendshipId: friendship.id
      });
      
      const result = await dispatch(removeFriend({ 
        userId: user.uid, 
        friendId: userId,
        friendshipId: friendship.id
      })).unwrap();
      
      console.log('Remove friend successful:', result);
      
      // Refresh all data to update UI immediately
      await Promise.all([
        dispatch(fetchAllUsers(user.uid)),
        dispatch(fetchUserFriends(user.uid)),
        dispatch(fetchFriendRequests(user.uid))
      ]);
      
      console.log('Data refresh completed');
    } catch (error) {
      console.error('Failed to remove friend:', error);
      console.error('Error details:', {
        userId,
        friendship,
        currentUser: user.uid
      });
    } finally {
      setRemovingFriend(null);
    }
  };

  // Handle starting a conversation
  const handleStartConversation = async (friendId) => {
    if (!user?.uid) return;
    
    try {
      // Check if conversation already exists
      const existingConversation = conversations.find(conv => 
        conv.participants.includes(user.uid) && conv.participants.includes(friendId)
      );
      
      if (existingConversation) {
        // Navigate to existing conversation
        navigate(`/chat/${existingConversation.id}`);
      } else {
        // Create new conversation
        const result = await dispatch(createConversation({
          participants: [user.uid, friendId]
        })).unwrap();
        navigate(`/chat/${result.id}`);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} transition-colors duration-300`}>
      <Header />
      
      <main className="p-3 sm:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition hover:scale-105 shadow-md text-white"
            style={{
              background: theme === "light"
                ? "linear-gradient(90deg, #6B54D3, #8C77E7)"
                : "linear-gradient(90deg, #3CB14A, #2A6A28)",
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">Fitness Buddies</h1>
        </div>

        {/* Search Bar */}
        <div className={`mb-6 ${cardBg} p-4 rounded-lg shadow-lg ${borderColor} border`}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, or interests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full p-3 pl-10 rounded-lg border ${theme === "light" ? "border-gray-300" : "border-gray-600"} ${theme === "light" ? "bg-white" : "bg-gray-700"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <Users className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Tabs */}
        <div className={`mb-6 ${cardBg} p-2 rounded-lg shadow-lg ${borderColor} border`}>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 px-4 rounded-md transition ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : `${theme === "light" ? "text-gray-600 hover:bg-gray-100" : "text-gray-300 hover:bg-gray-700"}`
              }`}
            >
              All Users ({allUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 py-2 px-4 rounded-md transition ${
                activeTab === 'friends'
                  ? 'bg-green-600 text-white'
                  : `${theme === "light" ? "text-gray-600 hover:bg-gray-100" : "text-gray-300 hover:bg-gray-700"}`
              }`}
            >
              Friends ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-2 px-4 rounded-md transition ${
                activeTab === 'requests'
                  ? 'bg-orange-600 text-white'
                  : `${theme === "light" ? "text-gray-600 hover:bg-gray-100" : "text-gray-300 hover:bg-gray-700"}`
              }`}
            >
              Requests ({friendRequests.length})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <RocketLoader message="Loading fitness buddies..." variant="light" />
          </div>
        )}

        {/* Users Grid */}
                          {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <RocketLoader message="Loading users..." variant="light" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredUsers.map((userItem) => {
                        const friendStatus = getUserFriendStatus(userItem.uid);
                        const friendRequest = getFriendRequest(userItem.uid);
                        
                        return (
                          <div key={userItem.uid}>
                            <ProfileCard
                              user={{
                                ...userItem,
                                requestId: friendRequest?.id
                              }}
                              friendStatus={friendStatus}
                              onMessage={handleStartConversation}
                              onAddFriend={handleSendFriendRequest}
                              onRemoveFriend={handleRemoveFriend}
                              onAcceptRequest={handleAcceptFriendRequest}
                              onRejectRequest={handleRejectFriendRequest}
                              removingFriend={removingFriend}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

        {/* Empty State */}
        {!loading && filteredUsers.length === 0 && (
          <div className={`text-center py-20 ${cardBg} rounded-lg shadow-lg ${borderColor} border`}>
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No users found</h3>
            <p className={`${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
              {searchTerm ? 'Try adjusting your search terms.' : 'No users available at the moment.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}