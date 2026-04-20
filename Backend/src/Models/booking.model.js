const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },

  startDate: {
    type: Date,
    required: true,
  },

 visitDate:{
  type: Date,
  required: true,
 },

 paymentMethod: {
    type: String,
    enum: ["token", "pg", "visit", "full"],
    // required: true,
  },
  sharingType: {
    type: String,
    enum: ["single", "double"],
    default: "single",
    required: true,
  },

  totalPrice: Number,

  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Cancelled"],
    default: "Confirmed",
  },

}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);