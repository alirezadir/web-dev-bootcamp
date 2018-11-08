var mongoose = require("mongoose");
// Camp Schema in db  
var campSchema = new mongoose.Schema({
    name: String, 
    image: String,
    price: String, 
    desc: String, 
    location: String, 
    lat: Number, 
    lng: Number,
    createdAt: { type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User"
        }, 
        username:String
    }, 
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