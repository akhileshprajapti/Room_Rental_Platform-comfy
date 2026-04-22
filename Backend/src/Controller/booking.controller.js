const Booking = require("../Models/booking.model");
const Listing = require("../Models/listing.model");
const nodemailer = require("nodemailer");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { getPaymentSummary } = require("../Utils/paymentSummary");

// Email Transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const calculateBookingAmounts = (listingPrice, paymentMethod) => {
  const totalAmount = Number(listingPrice) || 0;
  const tokenAmount = Math.round(totalAmount * 0.10);

  if (paymentMethod === "token") {
    return {
      totalAmount,
      checkoutAmount: tokenAmount,
      amountPaid: 0,
      remainingAmount: totalAmount,
      tokenAmount,
      fullPayment: 0,
      needsPayment: true,
      paymentStatus: "Pending",
      status: "Pending",
    };
  }

  if (paymentMethod === "full") {
    return {
      totalAmount,
      checkoutAmount: totalAmount,
      amountPaid: 0,
      remainingAmount: totalAmount,
      tokenAmount: 0,
      fullPayment: totalAmount,
      needsPayment: true,
      paymentStatus: "Pending",
      status: "Pending",
    };
  }

  return {
    totalAmount,
    checkoutAmount: 0,
    amountPaid: 0,
    remainingAmount: totalAmount,
    tokenAmount: 0,
    fullPayment: 0,
    needsPayment: false,
    paymentStatus: "Pending",
    status: "Confirmed",
  };
};

