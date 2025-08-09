const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");


const Listing = require("../models/listing");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

router
.route("/")
.get( wrapAsync(listingController.index))
.post( validateListing, isLoggedIn, wrapAsync(listingController.create));

//New Route
router.get("/new", isLoggedIn, listingController.new);


router
.route("/:id")
.get( wrapAsync(listingController.show))
.put(isLoggedIn, isOwner, validateListing, wrapAsync(listingController.update))
.delete( isLoggedIn, isOwner, wrapAsync(listingController.delete));




//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.edit));

module.exports = router;