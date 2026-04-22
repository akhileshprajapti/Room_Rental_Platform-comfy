const User = require('../Models/user.model');
const Listing = require("../Models/listing.model");
const Booking = require("../Models/booking.model");
const { getPaymentSummary } = require("../Utils/paymentSummary");

module.exports.getAdminDashboard = async (req, res) => {
    try {
        const user = await User.find();
        const listing = await Listing.find().populate("owner");
        const bookings = await Booking.find()
            .populate("user", "name email phone")
            .populate("listing", "title location price")
            .sort({ createdAt: -1 });
        const normalizedBookings = bookings.map((booking) => {
            const bookingObject = booking.toObject();
            const summary = getPaymentSummary(booking);

            return {
                ...bookingObject,
                totalPrice: summary.totalAmount,
                amountPaid: summary.paidAmount,
                remainingAmount: summary.dueAmount,
                paymentStatus: summary.paymentStatus,
                paymentBreakdown: {
                    ...(bookingObject.paymentBreakdown || {}),
                    tokenAmount: summary.tokenAmount,
                    remainingAmount: summary.dueAmount,
                },
            };
        });

        const bookingStats = {
            total: normalizedBookings.length,
            pending: normalizedBookings.filter((booking) => booking.status === "Pending").length,
            confirmed: normalizedBookings.filter((booking) => booking.status === "Confirmed").length,
            cancelled: normalizedBookings.filter((booking) => booking.status === "Cancelled").length,
            partialPayments: normalizedBookings.filter((booking) => booking.paymentStatus === "Partial").length,
            paid: normalizedBookings.filter((booking) => booking.paymentStatus === "Paid").length,
            totalDueAmount: normalizedBookings.reduce((sum, booking) => sum + (booking.remainingAmount || 0), 0),
            totalPaidAmount: normalizedBookings.reduce((sum, booking) => sum + (booking.amountPaid || 0), 0),
        };

        res.status(200).json({
            message: "Admin Dashboard",
            user: user || [],
            listing: listing || [],
            bookings: normalizedBookings || [],
            bookingStats,
        });

    } catch (error) {
        console.log("Admin Dashboard Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const deleteUser = await User.findByIdAndDelete(userId)
        if (!deleteUser) {
            return res.status(404).json({ message: "User not found" })
        }
        res.status(200).json({ message: "User deleted successfully" })
    } catch (error) {
        console.log("deleteUser", error)
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports.deleteListing = async (req, res) => {
    try {
        const listingId = req.params.id;

        const deletedListing = await Listing.findByIdAndDelete(listingId);

        if (!deletedListing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        return res.status(200).json({
            message: "Listing deleted successfully"
        });

    } catch (error) {
        console.log("Delete Listing Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
