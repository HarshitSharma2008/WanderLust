
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const {
    isLoggedIn,
    isOwner,
    validateListing
} = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const Listing = require("../models/listing.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");

const upload = multer({ storage });

// Search helper: treat user input as plain text
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Main listing page
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single("listing[image][url]"),
        validateListing,
        wrapAsync(listingController.createListing)
    );

// NEW: Search listings
router.get("/search", wrapAsync(async (req, res) => {
    const q = (req.query.q || "").trim();

    if (!q) {
        return res.redirect("/listings");
    }

    const searchRegex = new RegExp(escapeRegex(q), "i");

    const alllistings = await Listing.find({
        $or: [
            { title: searchRegex },
            { location: searchRegex },
            { country: searchRegex },
            { description: searchRegex },
            { category: searchRegex }
        ]
    });

    res.render("listings/index.ejs", {
        alllistings,
        searchQuery: q,
        activeCategory: null
    });
}));

// NEW: Category filter keywords
const categoryKeywords = {
    "Trending": null,
    "Rooms": /\b(room|rooms|bedroom|bedrooms|shared room|private room|hostel)\b/i,
    "Iconic Cities": /\b(city|cities|urban|downtown|city centre|city center)\b/i,
    "Mountains": /\b(mountain|mountains|hill|hills|himalaya|himalayas|valley|valleys)\b/i,
    "Castles": /\b(castle|castles|fort|forts|palace|palaces)\b/i,
    "Amazing Pools": /\b(pool|pools|swimming|swimming pool|infinity pool)\b/i,
    "Camping": /\b(camping|camp|campsite|tent|tents|glamping)\b/i,
    "Farms": /\b(farm|farms|farmhouse|farmstay|countryside|barn)\b/i,
    "Arctic": /\b(arctic|igloo|igloos|snow|ice|polar|tundra)\b/i,
    "Domes": /\b(dome|domes|geodesic dome|bubble house)\b/i
};

const allowedCategories = Object.keys(categoryKeywords);

// NEW: Show listings for a selected category
router.get("/category/:category", wrapAsync(async (req, res) => {
    const category = allowedCategories.find(
        item => item.toLowerCase() === req.params.category.toLowerCase()
    );

    if (!category) {
        return res.status(404).send("Category not found");
    }

    let alllistings;

    if (category === "Trending") {
        // Show explicitly categorized Trending listings
        alllistings = await Listing.find({ category: "Trending" });
    } else {
        const keywordRegex = categoryKeywords[category];

        // Match the saved category OR relevant listing text.
        // This also helps with older listings that have no category.
        alllistings = await Listing.find({
            $or: [
                { category: category },
                { title: keywordRegex },
                { description: keywordRegex },
                { location: keywordRegex },
                { country: keywordRegex }
            ]
        });
    }

    res.render("listings/index.ejs", {
        alllistings,
        searchQuery: "",
        activeCategory: category
    });
}));

// New listing form
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Existing listing routes — preserved
router.route("/:id")
    .put(
        isLoggedIn,
        isOwner,
        upload.single("listing[image][url]"),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.destroyListing)
    )
    .get(wrapAsync(listingController.showListing));

// Edit listing form
router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm)
);

module.exports = router;

