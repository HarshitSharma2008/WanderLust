const listing=require("../models/listing");
const Review=require("../models/reviews");



module.exports.createReview=async (req, res) => {
    let listingData = await listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author=req.user._id;
    listingData.reviews.push(newReview);

    await newReview.save();
    await listingData.save();

    console.log("new Review saved");
    req.flash("success","review created !");
    res.redirect(`/listings/${listingData.id}`);
};


module.exports.destroyReview=async(req,res)=>{
    let{id,reviewId}=req.params;

    await listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","review deleted !");

    res.redirect(`/listings/${id}`);


};