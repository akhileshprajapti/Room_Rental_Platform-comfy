const express = require("express");
const router = express.Router();
const bookingController = require("../Controller/booking.controller");
const { isAuthenticated } = require("../Middleware/AuthUser.middleware");
const paymentController = require('../Controller/payment.controller');

router.post("/create", isAuthenticated, bookingController.createBooking);
router.get("/userBookings/:userId", isAuthenticated, bookingController.getUserBookings);

// Stripe requires the raw body to verify the webhook signature
router.post(
    '/webhook', 
    express.raw({ type: 'application/json' }), 
    paymentController.handleStripeWebhook
);

module.exports = router;