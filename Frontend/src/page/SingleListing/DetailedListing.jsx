import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./DetailedListing.css";
import Navbar from "../../components/Header/Navbar";
import BACKEND_API from "../../Config/api";
import BookingPages from "../Booking/BookingPage.jsx"; 

export default function ListingDetails() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [editError, setEditError] = useState("");
  const [fullscreenImg, setFullscreenImg] = useState(null);

  // Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);

  const navigate = useNavigate();

  /** FETCH LISTING */
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await axios.get(`${BACKEND_API}/api/v1/listing/${id}`);
        // Ensure we set the listing correctly based on backend response structure
        setListing(res.data.listing || res.data);
      } catch (err) {
        setMessage("Error loading details");
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  /** DELETE LISTING */
  const handleDelete = async () => {
    try {
      const res = await axios.delete(`${BACKEND_API}/api/v1/listing/${id}`, {
        withCredentials: true,
      });
      setMessage(res.data.message || "Listing deleted successfully");
      setTimeout(() => navigate("/Pg"), 1500);
    } catch (error) {
      setEditError(error.response?.data?.message || "Delete failed");
      setTimeout(() => setEditError(""), 1500);
    }
  };

  /** EDIT LOGIC */
  const openEdit = () => {
    setEditData({ ...listing });
    setEditMode(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${BACKEND_API}/api/v1/listing/${id}`, editData, { withCredentials: true });
      setMessage("Update Successful");
      setEditMode(false);
      setListing(res.data.listing || res.data);
      setTimeout(() => setMessage(""), 1500);
    } catch (error) {
      setEditError("Update failed");
      setTimeout(() => setEditError(""), 1500);
    }
  };

  if (loading) return <p className="loading">Loading...</p>;
  if (!listing) return <p>Listing not found.</p>;

  return (
    <div className="details-page">
      <Navbar />
      {editError && <p className="error-text" style={{color: 'red'}}>{editError}</p>}
      {message && <p className="success-text" style={{color: 'green'}}>{message}</p>}
      
      <div className="details-container">
        {/* ACTION BUTTONS */}
        <div className="btn-container">
          <button className="book-btn" onClick={handleDelete}>Delete</button>
          <button className="book-btn" onClick={openEdit}>Edit</button>
        </div>

        {/* IMAGE SLIDER */}
        <div className="details-image-slider">
          {listing.image?.map((img, index) => (
            <img 
              key={index} 
              src={img?.url} 
              alt="Room" 
              className="slider-img" 
              onClick={() => setFullscreenImg(img.url)} 
            />
          ))}
        </div>

        {fullscreenImg && (
          <div className="fullscreen-viewer" onClick={() => setFullscreenImg(null)}>
            <img src={fullscreenImg} className="fullscreen-img" alt="Zoom" />
          </div>
        )}

        {/* LEFT INFO SECTION */}
        <div className="listing-info">
          <div className="info-header">
            <h1>{listing.title}</h1>
            {/* BOOKING STATUS DISPLAY */}
            <div className={`status-badge ${listing.isBooked ? 'booked' : 'available'}`}>
              {listing.isBooked ? "● Fully Booked" : "● Available Now"}
            </div>
            
            <div className="price-box">
              <span className="price">₹{listing.price}</span>
              <span className="permonth">/ month</span>
            </div>
          </div>

          <div className="booking-box">
            <h3>Description</h3>
            <p className="full-desc">{listing.description}</p>

            <h3>Contact info</h3>
            <p className="full-desc">{listing.phoneNumber}</p>

            <h3>Gender</h3>
            <p className="full-desc">{listing.gender}</p>

            <h3>Location</h3>
            <p className="full-desc">{listing.location}, {listing.country}</p>

            <h3>Room Type</h3>
            <p className="full-desc">{listing.roomType}</p>

            <h3>Amenities</h3>
            <div className="amenities-box">
              {listing.amenities?.map((a, i) => (
                <div key={i} className="amenity-pill">{a}</div>
              ))}
            </div>

            <h3 className="owner">Owner</h3>
            <p className="full-desc">{listing.owner?.name}</p>
            <p className="full-desc">{listing.owner?.email}</p>
          </div>
        </div>

        {/* RIGHT BOOKING BOX */}
        <div className="booking-box">
          <h2>₹{listing.price}</h2>
          <p className="per-month">per month</p>
          <button
            className="book-btn"
            disabled={listing.isBooked} // Disable if already booked
            onClick={() => setShowBookingModal(true)} 
          >
            {listing.isBooked ? "Not Available" : "Book Now"}
          </button>
        </div>
      </div>

      {/* OVERLAPPING MODAL */}
      {showBookingModal && (
        <BookingPages 
          onClose={() => setShowBookingModal(false)} 
          listing={listing}
        />
      )}

      {/* EDIT MODAL REMAINS THE SAME AS YOUR ORIGINAL CODE */}
    </div>
  );
}