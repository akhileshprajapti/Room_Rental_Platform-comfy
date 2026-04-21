const Booking = require("../Models/booking.model");
const Listing = require("../Models/listing.model");
const nodemailer = require("nodemailer");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Email Transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

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
    let finalPrice = Number(listing.price);
    let needsPayment = false;

    if (paymentMethod === "token") {
      finalPrice = Math.round(listing.price * 0.10);
      needsPayment = true;
    } else if (paymentMethod === "full") {
      finalPrice = listing.price;
      needsPayment = true;
    } else if (paymentMethod === "visit") {
      finalPrice = 0;
      needsPayment = false;
    }

    // ✅ Create booking
    const booking = await Booking.create({
      user: req.user._id,
      listing: listingId,
      startDate,
      visitDate,
      paymentMethod,
      sharingType,
      totalPrice: finalPrice,
      status: needsPayment ? "Pending" : "Confirmed",
    });

    let paymentUrl = null;

    // ✅ Stripe Payment
    if (needsPayment) {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          metadata: { bookingId: booking._id.toString() },
          line_items: [
            {
              price_data: {
                currency: "inr",
                product_data: {
                  name: listing.title,
                  description: `Move-in Date: ${startDate}`,
                },
                unit_amount: finalPrice * 100,
              },
              quantity: 1,
            },
          ],
          success_url: `${process.env.FRONTEND_URL}/payment-success?id=${booking._id}`,
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
      from: `"PG Booking Portal" <${process.env.EMAIL_USER}>`,
      to: req.user.email,
      subject: needsPayment
        ? "Action Required: Complete your Payment! 🏠"
        : "Booking Confirmed! ✅",
      html: `
        <h1>${needsPayment ? "Payment Required" : "Booking Received"}</h1>
        <p>Hello ${req.user.name},</p>
        <p>Booking for: <b>${listing.title}</b></p>
        <p><b>Total Amount:</b> ₹${finalPrice}</p>
        ${
          needsPayment
            ? `<p>Please complete your payment: <a href="${paymentUrl}">Pay Now</a></p>`
            : `<p>Your visit is confirmed for ${visitDate}</p>`
        }
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
      message: needsPayment
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
      .populate('listing', 'title location price')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error("GetUserBookings Error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};