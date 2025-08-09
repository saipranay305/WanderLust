const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.createReview = async (req,res,next)=>{
    const {id}=req.params;
    const listing=await Listing.findById(id);
    const review=new Review(req.body.review);
    review.author=req.user._id; // Set the author of the review to the current user
    listing.reviews.push(review);
    await review.save();
    await listing.save();

    console.log("Review added successfully");
    req.flash("success","Review Added Successfully");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteReview = async (req,res   ,next)=>{
    const {id,reviewId}=req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});// pull removes the review from the listing.
    await Review.findByIdAndDelete(reviewId);
    console.log("Review deleted successfully");
    req.flash("success","Review Deleted Successfully");
    res.redirect(`/listings/${id}`);
};