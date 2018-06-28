var mongoose = require('mongoose');

/* 
to choose fibonacci # or regular #s
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
    role: {
        type: String,
        enum: ['Participant', 'Observer']
    }
})

var sessionSchema = new mongoose.Schema({
    users: [userSchema]
})

//Export model
module.exports = mongoose.model('Session', sessionSchema);