import React, { useState } from 'react';
import axios from 'axios';

function ChangePassword() {
  const [formData, setFormData] = useState({
    nickname: '',
    oldPassword: '',
    newPassword: ''
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
    axios.post('http://localhost:3001/api/changePassword', formData, { withCredentials: true })
      .then(response => {
        alert('Password updated successfully');
        window.location.href = '/login';
      })
      .catch(error => {
        console.error('There was an error!', error);
        alert('Failed to update password. Please check your credentials and try again.');
      });
  };

  return (
    <div className="change-password">
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nickname:
          <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Old Password:
          <input type="password" name="oldPassword" value={formData.oldPassword} onChange={handleChange} required />
        </label>
        <br />
        <label>
          New Password:
          <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} required />
        </label>
        <br />
        <button type="submit">Change Password</button>
      </form>
    </div>
  );
}

export default ChangePassword;