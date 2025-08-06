const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing=require("../models/listing");

const validateListing=(req,res,next)=>{
     let {error}=listingSchema.validateAsync(req.body);
    if(error) {
        throw new ExpressError(400, error); 
    }  
    else{
        next();
    }
};

//Index Route
router.get("/", wrapAsync(async (req,res,next)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));
//New Route
router.get("/new",(req,res)=>{
    res.render("listings/new.ejs");
} );
//Show Route
router.get("/:id",wrapAsync(async(req,res,next)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error","Listing Not Found");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
}));

//Create Route
router.post("/",validateListing,wrapAsync(async (req,res,next)=>{
    // let {titile,description,image,price,country,location}=req.body;
    // let listing=req.body.listing;
    // if(!req.body.listing) throw new ExpressError(400,"Invalid Listing Data");
     const newListing=new Listing(req.body.listing);    
    await newListing.save();
    req.flash("success","New Listing Created Successfully");
    res.redirect("/listings");
}));

//Edit Route
router.get("/:id/edit",wrapAsync(async (req,res,next)=>{
     let {id}=req.params;
    const listing=await Listing.findById(id);
     if(!listing){
        req.flash("error","Listing Not Found");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing});
}));

//Update Route
router.put("/:id" ,validateListing,wrapAsync(async (req,res,next)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success","Listing Updated Successfully");
    res.redirect(`/listings/${id}`)
}));

//Delete Route
router.delete("/:id",wrapAsync(async(req,res,next)=>{
    const {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted Successfully");
    res.redirect("/listings");
}));

module.exports = router;