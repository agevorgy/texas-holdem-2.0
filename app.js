require('dotenv').config();
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');
require('./models/schemas');

const Session = mongoose.model('Session');
const User = mongoose.model('User');

var app = express();
var port = process.env.PORT || 3005;
var database = process.env.DATABASE;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.send(200);
  }
  else {
    next();
  }
});

app.get('/', (req, res) => res.status(200).send('Hello world!'));
app.set('view engine', 'html');

mongoose.connect(database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('we are connected to mongoDB!');
});

app.get('/getUsers', function (req, res) {
  Session.find({}, function (err, sessions) {
    if (err) console.error(`Error getting users: ${err}`);

    return res.send(sessions);
  });
})

// Returns session ID and user ID (client wants both)
app.post('/api/create-session', function (req, res) {

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

app.put('/api/join-session/:id', function (req, res) {
  var sessionId = req.params.id;
  var userRole = req.body.role;
  var name = req.body.name;
  var userId = req.body.userId;

  Session.findOne({ id: sessionId }, function (err, sessions) {
    if (err) console.error();

    User.find({}, function (err, users) {
      if (err) console.error();

      // if user Id exists already (moderator), just update user role
      if ((i = userExists(users, userId)) != -1) {

        users[i].role = userRole;

        users[i].save(function (err) {
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

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});


module.exports = app;
