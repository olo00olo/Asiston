import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoginBar from './LoginBar';
import MainContent from './MainContent';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setIsLoggedIn(true);
    }

    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`; // Dodanie accessToken do nagłówków
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            const response = await axios.post('http://localhost:5124/refresh', { refreshToken });

            if (response.status === 200) {
              const { accessToken, refreshToken: newRefreshToken } = response.data;
              localStorage.setItem('accessToken', accessToken);
              localStorage.setItem('refreshToken', newRefreshToken);
              axios.defaults.headers['Authorization'] = `Bearer ${accessToken}`;

              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.error('Refresh token failed:', refreshError);
            handleLogout();
          }
        }
        return Promise.reject(error);
      }
    );
  }, []);

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5124/login',
        { email, password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        alert('Login successful');
        setIsLoggedIn(true);
        setErrorMessage('');
      }
    } catch (error) {
      setErrorMessage('Invalid email or password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
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
        {/* Zmienność w renderowaniu treści w zależności od stanu logowania */}
        {/* <MainContent3 isLoggedIn={isLoggedIn} /> */}
        {isLoggedIn ? <MainContent isLoggedIn={isLoggedIn} /> : <p>Please log in</p>}
      </div>
    </div>
  );
};

export default App;
