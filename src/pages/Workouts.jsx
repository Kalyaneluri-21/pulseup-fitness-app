import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addWorkout, updateWorkout, deleteWorkout } from '../features/WorkoutSlice';
import RocketLoader from '../components/RocketLoader';

const Workouts = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { workouts, status } = useSelector((state) => state.workouts);
  
  const [showForm, setShowForm] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'strength',
    duration: '',
    exercises: [],
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingWorkout) {
      dispatch(updateWorkout({
        workoutId: editingWorkout.id,
        workoutData: formData
      }));
      setEditingWorkout(null);
    } else {
      dispatch(addWorkout({
        userId: user.uid,
        workoutData: formData
      }));
    }
    
    setFormData({
      name: '',
      type: 'strength',
      duration: '',
      exercises: [],
      notes: ''
    });
    setShowForm(false);
  };

  const handleEdit = (workout) => {
    setEditingWorkout(workout);
    setFormData({
      name: workout.name,
      type: workout.type,
      duration: workout.duration,
      exercises: workout.exercises || [],
      notes: workout.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = (workoutId) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      dispatch(deleteWorkout(workoutId));
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (status === 'loading') {
    return (
      <div className="workouts-container">
        <div className="loading">
          <RocketLoader message="Loading workouts..." variant="light" />
        </div>
      </div>
    );
  }

  return (
    <div className="workouts-container">
      <div className="workouts-header">
        <h1>My Workouts</h1>
        <button 
          className="add-workout-btn"
          onClick={() => setShowForm(true)}
        >
          Add New Workout
        </button>
      </div>

      {showForm && (
        <div className="workout-form-overlay">
          <div className="workout-form">
            <h2>{editingWorkout ? 'Edit Workout' : 'Add New Workout'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Workout Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Type:</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="strength">Strength Training</option>
                  <option value="cardio">Cardio</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Duration (minutes):</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Notes:</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="save-btn">
                  {editingWorkout ? 'Update Workout' : 'Save Workout'}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditingWorkout(null);
                    setFormData({
                      name: '',
                      type: 'strength',
                      duration: '',
                      exercises: [],
                      notes: ''
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="workouts-list">
        {workouts.length === 0 ? (
          <div className="no-workouts">
            <p>No workouts yet. Create your first workout to get started!</p>
          </div>
        ) : (
          workouts.map((workout) => (
            <div key={workout.id} className="workout-card">
              <div className="workout-header">
                <h3>{workout.name}</h3>
                <div className="workout-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(workout)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(workout.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="workout-details">
                <p><strong>Type:</strong> {workout.type}</p>
                <p><strong>Duration:</strong> {workout.duration} minutes</p>
                {workout.notes && (
                  <p><strong>Notes:</strong> {workout.notes}</p>
                )}
                <p><strong>Created:</strong> {new Date(workout.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .workouts-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          background: linear-gradient(135deg, #caf0f8 0%, #e0f2fe 50%, #f0fdfa 100%);
          min-height: 100vh;
        }
        
        .workouts-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        
        .add-workout-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }
        
        .workout-form-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .workout-form {
          background: white;
          padding: 30px;
          border-radius: 10px;
          width: 90%;
          max-width: 500px;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
        
        .save-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
        }
        
        .cancel-btn {
          background: #6c757d;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
        }
        
        .workouts-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .workout-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .workout-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .workout-actions {
          display: flex;
          gap: 10px;
        }
        
        .edit-btn {
          background: #ffc107;
          color: black;
          border: none;
          padding: 5px 10px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
        }
        
        .delete-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
        }
        
        .workout-details p {
          margin: 5px 0;
          font-size: 14px;
        }
        
        .no-workouts {
          text-align: center;
          padding: 40px;
          color: #666;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          font-size: 18px;
        }
      `}</style>
    </div>
  );
};

export default Workouts;