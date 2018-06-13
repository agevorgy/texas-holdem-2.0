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
  
UserSchema
.virtual('name')
.get(function () {
  return this.name;
});

// Virtual for user's URL
UserSchema
.virtual('url')
.get(function () {
  return '/user/' + this._id;
});

//Export model
module.exports = mongoose.model('user', UserSchema);