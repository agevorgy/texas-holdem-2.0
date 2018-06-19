require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var shortid = require('shortid');
//require('./models/users');
require('./models/session');

//const Users = mongoose.model('User');
const Session = mongoose.model('Session');

var app = express();
var port = process.env.PORT || 3005;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', (req, res) => res.status(200).send('Hello world!'));
app.set('view engine', 'html');


mongoose.connect('mongodb://localhost:27017/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('we are connected!');
});

app.get('/getUsers', function(req, res) {
  Session.find({}, function(err, sessions) {
    if (err) throw err;

    return res.send(sessions);
  })
})

app.post('/api/create-session', function(req, res) { 
  console.log("Creating session..");
  var name = req.body.name;
  
  var users = [];
  
  users.push({
    name: name,
    kind: 'Participant'
  })

  var newSession = new Session ({
      users: users
  })

  console.log(`New session object created: ${newSession}`)
  
  newSession.save(function(err) {
    console.log(`Saving new session...`)
    if (err) throw err;

    return res.json({_id: newSession._id});
    console.log('Saved');
  })
}) 

app.put('/api/join-session',function(req, res) { 
  console.log('joining session...');
  var sessionID = req.body._id;
  var userType = req.body.kind;
  var name = req.body.name;

  Session.findOne({_id: sessionID}, function(err, sessions) {
    if (err) throw err;
    sessions.users.push({
      name: name,
      kind: userType
    });

    sessions.save(function(err) {
      console.log(`Adding user to session...`)
      if (err) throw err;

      return res.json({_id: sessions.users[sessions.users.length - 1]});
      console.log('User joined session');
    });
  })
})



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.listen(port, () => console.log(`listening on port ${port}`));

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  //res.json('error');
});


module.exports = app;
