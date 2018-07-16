require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');

var app = express();
var port = process.env.PORT || 3005;
var database = process.env.DATABASE;

var routes = require('./routes');

var server = app.listen(port);
var io = require('socket.io').listen(server);
var ioEvents = require('./socket');
// Socket middleware
ioEvents(io);

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

module.exports = app;