const express=require("express");
const router=express.Router({mergeParams:true});
const Review=require("../models/reviews.js");
const{reviewSchema}=require("../schema.js");
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const listing=require("../models/listing.js");

const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg=err.details.map((el)=>el.message).join(",");
        throw new ExpressError(404,errMsg);
    }else{
        next();
    }
};


//reviews
//post review route
router.post("/", validateReview,wrapAsync(async (req, res) => {
    let listingData = await listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listingData.reviews.push(newReview);

    await newReview.save();
    await listingData.save();

    console.log("new Review saved");
    req.flash("success","review created !");
    res.redirect(`/listings/${listingData.id}`);
}));


//delete review route
router.delete("/:reviewId", wrapAsync(async(req,res)=>{
    let{id,reviewId}=req.params;

    await listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","review deleted !");

    res.redirect(`/listings/${id}`);


}));

module.exports=router;