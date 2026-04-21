import React from 'react';
import './sections.css';

export default function ProfileSection({ user }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="profile-section">
      <div className="profile-grid">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="card-header">
            <h3>Personal Information</h3>
            <span className="badge verified">✓ Verified</span>
          </div>

          <div className="profile-details">
            <div className="detail-item">
              <label>Full Name</label>
              <p>{user?.name || 'N/A'}</p>
            </div>

            <div className="detail-item">
              <label>Email Address</label>
              <p>{user?.email || 'N/A'}</p>
            </div>

            <div className="detail-item">
              <label>Phone Number</label>
              <p>{user?.phone || 'Not provided'}</p>
            </div>

            <div className="detail-item">
              <label>Account Type</label>
              <p className="role-badge">{user?.role || 'User'}</p>
            </div>

            <div className="detail-item">
              <label>Member Since</label>
              <p>{formatDate(user?.createdAt)}</p>
            </div>

            <div className="detail-item">
              <label>Account Status</label>
              <p>
                <span className="status-active">🟢 Active</span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats-card">
          <h3>Account Stats</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">0</span>
              <span className="stat-label">Total Bookings</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">0</span>
              <span className="stat-label">Listings Created</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">100%</span>
              <span className="stat-label">Profile Complete</span>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="security-card">
          <h3>Security</h3>
          <div className="security-items">
            <div className="security-item">
              <span className="icon">🔒</span>
              <div>
                <p className="title">Password</p>
                <p className="desc">Last changed: Never</p>
              </div>
            </div>
            <div className="security-item">
              <span className="icon">📧</span>
              <div>
                <p className="title">Email Verification</p>
                <p className="desc verified-text">✓ Verified</p>
              </div>
            </div>
            <div className="security-item">
              <span className="icon">🔐</span>
              <div>
                <p className="title">Two-Factor Auth</p>
                <p className="desc">Not enabled</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
