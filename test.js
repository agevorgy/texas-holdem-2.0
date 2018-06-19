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



var Chris = new User({
  name: 'Chris',
  _id: 'ajshdb',
  score: 5

});

Chris.save(function(err){
  if (err) throw err;

  console.log('User saved!!!')
});