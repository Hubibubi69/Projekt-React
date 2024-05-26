import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({
    nickname: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3001/api/login', formData, { withCredentials: true })
      .then(response => {
        alert('User logged in successfully');
        window.location.href = '/';
      })
      .catch(error => {
        alert('Failed to login. Please check your credentials and try again');
        console.error('There was an error!', error);
      });
  };

  return (
    <div className="login">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nickname:
          <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Password:
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </label>
        <br />
        <button type="submit">Login</button>
      </form>
      <Link to="/changePassword">Forgot password?</Link>
    </div>
  );
}
export default Login;
