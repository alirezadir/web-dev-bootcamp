var Camp = require("../models/camp");
var Comment = require("../models/comment");


var middlewareObj = {};
// Authentication 

middlewareObj.isLogegdIn = function(req, res, next){  // next is the next thing that comes after middleware e.g. function(req, res)
    if (req.isAuthenticated()){
        return next(); // exec next thing 
    } 
    req.flash("error", "You must log in first ..."); // Note: this should come before redirecting to next. 
    res.redirect("/login");
}

//Authorization 

middlewareObj.checkCampOwnership = function(req, res, next){
    // check if user is logged in
    if (req.isAuthenticated()){
        // find camp to check if the author id matches the user id 
        Camp.findById(req.params.id, function(err, foundCamp) {
            if (err){
                res.redirect("back");
            } else {
                // check if camp author id matches user id 
                if (foundCamp.author.id.equals(req.user._id) || req.user.isAdmin){ // Note: author.is is an object, user._id is a string, so we can't use == or ===
                                                           // note: 
                    next();
                } else {
                    req.flash("error", "Permission denied.");
                    res.redirect("back");
                }
            }
        })
    } else {
        req.flash("error", "You must log in first ...");
        res.redirect("back");
    }
}


middlewareObj.checkCommentOwnership = function (req, res, next){
    // check if user is logged in
    if (req.isAuthenticated()){
        // find comment to check if the author id matches the user id 
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if (err){
                res.redirect("back");
            } else {
                // check if camp author id matches user id 
                if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin){ // Note: author.is is an object, user._id is a string, so we can't use == or ===
                    next();
                } else {
                    req.flash("error", "Permission denied.");
                    res.redirect("back");
                }
            }
        })
    } else {
        req.flash("error", "You must log in first ...");
        res.redirect("back");
    }
}


module.exports = middlewareObj;