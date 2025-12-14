const MongoDb = require("mongoose")

const connectDB = () =>{
    MongoDb.connect(process.env.MONGOOS_URL)
    .then(() =>{
        console.log("MongoDB is connected")
    })
    .catch ((error) =>{
        console.log("mongodb not connected", error)
    })
}

module.exports = connectDB