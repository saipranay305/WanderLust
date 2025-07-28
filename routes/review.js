const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const Listing=require("../models/listing");

const validateReview=(req,res,next)=>{
     let {error}=reviewSchema.validateAsync(req.body);
    if(error) {
        throw new ExpressError(400, error); 
    }  
    else{
        next();
    }
};

//Post Review Route
router.post("/",validateReview,wrapAsync(async (req,res,next)=>{
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
router.delete("/:reviewId",wrapAsync(async (req,res   ,next)=>{
    const {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});// pull removes the review from the listing.
    await Review.findByIdAndDelete(reviewId);
    console.log("Review deleted successfully");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;