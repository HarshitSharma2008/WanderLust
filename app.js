if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();

}

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter= require("./routes/review.js");
const userRouter = require("./routes/user.js");


const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");

const passport=require("passport");
const localStrategy=require("passport-local");
const User=require("./models/user.js");


// ================= DATABASE CONNECTION =================


const dbUrl = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dbUrl);
}

main()
    .then(() => {
        console.log("connection created");
    })
    .catch(err => {
        console.log("CONNECTION ERROR:");
        console.log(err);
    });



// ================= APP CONFIGURATION =================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// ================= MIDDLEWARE =================

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

app.engine("ejs", ejsMate);

app.use(express.static(path.join(__dirname, "/public")));


// ================= SESSION =================


const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});

store.on("error",()=>{
    console.log("ERROR in Mongo Session Store",err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
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
    res.locals.currUser=req.user;

    next();
});



// ================= LISTING ROUTES =================

app.use("/listings", listingRouter);


// ================= REVIEW ROUTES =================

app.use("/listings/:id/reviews", reviewRouter);
app.use("/",userRouter);


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


