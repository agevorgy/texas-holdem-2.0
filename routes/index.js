const express = require('express');
const mongoose = require('mongoose');
require('../models/schemas');

const router = express.Router();
const Session = mongoose.model('Session');
const User = mongoose.model('User');

// Create session
router.post('/api/create-session', (req, res) => {
  const newUser = new User({
    name: req.body.name,
  });

  newUser.save((err) => {
    if (err) console.error(`Error creating new user: ${err}`);
  });

  const users = [];
  users.push(newUser);

  const newSession = new Session({
    users,
  });

  newSession.save((err) => {
    if (err) console.error(`Error creating new session: ${err}`);

    return res.json({
      sessionId: newSession.id,
      userId: newUser._id,
    });
  });
});

// Returns positive int if user exists
function userExists(userArray, id) {
  for (let i = 0; i < userArray.length; i += 1) {
    if (userArray[i].id === id) {
      return i;
    }
  }
  return -1;
}

// Join session
router.put('/api/join-session/:id', (req, res) => {
  const sessionId = req.params.id;
  // const userRole = req.body.role;
  const { userId, userRole, name } = req.body;
  // const name = req.body.name;
  // const userId = req.body.userId;

  Session.findOne({ id: sessionId }, (err, sessions) => {
    if (err) console.error();

    User.find({}, (error, users) => {
      if (error) console.error(error);

      // if moderator, just update user role in BOTH user and session models
      const i = userExists(users, userId);
      if (i !== -1) {
        users[i].role = userRole;
        sessions.users[userExists(sessions.users, userId)].role = userRole;

        sessions.save((errors) => {
          if (errors) console.error(`Error updating user role in session: ${errors}`);
        });

        users[i].save((errors) => {
          if (errors) console.error(`Error updating user role: ${errors}`);

          return res.json({ userId: userId });
        });

        // create new user and push user to session users
      } else {
        const newUser = new User({
          name,
          role: userRole,
        });

        newUser.save((errors) => {
          if (errors) console.error(`Error adding new user: ${errors}`);
        });

        sessions.users.push(newUser);

        sessions.save((errors) => {
          if (errors) console.error(`Error adding new user to session: ${errors}`);

          return res.json({ userId: newUser._id });
        });
      }
    });
  });
});

module.exports = router;
