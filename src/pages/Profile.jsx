import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile, fetchUserProfile } from '../features/ProfileSlice';
import Header from '../components/Header';
import RocketLoader from '../components/RocketLoader';
import { ArrowLeft, Save, Edit } from 'lucide-react';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { profile, status } = useSelector((state) => state.profile);
  const theme = useSelector((state) => state.theme.theme);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    height: '',
    fitnessGoals: [],
    experienceLevel: 'beginner',
    interests: [],
    profilePicture: ''
  });

  // Load profile data when component mounts
  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchUserProfile(user.uid));
    }
  }, [dispatch, user?.uid]);

  // Update form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        age: profile.age || '',
        weight: profile.weight || '',
        height: profile.height || '',
        fitnessGoals: profile.fitnessGoals || [],
        experienceLevel: profile.experienceLevel || 'beginner',
        interests: profile.interests || [],
        profilePicture: profile.profilePicture || ''
      });
    }
  }, [profile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user?.uid) {
      dispatch(updateUserProfile({
        userId: user.uid,
        profileData: formData
      }));
      setIsEditing(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGoalChange = (index, value) => {
    const newGoals = [...formData.fitnessGoals];
    newGoals[index] = value;
    setFormData({
      ...formData,
      fitnessGoals: newGoals
    });
  };

  const addGoal = () => {
    setFormData({
      ...formData,
      fitnessGoals: [...formData.fitnessGoals, '']
    });
  };

  const removeGoal = (index) => {
    const newGoals = formData.fitnessGoals.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      fitnessGoals: newGoals
    });
  };

  const handleInterestChange = (interest) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];
    
    setFormData({
      ...formData,
      interests: newInterests
    });
  };

  if (status === 'loading') {
    return (
      <div className={`min-h-screen ${theme === 'light' ? 'bg-gradient-to-br from-[#caf0f8] via-[#e0f2fe] to-[#f0fdfa]' : 'bg-[#0a0a0a]'} transition-colors duration-300`}>
        <Header />
        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center py-20">
              <RocketLoader message="Loading profile..." variant="light" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-gradient-to-br from-[#caf0f8] via-[#e0f2fe] to-[#f0fdfa]' : 'bg-[#0a0a0a]'} transition-colors duration-300`}>
      <Header />
      
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition hover:scale-105 shadow-md text-white"
                             style={{
                 background: theme === "light"
                   ? "linear-gradient(90deg, #00b4d8, #48bfe3)"
                   : "linear-gradient(90deg, #3CB14A, #2A6A28)",
               }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

                     <div className={`rounded-xl ${theme === 'light' ? 'bg-[#f0fdfa]' : 'bg-[#1a1a2e]'} p-6 shadow-lg border ${theme === 'light' ? 'border-[#90e0ef]' : 'border-gray-600'}`}>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Profile</h1>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition hover:scale-105"
                                 style={{
                   background: theme === "light" ? "#caf0f8" : "#1a1a2e",
                   color: theme === "light" ? "#00b4d8" : "#4a9eff",
                 }}
              >
                <Edit className="w-4 h-4" />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full p-3 rounded-lg border ${
                          theme === 'light' ? 'bg-white border-gray-300' : 'bg-gray-700 border-gray-600'
                        } ${!isEditing ? 'opacity-50' : ''}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Age</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full p-3 rounded-lg border ${
                          theme === 'light' ? 'bg-white border-gray-300' : 'bg-gray-700 border-gray-600'
                        } ${!isEditing ? 'opacity-50' : ''}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full p-3 rounded-lg border ${
                          theme === 'light' ? 'bg-white border-gray-300' : 'bg-gray-700 border-gray-600'
                        } ${!isEditing ? 'opacity-50' : ''}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Height (cm)</label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full p-3 rounded-lg border ${
                          theme === 'light' ? 'bg-white border-gray-300' : 'bg-gray-700 border-gray-600'
                        } ${!isEditing ? 'opacity-50' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium mb-2">Experience Level</label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'light' ? 'bg-white border-gray-300' : 'bg-gray-700 border-gray-600'
                    } ${!isEditing ? 'opacity-50' : ''}`}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Fitness Goals */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Fitness Goals</h2>
                  {formData.fitnessGoals.map((goal, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={goal}
                        onChange={(e) => handleGoalChange(index, e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter your fitness goal"
                        className={`flex-1 p-3 rounded-lg border ${
                          theme === 'light' ? 'bg-white border-gray-300' : 'bg-gray-700 border-gray-600'
                        } ${!isEditing ? 'opacity-50' : ''}`}
                      />
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeGoal(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={addGoal}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Add Goal
                    </button>
                  )}
                </div>

                {/* Interests */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Fitness Interests</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Strength Training', 'Cardio', 'Yoga', 'Running', 'Cycling', 'Swimming', 'HIIT', 'Pilates', 'CrossFit'].map((interest) => (
                      <label key={interest} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.interests.includes(interest)}
                          onChange={() => handleInterestChange(interest)}
                          disabled={!isEditing}
                          className="rounded"
                        />
                        <span className="text-sm">{interest}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;



