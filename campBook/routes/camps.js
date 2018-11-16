// INDEX
var express = require("express");
var router  = express.Router();
var Camp = require("../models/camp");
var middleware = require("../middleware"); // this automatically requires index.js inside
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});



var NodeGeocoder = require('node-geocoder');
var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
  };
 
var geocoder = NodeGeocoder(options);



router.get("/", function(req, res){  // NOTE: this is in fact /camplist
    // eval(require("locus"));
    // console.log(req.user);
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Camp.find({name: regex}, function(err, allcamps){  // find output -> allcamps
            if (err){
                console.log("Error finding camps");
            } else{
                res.render("camps/index", {camps:allcamps});
            }
        });

    } else{
         // get all camps from DB
        Camp.find({}, function(err, allcamps){  // find output -> allcamps
            if (err){
                console.log("Error finding camps");
            } else{
                res.render("camps/index", {camps:allcamps});
            }
        });
    }
});

//CREATE - add new campground to DB
router.post("/", middleware.isLogegdIn, upload.single('image'), function(req, res){
   
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
        if(err) {
          req.flash('error', err.message);
          console.log("err in cloudinRY ", err)
          return res.redirect('back');
        }
        // get data from form and add to campgrounds array
        var name = req.body.name;
        // var image = req.body.image;
        var image = result.secure_url;
        var imageId = result.public_id;
        var price = req.body.price;
        var desc = req.body.description;
        var author = {
            id: req.user._id,
            username: req.user.username
        };

        geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            req.flash('error', 'Invalid geo');
            console.log("GEO LOG ", err);
            return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var newCamp = {name: name, price:price, image: image, imageId:imageId, desc: desc, author:author, location: location, lat: lat, lng: lng};
        // Create a new campground and save to DB
        Camp.create(newCamp, function(err, newlyCreated){
            if(err){
                console.log("create log", err);
                req.flash('error', err.message);
                return res.redirect('back');
            } else {
                //redirect back to campgrounds page
                console.log(newlyCreated);
                res.redirect("/camplist/"+newlyCreated.id);
            }
        });
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
router.put("/:id", middleware.checkCampOwnership, upload.single('image'),function(req, res){
    geocoder.geocode(req.body.camp.location, function (err, data) {
      console.log("req.file: ",req.file) 
      if (err || !data.length) {
        req.flash('error', 'Invalid address');
        console.log(err);
        return res.redirect('back');
      }
      req.body.camp.lat = data[0].latitude;
      req.body.camp.lng = data[0].longitude;
      req.body.camp.location = data[0].formattedAddress;
  
      Camp.findById(req.params.id, async function(err, foundCamp){
          if(err){
              req.flash("error", err.message);
              res.redirect("back");
          } else {
              if (req.file){
                  try {
                    await cloudinary.v2.uploader.destroy(foundCamp.imageId);
                        if (err){
                            req.flash("error",err.message);
                            return res.redirect("back");
                        }
                        var result  =  await cloudinary.v2.uploader.upload(req.file.path);
                        foundCamp.imageId = result.public_id;
                        foundCamp.image = result.secure_url ;
                  } catch {
                    req.flash("error", err.message);
                    return res.redirect("back");
                  }
                  
              }
              for (var v in req.body.camp) foundCamp[v] = req.body.camp[v]
            //   camp.name = req.body.camp.name
            //   camp.desc = req.body.camp.
              // req.body.camp
              foundCamp.save();
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

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
