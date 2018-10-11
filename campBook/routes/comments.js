// ===================
// COMMENTS ROUTES
// ===================

var express = require("express");
var router  = express.Router({mergeParams: true}); // {mergeParams: true} required to get access to :id  in /camplist/:id/comments
var Camp = require("../models/camp");
var Comment = require("../models/comment");
var middleware = require("../middleware"); // this automatically requires index.js inside

// NEW 
router.get("/new", middleware.isLogegdIn, function(req, res) { // Note: this is in fact /camplist/:id/comments/new -> checkout app.js
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
router.post("/", middleware.isLogegdIn, function(req, res){
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
                 req.flash("success", "Successfully created comment.");
                 res.redirect("/camplist/" + foundCamp._id);
             }
          });
      }
   });
});

// EDIT form
// camplist/:id/comments/:comment_id/edit

router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if (err){
            console.log(err);
            req.flash("error", "Oops something went wrong.");
            res.redirect("back");
        } else {
            res.render("comments/edit", {camp_id:req.params.id, comment:foundComment});
        }
    })
})

// UPDATE 
router.put("/:comment_id",middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment,  function(err, updatedComment){
        if(err) {
            req.flash("error", "Oops something went wrong.");
            res.redirect("back");
        } else{
            req.flash("success", "Successfully updated the comment!");
            res.redirect("/camplist/" + req.params.id);
        }
    })
})


//DESTROTY 
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndDelete(req.params.comment_id, function(err){
        if (err){
            console.log(err);
            res.redirect("/camplist/" + req.params.id);
        }
        res.redirect("/camplist/" + req.params.id);
    })
});

module.exports = router;
