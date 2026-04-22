const express = require("express");
const router = express.Router();
const bookingController = require("../Controller/booking.controller");
const paymentController = require("../Controller/payment.controller");
const { isAuthenticated } = require("../Middleware/AuthUser.middleware");

router.post("/create", isAuthenticated, bookingController.createBooking);
router.get("/userBookings/:userId", isAuthenticated, bookingController.getUserBookings);
router.get("/confirm-payment/:sessionId", paymentController.confirmStripeCheckout);
router.get("/:bookingId", isAuthenticated, bookingController.getBookingDetails);
router.post("/:bookingId/pay-remaining", isAuthenticated, bookingController.payRemainingAmount);
router.delete("/:bookingId", isAuthenticated, bookingController.cancelBooking);

module.exports = router;
