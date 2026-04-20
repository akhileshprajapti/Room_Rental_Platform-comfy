import React, { useState } from "react";
import axios from "axios";
import "./BookingPage.css";

export default function BookingModal({ onClose, listing }) {
  const [sharing, setSharing] = useState("single");
  const [paymentChoice, setPaymentChoice] = useState("token");
  const [visitDate, setVisitDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFinalSubmit = async () => {
    // ✅ Check listing
    if (!listing || !listing._id) {
      alert("Listing not found. Please refresh.");
      return;
    }

    // ✅ Validate dates
    if (!startDate) {
      alert("Please select Start Date.");
      return;
    }

    if (paymentChoice === "visit" && !visitDate) {
      alert("Please select Visit Date.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/v1/booking/create",
        {
          listingId: listing._id,
          startDate,
          visitDate: visitDate || null,
          paymentMethod: paymentChoice,
          sharingType: sharing,
        },
        { withCredentials: true }
      );

      // ✅ 🔥 FIXED LOGIC
      if (response.data.paymentUrl) {
        // 👉 Redirect to Stripe Payment Page
        window.location.href = response.data.paymentUrl;
        return;
      }

      // 👉 No payment (visit booking)
      setIsSuccess(true);
      setTimeout(() => onClose(), 3000);

    } catch (error) {
      console.error("Booking Error:", error);
      alert(error.response?.data?.message || "Something went wrong.");
      setLoading(false);
    }
  };

  // ✅ Success UI
  if (isSuccess) {
    return (
      <div className="modal-overlay">
        <div className="modal-box success-container">
          <div className="success-icon">✅</div>
          <h2 className="success-title">Booking Confirmed!</h2>
          <p className="success-text">
            Your booking request is submitted successfully.
          </p>
          <button className="confirm-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        {/* Header */}
        <div className="modal-header">
          <h2>Book This PG</h2>
          <span className="close-btn" onClick={onClose}>✕</span>
        </div>

        {/* Sharing */}
        <div className="section">
          <p className="label">Select Sharing Type</p>
          <div className="btn-group">
            <button
              className={sharing === "single" ? "active" : ""}
              onClick={() => setSharing("single")}
            >
              Single Sharing
            </button>

            <button
              className={sharing === "double" ? "active" : ""}
              onClick={() => setSharing("double")}
            >
              Double Sharing
            </button>
          </div>
        </div>

        {/* Payment */}
        <div className="section">
          <p className="label">Select Payment Method</p>

          <div className="btn-group">
            <button
              className={paymentChoice === "token" ? "active" : ""}
              onClick={() => setPaymentChoice("token")}
            >
              Token (10%)
            </button>

            {/* ❌ removed "pg" → replaced with visit */}
            <button
              className={paymentChoice === "visit" ? "active" : ""}
              onClick={() => setPaymentChoice("visit")}
            >
              Book Visit
            </button>
          </div>

          <button
            className={`book-now ${paymentChoice === "full" ? "active-full" : ""}`}
            onClick={() => setPaymentChoice("full")}
          >
            Book Now (Full Payment)
          </button>
        </div>

        {/* Dates */}
        <div className="date-section">
          <div>
            <p className="label">Visit Date</p>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
            />
          </div>

          <div>
            <p className="label">Start Date</p>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <p className="loading-msg">
            Processing your booking...
          </p>
        )}

        {/* Footer */}
        <div className="modal-footer">
          <button
            className="cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="confirm-btn"
            onClick={handleFinalSubmit}
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm Booking"}
          </button>
        </div>

      </div>
    </div>
  );
}