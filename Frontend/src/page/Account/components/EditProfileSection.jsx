import React, { useState } from 'react';
import axios from 'axios';
import BACKEND_API from '../../../Config/api';
import './sections.css';

export default function EditProfileSection({ user, onUpdate }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setMessageType('error');
      setMessage('Name is required');
      return;
    }

    if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone)) {
      setMessageType('error');
      setMessage('Phone number must be exactly 10 digits');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `${BACKEND_API}/api/v1/user/updateProfile`,
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        setMessageType('success');
        setMessage('Profile updated successfully!');
        onUpdate(response.data.user);
      }
    } catch (error) {
      setMessageType('error');
      setMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-section">
      <form onSubmit={handleSubmit} className="edit-form">
        {message && (
          <div className={`alert alert-${messageType}`}>
            {message}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled
            className="disabled-input"
          />
          <small>Email cannot be changed</small>
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter 10-digit phone number"
            maxLength="10"
            pattern="[0-9]{10}"
            required
          />
          <small>Must be 10 digits</small>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Save Changes'}
          </button>
          <button type="reset" className="btn btn-secondary">
            Reset
          </button>
        </div>
      </form>

      {/* Password Change Section */}
      <div className="password-section">
        <h3>Change Password</h3>
        <form className="password-form">
          <div className="form-group">
            <label htmlFor="current-password">Current Password</label>
            <input
              type="password"
              id="current-password"
              placeholder="Enter current password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="new-password">New Password</label>
            <input
              type="password"
              id="new-password"
              placeholder="Enter new password (min 6 characters)"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              placeholder="Confirm new password"
              minLength="6"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled>
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
