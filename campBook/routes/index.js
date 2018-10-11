var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");


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
    var newUser = new User({username:req.body.username});  // user does not save password but a hashed version of pass through register method
    User.register(newUser, req.body.password, function(err, user){
       if (err){
           console.log(err);
           return res.render("register");
       } else {
           passport.authenticate("local")(req, res, function(){
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
    failureRedirect: "/login"
}), function(req, res) {
});

// logout 
router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/camplist");
});

//middleware 
function isLogegdIn(req, res, next){  // next is the next thing that comes after middleware e.g. function(req, res)
    if (req.isAuthenticated()){
        return next(); // exec next thing 
    } 
    res.redirect("/login");
}

module.exports = router;