import React from "react";
import "./Footer.css";
import { Instagram, Linkedin, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-logo">
          <h2>Comfy</h2>
          <p>Simplifying your PG and Flat Rentals with Smart Technology.</p>
          <div className="social-icons">
            <a href="https://www.instagram.com/akhileshprajapati928?igsh=MTg1dGsxNGw5aWp2dw==">

            <Instagram size={20} />
            </a>
            <Linkedin size={20} />
            <Youtube size={20} />
          </div>
        </div>

          <div className="link-section">
            <h4>Company</h4>
            <ul>
              <li>About Us</li>
              <li>Our Story</li>
              <li>Careers</li>
              <li>Contact Us</li>
            </ul>
          </div>

          <div className="link-section">
            <h4>Legal</h4>
            <ul>
              <li>Privacy Policy</li>
              <li>Terms & Conditions</li>
              <li>Guest Policy</li>
              <li>Cookies Policy</li>
              <li>Refund & Cancellation Policy</li>
            </ul>
          </div>
      </div>

      
    </footer>
  );
}
