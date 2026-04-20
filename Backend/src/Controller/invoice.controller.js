const PDFDocument = require("pdfkit");
const Booking = require("../Models/booking.model");

exports.generateInvoice = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate("user")
      .populate("listing");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const listing = booking.listing;

    // 💰 Payment logic
    let totalAmount = listing.price;
    let paidAmount = booking.totalPrice;
    let dueAmount = 0;

    if (booking.paymentMethod === "token") {
      dueAmount = totalAmount - paidAmount;
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice_${bookingId}.pdf`
    );

    doc.pipe(res);

    // ================= HEADER =================
    doc
      .fontSize(24)
      .fillColor("#2E86C1")
      .text("PG BOOKING INVOICE", { align: "center" });

    doc.moveDown(0.5);

    doc
      .fontSize(10)
      .fillColor("gray")
      .text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" });

    doc.moveDown(2);

    // ================= CUSTOMER =================
    doc
      .fontSize(16)
      .fillColor("#000")
      .text("Customer Details", { underline: true });

    doc.moveDown(0.5);

    doc.fontSize(12).text(`Name: ${booking.user.name}`);
    doc.text(`Email: ${booking.user.email}`);
    doc.text(`Booking ID: ${booking._id}`);

    doc.moveDown(2);

    // ================= PG DETAILS =================
    doc.fontSize(16).text("PG Details", { underline: true });

    doc.moveDown(0.5);

    doc.fontSize(12).text(`PG Name: ${listing.title}`);
    doc.text(`Location: ${listing.location}, ${listing.country}`);
    doc.text(`Category: ${listing.gender}`);
    doc.text(`Room Type: ${listing.roomType}`);
    doc.text(`Contact: ${listing.phoneNumber}`);

    doc.moveDown();

    // Amenities
    if (listing.amenities && listing.amenities.length > 0) {
      doc.text("Amenities:");
      listing.amenities.forEach((item) => {
        doc.text(`  • ${item}`);
      });
    }

    doc.moveDown();

    // Dates
    doc.text(`Start Date: ${booking.startDate || "N/A"}`);
    doc.text(`Visit Date: ${booking.visitDate || "N/A"}`);
    doc.text(
      `Payment Date: ${
        booking.paymentDate
          ? new Date(booking.paymentDate).toDateString()
          : "N/A"
      }`
    );

    doc.moveDown(2);

    // ================= PAYMENT TABLE (FIXED) =================
    doc.fontSize(16).text("Payment Summary", { underline: true });

    doc.moveDown(1);

    const leftX = 50;
    const rightX = 400;

    let y = doc.y;

    // Header
    doc.fontSize(12).fillColor("#000");
    doc.text("Description", leftX, y);
    doc.text("Amount", rightX, y);

    y += 20;
    doc.moveTo(leftX, y).lineTo(550, y).stroke();

    y += 10;

    // Total Price
    doc.text("Total Price", leftX, y);
    doc.text(`₹${totalAmount}`, rightX, y);

    y += 20;

    // Paid Amount
    doc.text("Paid Amount", leftX, y);
    doc.text(`₹${paidAmount}`, rightX, y);

    y += 20;

    // Due Amount
    doc.text("Due Amount", leftX, y);
    doc.text(`₹${dueAmount}`, rightX, y);

    y += 20;
    doc.moveTo(leftX, y).lineTo(550, y).stroke();

    y += 20;

    // Status
    if (booking.paymentMethod === "token") {
      doc.fillColor("red").text("Status: Partially Paid", leftX, y);
    } else {
      doc.fillColor("green").text("Status: Fully Paid", leftX, y);
    }

    doc.moveDown(4);

    // ================= FOOTER =================
    doc
      .fontSize(12)
      .fillColor("gray")
      .text("Thank you for booking with us!", { align: "center" });

    doc.moveDown(0.5);

    doc
      .fontSize(10)
      .text("For support: support@pgbooking.com", { align: "center" });

    doc.end();

  } catch (error) {
    console.error("Invoice Error:", error.message);
    res.status(500).json({ message: "Error generating invoice" });
  }
};