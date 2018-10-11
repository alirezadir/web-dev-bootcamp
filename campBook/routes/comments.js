// ===================
// COMMENTS ROUTES
// ===================

var express = require("express");
var router  = express.Router({mergeParams: true}); // {mergeParams: true} required to get access to :id  in /camplist/:id/comments
var Camp = require("../models/camp");
var Comment = require("../models/comment");

// NEW 
router.get("/new", isLogegdIn, function(req, res) { // Note: this is in fact /camplist/:id/comments/new -> checkout app.js
   var id = req.params.id;
   Camp.findById(id, function(err, foundCamp){
     if(err){
         console.log(err);
     }else{
         res.render("comments/new", {camp:foundCamp});
     }
   });
});


// CREATE 
router.post("/", isLogegdIn, function(req, res){
    // lookup camp with if 
    //cretae a new comment 
    // connect new comment to camp 
    // redirect to camp show
   var comment = req.body.comment; 
   Camp.findById(req.params.id, function(err, foundCamp) {
      if (err){
          console.log(err);
          res.redirect("/camplist");
      } else{ // create comment 
          Comment.create(req.body.comment, function(err, newComment){
             if (err){
                 console.log(err);
             } 
             else { 
                 // add username and id to the comment
                 console.log(req.user);
                 newComment.author.id = req.user._id;
                 newComment.author.username = req.user.username;
                 newComment.save();
                 // associate comment to the camp
                 foundCamp.comments.push(newComment);
                 foundCamp.save();
                 res.redirect("/camplist/" + foundCamp._id);
             }
          });
      }
   });
});

//middleware 
function isLogegdIn(req, res, next){  // next is the next thing that comes after middleware e.g. function(req, res)
    if (req.isAuthenticated()){
        return next(); // exec next thing 
    } 
    res.redirect("/login");
}

module.exports = router;