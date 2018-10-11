// INDEX
var express = require("express");
var router  = express.Router();
var Camp = require("../models/camp");
var middleware = require("../middleware"); // this automatically requires index.js inside


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
router.get("/new", middleware.isLogegdIn, function(req, res){ // note: this is in fact /camplist/new
    res.render("camps/new")
});

// CREATE 
router.post("/", middleware.isLogegdIn, function(req, res){
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id, 
        username: req.user.username
    }
    var newCamp = {name: name, price:price, image: image, desc:desc, author:author};
    //res.redirect("/camplist");
    // push from db
    Camp.create(newCamp, function(err, newcamp){
        if (err){
            console.log("Error adding new camps");
        } else{
            console.log(newcamp);
            req.flash("success", "Successfully created a camp.");
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
           req.flash("error", "Oops something went wrong.");
       } else {
           console.log(foundCamp);
           res.render("camps/show", {camp:foundCamp});
       }
    });
});

// EDIT 
// form to update the camp
router.get("/:id/edit", middleware.checkCampOwnership, function(req,res){
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
router.put("/:id", middleware.checkCampOwnership, function(req, res){
    Camp.findByIdAndUpdate(req.params.id, req.body.camp, function(err, foundCamp){
        if (err){
            req.flash("error", "Oops something went wrong.");
            res.redirect("/camplist");
        } else{
            req.flash("success", "Successfully updated the camp.");
            res.redirect("/camplist/" + req.params.id);
        }
    })
});

//DESTROTY 
router.delete("/:id", middleware.checkCampOwnership, function(req, res){
    Camp.findByIdAndDelete(req.params.id, function(err){
        if (err){
            console.log(err);
            res.redirect("/camplist");
        }
        req.flash("success", "Successfully deleted the camp.");
        res.redirect("/camplist");
    })
});

module.exports = router;