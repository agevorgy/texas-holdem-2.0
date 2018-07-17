var mongoose = require('mongoose');
var shortid = require('shortid');

var userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    card: {
        type: String,
        enum: [null, '1', '2', '3', '5', '8', '13', '?']
    },
    role: {
        type: String,
        enum: ['Participant', 'Observer']
    }
})

var sessionSchema = new mongoose.Schema({
    id: {
        type: String,
        'default': shortid.generate
    },
    users: [userSchema]
})

//Export model
module.exports = mongoose.model('Session', sessionSchema);
module.exports = mongoose.model('User', userSchema);