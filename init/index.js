const mongoose = require("mongoose");

const initdata = require("./data.js");
const listing = require("../models/listing.js");

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

const initDB = async () => {
    await listing.deleteMany({});

    initdata.data = initdata.data.map((obj) => ({
        ...obj,
        owner: "6abd31832a35eb9016c41e5c"
    }));

    await listing.insertMany(initdata.data);

    console.log("data was saved");
};

initDB();