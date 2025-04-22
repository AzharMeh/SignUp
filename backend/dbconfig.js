const mongoose = require("mongoose");



const dbConnect = ()=>{
    mongoose.connect("mongodb+srv://azharmehmood966:sr8rvM4H0Ce0cFCI@cluster0.zckyy5c.mongodb.net/").then(()=>{
        console.log("connected to database");
    }).catch((err)=>{
        console.log('db not connected', err.message)
    })
}

module.exports = dbConnect;