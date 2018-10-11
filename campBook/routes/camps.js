// INDEX
var express = require("express");
var router  = express.Router();
var Camp = require("../models/camp");


router.get("/", function(req, res){  // NOTE: this is in fact /camplist
    console.log(req.user);
    // render form an array 
    // res.render("camplist.ejs", {camps:camps});
    Camp.find({}, function(err, allcamps){  // find output -> allcamps
        if (err){
            console.log("Error finding camps");
        } else{
            res.render("camps/index", {camps:allcamps});
        }
    });
});

// NEW 
router.get("/new", isLogegdIn, function(req, res){ // note: this is in fact /camplist/new
    res.render("camps/new")
});

// CREATE 
router.post("/", isLogegdIn, function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id, 
        username: req.user.username
    }
    var newCamp = {name: name, image: image, desc:desc, author:author};
    //res.redirect("/camplist");
    // push from db
    Camp.create(newCamp, function(err, newcamp){
        if (err){
            console.log("Error adding new camps");
        } else{
            console.log(newcamp);
            res.redirect("/camplist");
        }
    });
});

// SHOW
router.get("/:id", function(req, res){
    var id = req.params.id;
    //Camp.findById(id, function(err, foundCamp){
    // Comments in Camp are references to objects - using populate to dereference them here 
    Camp.findById(id).populate("comments").exec(function(err, foundCamp){
       if (err){
           console.log("couldnt find camp by id");
       } else {
           console.log(foundCamp);
           res.render("camps/show", {camp:foundCamp});
       }
    });
});



// EDIT 
// form to update the camp
router.get("/:id/edit", checkOwnership, function(req,res){
    Camp.findById(req.params.id, function(err, foundCamp){
        if (err){
            console.log(err);
            res.redirect("/camplist");
        } else {
            res.render("camps/edit", {camp: foundCamp});        
        }
    })
});

// UPDATE 
// put request route 
// redirect to show page 
router.put("/:id", checkOwnership, function(req, res){
    Camp.findByIdAndUpdate(req.params.id, req.body.camp, function(err, foundCamp){
        if (err){
            res.redirect("/camplist");
        } else{
            res.redirect("/camplist/" + req.params.id);
        }
        
    })
});

//DESTROTY 
router.delete("/:id", checkOwnership, function(req, res){
    Camp.findByIdAndDelete(req.params.id, function(err){
        if (err){
            console.log(err);
            res.redirect("/camplist");
        }
        res.redirect("/camplist");
    })
});

//middleware 
//Authentication 
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
        // find camp to check if the author id matches the user id 
        Camp.findById(req.params.id, function(err, foundCamp) {
            if (err){
                res.redirect("back");
            } else {
                // check if camp author id matches user id 
                if (foundCamp.author.id.equals(req.user._id)){ // Note: author.is is an object, user._id is a string, so we can't use == or ===
                                                           // note: 
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