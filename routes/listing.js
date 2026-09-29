const express=require("express");
const router=express.Router();
const listing=require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const{listingSchema}=require("../schema.js");


//validate functionS
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);

    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(404, errMsg);
    } else {
        next();
    }
};




//index route
router.get("/",wrapAsync(async(req,res)=>{
    const alllistings=await listing.find({});
    res.render("listings/index.ejs",{alllistings});

}));
//new route
router.get("/new",(req,res)=>{
    res.render("listings/new.ejs");
})
//create route
router.post("/",validateListing,wrapAsync(async(req,res,next)=>{
    //let{title,description,image,country,price,location}=req.body;
    const newlistings=new listing(req.body.listing);
    console.log(newlistings);
    await newlistings.save();
    req.flash("success","new listing created !");
    res.redirect("/listings");

    

}));


// edit route
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listings = await listing.findById(id);
    req.flash("success"," listing updated !");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listings });
}));

//update route
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;

    await listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { runValidators: true }
    );
    req.flash("success","listing updated !");

    res.redirect(`/listings/${id}`);
}));

//delete route
router.delete("/:id",wrapAsync(async (req,res)=>{
    let{id}=req.params;
    let deletedlisting=await listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    req.flash("success","listing deleted !");
    res.redirect("/listings");
}));

//show route
router.get("/:id",wrapAsync(async (req,res)=>{
    let{id}=req.params;
    const listings=await listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listings});

}));


module.exports=router;
