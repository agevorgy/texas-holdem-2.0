var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    userID: {
        type: Number
    },
    name: {
        type: String,
        required: true
    },
    score: {
      type: String,
      enum: ['1', '2', '3', '5', '8', '13', '?']
    }
})

var sessionSchema = new mongoose.Schema({
    sessionID: {
        type: Number
    },
    users: [userSchema]
})

//Export model
module.exports = mongoose.model('Session', sessionSchema);