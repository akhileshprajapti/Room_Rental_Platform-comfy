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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = async () => {
      try {
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
    fetchListing();
  }, []);

  const handleNavigation = (id) => {
    navigate(`/pg/${id}`);
  };

  return (
    <div>
      <section className="section-box">
        <Navbar />

        <div className="card-container">
          {/* LEFT FILTER SECTION */}
          <div className="filter">
            <h1 className="filter-title">Filters</h1>
            <div className="filter-box">
              <div className="input">
                <input type="text" placeholder="Enter city name" />
              </div>

              <div className="filter-property">
                <h3>Property Type</h3>
                <div className="btn-box">
                  <button className="toggel-btn">PG</button>
                  <button className="toggel-btn">Flat</button>
                </div>
              </div>

              <div className="filter-property">
                <h3>Gender</h3>
                <div className="btn-box">
                  <button className="toggel-btn">Male</button>
                  <button className="toggel-btn">Female</button>
                  <button className="toggel-btn">Co-Living</button>
                </div>
              </div>

              <div className="filter-range">
                <label>Price Range: 0 - 50000</label>
                <input className="range-input" type="range" />
              </div>

              <div className="filter-btn">
                <button className="filter-btns">Apply Filter</button>
              </div>
            </div>
          </div>

          {/* RIGHT LISTING SECTION */}
          <div className="card">
            <div className="card-box">
              {loading && <p>Loading...</p>}
              {error && <p>Error: {error}</p>}
              {!loading && !error && listingData.length === 0 && (
                <p>No data available</p>
              )}

              {/* Render Cards */}

              {!loading &&
                !error &&
                listingData.map((listing) => (
                  <div key={listing._id} onClick={() => handleNavigation(listing._id)}>
                    <ListingCard  listing={listing} />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>
      {/* <Footer /> */}
    </div>
  );
}
