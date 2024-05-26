const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const session = require('express-session');
const app = express();
const port = 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(bodyParser.json());
app.use(session({
  secret: 'secretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

fs.readFile('users.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading users file:', err);
    return;
  }

  let users = data.split('\n').filter(line => line).map(line => JSON.parse(line));

  users = users.map(user => {
    if (!user.hasOwnProperty('balance')) {
      user.balance = 0;
    }
    if (!user.hasOwnProperty('rentedCars')) {
      user.rentedCars = [];
    }
    return user;
  });

  fs.writeFile('users.txt', users.map(u => JSON.stringify(u)).join('\n') + '\n', (err) => {
    if (err) {
      console.error('Error writing users file:', err);
    } else {
      console.log('Users updated successfully');
    }
  });
});

app.post('/api/register', (req, res) => {
  const { nickname, email, password, repeatPassword } = req.body;
  if (password !== repeatPassword) {
    return res.status(400).send('Passwords do not match');
  }

  fs.readFile('users.txt', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Server error');
    }

    const users = data.split('\n').filter(line => line).map(line => JSON.parse(line));
    const existingUser = users.find(user => user.nickname === nickname || user.email === email);

    if (existingUser) {
      return res.status(400).send('Nickname or email already exists');
    }

    const user = { nickname, email, password, balance: 0, rentedCars: [] };
    fs.appendFile('users.txt', JSON.stringify(user) + '\n', (err) => {
      if (err) {
        res.status(500).send('Server error');
      } else {
        req.session.user = { nickname: user.nickname };
        res.status(200).send('User registered successfully');
      }
    });
  });
});

app.post('/api/login', (req, res) => {
  const { nickname, password } = req.body;
  fs.readFile('users.txt', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Server error');
      return;
    }
    const users = data.split('\n').filter(line => line).map(line => JSON.parse(line));
    const user = users.find(u => u.nickname === nickname && u.password === password);
    if (user) {
      req.session.user = { nickname: user.nickname };
      res.status(200).send('User logged in successfully');
    } else {
      res.status(401).send('Invalid credentials');
    }
  });
});

app.get('/api/session', (req, res) => {
  if (req.session.user) {
    res.status(200).json(req.session.user);
  } else {
    res.status(401).send('No active session');
  }
});

app.get('/api/logout', (req, res) => {
  if (req.session.user) {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).send('Logout failed');
      }
      res.clearCookie('connect.sid');
      res.status(200).send('User logged out successfully');
    });
  } else {
    res.status(400).send('No active session to logout');
  }
});

app.post('/api/rent', (req, res) => {
  const { nickname, car, date, cost } = req.body;
  fs.readFile('users.txt', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Server error');
    }

    if (!nickname || !car || !date || !cost) {
      return res.status(400).send('Invalid input. Please provide valid values for all fields.');
    }

    let users = data.split('\n').filter(line => line).map(line => JSON.parse(line));
    const userIndex = users.findIndex(u => u.nickname === nickname);

    if (userIndex === -1) {
      return res.status(404).send('User not found');
    }

    if (cost < 0) {
      return res.status(400).send('Invalid cost');
    }

    if (users[userIndex].balance < cost) {
      return res.status(400).send('Insufficient balance');
    }

    if (users[userIndex].rentedCars.some(r => r.date === date)) {
      return res.status(400).send('Car already rented on this date');
    }

    if (users[userIndex].rentedCars.some(r => r.car === car)) {
      return res.status(400).send('Car already rented');
    }
 
    users[userIndex].balance -= parseInt(cost);
    users[userIndex].rentedCars.push({ car, date, cost });

    fs.writeFile('users.txt', users.map(u => JSON.stringify(u)).join('\n') + '\n', (err) => {
      if (err) {
        return res.status(500).send('Server error');
      }
      res.status(200).send('Car rented successfully');
    });
  });
});

app.post('/api/cancel', (req, res) => {
  const { nickname, date, refund } = req.body;
  fs.readFile('users.txt', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Server error');
    }

    let users = data.split('\n').filter(line => line).map(line => JSON.parse(line));
    const userIndex = users.findIndex(u => u.nickname === nickname);

    if (userIndex === -1) {
      return res.status(404).send('User not found');
    }

    if (refund < 0) {
      return res.status(400).send('Invalid refund');
    }

    const rentalIndex = users[userIndex].rentedCars.findIndex(r => r.date === date);

    if (rentalIndex === -1) {
      return res.status(400).send('Rental not found');
    }

    users[userIndex].balance += refund;
    users[userIndex].rentedCars.splice(rentalIndex, 1);

    fs.writeFile('users.txt', users.map(u => JSON.stringify(u)).join('\n') + '\n', (err) => {
      if (err) {
        return res.status(500).send('Server error');
      }
      res.status(200).send('Rental cancelled successfully');
    });
  });
});

app.get('/api/users', (req, res) => {
  if (!req.session.user || req.session.user.nickname !== 'admin') {
    return res.status(401).send('Unauthorized');
  }

  fs.readFile('users.txt', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Server error');
    }

    const users = data.split('\n').filter(line => line).map(line => JSON.parse(line));
    res.status(200).json(users);
  });
});

