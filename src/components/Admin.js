import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Admin() {
  const [users, setUsers] = useState([]);
  const [nickname, setNickname] = useState('');
  const [car, setCar] = useState('');
  const [date, setDate] = useState('');
  const [balance, setBalance] = useState(0);
  const [cost, setCost] = useState(0);
  const [newPassword, setNewPassword] = useState('');

useEffect(() => {
  axios.get('http://localhost:3001/api/users', { withCredentials: true })
    .then(response => {
      const usersWithRentedCars = response.data.map(user => ({
        ...user,
        rentedCars: user.rentedCars || [] 
      }));
      setUsers(usersWithRentedCars);
    })
    .catch(error => {
      console.error('Error fetching users', error);
    });
}, []);


  const handleAddCar = (nickname) => {
    axios.post('http://localhost:3001/api/rent', {
      nickname,
      car,
      date,
      cost: parseInt(cost)
    }, { withCredentials: true })
      .then(response => {
        alert('Car added successfully');
      })
      .catch(error => {
        console.error('Error adding car', error);
      });
        window.location.reload();
  };

  const handleRemoveCar = (nickname, date, cost) => {
  const refund = parseInt(cost); 
  axios.post('http://localhost:3001/api/cancel', {
    nickname,
    date,
    refund
  }, { withCredentials: true })
    .then(response => {
      alert('Car removed successfully');
    })
    .catch(error => {
      console.error('Error removing car', error);
    });
        window.location.reload();
};

  const handleRemoveUser = (nickname) => {
    axios.post('http://localhost:3001/api/admin/removeUser', {
      nickname
    }, { withCredentials: true })
      .then(response => {
        alert('User removed successfully');
        setUsers(users.filter(user => user.nickname !== nickname));
      })
      .catch(error => {
        console.error('Error removing user', error);
      });
    window.location.reload();
  };

  const handleChangePasswordByAdmin = (nickname) => {
    axios.post('http://localhost:3001/api/admin/changePasswordByAdmin', {
      nickname,
      newPassword
    }, { withCredentials: true })
      .then(response => {
        alert('Password changed successfully');
      })
      .catch(error => {
        console.error('Error changing password', error);
      });
    window.location.reload();
  };

  const handleUpdateBalance = (nickname, balance) => {
    axios.post('http://localhost:3001/api/admin/updateBalance', {
      nickname,
      newBalance: parseInt(balance)
    }, { withCredentials: true })
      .then(response => {
        alert('Balance updated successfully');
      })
      .catch(error => {
        console.error('Error updating balance', error);
      });
    window.location.reload();

  };

  const handleRenameUser = (oldNickname, newNickname) => {
    axios.post('http://localhost:3001/api/admin/renameUser', {
      nickname: oldNickname,
      newNickname
    }, { withCredentials: true })
      .then(response => {
        alert('User renamed successfully');
      })
      .catch(error => {
        console.error('Error renaming user', error);
      });
      window.location.reload();
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      <h3>Manage Users</h3>
      <ul>
        {users.map(user => (
          <li key={user.nickname}>
            {user.nickname} ({user.balance} balance)
            <input
              type="text"
              placeholder="New nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <button onClick={() => handleRenameUser(user.nickname, nickname)}>Rename</button>
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button onClick={() => handleChangePasswordByAdmin(user.nickname)}>Change Password</button>
            <button onClick={() => handleRemoveUser(user.nickname)}>Remove User</button>
            
            <input
              type="text"
              placeholder="Car"
              value={car}
              onChange={(e) => setCar(e.target.value)}
            />
            <input
              type="number"
              placeholder="Cost"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <button onClick={() => handleAddCar(user.nickname)}>Add Car</button>
            {user.rentedCars.map((rental, index) => (
                <div key={index}>
                    <span>{rental.car} - {rental.date} - {rental.cost} USD</span>
                    <button onClick={() => handleRemoveCar(user.nickname, rental.date, rental.cost)}>Remove Car</button>
                </div>
            ))}
            <input
              type="number"
              placeholder="Balance"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
            />
            <button onClick={() => handleUpdateBalance(user.nickname, balance)}>Update Balance</button>
          </li>
        ))}
      </ul>
    </div>
  );
}


export default Admin;
