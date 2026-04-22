import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import BACKEND_API from "../../Config/api";
import "./payment.css";

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const bookingId = params.get("id");
  const sessionId = params.get("session_id");

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [ready, setReady] = useState(false);
  const invoiceUrl = `${BACKEND_API}/api/v1/invoice/${bookingId}${sessionId ? `?session_id=${sessionId}` : ""}`;

  // 🔥 WAIT FOR WEBHOOK (AUTO CHECK)
  useEffect(() => {
    let attempts = 0;
    let cancelled = false;

    const confirmPayment = async () => {
      if (!sessionId) return;

      await fetch(
        `${BACKEND_API}/api/v1/booking/confirm-payment/${sessionId}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
    };

    const checkInvoice = async () => {
      try {
        await confirmPayment();

        if (cancelled) return;

        const res = await fetch(invoiceUrl);

        if (res.ok) {
          setReady(true);
          setLoading(false);
          return;
        }
      } catch (err) {}

      attempts++;

      if (attempts < 10) {
        setTimeout(checkInvoice, 2000); // retry every 2 sec
      } else {
        setLoading(false);
      }
    };

    if (bookingId) {
      checkInvoice();
    }

    return () => {
      cancelled = true;
    };
  }, [bookingId, sessionId]);

  // 🔥 DOWNLOAD FUNCTION
  const downloadInvoice = async () => {
    if (!bookingId) {
      alert("Booking ID not found");
      return;
    }

    try {
      setDownloading(true);

      const response = await fetch(invoiceUrl);

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

        <div className="success-icon-large">✅</div>
        
        <h1>Payment Successful!</h1>
        <p className="success-subtitle">Your booking has been confirmed</p>

        <p className="booking-id">
          Booking ID: <strong>{bookingId}</strong>
        </p>

        <div className="success-info-box">
          <p>✉️ A confirmation email with your receipt has been sent to your registered email address.</p>
        </div>

        {/* 🔄 LOADING */}
        {loading && (
          <div className="loading-box">
            <p>⏳ Preparing your invoice PDF...</p>
            <div className="spinner"></div>
          </div>
        )}

        {/* ✅ READY */}
        {ready && (
          <button
            className="download-btn"
            onClick={downloadInvoice}
            disabled={downloading}
          >
            {downloading ? '⏳ Downloading...' : '📥 Download Receipt PDF'}
          </button>
        )}

        {/* ❌ NOT READY AFTER RETRY */}
        {!loading && !ready && (
          <div className="retry-box">
            <p>⚠️ Invoice is still being prepared. Please try downloading again in a few moments.</p>
            <button 
              className="download-btn"
              onClick={() => {
                setLoading(true);
                // Retry checking
                if (sessionId) {
                  fetch(`${BACKEND_API}/api/v1/booking/confirm-payment/${sessionId}`, {
                    credentials: "include",
                  }).finally(() => {
                    fetch(invoiceUrl)
                      .then(r => {
                        if (r.ok) {
                          setReady(true);
                        }
                        setLoading(false);
                      })
                      .catch(() => setLoading(false));
                  });
                  return;
                }

                fetch(invoiceUrl)
                  .then(r => {
                    if (r.ok) {
                      setReady(true);
                    }
                    setLoading(false);
                  })
                  .catch(() => setLoading(false));
              }}
            >
              🔄 Retry
            </button>
          </div>
        )}

        <button
          className="home-btn"
          onClick={() => (window.location.href = "/Account")}
        >
          Go to My Bookings
        </button>

      </div>
    </div>
  );
};

export default PaymentSuccess;
