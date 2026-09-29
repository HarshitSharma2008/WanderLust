
const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

const session = require("express-session");
const flash = require("connect-flash");

const passport=require("passport");
const localStrategy=require("passport-local");
const User=require("./models/user.js");


// ================= DATABASE CONNECTION =================

main()
    .then(() => {
        console.log("connection created");
    })
    .catch(err => {
        console.log("CONNECTION ERROR:");
        console.log(err);
    });

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}


// ================= APP CONFIGURATION =================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// ================= MIDDLEWARE =================

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

app.engine("ejs", ejsMate);

app.use(express.static(path.join(__dirname, "/public")));


// ================= SESSION =================

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,

    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};




app.use(session(sessionOptions));


// ================= FLASH =================

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// Make flash messages available to EJS
app.use((req, res, next) => {

    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");

    next();
});


// ================= ROOT ROUTE =================

app.get("/", (req, res) => {
    res.send("Hi i am root");
});


// ================= LISTING ROUTES =================

app.use("/listings", listings);


// ================= REVIEW ROUTES =================

app.use("/listings/:id/reviews", reviews);


// ================= 404 ERROR =================

app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});


// ================= ERROR HANDLING =================

app.use((err, req, res, next) => {

    let {
        statusCode = 500,
        message = "Something went wrong!"
    } = err;

    res.status(statusCode).render("error.ejs", {
        message
    });
});


// ================= SERVER =================

app.listen(8080, () => {
    console.log("Listening to the port 8080");
});


