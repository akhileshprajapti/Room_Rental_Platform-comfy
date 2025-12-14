const Listing = require("../Models/listing.model");
const { v4: uuid } = require("uuid");
const storageServer = require("../services/storage.service"); 

//  CREATE LISTING
module.exports.createListing = async (req, res) => {
  try {
    // Check if image is provided
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "Image is required",
      });
    }

    // Upload images to ImageKit
    let uploadedImages = [];

    for (let img of req.files) {
      const upload = await storageServer.uploadImage(img.buffer, uuid());
      uploadedImages.push({
        url: upload.url,
        filename: upload.fileId,
      });
    }

    const newListing = await Listing.create({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      location: req.body.location,
      country: req.body.country,
      owner: req.user._id,
      amenities: req.body.amenities,
      roomType: req.body.roomType,
      phoneNumber: req.body.phoneNumber,
      gender: req.body.gender,

      //  FIXED: remove uploadedImage, store array
      image: uploadedImages,
    });

    res.status(201).json({
      message: "Listing created successfully",
      listing: newListing,
    });

  } catch (error) {
    console.error("Create Listing Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// GET ALL LISTINGS
module.exports.getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find().populate("owner");
    res.status(200).json(listings);
  } catch (error) {
    console.error("Get All Listings Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//  GET SINGLE LISTING
module.exports.getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate("owner")
      // .populate("reviews");

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.status(200).json(listing);
  } catch (error) {
    console.error("Get Listing Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//  UPDATE LISTING
module.exports.updateListing = async (req, res) => {
  try {
    let updateData = {
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      location: req.body.location,
      country: req.body.country,
      amenities: req.body.amenities,
      roomType: req.body.roomType,
      phoneNumber: req.body.phoneNumber,
      gender: req.body.gender,

    };

    // If there is a new image
    if (req.file) {
      const uploadedImage = await storageServer.uploadImage(
        req.file.buffer,
        uuid()
      );
      updateData.image = {
        url: uploadedImage.url,
        filename: uploadedImage.fileId,
      };
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedListing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.status(200).json({
      message: "Listing updated",
      listing: updatedListing,
    });
  } catch (error) {
    console.error("Update Listing Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//  DELETE LISTING
module.exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Delete Listing Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
