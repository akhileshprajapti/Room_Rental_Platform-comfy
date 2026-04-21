import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BACKEND_API from "../../Config/api";
import "./Account.css";

// Sub-components
import ProfileSection from "./components/ProfileSection";
import EditProfileSection from "./components/EditProfileSection";
import BookingsSection from "./components/BookingsSection";

export default function Account() {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_API}/api/v1/user/loginStatus`, {
        withCredentials: true,
      });
      if (response.data && response.data.user) {
        setUser(response.data.user);
      } else {
        console.warn("User not found in response");
        navigate("/LogIn");
      }
    } catch (err) {
      console.error("Login status error:", err);

      if (err.response?.status === 401) {
        navigate("/LogIn");
      } else {
        setError("Server error. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${BACKEND_API}/api/v1/user/logout`,
        {},
        {
          withCredentials: true,
        },
      );
      localStorage.removeItem("user");
      navigate("/LogIn");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="account-container loading-state">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="account-container error-state">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSection user={user} />;
      case "edit":
        return <EditProfileSection user={user} onUpdate={setUser} />;
      case "bookings":
        return <BookingsSection userId={user?._id} />;
      default:
        return <ProfileSection user={user} />;
    }
  };

  return (
    <div className="account-container">
      {/* SIDEBAR */}
      <aside className="account-sidebar">
        <div className="sidebar-header">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <span className="icon">👤</span>
            <span className="label">Account</span>
          </button>

          <button
            className={`nav-item ${activeTab === "edit" ? "active" : ""}`}
            onClick={() => setActiveTab("edit")}
          >
            <span className="icon">✏️</span>
            <span className="label">Edit Profile</span>
          </button>

          <button
            className={`nav-item ${activeTab === "bookings" ? "active" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            <span className="icon">📅</span>
            <span className="label">My Bookings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <span className="icon">🚪</span>
            <span className="label">Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="account-content">
        <div className="content-header">
          <h1>
            {activeTab === "profile"
              ? "My Account"
              : activeTab === "edit"
                ? "Edit Profile"
                : "My Bookings"}
          </h1>
          <p className="breadcrumb">
            Dashboard / {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </p>
        </div>

        <div className="content-body">{renderContent()}</div>
      </main>
    </div>
  );
}
