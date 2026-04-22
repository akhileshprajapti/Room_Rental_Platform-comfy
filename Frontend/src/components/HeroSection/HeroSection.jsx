import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HeroSection.css";
import BACKEND_API from "../../Config/api";
import { MapPin, Home, Users } from "lucide-react";

export default function HeroSection() {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [roomType, setRoomType] = useState("");
  const [gender, setGender] = useState("");

  const [showDialog, setShowDialog] = useState(false);
  const [results, setResults] = useState([]);
  const [dialogMsg, setDialogMsg] = useState("");

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `${BACKEND_API}/api/v1/listing/search?location=${location}&gender=${gender}&roomType=${roomType}`,
      );

      const data = await response.json();

      if (!data?.listings?.length) {
        setDialogMsg("No results found");
        setResults([]);
      } else {
        setResults(data.listings);
        setDialogMsg("");
      }

      setShowDialog(true);
    } catch (error) {
      setDialogMsg("Something went wrong:", error);
      setResults([]);
      setShowDialog(true);
    }
  };

  return (
    <section className="heroSection">
      <video src="/heroBgVideo.mp4" autoPlay muted loop className="heroVideo" poster="/heroBGAnime.jpg"/>

      <div className="heroOverlay">
        <div className="heroContainer">
          <div className="border-box">
            {/* LEFT */}
            <div className="heroLeft">
              <h1>
                Switch to Smart <br />
                Renting with <span className="brand">Comfy</span>
              </h1>
              <p>Verified PGs & Flats | No Brokerage | Free Guided Visits</p>
            </div>

            {/* SEARCH CARD */}
            <div className="heroCard">
              <div className="heroField">
                <MapPin className="icon" />
                <input
                  type="text"
                  placeholder="Search city"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="heroField">
                <Home className="icon" />
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                >
                  <option value="">Property Type</option>
                  <option value="Single Room">Single Room</option>
                  <option value="Double Room">Double Room</option>
                  <option value="Full House">Full House</option>
                </select>
              </div>

              <div className="heroField">
                <Users className="icon" />
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Gender</option>
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                  <option value="Co-Living">Co-Living</option>
                </select>
              </div>

              <button className="heroBtn" onClick={handleSearch}>
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RESULT DIALOG */}
      {showDialog && (
        <div className="dialogOverlay" onClick={() => setShowDialog(false)}>
          <div className="dialogBox" onClick={(e) => e.stopPropagation()}>
            {dialogMsg ? (
              <p className="dialogMsg">{dialogMsg}</p>
            ) : (
              <div className="resultList">
                {results.map((item) => (
                  <div 
                    key={item._id} 
                    className="resultItem"
                    onClick={() => {
                      navigate(`/pg/${item._id}`);
                      setShowDialog(false);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <img src={item.image?.[0]?.url} alt="" />
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.location}</p>
                      <span>₹{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setShowDialog(false)}>Close</button>
          </div>
        </div>
      )}
    </section>
  );
}
