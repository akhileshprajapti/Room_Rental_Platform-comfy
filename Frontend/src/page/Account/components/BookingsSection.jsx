import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BACKEND_API from '../../../Config/api';
import './sections.css';

export default function BookingsSection({ userId }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
                  <label>Total Price</label>
                  <p className="price">₹ {booking.totalPrice || 0}</p>
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
                <button className="btn btn-sm btn-outline">View Details</button>
                {booking.status === 'Confirmed' && (
                  <button className="btn btn-sm btn-outline-danger">Cancel Booking</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
