import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Account from "../Accounts/Accounts";
import axios from "axios";
import "./Navbar.css";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isLogin, setIsLogIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // ✅ NEW STATE (for same page account UI)
  const [showAccountPage, setShowAccountPage] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const blackRoutes = ["/Pg", "/AdminDashboard"];

  // Scroll Effect
  useEffect(() => {
    if (blackRoutes.includes(location.pathname)) {
      setIsScrolled(false);

      const handleScroll = () => {
        if (window.scrollY > lastScrollY) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }

    const handleScroll = () => {
      if (window.scrollY > 50) setIsScrolled(true);
      else setIsScrolled(false);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname, lastScrollY]);

  // Login Status
  useEffect(() => {
    const LoginStatus = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8080/api/v1/user/loginStatus",
          { withCredentials: true }
        );

        if (res.status === 200 && res?.data?.login === true) {
          setIsLogIn(true);
          setUserRole(res?.data?.role || "user");
        }
      } catch (err) {
        console.error("Error checking login status:", err);
        setIsLogIn(false);
      }
    };
    LoginStatus();
  }, []);

  // Logout
  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8080/api/v1/user/logout",
        {},
        { withCredentials: true }
      );
      setIsLogIn(false);
      setShowDropdown(false);
      setShowAccountPage(false); // ✅ hide account page
      navigate("/");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const handleAdminDashboard = () => {
    navigate("/AdminDashboard");
  };

  return (
    <div>
      {/* ✅ NAVBAR */}
      <nav
        className={`Nav-box ${
          location.pathname === "/Pg" ||
          location.pathname.startsWith("/pg/") ||
          location.pathname === "/AdminDashboard"
            ? `black-bg ${isVisible ? "show" : "hide"}`
            : isScrolled
            ? "scrolled"
            : ""
        }`}
      >
        <div className="Nav-container">
          <div className="logo-container">
            <Link
              to="/"
              className="logo"
              onClick={() => setShowAccountPage(false)} // reset
            >
              Comfy
            </Link>
          </div>

          <div className="Nav-list">
            <div className="list">
              <a href="/AddYourProperty">Add Your Property</a>
              <a href="/Pg">PG</a>
              <a href="/contact">Contact</a>

              {isLogin && userRole === "admin" && (
                <button className="Log-btn" onClick={handleAdminDashboard}>
                  Admin Dashboard
                </button>
              )}

              {/* LOGIN / PROFILE */}
              {!isLogin ? (
                <>
                  <Link to="/LogIn" className="Log-btn">
                    Log In
                  </Link>
                  <Link to="/SignIn" className="Sign-btn">
                    Sign In
                  </Link>
                </>
              ) : (
                <div className="profile-menu">
                  <div
                    className="profile-icon"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    👤 ▾
                  </div>

                  {showDropdown && (
                    <div className="dropdown">
                      {/* ✅ SAME PAGE ACCOUNT */}
                      <p
                        onClick={() => {
                          setShowAccountPage(true);
                          setShowDropdown(false);
                        }}
                      >
                        Account
                      </p>

                      <p onClick={handleLogout} className="logout">
                        Logout
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ✅ SAME PAGE ACCOUNT RENDER */}
      {showAccountPage && (
        <div className="account-wrapper">
          <button
            className="close-account"
            onClick={() => setShowAccountPage(false)}
          >
            ❌ Close
          </button>

          <Account />
        </div>
      )}
    </div>
  );
}