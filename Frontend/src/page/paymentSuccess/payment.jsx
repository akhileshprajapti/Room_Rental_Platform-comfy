import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "./payment.css";

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const bookingId = params.get("id");

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [ready, setReady] = useState(false);

  // 🔥 WAIT FOR WEBHOOK (AUTO CHECK)
  useEffect(() => {
    let attempts = 0;

    const checkInvoice = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/v1/invoice/${bookingId}`
        );

        if (res.ok) {
          setReady(true);
          setLoading(false);
          return;
        }
      } catch (err) {}

      attempts++;

      if (attempts < 5) {
        setTimeout(checkInvoice, 2000); // retry every 2 sec
      } else {
        setLoading(false);
      }
    };

    if (bookingId) {
      checkInvoice();
    }
  }, [bookingId]);

  // 🔥 DOWNLOAD FUNCTION
  const downloadInvoice = async () => {
    if (!bookingId) {
      alert("Booking ID not found");
      return;
    }

    try {
      setDownloading(true);

      const response = await fetch(
        `http://localhost:8080/api/v1/invoice/${bookingId}`
      );

      if (!response.ok) {
        throw new Error("Invoice not ready");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice_${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (error) {
      alert("Invoice not ready. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="success-container">
      <div className="success-card">

        <h1>✅ Payment Successful</h1>
        <p>Your booking is confirmed!</p>

        <p className="booking-id">
          Booking ID: <strong>{bookingId}</strong>
        </p>

        {/* 🔄 LOADING */}
        {loading && <p>⏳ Preparing your invoice...</p>}

        {/* ✅ READY */}
        {ready && (
          <button
            className="download-btn"
            onClick={downloadInvoice}
            disabled={downloading}
          >
            {downloading ? "Downloading..." : "Download Invoice PDF"}
          </button>
        )}

        {/* ❌ NOT READY AFTER RETRY */}
        {!loading && !ready && (
          <p style={{ color: "red" }}>
            Invoice not ready yet. Please click again after few seconds.
          </p>
        )}

        <button
          className="home-btn"
          onClick={() => (window.location.href = "/")}
        >
          Go to Home
        </button>

      </div>
    </div>
  );
};

export default PaymentSuccess;