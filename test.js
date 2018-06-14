#! /usr/bin/env node

console.log('This script populates some test users');
/*
// Get arguments passed on command line
var userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb://')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var User = require('./models/users')
var dotenv = require('dotenv').config();


var mongoose = require('mongoose');
//var mongoDB = userArgs[0];
/*
// Connect to MongoDB
mongoose.connect(process.env.MONGODB, {
});
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});
*/
mongoose.connect('mongodb://autointerns:autointern1@ds159110.mlab.com:59110/texas-hold-em');
mongoose.Promise = global.Promise;
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var users = []

function userCreate(name, score) {
  console.log("usercreate");
 
  userdetail = {name: name, score: score}
  
  var user = new User(userdetail);
       
  user.save(function (err) {
    console.log("saved");
    if (err) {
      cb(err, null)
      return
    }
    console.log('New user: ' + user);
    users.push(user)
    cb(null, user)
  });
}
function createUsers(cb) {
    async.parallel([
        function(callback) {
          console.log("hello!!");
          userCreate('Victoria', '1', callback);
        },
        function(callback) {
          userCreate('Ani', '3', callback);
        },
        ],
        // optional callback
        cb);
}

async.series([
    createUsers
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('BOOKInstances: ');
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});