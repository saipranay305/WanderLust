if(process.env.NODE_ENV !== "production") {
require("dotenv").config();
}


const express = require('express');
const app = express();
const mongoose = require("mongoose");
const ejs=require("ejs");
const path=require("path")
const methodOverride=require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo"); // For storing sessions in MongoDB
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const MONGO_URL = process.env.ATLASDB_URL;

main().then(()=>{
    console.log("Connection to database successful");
}).catch(err=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public"))); 


const store = MongoStore.create({
    mongoUrl: MONGO_URL,
    touchAfter: 24 * 3600, // time period in seconds after which the session will be updated
    crypto: {
        secret
: process.env.SECRET, // secret for encrypting session data
    },
    ttl: 14 * 24 * 60 * 60 // session expiration time in seconds (14 days)
});

store.on("error", function(e) {
    console.log("Error in Mongo Session store error", e);  
});
const sessionOptions={
    store,
    secret: process.env.SECRET,  
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
};
// app.get("/",(req,res)=>{
//     res.send("Home Page!")
// });



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currentUser = req.user; // Make currentUser available in all templates
    next();
});

//demo user
// app.get("/demouser",async (req,res)=>{
//     let fakeuser = new User({email:"student@gmail.com", username:"student" });
//     const newUser = await User.register(fakeuser, "student123");// automatically hashes the password pbkdf2
// }   );


app.use("/listings",listingRouter);

app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);

// app.all("*",(req,res,next)=>{
//     next(new ExpressError(404,"Page Not Found"));
// });
//Error Handling
app.use((err,req,res,next)=>{
    let{statusCode=500, message="Something went wrong"} = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs",{err});
});


app.listen(8080,()=>{
    console.log("server is running at port 8080");
});