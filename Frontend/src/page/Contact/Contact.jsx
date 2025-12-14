import React from "react";
import "./Contact.css";
import Navbar from "../../components/Header/Navbar";
import Footer from "../../components/Footer/Footer";

export default function Contact() {
  return (
    <div>
      <Navbar />
      <div className="contact-wrapper">
        <div className="contact-header">
          <h1>Any Doubts, Problems or Suggestions?</h1>
          <p>
            Whether it's a concern, a feature request, or feedback — we're
            listening. Fill out the form below and we'll get back to you
            shortly.
          </p>
        </div>

        <form className="contact-form">
          <div className="form-group">
            <label>Your Name</label>
            <input type="text" placeholder="Enter your name" />
          </div>

          <div className="form-group">
            <label>Phone or Email</label>
            <input type="text" placeholder="Enter your phone or email" />
          </div>

          <div className="form-group">
            <label>Your Message</label>
            <textarea placeholder="Write your message here..."></textarea>
          </div>

          <button type="submit" className="submit-btn">
            Submit
          </button>
        </form>
      </div>
      <Footer/>
    </div>
  );
}
