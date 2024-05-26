import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from './UserContext';

function Navbar() {
  const { user } = useContext(UserContext);

  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/register">Register</Link></li>
        <li><Link to="/calendar">Calendar</Link></li>
        {user && user.nickname === 'admin' && (
          <li><Link to="/admin">Admin Panel</Link></li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
