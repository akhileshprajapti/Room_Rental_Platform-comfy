const User = require('../Models/user.model');
const Listing = require("../Models/listing.model");

module.exports.getAdminDashboard = async (req, res) => {
    try {
        const user = await User.find();
        const listing = await Listing.find().populate("owner");

        res.status(200).json({
            message: "Admin Dashboard",
            user: user || [],
            listing: listing || []
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
