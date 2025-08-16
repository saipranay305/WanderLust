const Listing = require("../models/listing");
module.exports.index=async (req, res, next) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

module.exports.new=(req, res) => {
    res.render("listings/new.ejs");
}

module.exports.show=async (req, res, next) => {
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
}

module.exports.create=async (req, res, next) => {
    let url=req.file.path;
    let filename=req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; // Set the owner to the logged-in user 
    newListing.image = { url, filename }; // Set the image URL and filename
    await newListing.save();
    req.flash("success", "New Listing Created Successfully");
    res.redirect("/listings");
};

module.exports.edit=async (req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing Not Found");
        return res.redirect("/listings");
    }
    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace( "/upload","/upload/w_250"); // Ensure the URL is in the correct format
    res.render("listings/edit.ejs", { listing,originalImageUrl });
};

module.exports.update=async (req, res, next) => {

    let { id } = req.params;
    let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    if(typeof req.file!=="undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image = { url, filename }; // Update the image URL and filename
    await listing.save();
    }
    req.flash("success", "Listing Updated Successfully");
    res.redirect(`/listings/${id}`)
};

module.exports.delete=async (req, res, next) => {
    const { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted Successfully");
    res.redirect("/listings");
};