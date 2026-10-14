
const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mapToken
    ? mbxGeocoding({ accessToken: mapToken })
    : null;

module.exports.index = async (req, res, next) => {
    try {
        const alllistings = await Listing.find({});
        res.render("listings/index.ejs", { alllistings });
    } catch (err) {
        next(err);
    }
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res, next) => {
    try {
        const { id } = req.params;

        const listings = await Listing.findById(id)
            .populate({
                path: "reviews",
                populate: { path: "author" }
            })
            .populate("owner");

        if (!listings) {
            req.flash("error", "Listing you requested for does not exist!");
            return res.redirect("/listings");
        }

        res.render("listings/show.ejs", {
            listings,
            mapToken
        });
    } catch (err) {
        next(err);
    }
};

module.exports.createListing = async (req, res, next) => {
    try {
        if (!geocodingClient) {
            throw new Error("MAP_TOKEN is missing from the .env file.");
        }

        const response = await geocodingClient
            .forwardGeocode({
                query: req.body.listing.location,
                limit: 1
            })
            .send();

        const feature = response.body.features[0];

        if (!feature) {
            req.flash("error", "Location not found. Please enter a valid location.");
            return res.redirect("/listings/new");
        }

        const newListing = new Listing(req.body.listing);

        newListing.owner = req.user._id;
        newListing.geometry = feature.geometry;

        if (req.file) {
            newListing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }

        await newListing.save();

        req.flash("success", "New listing created!");
        res.redirect("/listings");
    } catch (err) {
        next(err);
    }
};

module.exports.renderEditForm = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listings = await Listing.findById(id);

        if (!listings) {
            req.flash("error", "Listing you requested for does not exist!");
            return res.redirect("/listings");
        }

        let originalImageUrl = listings.image.url;
        originalImageUrl = originalImageUrl.replace(
            "/upload",
            "/upload/h_300,w_250"
        );

        res.render("listings/edit.ejs", {
            listings,
            originalImageUrl
        });
    } catch (err) {
        next(err);
    }
};

module.exports.updateListing = async (req, res, next) => {
    try {
        const { id } = req.params;

        const updatedListing = await Listing.findByIdAndUpdate(
            id,
            { ...req.body.listing },
            { runValidators: true, new: true }
        );

        if (!updatedListing) {
            req.flash("error", "Listing you requested for does not exist!");
            return res.redirect("/listings");
        }

        if (req.file) {
            updatedListing.image = {
                url: req.file.path,
                filename: req.file.filename
            };

            await updatedListing.save();
        }

        req.flash("success", "Listing updated!");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        next(err);
    }
};

module.exports.destroyListing = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedListing = await Listing.findByIdAndDelete(id);

        if (!deletedListing) {
            req.flash("error", "Listing not found!");
            return res.redirect("/listings");
        }

        req.flash("success", "Listing deleted!");
        res.redirect("/listings");
    } catch (err) {
        next(err);
    }
};