module.exports.createBooking = async (req, res) => {
  try {
    const { listingId, startDate, visitDate, paymentMethod, sharingType } = req.body;

    // ✅ Check user
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // ✅ Get listing
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // ✅ Pricing
    const selectedPaymentMethod = ["token", "full", "visit"].includes(paymentMethod)
      ? paymentMethod
      : "token";
    const amounts = calculateBookingAmounts(listing.price, selectedPaymentMethod);

    // ✅ Create booking
    const booking = await Booking.create({
      user: req.user._id,
      listing: listingId,
      startDate,
      visitDate,
      paymentMethod: selectedPaymentMethod,
      sharingType,
      totalPrice: amounts.totalAmount,
      checkoutAmount: amounts.checkoutAmount,
      amountPaid: amounts.amountPaid,
      remainingAmount: amounts.remainingAmount,
      paymentStatus: amounts.paymentStatus,
      status: amounts.status,
      paymentBreakdown: {
        tokenAmount: amounts.tokenAmount,
        remainingAmount: amounts.remainingAmount,
        fullPayment: amounts.fullPayment,
      },
    });

    let paymentUrl = null;

    // ✅ Stripe Payment
    if (amounts.needsPayment) {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          metadata: {
            bookingId: booking._id.toString(),
            paymentPurpose: "initial",
          },
          line_items: [
            {
              price_data: {
                currency: "inr",
                product_data: {
                  name: listing.title,
                  description: `Move-in Date: ${startDate}`,
                },
                unit_amount: amounts.checkoutAmount * 100,
              },
              quantity: 1,
            },
          ],
          success_url: `${process.env.FRONTEND_URL}/payment-success?id=${booking._id}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
        });

        if (!session.url) {
          throw new Error("Stripe session URL missing");
        }

        paymentUrl = session.url;

      } catch (stripeError) {
        console.error("Stripe Error:", stripeError.message);

        return res.status(500).json({
          message: "Stripe error",
          error: stripeError.message,
        });
      }
    }

    // ✅ Email
    const progressMail = {
      from: `"🏠 Comfy PG Booking" <${process.env.EMAIL_USER}>`,
      to: req.user.email,
      subject: amounts.needsPayment
        ? "⏳ Complete Your Payment - Booking Request Received 🏠"
        : "✅ Booking Confirmed - Visit Scheduled 🎉",
      html: amounts.needsPayment ? `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; }
            .email-content { background: white; border-radius: 8px; padding: 30px; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { color: #f57c00; font-size: 28px; margin: 0; }
            .icon { font-size: 50px; text-align: center; margin-bottom: 15px; }
            .property-card { background: #f8f9fa; border-left: 4px solid #f57c00; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .property-card h3 { color: #f57c00; margin: 0 0 10px 0; }
            .property-card p { margin: 8px 0; font-size: 14px; }
            .price-box { background: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
            .price-box .amount { font-size: 32px; font-weight: 700; color: #f57c00; }
            .cta-button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; border: none; border-radius: 5px; cursor: pointer; display: inline-block; text-decoration: none; font-weight: 600; font-size: 16px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-content">
              <div class="header">
                <div class="icon">⏳</div>
                <h1>Payment Required</h1>
                <p>Complete your booking in 2 easy steps</p>
              </div>

              <p>Hello <strong>${req.user.name}</strong>,</p>
              <p>Your booking request has been received! Now complete the payment to confirm your reservation.</p>

              <div class="property-card">
                <h3>📍 Your Property</h3>
                <p><strong>${listing.title}</strong></p>
                <p>📍 ${listing.location}</p>
                <p>🛏️ Move-in: ${startDate}</p>
              </div>

              <div class="price-box">
                <p>Amount to Pay</p>
                <div class="amount">₹${amounts.checkoutAmount}</div>
                <small>${selectedPaymentMethod === 'token' ? `(10% token now. Remaining due: ₹${amounts.totalAmount - amounts.tokenAmount})` : '(Full Payment)'}</small>
              </div>

              <p style="text-align: center; font-size: 14px; color: #666;">
                Click the button below to proceed with secure payment
              </p>

              <center>
                <a href="${paymentUrl}" class="cta-button">💳 Complete Payment</a>
              </center>

              <p style="margin-top: 30px; font-size: 13px; color: #999;">
                This link is valid for 24 hours. If it expires, you'll need to create a new booking.
              </p>

              <div class="footer">
                <p>Thank you for choosing <strong>Comfy PG Portal</strong> 🏠</p>
                <p>Questions? Contact us at support@comfypg.com</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      ` : `
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
            .icon { font-size: 50px; text-align: center; margin-bottom: 15px; }
            .property-card { background: #f8f9fa; border-left: 4px solid #2e7d32; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .property-card h3 { color: #2e7d32; margin: 0 0 10px 0; }
            .property-card p { margin: 8px 0; font-size: 14px; }
            .visit-date-box { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .visit-date-box p { margin: 8px 0; }
            .footer { text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-content">
              <div class="header">
                <div class="icon">✅</div>
                <h1>Visit Scheduled!</h1>
                <p>Your booking request is confirmed</p>
              </div>

              <p>Hello <strong>${req.user.name}</strong>,</p>
              <p>Great! Your visit has been scheduled. The property manager will contact you soon.</p>

              <div class="property-card">
                <h3>📍 Property Details</h3>
                <p><strong>${listing.title}</strong></p>
                <p>📍 ${listing.location}</p>
                <p>📞 ${listing.phoneNumber}</p>
              </div>

              <div class="visit-date-box">
                <p><strong>📅 Scheduled Visit Date:</strong></p>
                <p style="font-size: 18px; color: #2e7d32; font-weight: 600;">${visitDate}</p>
                <p><strong>🏠 Move-in Date (if interested):</strong></p>
                <p>${startDate}</p>
              </div>

              <p style="margin-top: 20px; font-size: 13px; color: #666;">
                The property manager will contact you at your registered email or phone number to confirm the visit timing.
              </p>

              <div class="footer">
                <p>Thank you for choosing <strong>Comfy PG Portal</strong> 🏠</p>
                <p>Questions? Contact us at support@comfypg.com</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await transporter.sendMail(progressMail);
    } catch (mailError) {
      console.error("Email Error:", mailError.message);
    }

    // ✅ Response
    res.status(201).json({
      success: true,
      message: amounts.needsPayment
        ? "Redirecting to payment..."
        : "Booking confirmed successfully.",
      booking,
      paymentUrl,
    });

  } catch (error) {
    console.error("Booking Error:", error.message);

    res.status(500).json({
      message: "Internal server error during booking",
      error: error.message,
    });
  }
};

module.exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user is requesting their own bookings
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const bookings = await Booking.find({ user: userId })
      .populate('listing', 'title location price image country phoneNumber email description amenities roomType gender')
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

    res.status(200).json({
      success: true,
      bookings: normalizedBookings,
      count: normalizedBookings.length
    });
  } catch (error) {
    console.error("GetUserBookings Error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};

module.exports.getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate("listing")
      .populate("user", "name email phone role");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const summary = getPaymentSummary(booking);
    const canDownloadReceipt = booking.status === "Confirmed" && summary.paidAmount > 0;
    const canPayRemaining = booking.paymentMethod === "token" && booking.status === "Confirmed" && summary.dueAmount > 0;

    res.status(200).json({
      success: true,
      booking: {
        ...booking.toObject(),
        totalPrice: summary.totalAmount,
        amountPaid: summary.paidAmount,
        remainingAmount: summary.dueAmount,
        paymentStatus: summary.paymentStatus,
      },
      paymentSummary: {
        totalAmount: summary.totalAmount,
        tokenAmount: summary.tokenAmount,
        amountPaid: summary.paidAmount,
        dueAmount: summary.dueAmount,
        paymentMethod: booking.paymentMethod,
        paymentStatus: summary.paymentStatus,
      },
      actions: {
        canDownloadReceipt,
        receiptDownloadUrl: canDownloadReceipt
          ? `/api/v1/invoice/${booking._id}`
          : null,
        canPayRemaining,
        payRemainingUrl: canPayRemaining
          ? `/api/v1/booking/${booking._id}/pay-remaining`
          : null,
      },
    });
  } catch (error) {
    console.error("GetBookingDetails Error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports.payRemainingAmount = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate("listing");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    if (booking.status !== "Confirmed") {
      return res.status(400).json({ message: "Booking is not confirmed yet" });
    }

    if (booking.paymentMethod !== "token") {
      return res.status(400).json({ message: "Remaining payment is only available for token bookings" });
    }

    const summary = getPaymentSummary(booking);

    if (summary.dueAmount <= 0) {
      return res.status(400).json({ message: "No remaining amount to pay" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      metadata: {
        bookingId: booking._id.toString(),
        paymentPurpose: "remaining",
      },
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `${booking.listing.title} - Remaining Payment`,
              description: `Remaining balance for booking ${booking._id}`,
            },
            unit_amount: summary.dueAmount * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/payment-success?id=${booking._id}&type=remaining&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
    });

    res.status(200).json({
      success: true,
      message: "Redirecting to remaining payment...",
      paymentUrl: session.url,
      booking,
    });
  } catch (error) {
    console.error("PayRemainingAmount Error:", error);
    res.status(500).json({
      message: "Internal server error during remaining payment",
      error: error.message,
    });
  }
};

module.exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate("listing", "title location")
      .populate("user", "name email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    try {
      await transporter.sendMail({
        from: `"Comfy PG Booking" <${process.env.EMAIL_USER}>`,
        to: booking.user.email,
        subject: "Booking Cancelled Successfully",
        html: `
          <h2>Your booking is cancelled successfully</h2>
          <p>Hello <strong>${booking.user.name}</strong>,</p>
          <p>Your booking for <strong>${booking.listing?.title || "the property"}</strong> has been cancelled successfully.</p>
          <p><strong>Booking ID:</strong> ${booking._id}</p>
          <p><strong>Location:</strong> ${booking.listing?.location || "N/A"}</p>
          <p>If this was a mistake, you can create a new booking from your account.</p>
          <p>Thank you for using Comfy PG Portal.</p>
        `,
      });
    } catch (mailError) {
      console.error("Cancel Booking Email Error:", mailError.message);
    }

    await Booking.findByIdAndDelete(bookingId);

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      bookingId,
    });
  } catch (error) {
    console.error("CancelBooking Error:", error);
    return res.status(500).json({
      message: "Internal server error during booking cancellation",
      error: error.message,
    });
  }
};