app.get('/api/getCurrUserData', (req, res) => {
  const { nickname } = req.query;
  if (!req.session.user || req.session.user.nickname !== nickname) {
    return res.status(401).send('Unauthorized');
  }
  fs.readFile('users.txt', 'utf8', (err, data) => {
    if (err) { 
      return res.status(500).send('Server error');
    }
    const users = data.split('\n').filter(line => line).map(line => JSON.parse(line));
    const user = users.find(u => u.nickname === req.session.user.nickname);
    res.status(200).json(user);
  });
});

app.post('/api/admin/updateBalance', (req, res) => {
  const { nickname, newBalance } = req.body;
  fs.readFile('users.txt', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Server error');
    }

    let users = data.split('\n').filter(line => line).map(line => JSON.parse(line));
    const userIndex = users.findIndex(u => u.nickname === nickname);

    if (userIndex === -1) {
      return res.status(404).send('User not found');
    }

    if (newBalance < 0) {
      return res.status(400).send('Invalid balance');
    }

    users[userIndex].balance = newBalance;
    
    fs.writeFile('users.txt', users.map(u => JSON.stringify(u)).join('\n') + '\n', (err) => {
      if (err) {
        return res.status(500).send('Server error');
      }
      res.status(200).send('Balance updated successfully');
    });
  });
});


app.post('/api/admin/renameUser', (req, res) => {
  const { nickname, newNickname } = req.body;
  fs.readFile('users.txt', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Server error');
    }

    let users = data.split('\n').filter(line => line).map(line => JSON.parse(line));
    const userIndex = users.findIndex(u => u.nickname === nickname);

    if (userIndex === -1) {
      return res.status(404).send('User not found');
    }

    users[userIndex].nickname = newNickname;

    fs.writeFile('users.txt', users.map(u => JSON.stringify(u)).join('\n') + '\n', (err) => {
      if (err) {
        return res.status(500).send('Server error');
      }
      res.status(200).send('Nickname updated successfully');
    });
  });
});

app.post('/api/admin/changePasswordByAdmin', (req, res) => {
  if (!req.session.user || req.session.user.nickname !== 'admin') {
    return res.status(401).send('Unauthorized');
  }
  const { nickname, newPassword } = req.body;

  fs.readFile('users.txt', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Server error');
    }

    let users = data.split('\n').filter(line => line).map(line => JSON.parse(line));
    const userIndex = users.findIndex(u => u.nickname === nickname);

    if (userIndex === -1) {
      return res.status(404).send('User not found');
    }
    users[userIndex].password = newPassword;
    fs.writeFile('users.txt', users.map(u => JSON.stringify(u)).join('\n') + '\n', (err) => {
      if (err) {
        return res.status(500).send('Server error');
      }
      res.status(200).send('Password updated successfully');
    });
  });  
})

app.post('/api/changePassword', (req, res) => {
  const { nickname, oldPassword, newPassword } = req.body;
  fs.readFile('users.txt', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Server error');
    }

    let users = data.split('\n').filter(line => line).map(line => JSON.parse(line));
    const userIndex = users.findIndex(u => u.nickname === nickname);
    if (userIndex === -1) {
      return res.status(404).send('User not found');
    }

    if (users[userIndex].password !== oldPassword) {
      return res.status(401).send('Wrong password');
    }

    users[userIndex].password = newPassword;  
    fs.writeFile('users.txt', users.map(u => JSON.stringify(u)).join('\n') + '\n', (err) => {
      if (err) {
        return res.status(500).send('Server error');
      }
      res.status(200).send('Password updated successfully');
    });
  });
});

app.post('/api/cancel', (req, res) => {
  const { nickname, date, refund } = req.body;
  fs.readFile('users.txt', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Server error');
    }

    let users = data.split('\n').filter(line => line).map(line => JSON.parse(line));
    const userIndex = users.findIndex(u => u.nickname === nickname);

    if (userIndex === -1) {
      return res.status(404).send('User not found');
    }

    if (refund < 0) {
      return res.status(400).send('Invalid refund');
    }

    const rentalIndex = users[userIndex].rentedCars.findIndex(r => r.date === date);

    if (rentalIndex === -1) {
      return res.status(400).send('Rental not found');
    }

    users[userIndex].balance += parseInt(refund);
    users[userIndex].rentedCars.splice(rentalIndex, 1);

    fs.writeFile('users.txt', users.map(u => JSON.stringify(u)).join('\n') + '\n', (err) => {
      if (err) {
        return res.status(500).send('Server error');
      }
      res.status(200).send('Rental cancelled successfully');
    });
  });
});

app.post('/api/admin/removeUser', (req, res) => {
  const { nickname } = req.body;

  fs.readFile('users.txt', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Server error');
    }

    let users = data.split('\n').filter(line => line).map(line => JSON.parse(line));
    users = users.filter(user => user.nickname !== nickname);

    fs.writeFile('users.txt', users.map(u => JSON.stringify(u)).join('\n') + '\n', (err) => {
      if (err) {
        return res.status(500).send('Server error');
      }
      res.status(200).send('User removed successfully');
    });
  });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
