const express = require("express");
const router = express.Router();

const upload = require("../Middleware/upload.middleware");
const { isAuthenticated } = require("../Middleware/AuthUser.middleware");
const { isOwner } = require("../Middleware/AuthUser.middleware");

const listingController = require("../Controller/listing.controller");

// Create listing (must be logged in)
router.post("/create", isAuthenticated, upload, listingController.createListing);

// Get all listings (public)
router.get("/showListing", listingController.getAllListings);

// Get single (public)
router.get("/:id", listingController.getListing);

// Update (must be owner)
router.put("/:id", isAuthenticated, isOwner, upload, listingController.updateListing);

// Delete (must be owner)
router.delete("/:id", isAuthenticated, isOwner, listingController.deleteListing);

module.exports = router;
