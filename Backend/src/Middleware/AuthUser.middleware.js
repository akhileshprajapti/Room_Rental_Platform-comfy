const jwt = require("jsonwebtoken");
const User = require("../Models/user.model");

module.exports.isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access denied. Token missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "Invalid user." });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

const Listing = require("../models/listing.model");

module.exports.isOwner = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Check if logged-in user is the owner
    if (listing.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not allowed to modify this listing."
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
