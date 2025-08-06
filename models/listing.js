const mongoose =require("mongoose");
const review = require("./review");
const Schema=mongoose.Schema;

const listingSchema=new Schema({
    title:{
     type:String,
     required:true,
    },
    description:String,
    image:{
        filename:String,
        url:String,
    },
    price:Number,
    location:String,
    country:String,
    reviews:[{
        type:Schema.Types.ObjectId,
        ref:"Review",
    }
] 

});
listingSchema.post("findOneAndDelete",async function(listing){
    if(listing){
        await Review.deleteMany({
            _id: {
                $in: listing.reviews
            }
        });
        console.log("Reviews deleted successfully");
    }
});


const Listing=mongoose.model("Listing",listingSchema);

module.exports=Listing;