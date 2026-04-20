import React, { useState } from "react"; // Added useState
import "./Contact.css";
import Navbar from "../../components/Header/Navbar";
import Footer from "../../components/Footer/Footer";

export default function Contact() {
  // 1. Initialize State
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    message: "",
  });

  // 2. Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/v1/contact/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Feedback sent successfully!");
        setFormData({ name: "", contact: "", message: "" }); // Reset form
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Could not connect to the server.");
    }
  };

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

        {/* 4. Attach onSubmit handler */}
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              name="name" // Added name attribute
              value={formData.name} // Controlled component
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone or Email</label>
            <input
              type="text"
              name="contact" // Added name attribute
              value={formData.contact}
              onChange={handleChange}
              placeholder="Enter your phone or email"
              required
            />
          </div>

          <div className="form-group">
            <label>Your Message</label>
            <textarea
              name="message" // Added name attribute
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your message here..."
              required
            ></textarea>
          </div>

          <button type="submit" className="submit-btn">
            Submit
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}