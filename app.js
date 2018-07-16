require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');
var _ = require('lodash');

var app = express();
var port = process.env.PORT || 3005;
var database = process.env.DATABASE;

var routes = require('./routes');

var server = app.listen(port);
var io = require('socket.io').listen(server);

require('./models/schemas');
const Session = mongoose.model('Session');
const User = mongoose.model('User');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Handling CORS
app.use(cors());
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.send(200);
  }
  else {
    next();
  }
});

app.set('view engine', 'html');

app.get('/', (req, res) => res.status(200).send('Hello world!'));
app.use('/', routes);

mongoose.connect(database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('we are connected to mongoDB!');
});

app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
});

// Returns positive int if user exists
function userExists(userArray, id) {
  for (var i = 0; i < userArray.length; i++) {
    if (userArray[i].id == id) {
      return i;
    }
  }
  return -1;
}

// Keeping track of users for web sockets
let allUsers = {};

// Sockets
io.on('connection', (socket) => {

  // Join session
  socket.on('join', (user) => {
    let currUser = {};
    let curr = {};

    Session.findOne( {id: user.sessionId}, (err, sessions) => {
      if (err) console.error(`Error joining session ${user.sessionId}: ${err}`);

      User.find({}, function (err, users) {
        if (err) console.error();
  
        // if user Id exists already (moderator), just update user role in BOTH user and session models
        if ((i = userExists(users, user.userId)) != -1) {
  
          users[i].role = user.role;
          sessions.users[userExists(sessions.users, user.userId)].role = user.role;
          
          sessions.save((err) => {
            if (err) console.error(`Error updating user role in session: ${err}`);
          }) 
  
          users[i].save((err) => {
            if (err) console.error(`Error updating user role: ${err}`);
          })

          currUser = {"moderator": true, "name": user.name, "role": user.role};
          curr[user.userId] = currUser;

          if (user.sessionId in allUsers) {
            _.merge(allUsers[user.sessionId], curr);
          } else {
            allUsers[user.sessionId] = curr;   
          }

          socket.emit('user-joined', allUsers[user.sessionId]);
  
          // create new user and push user to session users
        } else {
          var newUser = new User({
            name: user.name,
            role: user.role
          });
  
          newUser.save(function (err) {
            if (err) console.error(`Error adding new user: ${err}`);
          })
  
          sessions.users.push(newUser);
  
          sessions.save(function (err) {
            if (err) console.error(`Error adding new user to session: ${err}`);
          });

          currUser = {"moderator": false, "name": user.name, "role": user.role};
          curr[newUser._id] = currUser;

          if (user.sessionId in allUsers) {
            _.merge(allUsers[user.sessionId], curr);
          } else {
            allUsers[user.sessionId] = curr;   
          }

          // Update current player
          socket.emit('user-joined', allUsers[user.sessionId]);
          // Update all players
          socket.broadcast.emit('user-joined', allUsers[user.sessionId]);
        }
      })
    }) 
  });

  socket.on('leave', (data) => {
    // remove from user database
    User.deleteOne({ _id: data.userId }, (err) => {
      if (err) console.error(err);
    });
    // remove from session
    // Session.findOne( { id: data.sessionId }, (err, sessions) => {

    // })

  })
  
  socket.on('disconnect', function () {
    console.log('client disconnect...')
  })
})

module.exports = app;