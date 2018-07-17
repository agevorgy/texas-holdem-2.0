var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

require('../models/schemas');

const Session = mongoose.model('Session');
const User = mongoose.model('User');

router.get('/getUsers', function (req, res) {
  Session.find({}, function (err, sessions) {
    if (err) console.error(`Error getting users: ${err}`);

    return res.send(sessions);
  });
});

// Create session
router.post('/api/create-session', function (req, res) {
  var newUser = new User({
    name: req.body.name
  })

  newUser.save(function (err) {
    if (err) console.error(`Error creating new user: ${err}`);
  })

  var users = [];
  users.push(newUser);

  var newSession = new Session({
    users: users
  })

  newSession.save(function (err) {
    if (err) console.error(`Error creating new session: ${err}`);

    return res.json({
      _sessionId: newSession.id,
      _userId: newUser._id
    });
  })
})

// Returns positive int if user exists
function userExists(userArray, id) {
  for (var i = 0; i < userArray.length; i++) {
    if (userArray[i].id == id) {
      return i;
    }
  }
  return -1;
}

// Join session
router.put('/api/join-session/:id', function (req, res) {
  var sessionId = req.params.id;
  var userRole = req.body.role;
  var name = req.body.name;
  var userId = req.body.userId;

  Session.findOne({ id: sessionId }, function (err, sessions) {
    if (err) console.error();

    User.find({}, function (err, users) {
      if (err) console.error();

      // if user Id exists already (moderator), just update user role in BOTH user and session models
      if ((i = userExists(users, userId)) != -1) {

        users[i].role = userRole;
        sessions.users[userExists(sessions.users, userId)].role = userRole;

        sessions.save((err) => {
          if (err) console.error(`Error updating user role in session: ${err}`);
        }) 

        users[i].save((err) => {
          if (err) console.error(`Error updating user role: ${err}`);

          return res.json({ _userId: userId })
        })

        // create new user and push user to session users
      } else {
        var newUser = new User({
          name: name,
          role: userRole
        })

        newUser.save(function (err) {
          if (err) console.error(`Error adding new user: ${err}`);
        })

        sessions.users.push(newUser);

        sessions.save(function (err) {
          if (err) console.error(`Error adding new user to session: ${err}`);

          return res.json({ _userId: newUser._id });
        });
      }
    })
  })
})

module.exports = router;
