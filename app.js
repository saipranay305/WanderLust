const express = require('express');
const app = express();
const mongoose = require("mongoose");
const ejs=require("ejs");
const Listing=require("./models/listing");
const path=require("path")
const methodOverride=require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema ,reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");



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

const validateListing=(req,res,next)=>{
     let {error}=listingSchema.validateAsync(req.body);
    if(error) {
        throw new ExpressError(400, error); 
    }  
    else{
        next();
    }
};
const validateReview=(req,res,next)=>{
     let {error}=reviewSchema.validateAsync(req.body);
    if(error) {
        throw new ExpressError(400, error); 
    }  
    else{
        next();
    }
};

// app.get("/testListing",async (req,res)=>{
//     let sampleListing =new Listing({
//         title: "MY villa",
//         description:"By the mountain",
//         price:1500,
//         location:"Goa",
//         country:"India",
//     });
//     await sampleListing.save();
//     console.log("saved");
//     res.send("Successful");
// });
//Index Route
app.get("/listings", wrapAsync(async (req,res,next)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));
//New Route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
} );
//Show Route
app.get("/listings/:id",wrapAsync(async(req,res,next)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs",{listing});
}));

//Create Route
app.post("/listings",validateListing,wrapAsync(async (req,res,next)=>{
    // let {titile,description,image,price,country,location}=req.body;
    // let listing=req.body.listing;
    // if(!req.body.listing) throw new ExpressError(400,"Invalid Listing Data");
     const newListing=new Listing(req.body.listing);    
    await newListing.save();
    res.redirect("/listings");
}));

//Edit Route
app.get("/listings/:id/edit",wrapAsync(async (req,res,next)=>{
     let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//Update Route
app.put("/listings/:id" ,validateListing,wrapAsync(async (req,res,next)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`)
}));

//Delete Route
app.delete("/listings/:id",wrapAsync(async(req,res,next)=>{
    const {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

//Reviews
//Post Review Route
app.post("/listings/:id/reviews",validateReview,wrapAsync(async (req,res,next)=>{
    const {id}=req.params;
    const listing=await Listing.findById(id);
    const review=new Review(req.body.review);
    listing.reviews.push(review);
    await review.save();
    await listing.save();

    console.log("Review added successfully");
    res.redirect(`/listings/${id}`);
}));

//Delete Review Route
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async (req,res   ,next)=>{
    const {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});// pull removes the review from the listing.
    await Review.findByIdAndDelete(reviewId);
    console.log("Review deleted successfully");
    res.redirect(`/listings/${id}`);
}));
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