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

// EDIT form
// camplist/:id/comments/:comment_id/edit

router.get("/:comment_id/edit", checkOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if (err){
            console.log(err);
            res.redirect("back");
        } else {
            res.render("comments/edit", {camp_id:req.params.id, comment:foundComment});
        }
    })
})

// UPDATE 
router.put("/:comment_id",checkOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment,  function(err, updatedComment){
        if(err) {
            res.redirect("back");
        } else{
            res.redirect("/camplist/" + req.params.id);
        }
    })
})


//DESTROTY 
router.delete("/:comment_id", checkOwnership, function(req, res){
    Comment.findByIdAndDelete(req.params.comment_id, function(err){
        if (err){
            console.log(err);
            res.redirect("/camplist/" + req.params.id);
        }
        res.redirect("/camplist/" + req.params.id);
    })
});


//middleware 
// Authentication 
function isLogegdIn(req, res, next){  // next is the next thing that comes after middleware e.g. function(req, res)
    if (req.isAuthenticated()){
        return next(); // exec next thing 
    } 
    res.redirect("/login");
}

//Authorization 
function checkOwnership(req, res, next){
    // check if user is logged in
    if (req.isAuthenticated()){
        // find comment to check if the author id matches the user id 
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if (err){
                res.redirect("back");
            } else {
                // check if camp author id matches user id 
                if (foundComment.author.id.equals(req.user._id)){ // Note: author.is is an object, user._id is a string, so we can't use == or ===
                    next();
                } else {
                    res.redirect("back");
                }
            }
        })
    } else {
        res.redirect("back");
    }
}

module.exports = router;
