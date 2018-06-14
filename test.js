#! /usr/bin/env node

console.log('This script populates some test users');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb://')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

var async = require('async')
var Users = require('./models/users')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var users = []


function userCreate(name, cb) {
  userdetail = {name:name}
//   if (d_birth != false) userdetail.date_of_birth = d_birth
//   if (d_death != false) userdetail.date_of_death = d_death
  
  var user = new Users(userdetail);
       
  user.save(function (err) {
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
          userCreate('Victoria', callback);
        },
        function(callback) {
          userCreate('Ani',callback);
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



