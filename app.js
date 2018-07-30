require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const createError = require('http-errors');

const app = express();
const port = process.env.PORT || 3005;
const database = process.env.MONGODB_URI;

const server = app.listen(port);
const io = require('socket.io').listen(server);
const ioEvents = require('./socket');
// Socket middleware
ioEvents(io);

const routes = require('./routes');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Handling CORS
app.use(cors());
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.send(200);
  } else {
    next();
  }
});

app.set('view engine', 'html');

app.get('/', (req, res) => res.status(200).send('Hello world!'));
app.use('/', routes);

mongoose.connect(database);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('we are connected to mongoDB!');
});

app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
});

module.exports = app;
