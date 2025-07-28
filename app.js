const express = require('express');
const app = express();
const mongoose = require("mongoose");
const ejs=require("ejs");
const path=require("path")
const methodOverride=require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");



const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
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

app.get("/",(req,res)=>{
    res.send("Home Page!")
});




app.use("/listings",listings);

app.use("/listings/:id/reviews",reviews);

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