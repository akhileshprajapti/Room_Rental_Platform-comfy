const mongoose = require("mongoose");
const { ref, number } = require("joi");
const Schema = mongoose.Schema

const listingSchema = Schema({
    title: {
        type: String,
        required: true,
    },
    description : String,
    image: [{
       url: String,
       filename: String,
  }],
    price: Number,
    location: String,
    country: String,
    gender :{
        type: String,
        enum: ["Boys", "Girls", "Co-Living"]
    },
    phoneNumber:{
        type: Number,
    },

    amenities:{
       type: [String],
       default: []
    },
     
    roomType: {
        type: String,
        enum: ['Single Room', 'Double Room', 'Full House'],
    },
    reviews : [
        {
           type : Schema.Types.ObjectId,
           ref : "Review"  
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});



const Listing = mongoose.models.Listing || mongoose.model("Listing",listingSchema)
module.exports = Listing;