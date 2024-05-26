import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from './UserContext';
import axios from 'axios';

function Home() {
  const { user, setUser } = useContext(UserContext);

  const handleLogout = () => {
    axios.get('http://localhost:3001/api/logout', { withCredentials: true })
      .then(response => {
        setUser(null);
        window.location.href = '/';
      })
      .catch(error => {
        console.error('Error logging out', error);
      });
  };

  return (
    <div className="home">
      <h1>Welcome to Car Rental Service</h1>
      {user ? <h1>Hello, {user.nickname}!</h1> : null}
      {user && user.nickname === 'admin' && (
        <Link to="/admin">Admin Panel</Link>
      )}
      {user && (
        <>
          <Link to="/calendar">View Booking Calendar</Link>
          <br />
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
      {!user && (
        <>
          <Link to="/register">Register</Link>
          <br />
          <Link to="/login">Login</Link>
        </>
      )}
    </div>
  );
}

export default Home;
