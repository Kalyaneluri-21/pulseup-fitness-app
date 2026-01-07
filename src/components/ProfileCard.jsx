import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  User, 
  Settings, 
  LogOut, 
  Camera, 
  Edit3,
  Heart,
  MessageCircle,
  Users,
  UserMinus
} from 'lucide-react';

export default function ProfileCard({ user, onMessage, onAddFriend, onRemoveFriend, friendStatus, onAcceptRequest, onRejectRequest, removingFriend }) {
  const theme = useSelector((state) => state.theme.theme);
  const [showMenu, setShowMenu] = useState(false);
  
  const bgColor = theme === "light" ? "bg-white" : "bg-gray-800";
  const textColor = theme === "light" ? "text-gray-900" : "text-gray-100";
  const borderColor = theme === "light" ? "border-gray-200" : "border-gray-700";
  const cardBg = theme === "light" ? "bg-gray-50" : "bg-gray-900";

  const getActionButton = () => {
    switch (friendStatus) {
                   case 'friend':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => onMessage(user.uid)}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </button>
            <button
              onClick={() => onRemoveFriend(user.uid)}
              disabled={removingFriend === user.uid}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition ${
                removingFriend === user.uid 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gray-600 hover:bg-gray-700'
              } text-white`}
            >
              {removingFriend === user.uid ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <UserMinus className="w-4 h-4" />
              )}
              {removingFriend === user.uid ? 'Removing...' : 'Remove'}
            </button>
          </div>
        );
      case 'request-received':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => onAcceptRequest(user.requestId, user.uid)}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            >
              <Heart className="w-4 h-4" />
              Accept
            </button>
            <button
              onClick={() => onRejectRequest(user.requestId)}
                              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
            >
              <User className="w-4 h-4" />
              Decline
            </button>
          </div>
        );
      case 'request-sent':
        return (
          <button
            disabled
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gray-400 text-white rounded-lg cursor-not-allowed"
          >
            <User className="w-4 h-4" />
            Request Sent
          </button>
        );
      default:
        return (
          <button
            onClick={() => onAddFriend(user.uid)}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            <User className="w-4 h-4" />
            Add Friend
          </button>
        );
    }
  };

  return (
    <div className={`${bgColor} rounded-xl shadow-lg ${borderColor} border overflow-hidden transition-all duration-300 hover:shadow-xl`}>
      {/* Profile Header */}
      <div className="relative">
        {/* Cover Photo Placeholder */}
        <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500"></div>
        
        {/* Profile Picture */}
        <div className="absolute -bottom-12 left-6">
          <div className="relative">
                         <img
               src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=random&size=80`}
               alt={user.name || 'User'}
               className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
             />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

                      {/* Profile Info */}
        <div className="pt-16 pb-6 px-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h3>
              <p className="text-sm text-gray-600 mb-2">@{user.email?.split('@')[0] || 'user'}</p>
            </div>
          </div>

        {/* Interests */}
        {user.interests && user.interests.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Interests</h4>
            <div className="flex flex-wrap gap-2">
              {user.interests.slice(0, 4).map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                >
                  {interest}
                </span>
              ))}
              {user.interests.length > 4 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{user.interests.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {getActionButton()}
        </div>
      </div>
    </div>
  );
}