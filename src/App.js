import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Calendar from './components/Calendar';
import Navbar from './components/navbar';
import './App.css';
import { UserProvider } from './components/UserContext';
import ChangePassword from './components/ChangePassword';
import Admin from './components/Admin';

function App() {
  return (
    <UserProvider>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/admin" element={<Admin/>} />
        <Route path="/changePassword" element={<ChangePassword/>} />
      </Routes>
    </Router>
    </UserProvider>
  );
}

export default App;
