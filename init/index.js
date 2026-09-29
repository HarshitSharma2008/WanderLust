const mongoose=require("mongoose");
const initdata=require("../init/data.js");
const listing=require("../models/listing.js");
main()
    .then(() => {
        console.log("connection created");
    })
    .catch(err => {
        console.log("CONNECTION ERROR:");
        console.log(err);
    });

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const initDB=async ()=>{
    await listing.deleteMany({});
    await listing.insertMany(initdata.data);
    console.log("data was saved");

}
initDB();