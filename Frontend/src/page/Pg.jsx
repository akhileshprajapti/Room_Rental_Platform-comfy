import { useEffect, useState } from "react";
import React from "react";
import "../components/Css/Pg.css";
import Navbar from "../components/Header/Navbar";
import ListingCard from "./Listing/Listing";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BACKEND_API from "../Config/api";

export default function Pg() {

  const [listingData, setListingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [location, setLocation] = useState("");
  const [roomType, setRoomType] = useState("");
  const [gender, setGender] = useState("");

  const navigate = useNavigate();

  // 🔥 FETCH ALL (DEFAULT)
  const fetchAllListings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BACKEND_API}/api/v1/listing/showListing`
      );
      setListingData(res.data.data || res.data);
    } catch (err) {
      setError("Server Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FILTER API
  const fetchFiltered = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BACKEND_API}/api/v1/listing/search?location=${location}&gender=${gender}&roomType=${roomType}`
      );

      setListingData(res.data.listings);

    } catch (err) {
      setError("Filter Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 AUTO FILTER (Debounce)
  useEffect(() => {

    const delay = setTimeout(() => {

      if (!location && !roomType && !gender) {
        fetchAllListings();
      } else {
        fetchFiltered();
      }

    }, 400); // debounce delay

    return () => clearTimeout(delay);

  }, [location, roomType, gender]);

  // 🔥 INITIAL LOAD
  useEffect(() => {
    fetchAllListings();
  }, []);

  const handleNavigation = (id) => {
    navigate(`/pg/${id}`);
  };

  // 🔥 CLEAR FILTERS
  const clearFilters = () => {
    setLocation("");
    setRoomType("");
    setGender("");
  };

  return (
    <div>
      <section className="section-box">
        <Navbar />

        <div className="card-container">

          {/* LEFT FILTER */}
          <div className="filter">
            <h1 className="filter-title">Filters</h1>

            <div className="filter-box">

              {/* LOCATION */}
              <div className="input">
                <input
                  type="text"
                  placeholder="Enter city name"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* ROOM TYPE */}
              <div className="filter-property">
                <h3>Room Type</h3>
                <div className="btn-box">
                  {["Single Room", "Double Room", "Full House"].map((type) => (
                    <button
                      key={type}
                      onClick={() =>
                        setRoomType(roomType === type ? "" : type)
                      }
                      className={`toggel-btn ${
                        roomType === type ? "active" : ""
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* GENDER */}
              <div className="filter-property">
                <h3>Gender</h3>
                <div className="btn-box">
                  {["Boys", "Girls", "Co-Living"].map((g) => (
                    <button
                      key={g}
                      onClick={() =>
                        setGender(gender === g ? "" : g)
                      }
                      className={`toggel-btn ${
                        gender === g ? "active" : ""
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* CLEAR BUTTON */}
              <div className="filter-btn">
                <button className="filter-btns" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>

            </div>
          </div>

          {/* RIGHT LISTINGS */}
          <div className="card">
            <div className="card-box">

              {loading && <p>Loading...</p>}
              {error && <p>{error}</p>}

              {!loading && !error && listingData.length === 0 && (
                <p>No data found</p>
              )}

              {!loading &&
                !error &&
                listingData.map((listing) => (
                  <div
                    key={listing._id}
                    onClick={() => handleNavigation(listing._id)}
                  >
                    <ListingCard listing={listing} />
                  </div>
                ))}

            </div>
          </div>

        </div>
      </section>
    </div>
  );
}