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

const updateBookingFromCheckoutSession = async (session) => {
  const bookingId = session.metadata?.bookingId;
  const paymentPurpose = session.metadata?.paymentPurpose || "initial";

  if (!bookingId) {
    throw new Error("Booking ID missing from Stripe session");
  }

  if (session.payment_status && session.payment_status !== "paid") {
    throw new Error("Stripe checkout session is not paid yet");
  }

  const booking = await Booking.findById(bookingId)
    .populate("user")
    .populate("listing");

  if (!booking) {
    throw new Error("Booking not found");
  }

  const totalAmount = booking.totalPrice || booking.listing.price || 0;
  const tokenAmount = booking.paymentBreakdown?.tokenAmount || Math.round(totalAmount * 0.10);
  let paidAmount = booking.amountPaid || 0;
  let dueAmount = booking.remainingAmount || totalAmount;

  if (paymentPurpose === "remaining") {
    paidAmount = totalAmount;
    dueAmount = 0;
    booking.remainingPaymentId = session.payment_intent;
    booking.remainingPaymentDate = new Date();
    booking.paymentStatus = "Paid";
  } else if (booking.paymentMethod === "token") {
    paidAmount = tokenAmount;
    dueAmount = Math.max(totalAmount - tokenAmount, 0);
    booking.paymentStatus = dueAmount > 0 ? "Partial" : "Paid";
  } else {
    paidAmount = totalAmount;
    dueAmount = 0;
    booking.paymentStatus = "Paid";
  }

  booking.status = "Confirmed";
  booking.paymentId = booking.paymentId || session.payment_intent;
  booking.paymentDate = booking.paymentDate || new Date();
  booking.amountPaid = paidAmount;
  booking.remainingAmount = dueAmount;
  booking.paymentBreakdown = {
    tokenAmount: booking.paymentMethod === "token" ? tokenAmount : 0,
    remainingAmount: dueAmount,
    fullPayment: booking.paymentMethod === "full" || dueAmount === 0 ? totalAmount : 0,
  };

  await booking.save();

  return {
    booking,
    totalAmount,
    paidAmount,
    dueAmount,
  };
};

