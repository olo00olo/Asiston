import React, { useState } from 'react';
import axios from 'axios';

const LoginBar = ({ 
  isLoggedIn, 
  onLogin, 
  onLogout,
  email, 
  setEmail, 
  password, 
  setPassword, 
  errorMessage 
}) => {
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Regex to validate email format
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  // Validate email
  const validateEmail = (email) => {
    return emailRegex.test(email);
  };

  // Validate password
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 6) {
      errors.push('Passwords must be at least 6 characters.');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Passwords must have at least one uppercase letter.');
    }
    if (!/\d/.test(password)) {
      errors.push('Passwords must have at least one digit.');
    }
    if (!/\W/.test(password)) {
      errors.push('Passwords must have at least one non-alphanumeric character.');
    }
    return errors;
  };

  // Handle register form submission
  const handleRegisterSubmit = async () => {
    setEmailError('');
    setPasswordError('');
    setRegistrationError('');

    // Validate email
    if (!validateEmail(newEmail)) {
      setEmailError('Invalid email address.');
      return;
    }

    // Validate password
    const passwordValidationErrors = validatePassword(newPassword);
    if (passwordValidationErrors.length > 0) {
      setPasswordError(passwordValidationErrors.join(' '));
      return;
    }

    if (newPassword !== confirmPassword) {
      setRegistrationError('Passwords do not match.');
      return;
    }

    // Prepare the data to be sent in the POST request
    const registrationData = {
      email: newEmail,
      password: newPassword,
    };

    try {
      // Send POST request to the backend
      const response = await axios.post('http://localhost:5124/register', registrationData);
      console.log('Registration successful:', response.data);

      // After successful registration, close the registration form
      setShowRegisterForm(false);
      setNewEmail('');
      setNewPassword('');
      setConfirmPassword('');
      setRegistrationError('');
    } catch (error) {
      console.error('Registration failed:', error);
      if (error.response) {
        // If status is 400 or 409, display an appropriate message
        if (error.response.status === 400 || error.response.status === 409) {
          setRegistrationError('Email is already registered.');
        } else {
          setRegistrationError('Registration failed. Please try again.');
        }
      } else {
        setRegistrationError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div style={{ background: '#ddd', padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
      {isLoggedIn ? (
        <button onClick={onLogout}>Logout</button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginRight: '10px', padding: '5px' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginRight: '10px', padding: '5px' }}
          />
          <button onClick={onLogin}>Login</button>

          <button onClick={() => setShowRegisterForm(true)}>Register</button>
        </div>
      )}

      {errorMessage && <p style={{ color: 'red', margin: 0 }}>{errorMessage}</p>}

      {showRegisterForm && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)', width: '300px' }}>
          <h3>Register</h3>
          <input
            type="email"
            placeholder="Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
          />
          {emailError && <p style={{ color: 'red', fontSize: '12px' }}>{emailError}</p>}

          <input
            type="password"
            placeholder="Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
          />

          {passwordError && <p style={{ color: 'red', fontSize: '12px' }}>{passwordError}</p>}
          {registrationError && <p style={{ color: 'red' }}>{registrationError}</p>}

          <button onClick={handleRegisterSubmit} style={{ marginRight: '10px' }}>Register</button>
          <button onClick={() => setShowRegisterForm(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default LoginBar;
