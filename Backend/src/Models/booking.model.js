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

  visitDate: {
    type: Date,
    required: true,
  },

  paymentMethod: {
    type: String,
    enum: ["token", "full", "visit"],
    default: "token",
  },
  sharingType: {
    type: String,
    enum: ["single", "double"],
    default: "single",
    required: true,
  },

  totalPrice: Number, // Full rent/price of listing
  checkoutAmount: {
    type: Number,
    default: 0,
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  remainingAmount: {
    type: Number,
    default: 0,
  },

  paymentStatus: {
    type: String,
    enum: ["Pending", "Partial", "Paid"],
    default: "Pending",
  },

  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Cancelled"],
    default: "Pending",
  },

  paymentId: String,
  paymentDate: Date,
  remainingPaymentId: String,
  remainingPaymentDate: Date,
  receiptEmailSent: {
    type: Boolean,
    default: false,
  },
  receiptEmailSentAt: Date,

  paymentBreakdown: {
    tokenAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    fullPayment: { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