const createReceiptPdfBuffer = (booking, totalAmount, paidAmount, dueAmount) => (
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    doc.fontSize(22).text("PG Booking Invoice", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Booking ID: ${booking._id}`);
    doc.text(`Name: ${booking.user.name}`);
    doc.text(`Email: ${booking.user.email}`);
    doc.moveDown();

    doc.text(`PG: ${booking.listing.title}`);
    doc.text(`Location: ${booking.listing.location || "N/A"}`);
    doc.text(`Sharing: ${booking.sharingType}`);
    doc.text(`Payment Method: ${booking.paymentMethod}`);
    doc.moveDown();

    doc.text(`Total Amount: Rs.${totalAmount}`);
    doc.text(`Paid Amount: Rs.${paidAmount}`);
    doc.text(`Due Amount: Rs.${dueAmount}`);
    doc.text(`Status: ${dueAmount > 0 ? "Partially Paid" : "Fully Paid"}`);

    doc.moveDown();
    doc.text("Thank you for booking with us!", { align: "center" });

    doc.end();
  })
);

const sendBookingConfirmationEmail = async (booking, totalAmount, paidAmount, dueAmount) => {
  if (booking.receiptEmailSent) {
    return false;
  }

  const pdfData = await createReceiptPdfBuffer(booking, totalAmount, paidAmount, dueAmount);
  const isTokenPayment = booking.paymentMethod === "token" && dueAmount > 0;

  await transporter.sendMail({
    from: `"Comfy PG Booking" <${process.env.EMAIL_USER}>`,
    to: booking.user.email,
    subject: "Booking Confirmed - Invoice Attached",
    html: `
      <h2>Booking Confirmed</h2>
      <p>Hello <strong>${booking.user.name}</strong>,</p>
      <p>Your booking for <strong>${booking.listing.title}</strong> is confirmed.</p>
      <p><strong>Total Amount:</strong> Rs.${totalAmount}</p>
      <p><strong>Paid Amount:</strong> Rs.${paidAmount}</p>
      <p><strong>Due Amount:</strong> Rs.${dueAmount}</p>
      ${isTokenPayment ? `<p>You can pay the remaining amount from your account booking details.</p>` : `<p>Your full payment has been received.</p>`}
      <p>Your invoice PDF is attached with this email for download.</p>
      <p>Thank you for choosing Comfy PG Portal.</p>
    `,
    attachments: [
      {
        filename: `invoice_${booking._id}.pdf`,
        content: pdfData,
      },
    ],
  });

  booking.receiptEmailSent = true;
  booking.receiptEmailSentAt = new Date();
  await booking.save();

  return true;
};

exports.updateBookingFromCheckoutSession = updateBookingFromCheckoutSession;
exports.sendBookingConfirmationEmail = sendBookingConfirmationEmail;

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
      const paymentPurpose = session.metadata.paymentPurpose || "initial";
      const booking = await Booking.findById(bookingId)
        .populate("user")
        .populate("listing");

      if (!booking) return;

      // 💰 PAYMENT CALCULATION
      const totalAmount = booking.totalPrice || booking.listing.price || 0;
      const tokenAmount = booking.paymentBreakdown?.tokenAmount || Math.round(totalAmount * 0.10);
      let paidAmount = booking.amountPaid || 0;
      let dueAmount = booking.remainingAmount || totalAmount;

      if (paymentPurpose === "remaining") {
        paidAmount = totalAmount;
        dueAmount = 0;
        booking.remainingPaymentId = session.payment_intent;
        booking.remainingPaymentDate = new Date();
        booking.paymentStatus = "Paid";
      } else if (booking.paymentMethod === "token") {
        paidAmount = tokenAmount;
        dueAmount = Math.max(totalAmount - tokenAmount, 0);
        booking.paymentStatus = dueAmount > 0 ? "Partial" : "Paid";
      } else {
        paidAmount = totalAmount;
        dueAmount = 0;
        booking.paymentStatus = "Paid";
      }

      booking.status = "Confirmed";
      booking.paymentId = booking.paymentId || session.payment_intent;
      booking.paymentDate = booking.paymentDate || new Date();
      booking.amountPaid = paidAmount;
      booking.remainingAmount = dueAmount;
      booking.paymentBreakdown = {
        tokenAmount: booking.paymentMethod === "token" ? tokenAmount : 0,
        remainingAmount: dueAmount,
        fullPayment: booking.paymentMethod === "full" || dueAmount === 0 ? totalAmount : 0,
      };

      await booking.save();

      // ✅ CREATE PDF BUFFER
      const doc = new PDFDocument();
      let buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));

      doc.on("end", async () => {
        try {
          if (booking.receiptEmailSent) {
            return;
          }

          const pdfData = Buffer.concat(buffers);

          // ✅ SEND EMAIL
          await transporter.sendMail({
            from: `"🏠 Comfy PG Booking" <${process.env.EMAIL_USER}>`,
            to: booking.user.email,
            subject: "🎉 Your Booking is Confirmed! Receipt Attached",
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <style>
                  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; }
                  .email-content { background: white; border-radius: 8px; padding: 30px; }
                  .header { text-align: center; margin-bottom: 30px; }
                  .header h1 { color: #2e7d32; font-size: 28px; margin: 0; }
                  .header p { color: #666; font-size: 14px; margin: 5px 0 0 0; }
                  .success-icon { font-size: 50px; text-align: center; margin-bottom: 15px; }
                  .greeting { color: #333; font-size: 16px; margin-bottom: 20px; }
                  .property-card { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 5px; }
                  .property-card h3 { color: #667eea; margin: 0 0 10px 0; font-size: 18px; }
                  .property-card p { margin: 8px 0; font-size: 14px; }
                  .summary-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                  .summary-table tr { border-bottom: 1px solid #eee; }
                  .summary-table td { padding: 12px; font-size: 14px; }
                  .summary-table .label { font-weight: 600; color: #666; width: 50%; }
                  .summary-table .value { text-align: right; color: #333; }
                  .summary-table .price { color: #2e7d32; font-weight: 700; font-size: 16px; }
                  .amount-due { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
                  .amount-due p { margin: 5px 0; color: #2e7d32; }
                  .amount-due .amount { font-size: 28px; font-weight: 700; }
                  .footer-note { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; font-size: 13px; color: #666; }
                  .footer-note strong { color: #333; }
                  .footer { text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #999; }
                  .footer a { color: #667eea; text-decoration: none; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="email-content">
                    
                    <div class="header">
                      <div class="success-icon">✅</div>
                      <h1>Booking Confirmed!</h1>
                      <p>Your reservation has been successfully processed</p>
                    </div>

                    <div class="greeting">
                      <p>Hello <strong>${booking.user.name}</strong>,</p>
                      <p>Thank you for booking with <strong>Comfy PG Portal</strong>! 🏠 We're excited to help you find your perfect home.</p>
                    </div>

                    <div class="property-card">
                      <h3>📍 Your Property</h3>
                      <p><strong>${booking.listing.title}</strong></p>
                      <p>📍 ${booking.listing.location}, ${booking.listing.country}</p>
                      <p>📞 ${booking.listing.phoneNumber}</p>
                      <p>👥 Category: ${booking.listing.gender}</p>
                      <p>🛏️ Room Type: ${booking.listing.roomType}</p>
                    </div>

                    <table class="summary-table">
                      <tr>
                        <td class="label">Booking ID:</td>
                        <td class="value"><strong>${booking._id}</strong></td>
                      </tr>
                      <tr>
                        <td class="label">Move-in Date:</td>
                        <td class="value"><strong>${new Date(booking.startDate).toLocaleDateString('en-IN')}</strong></td>
                      </tr>
                      <tr>
                        <td class="label">Sharing Type:</td>
                        <td class="value">${booking.sharingType}</td>
                      </tr>
                      <tr>
                        <td class="label">Payment Method:</td>
                        <td class="value">${booking.paymentMethod === 'token' ? '🏷️ Token Payment' : '💳 Full Payment'}</td>
                      </tr>
                      <tr>
                        <td class="label">Monthly Rent:</td>
                        <td class="value price">₹${totalAmount}</td>
                      </tr>
                      <tr>
                        <td class="label">Amount Paid:</td>
                        <td class="value price">₹${paidAmount}</td>
                      </tr>
                      ${booking.paymentMethod === 'token' ? `
                      <tr>
                        <td class="label">Due at Property:</td>
                        <td class="value price">₹${dueAmount}</td>
                      </tr>
                      ` : ''}
                    </table>

                    <div class="amount-due">
                      <p>Payment Status: <strong>✅ Confirmed</strong></p>
                      <p class="amount">Payment Received: ₹${paidAmount}</p>
                    </div>

                    <div class="footer-note">
                      <strong>📌 Important Information:</strong>
                      <p>✅ Your receipt is attached to this email in PDF format</p>
                      ${booking.paymentMethod === 'token' ? `<p>💰 You need to pay ₹${dueAmount} at the property upon check-in</p>` : ''}
                      <p>📞 For any queries, contact the property owner at ${booking.listing.phoneNumber}</p>
                    </div>

                    <div class="footer">
                      <p>Thank you for choosing <strong>Comfy PG Portal</strong> 🎉</p>
                      <p>For support: <a href="mailto:support@comfypg.com">support@comfypg.com</a></p>
                      <p style="margin-top: 15px; color: #bbb;">
                        © 2024 Comfy PG Portal. All rights reserved.
                      </p>
                    </div>

                  </div>
                </div>
              </body>
              </html>
            `,
            attachments: [
              {
                filename: `receipt_${booking._id}.pdf`,
                content: pdfData,
              },
            ],
          });

          booking.receiptEmailSent = true;
          booking.receiptEmailSentAt = new Date();
          await booking.save();

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

      if (dueAmount > 0) {
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

exports.confirmStripeCheckout = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ message: "Stripe session ID is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const {
      booking,
      totalAmount,
      paidAmount,
      dueAmount,
    } = await updateBookingFromCheckoutSession(session);
    const emailSent = await sendBookingConfirmationEmail(
      booking,
      totalAmount,
      paidAmount,
      dueAmount
    );

    return res.status(200).json({
      success: true,
      message: "Payment confirmed successfully",
      booking,
      emailSent,
      paymentSummary: {
        totalAmount,
        paidAmount,
        dueAmount,
        paymentStatus: booking.paymentStatus,
      },
    });
  } catch (error) {
    console.error("ConfirmStripeCheckout Error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to confirm payment",
    });
  }
};
