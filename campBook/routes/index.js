var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Camp = require("../models/camp");


// ROOT
router.get("/", function(req, res){
    res.render("landing");
});


//==========
// AUTH ROUTES 
//============
// sign up form
router.get("/register", function(req, res) {
    res.render("register");
});
// sign up logic
router.post("/register", function(req, res) {
    var newUser = new User({
        username:req.body.username, 
        firstName: req.body.firstName, 
        lastName: req.body.lastName, 
        email: req.body.email, 
        avatar: req.body.avatar
    });  

    // eval(require('locus'));
    if (req.body.adminCode === process.env.ADMIN_CODE){
        newUser.isAdmin = true;
        console.log("user is an admin");
    } else {
        console.log("admin code is")
        console.log(req.body.adminCode);
    }
    User.register(newUser, req.body.password, function(err, user){ // user does not save password but a hashed version of pass through register method
       if (err){
           console.log(err);
           req.flash("error", err.message);
           return res.redirect("/register");
       } else {
           passport.authenticate("local")(req, res, function(){
              req.flash("success", "Welcome to CampBook " + user.username);
              res.redirect("/camplist"); 
           });
           
       }
    });
});

// log ing form
router.get("/login", function(req, res) {
    res.render("login");
});

// log in logic 
router.post("/login", passport.authenticate("local", { // passport.authenticate: middleware
    successRedirect: "/camplist", 
    failureRedirect: "/login", 
    failureFlash: true
}), function(req, res) {
});

// logout 
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Successfully logged out!");
    res.redirect("/camplist");
});


// USER PROFILE
router.get("/users/:id", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if (err){
            req.flash("error", "cannot find user ....");
            res.redirect("/");
        } else {
        console.log(foundUser)
        Camp.find().where('author.id').equals(foundUser._id).exec(function(err, foundCamps){
            if (err){
                req.flash("error", "cannot find camps ....");
                res.redirect("/");
            } 
            console.log("foundCamps")
            console.log(foundCamps)
            res.render("users/show", {user:foundUser, camps:foundCamps});
        });
        
        }
    });
});

module.exports = router;