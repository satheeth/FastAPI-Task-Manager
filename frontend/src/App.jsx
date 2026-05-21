import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = 'https://fastapi-task-manager-hsk5.onrender.com';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [tasks, setTasks] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDesc, setEditTaskDesc] = useState('');

  // Fetch tasks when the token changes (i.e., user logs in)
  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        handleLogout(); // Token might be expired
      }
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        // OAuth2 expects Form Data for login
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Login failed');
        }

        const data = await response.json();
        setToken(data.access_token);
        localStorage.setItem('token', data.access_token);
      } else {
        // Registration expects standard JSON
        const response = await fetch(`${API_BASE_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Registration failed');
        }

        setIsLogin(true);
        setError('Registration successful! Please log in.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    setToken('');
    setTasks([]);
    localStorage.removeItem('token');
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTaskTitle, description: newTaskDesc, completed: false })
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks([...tasks, newTask]);
        setNewTaskTitle('');
        setNewTaskDesc('');
      }
    } catch (err) {
      console.error("Failed to create task", err);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ completed: !task.completed })
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(t => (t.id === task.id ? updatedTask : t)));
      }
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setTasks(tasks.filter(t => t.id !== taskId));
      }
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditTaskDesc(task.description || '');
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditTaskTitle('');
    setEditTaskDesc('');
  };

  const handleUpdateTask = async (e, task) => {
    e.preventDefault();
    if (!editTaskTitle.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: editTaskTitle, description: editTaskDesc, completed: task.completed })
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(t => (t.id === task.id ? updatedTask : t)));
        cancelEditing();
      }
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  // Render Login/Register Form if not authenticated
  if (!token) {
    return (
      <div className="auth-container">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleAuth}>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
        </form>
        <button className="link-btn" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </button>
      </div>
    );
  }

  // Filter the tasks based on the selected filter state
  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true; // 'all'
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  // Ensure we don't land on an empty out-of-bounds page after deletions
  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages > 0 ? totalPages : 1));
  const indexOfLastTask = safeCurrentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to the first page when changing filters
  };

  // Render Task Manager if authenticated
  return (
    <div className="app-container">
      <header>
        <h2>Task Manager</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>

      <div className="create-task-section">
        <form className="task-form" onSubmit={handleCreateTask}>
          <input type="text" placeholder="Task Title" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} required />
          <input type="text" placeholder="Description (optional)" value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} />
          <button type="submit">Add Task</button>
        </form>
      </div>

      <div className="filter-container">
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => handleFilterChange('all')}>All</button>
        <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => handleFilterChange('pending')}>Pending</button>
        <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => handleFilterChange('completed')}>Completed</button>
      </div>

      <ul className="task-list">
        {currentTasks.map(task => (
          <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
            {editingTaskId === task.id ? (
              <form className="edit-task-form" onSubmit={(e) => handleUpdateTask(e, task)}>
                <input type="text" placeholder="Task Title" value={editTaskTitle} onChange={(e) => setEditTaskTitle(e.target.value)} required />
                <input type="text" placeholder="Description (optional)" value={editTaskDesc} onChange={(e) => setEditTaskDesc(e.target.value)} />
                <div className="edit-actions">
                  <button type="submit" className="save-btn">Save</button>
                  <button type="button" className="cancel-btn" onClick={cancelEditing}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <div className="task-content">
                  <div className="checkbox-wrapper">
                    <input type="checkbox" checked={task.completed} onChange={() => handleToggleComplete(task)} />
                  </div>
                  <div className="task-details">
                    <div className="task-title-row">
                      <h3>{task.title}</h3>
                      <span className={`status-badge ${task.completed ? 'status-completed' : 'status-pending'}`}>
                        {task.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                    {task.description && <p>{task.description}</p>}
                  </div>
                </div>
                <div className="task-actions">
                  <button className="edit-btn" onClick={() => startEditing(task)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDeleteTask(task.id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
        {filteredTasks.length === 0 && (
          <p className="no-tasks">
            {tasks.length === 0 ? "No tasks yet. Create one above!" : "No tasks match your current filter."}
          </p>
        )}
      </ul>

      {totalPages > 1 && (
        <div className="pagination-container">
          <button
            className="page-btn"
            onClick={() => handlePageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            return (
              <button
                key={pageNumber}
                className={`page-btn ${safeCurrentPage === pageNumber ? 'active' : ''}`}
                onClick={() => handlePageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            className="page-btn"
            onClick={() => handlePageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default App;