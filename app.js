require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
//require('./models/users');
require('./models/session');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

//const Users = mongoose.model('User');
const Session = mongoose.model('Session');

var app = express();
var port = process.env.PORT || 3005;

mongoose.connect(process.env.MONGODB, {
});
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});
const API = '/texas';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get(API, (req, res) => res.status(200).send('Hello world!'));
app.set('view engine', 'html');
// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));



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

app.post('/api/create-session', function(req, res) { 
  var name = req.body.name;
  var sessionID = Math.floor(Math.random() * 128);
  var userID = Math.floor(Math.random() * sessionID);
  
  var users = [];
  users.push({
    userID : userID,
    name: name
  })

  var newSession = new Session ({
      sessionID: sessionID,
      users: users
  })
  
  newSession.save(function(err) {
    if (err) throw err;

    return sessionID;
  })
}) 

module.exports = app;
