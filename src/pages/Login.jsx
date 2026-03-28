import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import heroBg from '../assets/hero-bg.png';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'password') {
      login('admin');
      navigate('/admin');
    } else if (username === 'superadmin' && password === 'superpassword') {
      login('superadmin');
      navigate('/superadmin');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-page" style={{ backgroundImage: `url(${heroBg})` }}>
      <Navbar />
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">Admin Login</h2>
          <p className="login-subtitle">Sign in to access your dashboard</p>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <div className="login-field">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>
            <div className="login-field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            <button type="submit" className="login-btn">
              Login
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
