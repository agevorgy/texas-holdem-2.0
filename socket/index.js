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
let allCards = {};

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
	  let curr = {};
  
	  Session.findOne( {id: user.sessionId}, (err, sessions) => {
		if (err) console.error(`Error joining session ${user.sessionId}: ${err}`);
  
		User.find({}, function (err, users) {
			if (err) console.error();
	
			i = userExists(users, user.userId);
			users[i].role = user.role;
			sessions.users[userExists(sessions.users, user.userId)].role = user.role;
			
			sessions.save((err) => {
			  if (err) console.error(`Error updating user role in session: ${err}`);
			}) 
	
			users[i].save((err) => {
			  if (err) console.error(`Error updating user role: ${err}`);
			})
  
			curr[user.userId] = {"moderator": true, "name": user.name, "role": user.role};
  
			if (user.sessionId in allUsers) {
			  _.merge(allUsers[user.sessionId], curr);
			} else {
			  allUsers[user.sessionId] = curr;   
			}
  
			socket.emit('user-joined', allUsers[user.sessionId]);
			socket.join(user.sessionId);
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

		socket.join(user.sessionId);
		// Update current player
		socket.emit('user-joined', allUsers[user.sessionId]);
		// Update all players
		socket.broadcast.to(user.sessionId).emit('user-joined', allUsers[user.sessionId]);
		//socket.broadcast.emit('user-joined', allUsers[user.sessionId]);
		// Check if any cards were selected before user joined
		socket.emit('watch-submit-card', allCards[user.sessionId]);
	})

	// Select card event
	socket.on('set-card', (data) => {
		let curr = {}

		Session.findOne( { id: data.session }, (err, session) => {
			if (err) console.error(err);

			User.find({}, function (err, users) {
				if (err) console.error();
		
				i = userExists(users, data.user);
				users[i].card = data.card;
				session.users[userExists(session.users, data.user)].card = data.card;
				
				session.save((err) => {
				  if (err) console.error(`Error updating user role in session: ${err}`);
				}) 
				users[i].save((err) => {
				  if (err) console.error(`Error updating user role: ${err}`);
				})

				// if user de-selects card
				if (data.card == null) {
					currSession = allCards[data.session]
					delete currSession[data.user]
				} else {
					curr[data.user] = {card: data.card}

					if (data.session in allCards) {
						_.merge(allCards[data.session], curr);
					} else {
						allCards[data.session] = curr;   
					}
				}
	  
				socket.emit('watch-submit-card', allCards[data.session]);
				socket.broadcast.to(data.session).emit('watch-submit-card', allCards[data.session]);
			})
		})
	})

	socket.on('set-cards-up', (sessionId) => {
		Session.findOne( { id: sessionId }, (err, session) => {
			if (err) console.error(err);

			if (session.state == null) {
				session.state = true
			} else if (session.state == false) {
				session.state = true
			} else {
				session.state = false
			}

			socket.emit('flip-cards', session.state);
			socket.broadcast.to(sessionId).emit('flip-cards', session.state);
		});
	});

	socket.on('reset-game', (sessionId) => {
		Session.findOne( { id: sessionId }, (err, session) => {
			if (err) console.error(err);

			session.state = null;
			delete allCards[sessionId]

			socket.emit('flip-cards', session.state);
			socket.broadcast.to(sessionId).emit('flip-cards', session.state);
			socket.emit('watch-submit-card', {});
			socket.broadcast.to(sessionId).emit('watch-submit-card', {});
		});
	})
  
	// Leave session event
	socket.on('leave', (data) => {
	  User.deleteOne({ _id: data.user }, (err) => {
		if (err) console.error(err);
	  });

	  Session.update( 
		  { id: data.session },
		  { $pull: { users : { _id : data.user } } },
		  { safe: true },
		  (err, obj)  => {});
		  
	 // Delete user from session
	  currSession = allUsers[data.session]
	  if (currSession && currSession[data.user]) {
	  	delete currSession[data.user]
	  }

	  // Delete user's card
	  curr = allCards[data.session]
	  delete curr[data.user]

	  socket.broadcast.to(data.session).emit('watch-submit-card', allCards[data.session]);
	  socket.leave(data.session);
	  socket.emit('user-joined', allUsers[data.session]);
	  // Update all players
	  socket.broadcast.to(data.session).emit('user-joined', allUsers[data.session]);
	})
	
	// Disconnect event 
	socket.on('disconnect', function () {
	  console.log('client disconnect...')
	})
  })

module.exports = ioEvents;