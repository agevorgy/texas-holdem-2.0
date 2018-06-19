var mongoose = require('mongoose');

/* 
var scoreSchema = new mongoose.Schema({ 
    
})
*/

var userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    score: {
        type: String,
        enum: ['1', '2', '3', '5', '8', '13', '?']
    },
    kind: {
        type: String,
        enum: ['Participant', 'Observer']
    }
})

var sessionSchema = new mongoose.Schema({
    users: [userSchema]
})

//Export model
module.exports = mongoose.model('Session', sessionSchema);