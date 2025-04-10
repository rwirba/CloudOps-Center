import React from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate('/dashboard');
  };

  return (
    <div>
      <h2>Login to DevOps Control Tower</h2>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
