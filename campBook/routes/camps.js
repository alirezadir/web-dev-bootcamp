// INDEX
var express = require("express");
var router  = express.Router();
var Camp = require("../models/camp");
var middleware = require("../middleware"); // this automatically requires index.js inside
var NodeGeocoder = require('node-geocoder');
 
var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
  };
 
var geocoder = NodeGeocoder(options);
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

//CREATE - add new campground to DB
router.post("/", middleware.isLogegdIn, function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var price = req.body.price;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    console.log("req.body:") 
    console.log(req.body);
    geocoder.geocode(req.body.location, function (err, data) {
    
      if (err || !data.length) {
        req.flash('error', 'Invalid geo');
        console.log(err);
        return res.redirect('back');
      }
      var lat = data[0].latitude;
      var lng = data[0].longitude;
      var location = data[0].formattedAddress;
      var newCamp = {name: name, price:price, image: image, desc: desc, author:author, location: location, lat: lat, lng: lng};
      // Create a new campground and save to DB
      Camp.create(newCamp, function(err, newlyCreated){
          if(err){
              console.log(err);
          } else {
              //redirect back to campgrounds page
              console.log(newlyCreated);
              res.redirect("/camplist");
          }
      });
    });
  });

// NEW 
router.get("/new", middleware.isLogegdIn, function(req, res){ // note: this is in fact /camplist/new
    res.render("camps/new")
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

// UPDATE CAMPGROUND ROUTE

// // PUT - updates campground in the database
// router.put("/:id", isSafe, function(req, res){
//     geocoder.geocode(req.body.location, function (err, data) {
//       var lat = data.results[0].geometry.location.lat;
//       var lng = data.results[0].geometry.location.lng;
//       var location = data.results[0].formatted_address;
//       var newData = {name: req.body.name, image: req.body.image, description: req.body.description, cost: req.body.cost, location: location, lat: lat, lng: lng};
//       Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground){
//           if(err){
//               req.flash("error", err.message);
//               res.redirect("back");
//           } else {
//               req.flash("success","Successfully Updated!");
//               res.redirect("/campgrounds/" + campground._id);
//           }
//       });
//     });
//   });


//   // UPDATE CAMPGROUND ROUTE
// router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
//     geocoder.geocode(req.body.location, function (err, data) {
//       if (err || !data.length) {
//         req.flash('error', 'Invalid address');
//         return res.redirect('back');
//       }
//       req.body.campground.lat = data[0].latitude;
//       req.body.campground.lng = data[0].longitude;
//       req.body.campground.location = data[0].formattedAddress;
  
//       Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
//           if(err){
//               req.flash("error", err.message);
//               res.redirect("back");
//           } else {
//               req.flash("success","Successfully Updated!");
//               res.redirect("/campgrounds/" + campground._id);
//           }
//       });
//     });
//   });


router.put("/:id", middleware.checkCampOwnership, function(req, res){
    geocoder.geocode(req.body.camp.location, function (err, data) {
      console.log("req.body:") 
      console.log(req.body);
      if (err || !data.length) {
        //req.flash('error', 'Invalid address');
        req.flash('error', 'Invalid geo');
        console.log("error in geocode");
        // console.log(GEOCODER_API_KEY);
        console.log(err);
        return res.redirect('back');
      }
      req.body.camp.lat = data[0].latitude;
      req.body.camp.lng = data[0].longitude;
      req.body.camp.location = data[0].formattedAddress;
  
      Camp.findByIdAndUpdate(req.params.id, req.body.camp, function(err, foundCamp){
          if(err){
              req.flash("error", err.message);
              //console.log(err);
              res.redirect("back");
          } else {
              req.flash("success","Successfully Updated!");
              res.redirect("/camplist/" + foundCamp._id);
          }
      });
    });
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