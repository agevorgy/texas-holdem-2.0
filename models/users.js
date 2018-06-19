var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema();
UserSchema.add({
    name: {
        type: String,
        required: true,
    },
    score: {
      type: String,
      required: true,
      enum: ['1', '2', '3', '5', '8', '13', '?']
    }
  });

//Export model
module.exports = mongoose.model('User', UserSchema);