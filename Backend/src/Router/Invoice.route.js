const express = require("express");
const router = express.Router();
const invoiceController = require("../Controller/invoice.controller");

router.get("/:bookingId", invoiceController.generateInvoice);

module.exports = router;