import React from "react";
import "./AdminListing.css";

export default function AdminListings({ listings, handleDeleteListing }) {

  

  return (
    <div className="listing-wrapper">
      <h1 className="page-title">All PG Listings</h1>

      <div className="listing-grid">
        {listings.map((pg) => (
          <div key={pg._id} className="listing-card">

            {/* LEFT SECTION — IMAGES */}
            <div className="listing-left">
              <div className="image-scroll">
                {pg.image?.length > 0 ? (
                  pg.image.map((img, i) => (
                    <img key={i} src={img.url} className="listing-img" alt="PG" />
                  ))
                ) : (
                  <p>No images</p>
                )}
              </div>
            </div>

            {/* RIGHT SECTION — CONTENT */}
            <div className="listing-right">

              {/* Title + Description */}
              <h2 className="listing-title">{pg.title}</h2>
              <p className="listing-desc">{pg.description}</p>

              {/* Details grid */}
              <div className="details-box">
                <p><b>Price:</b> ₹{pg.price}</p>
                <p><b>Room Type:</b> {pg.roomType}</p>
                <p><b>Location:</b> {pg.location}</p>
                <p><b>Country:</b> {pg.country}</p>
              </div>

              {/* Amenities */}
              <div className="amenities-box">
                <b>Amenities:</b>
                <div className="amenities-tags">
                  {pg.amenities?.map((a, i) => (
                    <span key={i} className="tag">{a}</span>
                  ))}
                </div>
              </div>

              {/* Owner Box */}
              <div className="owner-box">
                <h4>Owner</h4>
                <p><b>Name:</b> {pg.owner?.name}</p>
                <p><b>Email:</b> {pg.owner?.email}</p>
                <p><b>Phone:</b> {pg.owner?.phone}</p>
              </div>

              {/* ID */}
              <p className="listing-id">ID: {pg._id}</p>

            </div>
            <div className='Listing-btn-delete'>
              <button onClick={() => handleDeleteListing(pg._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
