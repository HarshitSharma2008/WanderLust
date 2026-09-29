
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Import Review model
const Review = require("./reviews.js");


const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },

    description: String,

    image: {
        filename: String,

        url: {
            type: String,

            default:
                "https://a0.muscache.com/im/pictures/miso/Hosting-30267599/original/62ae5b3f-2da2-44b4-8d62-a7f2da7dde22.jpeg",

            set: (v) =>
                v === ""
                    ? "https://a0.muscache.com/im/pictures/miso/Hosting-30267599/original/62ae5b3f-2da2-44b4-8d62-a7f2da7dde22.jpeg"
                    : v
        }
    },

    price: Number,

    location: String,

    country: String,

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
});


// Delete all reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async (listing) => {

    if (listing) {

        await Review.deleteMany({
            _id: {
                $in: listing.reviews
            }
        });

    }

});


const listing = mongoose.model("listing", listingSchema);

module.exports = listing;



