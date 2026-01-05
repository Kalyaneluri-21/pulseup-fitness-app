import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, UserMinus, Users, UserCheck, UserX, MessageCircle } from 'lucide-react';
import Header from '../components/Header';
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
  selectConversations 
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

  // Theme-based styling
  const bgColor = theme === "light" ? "bg-gray-50" : "bg-gray-900";
  const cardBg = theme === "light" ? "bg-white" : "bg-gray-800";
  const textColor = theme === "light" ? "text-gray-900" : "text-gray-100";
  const borderColor = theme === "light" ? "border-gray-200" : "border-gray-700";

  // Load data on component mount
  useEffect(() => {
    if (user?.uid) {
      setLoading(true);
      Promise.all([
        dispatch(fetchAllUsers(user.uid)),
        dispatch(fetchUserFriends(user.uid)),
        dispatch(fetchFriendRequests(user.uid))
      ]).finally(() => setLoading(false));
    }
  }, [dispatch, user?.uid]);

  // Helper function to get user's friend status
  const getUserFriendStatus = (userId) => {
    // Check if they're already a friend
    const isFriend = friends.some(friend => friend.friendId === userId);
    if (isFriend) return 'friend';

    // Check if there's a pending request from them
    const hasRequestFromThem = friendRequests.some(request => request.fromUserId === userId);
    if (hasRequestFromThem) return 'request-received';

    // Check if we sent them a request
    const hasRequestToThem = friendRequests.some(request => request.toUserId === userId);
    if (hasRequestToThem) return 'request-sent';

    return 'none';
  };

  // Helper function to get friend request object
  const getFriendRequest = (userId) => {
    return friendRequests.find(request => 
      request.fromUserId === userId || request.toUserId === userId
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
      const welcomeMessage = `Talk to your new friend ${allUsers.find(u => u.uid === fromUserId)?.name || 'User'}! It will be an awesome experience! 🎉`;
      await dispatch(createConversation({
        participants: [user.uid, fromUserId],
        initialMessage: welcomeMessage
      })).unwrap();
      
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    }
  };

  // Handle rejecting friend request
  const handleRejectFriendRequest = async (requestId) => {
    try {
      await dispatch(rejectFriendRequest(requestId)).unwrap();
    } catch (error) {
      console.error('Failed to reject friend request:', error);
    }
  };

  // Handle removing friend
  const handleRemoveFriend = async (userId) => {
    if (!user?.uid) return;
    
    const friendship = getFriendship(userId);
    if (!friendship) return;
    
    try {
      await dispatch(removeFriend({ 
        userId: user.uid, 
        friendId: userId,
        friendshipId: friendship.id
      })).unwrap();
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  };

  // Handle starting a conversation
  const handleStartConversation = async (friendId) => {
    if (!user?.uid) return;
    
    // Check if conversation already exists
    const existingConversation = conversations.find(conv => 
      conv.participants.includes(user.uid) && conv.participants.includes(friendId)
    );
    
    if (existingConversation) {
      // Navigate to existing conversation
      navigate(`/chat/${existingConversation.id}`);
    } else {
      // Create new conversation
      try {
        const result = await dispatch(createConversation({
          participants: [user.uid, friendId]
        })).unwrap();
        navigate(`/chat/${result.id}`);
      } catch (error) {
        console.error('Failed to create conversation:', error);
      }
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
            <div className="text-lg">Loading fitness buddies...</div>
          </div>
        )}

        {/* Users Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((userItem) => {
              const friendStatus = getUserFriendStatus(userItem.uid);
              const friendRequest = getFriendRequest(userItem.uid);
              const friendship = getFriendship(userItem.uid);
              
              return (
                <div key={userItem.uid} className={`${cardBg} rounded-lg shadow-lg ${borderColor} border overflow-hidden transition hover:shadow-xl`}>
                  {/* User Header */}
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={userItem.profilePicture || `https://ui-avatars.com/api/?name=${userItem.name}&background=random&size=64`}
                        alt={userItem.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{userItem.name || 'Anonymous User'}</h3>
                        <p className={`text-sm ${theme === "light" ? "text-gray-600" : "text-gray-400"}`}>
                          {userItem.email}
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    {userItem.bio && (
                      <p className={`text-sm mb-4 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                        {userItem.bio}
                      </p>
                    )}

                    {/* Interests */}
                    {userItem.interests && userItem.interests.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-sm mb-2">Interests:</h4>
                        <div className="flex flex-wrap gap-2">
                          {userItem.interests.slice(0, 3).map((interest, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {interest}
                            </span>
                          ))}
                          {userItem.interests.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{userItem.interests.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {friendStatus === 'friend' && (
                        <>
                          <button
                            onClick={() => handleStartConversation(userItem.uid)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Message
                          </button>
                          <button
                            onClick={() => handleRemoveFriend(userItem.uid)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                          >
                            <UserMinus className="w-4 h-4" />
                            Remove
                          </button>
                        </>
                      )}
                      
                      {friendStatus === 'request-received' && (
                        <>
                          <button
                            onClick={() => handleAcceptFriendRequest(friendRequest.id, userItem.uid)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                          >
                            <UserCheck className="w-4 h-4" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectFriendRequest(friendRequest.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                          >
                            <UserX className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}
                      
                      {friendStatus === 'request-sent' && (
                        <button
                          disabled
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                        >
                          <UserPlus className="w-4 h-4" />
                          Request Sent
                        </button>
                      )}
                      
                      {friendStatus === 'none' && (
                        <button
                          onClick={() => handleSendFriendRequest(userItem.uid)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                        >
                          <UserPlus className="w-4 h-4" />
                          Add Friend
                        </button>
                      )}
                    </div>
                  </div>
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