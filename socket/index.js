require('../models/schemas');
var mongoose = require('mongoose');
const Session = mongoose.model('Session');
const User = mongoose.model('User');
var _ = require('lodash');

/**
 * Encapsulates all code for emitting and listening to socket events
 *
 */

let allUsers = {};

// Returns positive int if user exists
function userExists(userArray, id) {
  for (var i = 0; i < userArray.length; i++) {
    if (userArray[i].id == id) {
      return i;
    }
  }
  return -1;
}

var ioEvents = io => 
io.on('connection', (socket) => {
	// Join session event for moderator
	socket.on('join', (user) => {
	  let currUser = {};
	  let curr = {};
  
	  Session.findOne( {id: user.sessionId}, (err, sessions) => {
		if (err) console.error(`Error joining session ${user.sessionId}: ${err}`);
  
		User.find({}, function (err, users) {
			if (err) console.error(err);

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
		})
	  }) 
	});

	// join session event for non-moderators
	socket.on('join-new-user', (user) => {
		let currUser = {};
		let curr = {};
		  
		currUser = {"moderator": false, "name": user.name, "role": user.role};
		curr[user.userId] = currUser;

		if (user.sessionId in allUsers) {
			_.merge(allUsers[user.sessionId], curr);
		} else {
			allUsers[user.sessionId] = curr;   
		}
		// Update current player
		socket.emit('user-joined', allUsers[user.sessionId]);
		// Update all players
		socket.broadcast.emit('user-joined', allUsers[user.sessionId]);
	})
  
	// Leave session event
	socket.on('leave', (data) => {

	  User.deleteOne({ _id: data.user }, (err) => {
		if (err) console.error(err);
	  });
	  
	  Session.findOne( { id: data.session }, (err, sessions) => {
		if (err) console.error(err);
		
		sessions.users.splice(sessions.users.indexOf(data.user), 1);
		sessions.save();
	  })
	})
	
	// Disconnect event 
	socket.on('disconnect', function () {
	  console.log('client disconnect...')
	})
  })

module.exports = ioEvents;