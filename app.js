require('dotenv').config();
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');
var shortid = require('shortid');
require('./models/session');

const Session = mongoose.model('Session');

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
db.once('open', function() {
  console.log('we are connected to mongoDB!');
});

app.get('/getUsers', function(req, res) {
  Session.find({}, function(err, sessions) {
    if (err) console.log(`Error getting users: ${err}`);

    return res.send(sessions);
  });
})

// Returns session ID and user ID (client wants both)
app.post('/api/create-session', function(req, res) { 
  var name = req.body.name;
  var userId = shortid.generate()
  
  var users = [];
  
  users.push({
    name: name,
    id: userId
  })

  var newSession = new Session ({
      users: users
  })
  
  newSession.save(function(err) {
    if (err) console.log(`Error creating new session: ${err}`);

    return res.json({
      _sessionId: newSession.id,
      _userId: userId});
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

app.put('/api/join-session/:id', function(req, res) { 
  var sessionId = req.params.id;
  var userRole = req.body.role;
  var name = req.body.name;
  var userId = req.body.userId;

  Session.findOne({id: sessionId}, function(err, sessions) {
    if (err) throw err;

    // if user Id exists already, just update user role (moderator)
    if ((i = userExists(sessions.users, userId)) != -1) {
      
      sessions.users[i].role = userRole;

      sessions.save(function (err) {
        if (err) console.log(`Error updating user role: ${err}`);

        return res.json({_userId: userId});
      })
  
    } else {
      userId = shortid.generate()

      sessions.users.push({
        id: userId,
        name: name,
        role: userRole
      });

      sessions.save(function(err) {
        if (err) console.log(`Error adding user to session: ${err}`);

        return res.json({_userId: userId});
      });
    }
  })
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});


module.exports = app;
