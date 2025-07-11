const express = require('express');
const app = express();
const mongoose = require("mongoose");
const ejs=require("ejs");
const Listing=require("./models/listing");

const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
main().then(()=>{
    console.log("Connection to database successful");
}).catch(err=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(MONGO_URL);
}
app.get("/",(req,res)=>{
    res.send("Home Page!")
})

app.get("/testListing",async (req,res)=>{
    let sampleListing =new Listing({
        title: "MY villa",
        description:"By the mountain",
        price:1500,
        location:"Goa",
        country:"India",
    });
    await sampleListing.save();
    console.log("saved");
    res.send("Successful");
});
app.listen(8080,()=>{
    console.log("server is running at port 8080");
})