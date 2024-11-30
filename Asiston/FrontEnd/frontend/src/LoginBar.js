import React from 'react';

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
        </div>
      )}
      {errorMessage && <p style={{ color: 'red', margin: 0 }}>{errorMessage}</p>}
    </div>
  );
};

export default LoginBar;
