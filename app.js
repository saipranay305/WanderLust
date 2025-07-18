const express = require('express');
const app = express();
const mongoose = require("mongoose");
const ejs=require("ejs");
const Listing=require("./models/listing");
const path=require("path")
const methodOverride=require("method-override");

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
app.get("/",(req,res)=>{
    res.send("Home Page!")
})

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
app.get("/listings", async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
})
//New Route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
} )
//Show Route
app.get("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
})

//Create Route
app.post("/listings",async (req,res)=>{
    // let {titile,description,image,price,country,location}=req.body;
    // let listing=req.body.listing;
    const newListing=new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings")
});

//Edit Route
app.get("/listings/:id/edit",async (req,res)=>{
     let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
});

//Update Route
app.put("/listings/:id" ,async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`)
});

//Delete Route
app.delete("/listings/:id",async(req,res)=>{
    const {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
});


app.listen(8080,()=>{
    console.log("server is running at port 8080");
});