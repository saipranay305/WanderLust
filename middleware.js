const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema,reviewSchema} = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        //redirectUrl save
        req.session.redirectUrl = req.originalUrl; // Save the original URL to redirect after login
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        // Save the original URL to redirect after login
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currentUser._id)) {
        req.flash("error", "You do not have permission to make changes to this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validateAsync(req.body);
    if (error) {
        throw new ExpressError(400, error);
    }
    else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {

     let {error}=reviewSchema.validateAsync(req.body);
    if(error) {
        throw new ExpressError(400, error); 
    }  
    else{
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id,reviewId } = req.params;

    let review = await Review.findById(reviewId);
   

    if (!review) {
    req.flash("error", "Review not found");
    return res.redirect(`/listings/${id}`);
}

    if (!review.author.equals(res.locals.currentUser._id)) {
        req.flash("error", "You do not have permission to make changes to this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

