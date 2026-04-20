import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Header/Navbar";
import "./HeroSection.css";
import BACKEND_API from "../../Config/api";


export default function HeroSection() {

  const [location, setLocation] = useState("");
  const [roomType, setRoomType] = useState("");
  const [gender, setGender] = useState("");

  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false); // ⭐ NEW

  const navigate = useNavigate();

  const handleSearch = async () => {
    try {

      setHasSearched(true); // ⭐ mark search clicked

      const response = await fetch(
        `${BACKEND_API}/api/v1/listing/search?location=${location}&gender=${gender}&roomType=${roomType}`
      );

      const data = await response.json();

      setResults(data.listings);

    } catch (error) {
      console.error("Search error:", error);
    }
  };

  return (
    <section className="heroSection">
      <Navbar />

      <div className="overlay">
        <div className="hero-content">

          {/* TEXT */}
          <div className="hero-text">
            <h1>Switch to Smart Renting with Comfy</h1>
            <p>Verified PGs & Flats | No Brokerage | Free Guided Visits</p>
          </div>
        <div className="search-wrapper">
          {/* SEARCH BOX */}
          <div className="search-box">

            <div className="input-box">
              <label>Location</label>
              <input
                className="box"
                type="text"
                placeholder="Search for city"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="input-box">
              <label>Property Type</label>
              <select
                className="box"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
              >
                <option value="">Select Property Type</option>
                <option value="Single Room">Single Room</option>
                <option value="Double Room">Double Room</option>
                <option value="Full House">Full House</option>
              </select>
            </div>

            <div className="input-box">
              <label>Gender</label>
              <select
                className="box"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select Gender</option>
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Co-Living">Co-Living</option>
              </select>
            </div>

            <div className="btn-box">
              <button className="btn" onClick={handleSearch}>
                Search
              </button>
            </div>

          </div>

          {/* ============================= */}
          {/* ⭐ SHOW RESULTS ONLY AFTER SEARCH */}
          {/* ============================= */}

          {hasSearched && (
            <div className="results-section">

              {results.length === 0 ? (
                <p className="no-result">No results found</p>
              ) : (
                <div className="results-grid">

                  {results.map((item) => (

                    <div
                      key={item._id}
                      className="result-card"
                      onClick={() => navigate(`/pg/${item._id}`)}
                    >

                      <img
                        src={item.image?.[0]?.url}
                        alt="room"
                      />

                      <h3>{item.title}</h3>

                      <p>{item.location}</p>

                      <p>₹{item.price}</p>

                    </div>

                  ))}

                </div>
              )}

            </div>
          )}

        </div>
      </div>
      </div>
    </section>
  );
}