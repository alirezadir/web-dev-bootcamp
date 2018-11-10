var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"), 
    Camp  = require("./models/camp"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    flash       = require("connect-flash"),
    seedDB      = require("./seeds")
    
//requring routes
var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/camps"),
    indexRoutes      = require("./routes/index")
    
var url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp_v6"
mongoose.connect(url, { useNewUrlParser: true });
// For local: export DATABASEURL=
// For heroku: heroku config:set DATABASEURL=


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs"); //avoid extension .ejs
app.use(express.static(__dirname + "/public")); // adding stylesheets in public 
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require('moment');
//seedDB();  // seed disabled for now 

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){  
   res.locals.currentUser = req.user;  // we can access from all pages using <%currentUser%>
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

app.use("/",indexRoutes);
app.use("/camplist", campgroundRoutes);
app.use("/camplist/:id/comments",commentRoutes);

app.listen(3000, process.env.IP, function(){
   console.log("The YelpCamp Server Has Started at");
   console.log("port: " + this.address().port);
});