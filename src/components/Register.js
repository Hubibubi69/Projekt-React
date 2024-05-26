import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    password: '',
    repeatPassword: ''
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
    axios.post('http://localhost:3001/api/register', formData, { withCredentials: true })
      .then(response => {
        alert('User registered successfully');
        window.location.href = '/';
      })
      .catch(error => {
        alert('Failed to register. Please check your credentials and try again');
        console.error('There was an error!', error);
      });
  };

  return (
    <div className="register">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nickname:
          <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Email:
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Password:
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Repeat Password:
          <input type="password" name="repeatPassword" value={formData.repeatPassword} onChange={handleChange} required />
        </label>
        <br />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}


export default Register;
