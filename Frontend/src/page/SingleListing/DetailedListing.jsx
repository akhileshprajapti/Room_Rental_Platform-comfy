import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./DetailedListing.css";
import Navbar from "../../components/Header/Navbar";
import BACKEND_API from "../../Config/api";

export default function ListingDetails() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [editError, setEditError] = useState("");

  const navigate = useNavigate();

  const [fullscreenImg, setFullscreenImg] = useState(null);

  /** FETCH LISTING */
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await axios.get(
          `${BACKEND_API}/api/v1/listing/${id}`
        );
        setListing(res.data);
      } catch (err) {
        setMessage("Error loading details",err);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  /** DELETE LISTING */
  const handleDelete = async () => {
    try {
      const res = await axios.delete(
        `${BACKEND_API}/api/v1/listing/${id}`,
        { withCredentials: true }
      );
      setMessage(res.data.message || "Listing deleted successfully");

      setTimeout(() => navigate("/Pg"), 1500);
    } catch (error) {
      const errMsg =
        error.response?.data?.message || "You are not the owner of this listing";

      setEditError(errMsg);
      setTimeout(() => {
        setEditError("")
      }, 1500);
    }
  };

  /** OPEN EDIT MODAL */
  const openEdit = () => {
    setEditData({
      title: listing.title,
      description: listing.description,
      price: listing.price,
      phoneNumber: listing.phoneNumber,
      gender: listing.gender,
      location: listing.location,
      country: listing.country,
      roomType: listing.roomType,
      amenities: listing.amenities || [],
    });

   
    setEditMode(true);
  };

  /** HANDLE INPUT CHANGE */
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /** HANDLE AMENITY CHANGE */
  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;

    setEditData((prev) => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, value]
        : prev.amenities.filter((a) => a !== value),
    }));
  };

  /** SUBMIT EDIT */
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const updated = {
      ...editData,
      price: Number(editData.price),
      phoneNumber: Number(editData.phoneNumber),
      amenities: [...editData.amenities],
    };

    try {
      const res = await axios.put(
        `${BACKEND_API}/api/v1/listing/${id}`,
        updated,
        { withCredentials: true }
      );

        setMessage("Update Successful"); 
      setTimeout(() =>{
        setMessage("");
      }, 1500)

      setEditMode(false);
      setListing(res.data.listing); // update UI with new data

    } catch (error) {
      const errMsg =
        error.response?.data?.message || "Update failed / You are not the owner";
      setEditError(errMsg);
      setTimeout(() =>{
        setEditError("")
      },1500)
    }
  };

  if (loading) return <p className="loading">Loading...</p>;
  if (!listing) return <p>Listing not found.</p>;

  return (
    <div className="details-page">
      <Navbar />
    {editError && <p className="error-text">{editError}</p>}
    {message && <p className="error-text">{message}</p>}
      <div className="details-container">
        
        {/* ACTION BUTTONS */}
        <div className="btn-container">
          <button className="book-btn" onClick={handleDelete}>
            Delete
          </button>

          <button className="book-btn" onClick={openEdit}>
            Edit
          </button>

          {/* <p>{message}</p> */}
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

        {/* FULLSCREEN VIEWER */}
        {fullscreenImg && (
          <div className="fullscreen-viewer" onClick={() => setFullscreenImg(null)}>
            <img src={fullscreenImg} className="fullscreen-img" alt="Zoom" />
          </div>
        )}

        {/* LEFT INFO SECTION */}
        <div className="listing-info">
          <div className="info-header">
            <h1>{listing.title}</h1>

            <div className="price-box">
              <span className="price">₹{listing.price}</span>
              <span className="permonth">/ month</span>
            </div>
          </div>

          {/* DETAILS */}
          <div className="booking-box">
            <h3>Description</h3>
            <p className="full-desc">{listing.description}</p>

            <h3>Contact info</h3>
            <p className="full-desc">{listing.phoneNumber}</p>

            <h3>Gender</h3>
            <p className="full-desc">{listing.gender}</p>

            <h3>Location</h3>
            <p className="full-desc">
              {listing.location}, {listing.country}
            </p>

            <h3>Room Type</h3>
            <p className="full-desc">{listing.roomType}</p>

            <h3>Amenities</h3>
            <div className="amenities-box">
              {listing.amenities?.map((a, i) => (
                <div key={i} className="amenity-pill">
                  {a}
                </div>
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
          <button className="book-btn">Book Now</button>
        </div>
      </div>

      {/* ============================= */}
      {/* EDIT MODAL */}
      {/* ============================= */}

      {editMode && (
        <div className="edit-modal">
          <div className="edit-form-container">

            <h2>Edit Listing</h2>

            <form onSubmit={handleEditSubmit}>

              <label>Title</label>
              <input
                name="title"
                value={editData.title}
                onChange={handleEditChange}
                required
              />

              <label>Description</label>
              <textarea
                name="description"
                value={editData.description}
                onChange={handleEditChange}
                required
              />

              <label>Price</label>
              <input
                type="number"
                name="price"
                value={editData.price}
                onChange={handleEditChange}
                required
              />

              <label>Phone Number</label>
              <input
                type="number"
                name="phoneNumber"
                value={editData.phoneNumber}
                onChange={handleEditChange}
                required
              />

              <label>Gender</label>
              <select
                name="gender"
                value={editData.gender}
                onChange={handleEditChange}
                required
              >
                <option value="">Select</option>
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Co-Living">Co-Living</option>
              </select>

              <label>Location</label>
              <input
                name="location"
                value={editData.location}
                onChange={handleEditChange}
                required
              />

              <label>Country</label>
              <input
                name="country"
                value={editData.country}
                onChange={handleEditChange}
                required
              />

              <label>Room Type</label>
              <select
                name="roomType"
                value={editData.roomType}
                onChange={handleEditChange}
                required
              >
                <option value="">Select</option>
                <option value="Single Room">Single Room</option>
                <option value="Double Room">Double Room</option>
                <option value="Full House">Full House</option>
              </select>

              <label>Amenities</label>
              <div className="amenities-options">
                {["WiFi", "AC", "Parking", "Water Supply", "CCTV", "Kitchen"].map(
                  (item) => (
                    <label key={item}>
                      <input
                        type="checkbox"
                        value={item}
                        checked={editData.amenities?.includes(item)}
                        onChange={handleAmenityChange}
                      />
                      {item}
                    </label>
                  )
                )}
              </div>

              <div className="buttons">
                <button type="submit" className="save-btn">
                  Save
                </button>

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </button>

              </div>
                {editError && <p className="error-text">{editError}</p>}

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
