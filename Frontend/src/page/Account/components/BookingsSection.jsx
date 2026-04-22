import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BACKEND_API from '../../../Config/api';
import './sections.css';

export default function BookingsSection({ userId }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [payingRemaining, setPayingRemaining] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [userId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BACKEND_API}/api/v1/booking/userBookings/${userId}`,
        { withCredentials: true }
      );
      setBookings(response.data.bookings || []);
    } catch (err) {
      setError('Failed to load bookings');
      console.error(err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const getTokenAmount = (booking) => booking?.paymentBreakdown?.tokenAmount || 0;
  const getPaidAmount = (booking) => booking?.amountPaid || 0;
  const getDueAmount = (booking) => booking?.remainingAmount || 0;
  const canDownloadReceipt = (booking) => booking?.status === 'Confirmed' && getPaidAmount(booking) > 0;
  const canPayRemaining = (booking) => booking?.paymentMethod === 'token' && booking?.status === 'Confirmed' && getDueAmount(booking) > 0;

  const handlePayRemaining = async (bookingId) => {
    if (!bookingId) {
      alert('Booking ID not found');
      return;
    }

    try {
      setPayingRemaining(true);
      const response = await axios.post(
        `${BACKEND_API}/api/v1/booking/${bookingId}/pay-remaining`,
        {},
        { withCredentials: true }
      );

      if (response.data?.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error('Payment link not available');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to start remaining payment.');
    } finally {
      setPayingRemaining(false);
    }
  };

  const handleDownloadReceipt = async (bookingId) => {
    if (!bookingId) {
      alert('Booking ID not found');
      return;
    }

    try {
      setDownloading(true);
      const response = await fetch(
        `${BACKEND_API}/api/v1/invoice/${bookingId}`
      );

      if (!response.ok) {
        throw new Error('Invoice not ready');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt_${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Receipt not available yet. Please try again later.');
    } finally {
      setDownloading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!bookingId) {
      alert('Booking ID not found');
      return;
    }

    const shouldCancel = window.confirm('Are you sure you want to cancel this booking?');
    if (!shouldCancel) return;

    try {
      setCancellingId(bookingId);
      await axios.delete(
        `${BACKEND_API}/api/v1/booking/${bookingId}`,
        { withCredentials: true }
      );

      setBookings((currentBookings) => currentBookings.filter((booking) => booking._id !== bookingId));

      if (selectedBooking?._id === bookingId) {
        setShowModal(false);
        setSelectedBooking(null);
      }

      alert('Booking cancelled successfully. Confirmation email sent.');
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bookings-section loading">
        <p>Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bookings-section error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bookings-section">
      {bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No Bookings Yet</h3>
          <p>You haven't made any bookings yet. Start exploring properties now!</p>
          <a href="/Pg" className="btn btn-primary">
            Browse Properties
          </a>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking, index) => (
            <div key={booking._id || index} className="booking-card">
              <div className="booking-header">
                <div className="booking-title">
                  <h3>{booking.listing?.title || 'Property Booking'}</h3>
                  <span className={`status-badge ${getStatusColor(booking.status)}`}>
                    {booking.status || 'Unknown'}
                  </span>
                </div>
                <div className="booking-id">
                  <small>Booking ID: {booking._id?.slice(-8) || 'N/A'}</small>
                </div>
              </div>

              <div className="booking-details">
                <div className="detail-col">
                  <label>Start Date</label>
                  <p>{formatDate(booking.startDate)}</p>
                </div>

                <div className="detail-col">
                  <label>Visit Date</label>
                  <p>{formatDate(booking.visitDate)}</p>
                </div>

                <div className="detail-col">
                  <label>Sharing Type</label>
                  <p>{booking.sharingType || 'N/A'}</p>
                </div>

                <div className="detail-col">
                  <label>Payment Method</label>
                  <p className="payment-method">
                    {booking.paymentMethod === 'token' && '🏷️ Token Payment'}
                    {booking.paymentMethod === 'full' && '💳 Full Payment'}
                    {booking.paymentMethod === 'visit' && '🚶 Pay on Visit'}
                  </p>
                </div>

                <div className="detail-col">
                  <label>Total Rent</label>
                  <p className="price">₹ {booking.totalPrice || 0}</p>
                </div>

                <div className="detail-col">
                  <label>Paid</label>
                  <p className="price">₹ {getPaidAmount(booking)}</p>
                </div>

                <div className="detail-col">
                  <label>Due</label>
                  <p className="price">₹ {getDueAmount(booking)}</p>
                </div>

                <div className="detail-col">
                  <label>Booked On</label>
                  <p>{formatDate(booking.createdAt)}</p>
                </div>
              </div>

              <div className="booking-location">
                <span className="icon">📍</span>
                <p>{booking.listing?.location || 'Location not available'}</p>
              </div>

              <div className="booking-actions">
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => handleViewDetails(booking)}
                >
                  👁️ View Details
                </button>
                {canPayRemaining(booking) && (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handlePayRemaining(booking._id)}
                    disabled={payingRemaining}
                  >
                    {payingRemaining ? '⏳ Opening Payment...' : '💳 Pay Remaining'}
                  </button>
                )}
                {canDownloadReceipt(booking) && (
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => handleDownloadReceipt(booking._id)}
                    disabled={downloading}
                  >
                    {downloading ? '⏳ Downloading...' : '📥 Download Receipt'}
                  </button>
                )}
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleCancelBooking(booking._id)}
                  disabled={cancellingId === booking._id}
                >
                  {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAILS MODAL */}
      {showModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            <h2>📍 Property Details</h2>

            {/* PG Image */}
            {selectedBooking.listing?.image && selectedBooking.listing.image.length > 0 && (
              <div className="property-image">
                <img 
                  src={selectedBooking.listing.image[0].url} 
                  alt="PG" 
                />
              </div>
            )}

            {/* Property Info */}
            <div className="property-info">
              <div className="info-group">
                <h3>{selectedBooking.listing?.title}</h3>
                <p className="location">📍 {selectedBooking.listing?.location}, {selectedBooking.listing?.country}</p>
              </div>

              {/* Contact */}
              <div className="info-group">
                <h4>Contact Information</h4>
                <p>📞 {selectedBooking.listing?.phoneNumber}</p>
                <p>✉️ {selectedBooking.listing?.email}</p>
              </div>

              {/* Description */}
              {selectedBooking.listing?.description && (
                <div className="info-group">
                  <h4>About</h4>
                  <p>{selectedBooking.listing.description}</p>
                </div>
              )}

              {/* Amenities */}
              {selectedBooking.listing?.amenities && selectedBooking.listing.amenities.length > 0 && (
                <div className="info-group">
                  <h4>✨ Amenities</h4>
                  <div className="amenities-list">
                    {selectedBooking.listing.amenities.map((amenity, idx) => (
                      <span key={idx} className="amenity-tag">{amenity}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Details Table */}
              <div className="info-group">
                <h4>Booking Details</h4>
                <table className="details-table">
                  <tbody>
                    <tr>
                      <td>Room Type:</td>
                      <td>{selectedBooking.listing?.roomType}</td>
                    </tr>
                    <tr>
                      <td>Gender:</td>
                      <td>{selectedBooking.listing?.gender}</td>
                    </tr>
                    <tr>
                      <td>Sharing Type:</td>
                      <td>{selectedBooking.sharingType}</td>
                    </tr>
                    <tr>
                      <td>Price/Month:</td>
                      <td className="price">₹{selectedBooking.listing?.price}</td>
                    </tr>
                    <tr>
                      <td>Start Date:</td>
                      <td>{formatDate(selectedBooking.startDate)}</td>
                    </tr>
                    <tr>
                      <td>Payment Method:</td>
                      <td>{selectedBooking.paymentMethod === 'token' ? '🏷️ Token' : selectedBooking.paymentMethod === 'full' ? '💳 Full' : '🚶 Visit'}</td>
                    </tr>
                    <tr>
                      <td>Total Rent:</td>
                      <td className="price">₹{selectedBooking.totalPrice}</td>
                    </tr>
                    <tr>
                      <td>Token Amount:</td>
                      <td className="price">₹{getTokenAmount(selectedBooking)}</td>
                    </tr>
                    <tr>
                      <td>Amount Paid:</td>
                      <td className="price">₹{getPaidAmount(selectedBooking)}</td>
                    </tr>
                    <tr>
                      <td>Due Amount:</td>
                      <td className="price">₹{getDueAmount(selectedBooking)}</td>
                    </tr>
                    <tr>
                      <td>Payment Status:</td>
                      <td>{selectedBooking.paymentStatus || 'Pending'}</td>
                    </tr>
                    <tr>
                      <td>Status:</td>
                      <td><span className={`status-badge ${getStatusColor(selectedBooking.status)}`}>{selectedBooking.status}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Download Button in Modal */}
              {canPayRemaining(selectedBooking) && (
                <button
                  className="btn btn-primary btn-block"
                  onClick={() => handlePayRemaining(selectedBooking._id)}
                  disabled={payingRemaining}
                >
                  {payingRemaining ? '⏳ Opening Payment...' : '💳 Pay Remaining Amount'}
                </button>
              )}

              {canDownloadReceipt(selectedBooking) && (
                <button 
                  className="btn btn-primary btn-block"
                  onClick={() => {
                    handleDownloadReceipt(selectedBooking._id);
                  }}
                  disabled={downloading}
                >
                  {downloading ? '⏳ Downloading Receipt...' : '📥 Download Receipt as PDF'}
                </button>
              )}
              <button
                className="btn btn-secondary btn-block"
                onClick={() => handleCancelBooking(selectedBooking._id)}
                disabled={cancellingId === selectedBooking._id}
              >
                {cancellingId === selectedBooking._id ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
