var mongoose = require('mongoose');

// hello
var Schema = mongoose.Schema;

var ScoreSchema = new Schema();
ScoreSchema.add({
    point: {
        type: Number,
        required: true
    }
    
})


//Export model
module.exports = mongoose.model('Score', BookSchema);