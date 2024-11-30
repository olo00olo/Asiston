import React, { useState } from 'react';
import axios from 'axios';
import LoginBar from './LoginBar';
import MainContent from './MainContent';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5124/login',
        { email, password },
        { withCredentials: true }
      );
      
      if (response.status === 200) {
        setIsLoggedIn(true);
        setErrorMessage('');
      }
    } catch (error) {
      setErrorMessage('Invalid email or password');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div>
      <LoginBar
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onLogin={handleLogin}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        errorMessage={errorMessage}
      />
      <div style={{ padding: '20px' }}>
        <MainContent isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
};

export default App;
