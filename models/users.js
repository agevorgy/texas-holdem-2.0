var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema();
UserSchema.add({
    name: {
        type: String,
        required: true
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