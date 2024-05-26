import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from './UserContext';

function Calendar() {
  const { user } = useContext(UserContext);
  const [currUser, setCurrUser] = useState({});
  const [rentals, setRentals] = useState([]);
  const [car, setCar] = useState('');
  const [date, setDate] = useState('');
  const [cost, setCost] = useState(0);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (user) {
      axios.get('http://localhost:3001/api/session', { withCredentials: true })
        .then(response => {
          setRentals(response.data.rentedCars || []);
          axios.get('http://localhost:3001/api/getCurrUserData', {
            params: { nickname: user.nickname },
            withCredentials: true
          })
            .then(response => {
              setCurrUser(response.data);
              setBalance(response.data.balance);
              setRentals(response.data.rentedCars || []);
            })
            .catch(error => {
              console.error('Error fetching user data', error);
              window.location.href = '/';
            });
        })
        .catch(error => {
          console.error('Error fetching rentals', error);
          window.location.href = '/';
        });
    }
    else {
      alert('You need to log in first');
      window.location.href = '/';
    }
  }, [user]);

  const handleRent = () => {
    axios.post('http://localhost:3001/api/rent', {
      nickname: user.nickname,
      car,
      date,
      cost: parseInt(cost)
    }, { withCredentials: true })
      .then(response => {
        alert('Car rented successfully');
        setRentals([...rentals, { car, date, cost }]);
      })
      .catch(error => {
        alert('Error renting a car');
        console.error('Error renting a car', error);
      });
      window.location.reload();
  };

  const handleCancel = (date, cost) => {
    axios.post('http://localhost:3001/api/cancel', {
      nickname: user.nickname,
      date,
      refund: parseInt(cost)
    }, { withCredentials: true })
      .then(response => {
        console.log(cost)
        alert('Rental cancelled successfully');
        setRentals(rentals.filter(r => r.date !== date));
      })
      .catch(error => {
        alert('Error cancelling rental');
        console.error('Error cancelling rental', error);
      });
      window.location.reload();
  };

  return (
    <div>
      <h2>Car Rental Calendar</h2>
      {currUser && currUser.rentedCars && (
        <>
          <h3>Your Rentals</h3>
          <ul>
            {currUser.rentedCars.map((rental, index) => (
              <li key={index}>
                {rental.car} on {rental.date} for {rental.cost} USD
                <button onClick={() => handleCancel(rental.date, rental.cost)}>Cancel</button>
              </li>
            ))}
          </ul>
        </>
      )}
      {currUser && (
        <>
          <h3>Rent a Car</h3>
          <p>Your balance: {balance}</p>
          <input
            type="text"
            placeholder="Car"
            value={car}
            onChange={(e) => setCar(e.target.value)}
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            type="number"
            placeholder="Cost"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />
          <button onClick={handleRent}>Rent</button>
        </>
      )}
    </div>
  );
}

export default Calendar;
