import axios from "axios";
import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
import Navbar from "../../components/Header/Navbar";
import { useNavigate } from "react-router-dom";

import AdminUser from "./AdminPages/AdminUser";
import AdminListings from "./AdminPages/AdminListing";
import BACKEND_API from "../../Config/api";

export default function AdminDashboard() {
  const [activePage, setActivePage] = useState("users");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);

  const navigate = useNavigate();

  // FETCH ADMIN DASHBOARD DATA
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await axios.get(
          `${BACKEND_API}/api/v1/admin/adminDashboard`,
          { withCredentials: true }
        );

        console.log("Admin Data =>", res.data);

        // backend returns keys: user & listing
        setUsers(res.data.user || []);
        setListings(res.data.listing || []);

        setLoading(false);
      } catch (err) {
        console.log("AdminDashboard error", err);
        setError("Failed to load admin data.");
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // DELETE USER
  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmDelete) return;

    try {
      const res = await axios.delete(
        `http://localhost:8080/api/v1/admin/deleteUser/${userId}`,
        { withCredentials: true }
      );

      alert(res?.data?.message || "User deleted successfully");

      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.log("Delete user error", err);
    }
  };

  const handleDeleteListing = async (listingId) =>{
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmDelete) return;

    try {
      const res = await axios.delete(
        `http://localhost:8080/api/v1/admin/deleteListing/${listingId}`,
        { withCredentials: true }
      );

      alert(res?.data?.message || "User deleted successfully");

      setListings((prev) => prev.filter((l) => l._id !== listingId));

    } catch (err) {
      console.log("Delete user error", err);
    }
  }

  // NAVIGATE TO HOME PAGE
  const handleHomePage = () => {
    navigate("/");
  };

  // LOADING / ERROR STATES
  if (loading) return <h2 className="loading-text">Loading...</h2>;
  if (error) return <h2 className="error-text">{error}</h2>;

  // MAIN RENDER
  return (
    <div>
      <Navbar />

      <div className="admin-dashboard-container">
        {/* SIDEBAR */}
        <div className="admin-sidebar">
          <h1 className="dashboard-title">Admin Dashboard</h1>

          <button className="navigate-btn" onClick={handleHomePage}>
            Go To Home
          </button>

          <button
            className={activePage === "users" ? "active-tab" : ""}
            onClick={() => setActivePage("users")}
          >
            Users
          </button>

          <button
            className={activePage === "listings" ? "active-tab" : ""}
            onClick={() => setActivePage("listings")}
          >
            Listings
          </button>
        </div>

        {/* MAIN PAGE CONTENT */}
        <div className="admin-right-content">
          {activePage === "users" && (
            <AdminUser users={users} handleDeleteUser={handleDeleteUser} />
          )}

          {activePage === "listings" && (<AdminListings listings={listings} handleDeleteListing = {handleDeleteListing} />)}
        </div>
      </div>
    </div>
  );
}
