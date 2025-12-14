import React from "react";
import "./Listing.css";

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0);
};

const ListingCard = ({ listing }) => {
  const { title, description, price, image, amenities } = listing;

  return (
    <div className="listing-card">

      {/* IMAGE */}
      <div className="card-image-container">
        <img
          src={image?.[0]?.url || "https://via.placeholder.com/300"}
          alt="PG Room"
        />
      </div>

      {/* DETAILS */}
      <div className="card-details-container">
        <div>
          <h2 className="listing-title">{title || "No Title"}</h2>

          <p className="listing-description">
            {description || "No description available"}
          </p>

          <div className="listing-amenities">
            {amenities?.length > 0 ? (
              amenities.map((a, i) => (
                <span className="amenity-pill" key={i}>
                  {a}
                </span>
              ))
            ) : (
              <span>No amenities listed</span>
            )}
          </div>
        </div>

        {/* PRICE & BUTTON */}
        <div className="card-footer">
          <div className="price-info">
            <span className="price-label">From</span>
            <span className="price-value">{formatPrice(price)}</span>
            <span className="price-unit">/month</span>
          </div>

          <button className="book-button">Book Now</button>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
