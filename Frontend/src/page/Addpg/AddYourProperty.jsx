import React, { useEffect, useState } from "react";
import "./AddProperty.css";
// import { useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BACKEND_API from "../../Config/api";

// Fix Leaflet Marker Icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function AddProperty() {
  const initialState = {
    title: "",
    description: "",
    price: "",
    phoneNumber: "",
    gender: "",
    location: "",
    country: "",
    roomType: "",
    amenities: [],
    images: [], // File objects
  };

  const [formData, setFormData] = useState(initialState);
  const [previewUrls, setPreviewUrls] = useState([]); // for image preview
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate()

  // Revoke object URLs on unmount or when previews change
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // Helper: create a FormData from state
  const buildFormData = (data) => {
    const fd = new FormData();
    fd.append("title", data.title);
    fd.append("description", data.description);
    fd.append("price", data.price);
    fd.append("location", data.location);
    fd.append("country", data.country);
    fd.append("roomType", data.roomType);
    fd.append("phoneNumber", data.phoneNumber);
    fd.append("gender", data.gender);

    // amenities: append each as `amenities`
    (data.amenities || []).forEach((a) => fd.append("amenities", a));

    // images: append files as `images`
    (data.images || []).forEach((file) => fd.append("images", file));

    return fd;
  };

  // API call separated into its own function
  const createListing = async (data) => {
    const fd = buildFormData(data);
    try{

      const res = await axios.post(
        `${BACKEND_API}/api/v1/listing/create`,
        fd,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        }
      );
      setSuccessMessage(res?.data?.message || "PG Add Successfully");
      navigate("/Pg")
    }catch(err){
      setErrorMessage("api error" ,err?.response?.data?.message);
    }
  };

  // Basic client-side validation
  const validate = (data) => {
    if (!data.title.trim()) return "Title is required";
    if (!data.description.trim()) return "Description is required";
    if (!data.price) return "Price is required";
    if (!data.location.trim()) return "Location is required";
    if (!data.country.trim()) return "Country is required";
    if (!data.roomType) return "Room type is required";
    if (!data.phoneNumber) return "Phone Number is required";
    if (!data.gender) return "Gender is required";
    return null;
  };

  // Input handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, value]
        : prev.amenities.filter((a) => a !== value),
    }));
  };

  // File (input) select
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setFormData((prev) => {
      const newFiles = [...prev.images, ...files];
      return { ...prev, images: newFiles };
    });
    // create preview urls
    const newUrls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => [...prev, ...newUrls]);
  };

  // Drag & drop
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length === 0) return;
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
    const newUrls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => [...prev, ...newUrls]);
  };

  // Remove single image by index
  const removeImage = (idx) => {
    setFormData((prev) => {
      const images = prev.images.filter((_, i) => i !== idx);
      return { ...prev, images };
    });
    // revoke and remove preview url
    setPreviewUrls((prev) => {
      const url = prev[idx];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // Map click handler
  // function LocationPicker() {
  //   useMapEvents({
  //     click(e) {
  //       setFormData((prev) => ({
  //         ...prev,
  //         latitude: e.latlng.lat,
  //         longitude: e.latlng.lng,
  //       }));
  //     },
  //   });
  //   return null;
  // }

  // Form submit -> calls createListing function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const validationError = validate(formData);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoading(true);
    try {
      const data = await createListing(formData);
      setSuccessMessage(data?.message || "Property created successfully");
      setFormData(initialState);
      // revoke previous preview urls
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
      setPreviewUrls([]);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Server error while creating property";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addProperty-container">
      <h2>Add New Property</h2>

      <form className="addProperty-form" onSubmit={handleSubmit}>
        {successMessage && (
          <div className="success-banner" role="status">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="error-banner" role="alert">
            {errorMessage}
          </div>
        )}

        {/* Title */}
        <div className="inputBox">
          <label>Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter property title"
            type="text"
          />
        </div>

        {/* Description */}
        <div className="inputBox">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Write a detailed description..."
          />
        </div>
        {/* Contact Info */}
        <div className="inputBox">
          <label>Phone Number</label>
          <input 
            type="Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Enter the number"
          />
        </div>

        <div className="inputBox">
          <label>Gender</label>
          <select 
            name="gender" 
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="Select">Select</option>
            <option value="Boys">Boys</option>
            <option value="Girls">Girls</option>
            <option value="Co-Living">Co-Living</option>
          </select>
        </div>

        {/* Price */}
        <div className="inputBox">
          <label>Price (₹)</label>
          <input
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Enter price"
            type="number"
            min="0"
          />
        </div>

        {/* Room Type */}
        <div className="inputBox">
          <label>Room Type</label>
          <select
            name="roomType"
            value={formData.roomType}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="Single Room">Single Room</option>
            <option value="Double Room">Double Room</option>
            <option value="Full House">Full House</option>
          </select>
        </div>

        {/* Amenities */}
        <div className="amenitiesBox">
          <label>Amenities</label>
          <div className="amenity-options">
            {["WiFi", "AC", "Parking", "Water Supply", "CCTV", "Kitchen"].map(
              (item) => (
                <label key={item}>
                  <input
                    type="checkbox"
                    value={item}
                    checked={formData.amenities.includes(item)}
                    onChange={handleAmenityChange}
                  />
                  {item}
                </label>
              )
            )}
          </div>
        </div>

        {/* Location + Country */}
        <div className="row">
          <div className="inputBox half">
            <label>Location</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City / Area"
              type="text"
            />
          </div>

          <div className="inputBox half">
            <label>Country</label>
            <input
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Country"
              type="text"
            />
          </div>
        </div>

        {/* Map Picker */}
        {/* <div className="map-section">
          <label>Pick Location on Map</label>
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: "250px", width: "100%", borderRadius: "10px" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationPicker />
            {formData.latitude && formData.longitude && (
              <Marker position={[formData.latitude, formData.longitude]} />
            )}
          </MapContainer>

          <div className="coordinates">
            <p>Latitude: {formData.latitude || "-"}</p>
            <p>Longitude: {formData.longitude || "-"}</p>
          </div>
        </div> */}

        {/* Drag & Drop Upload */}
        <div
          className="uploadBox"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <p>Drag & Drop Images Here</p>
          <span>OR</span>
          <input type="file" multiple accept="image/*" onChange={handleFileSelect} />
        </div>

        {/* Image Preview */}
        <div className="previewBox">
          {previewUrls.length === 0 && formData.images.length === 0 && (
            <div className="preview-empty">No images selected</div>
          )}

          {previewUrls.map((url, idx) => (
            <div key={url} style={{ position: "relative" }}>
              <img src={url} alt={`preview-${idx}`} className="preview-img" />
              <button
                type="button"
                aria-label={`Remove image ${idx + 1}`}
                onClick={() => removeImage(idx)}
                className="preview-remove-btn"
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  background: "#fff",
                  borderRadius: "50%",
                  border: "none",
                  padding: "6px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          className="submitBtn"
          type="submit"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Creating..." : "Submit Property"}
        </button>
      </form>
    </div>
  );
}
