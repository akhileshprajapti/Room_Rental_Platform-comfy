const Booking = require("../Models/booking.model");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ PAYMENT SUCCESS
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata.bookingId;

    try {
      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          status: "Confirmed",
          paymentId: session.payment_intent,
          paymentStatus: "Paid",
          paymentDate: new Date(),
        },
        { new: true }
      )
        .populate("user")
        .populate("listing");

      if (!booking) return;

      // 💰 PAYMENT CALCULATION
      let totalAmount = booking.listing.price;
      let paidAmount = booking.totalPrice;
      let dueAmount = 0;

      if (booking.paymentMethod === "token") {
        dueAmount = totalAmount - paidAmount;
      }

      // ✅ CREATE PDF BUFFER
      const doc = new PDFDocument();
      let buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));

      doc.on("end", async () => {
        try {
          const pdfData = Buffer.concat(buffers);

          // ✅ SEND EMAIL
          await transporter.sendMail({
            from: `"PG Booking Portal" <${process.env.EMAIL_USER}>`,
            to: booking.user.email,
            subject: "Booking Confirmed with Invoice 🧾",
            html: `
              <h2>Booking Confirmed ✅</h2>
              <p>Hello ${booking.user.name},</p>

              <p><b>PG:</b> ${booking.listing.title}</p>
              <p><b>Total Amount:</b> ₹${totalAmount}</p>
              <p><b>Paid Amount:</b> ₹${paidAmount}</p>

              ${
                booking.paymentMethod === "token"
                  ? `<p><b>Due Amount:</b> ₹${dueAmount} (Pay at PG)</p>`
                  : `<p><b>Status:</b> Fully Paid ✅</p>`
              }

              <p>Thank you for booking 🎉</p>
            `,
            attachments: [
              {
                filename: `invoice_${booking._id}.pdf`,
                content: pdfData,
              },
            ],
          });

          console.log("✅ Email with PDF sent successfully");

        } catch (err) {
          console.error("❌ Email/PDF Error:", err.message);
        }
      });

      // 🧾 PDF CONTENT
      doc.fontSize(20).text("PG Booking Invoice", { align: "center" });
      doc.moveDown();

      doc.fontSize(12).text(`Booking ID: ${booking._id}`);
      doc.text(`Name: ${booking.user.name}`);
      doc.text(`Email: ${booking.user.email}`);
      doc.moveDown();

      doc.text(`PG: ${booking.listing.title}`);
      doc.text(`Sharing: ${booking.sharingType}`);
      doc.text(`Payment Method: ${booking.paymentMethod}`);
      doc.moveDown();

      doc.text(`Total Amount: ₹${totalAmount}`);
      doc.text(`Paid Amount: ₹${paidAmount}`);

      if (booking.paymentMethod === "token") {
        doc.text(`Due Amount: ₹${dueAmount}`);
        doc.text(`Status: Partially Paid`);
      } else {
        doc.text(`Due Amount: ₹0`);
        doc.text(`Status: Fully Paid`);
      }

      doc.moveDown();
      doc.text("Thank you for booking!", { align: "center" });

      doc.end();

    } catch (err) {
      console.error("Webhook Error:", err.message);
    }
  }

  res.json({ received: true });
};