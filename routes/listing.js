const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");


const Listing = require("../models/listing");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");


//Index Route
router.get("/", wrapAsync(async (req, res, next) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));
//New Route
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});
//Show Route
router.get("/:id", wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({
        path: "reviews",
        populate:
        {
            path: "author",
        },
    }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing Not Found");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}));

//Create Route
router.post("/", validateListing, isLoggedIn, wrapAsync(async (req, res, next) => {
    // let {titile,description,image,price,country,location}=req.body;
    // let listing=req.body.listing;
    // if(!req.body.listing) throw new ExpressError(400,"Invalid Listing Data");
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; // Set the owner to the logged-in user 
    await newListing.save();
    req.flash("success", "New Listing Created Successfully");
    res.redirect("/listings");
}));

//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing Not Found");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}));

//Update Route
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing Updated Successfully");
    res.redirect(`/listings/${id}`)
}));

//Delete Route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted Successfully");
    res.redirect("/listings");
}));

module.exports = router;