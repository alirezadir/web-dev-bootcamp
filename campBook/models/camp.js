var mongoose = require("mongoose");
// Camp Schema in db  
var campSchema = new mongoose.Schema({
    name: String, 
    image: String, 
    desc: String, 
    comments: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});
// Camp model in db  
// var Camp = mongoose.model("Camp", campSchema);   
module.exports = mongoose.model("Camp", campSchema);

// mongo: show dbs -> use yelp_db -> show collections -> db.camps.find() [camps is plural of Camp name].