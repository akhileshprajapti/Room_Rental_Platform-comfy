import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Account from "../Accounts/Accounts";
import axios from "axios";
import "./Navbar.css";
import { User, ChevronDown, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isLogin, setIsLogIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/";

  /* ✅ SCROLL ONLY ON HOME (NO DESIGN CHANGE) */
  useEffect(() => {
    if (!isHome) {
      setIsScrolled(false);
      setIsVisible(true);
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      if (window.scrollY > 50) setIsScrolled(true);
      else setIsScrolled(false);

      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname, lastScrollY, isHome]);

  /* LOGIN STATUS */
  useEffect(() => {
    const LoginStatus = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8080/api/v1/user/loginStatus",
          { withCredentials: true },
        );

        if (res.status === 200 && res?.data?.login === true) {
          setIsLogIn(true);
          setUserRole(res?.data?.role || "user");
        }
      } catch {
        setIsLogIn(false);
      }
    };
    LoginStatus();
  }, []);

  /* LOGOUT */
  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8080/api/v1/user/logout",
        {},
        { withCredentials: true },
      );
      setIsLogIn(false);
      setShowDropdown(false);
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminDashboard = () => {
    navigate("/AdminDashboard");
  };

  return (
    <div>
      <nav
        className={`Nav-box ${
          isHome
            ? `${isScrolled ? "scrolled" : ""} ${isVisible ? "show" : "hide"}`
            : "scrolled static" 
        }`}
      >
        <div className="Nav-container">
          <div className="logo-container">
            <Link
              to="/"
              className="logo"
            >
              Comfy
            </Link>
          </div>
          <div className="Nav-list list">
            <a href="/AddYourProperty">Add Your Property</a>
            <a href="/Pg">PG</a>
            <a href="/contact">Contact</a>
          </div>
          <div className="Nav-list">
            <div className="list">
              {isLogin && userRole === "admin" && (
                <button className="Sign-btn" onClick={handleAdminDashboard} style={{color: 'white', border: 'none'}}>
                  Admin Dashboard
                </button>
              )}

              {!isLogin ? (
                <>
                  <Link to="/LogIn" className="Log-btn btn-arrow">
                    Log In <ArrowRight size={14} className="arrow" />
                  </Link>

                  <Link to="/SignIn" className="Sign-btn btn-arrow">
                    Sign In <ArrowRight size={14} className="arrow" />
                  </Link>
                </>
              ) : (
                <div className="profile-menu">
                  <div
                    className="profile-icon"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <User size={18} style={{color: 'white'}} />
                    <ChevronDown size={14} style={{color: 'white'}} />
                  </div>

                  {showDropdown && (
                    <div className="dropdown">
                      <Link to='/Account'>
                      <p
                        onClick={() => {
                          setShowDropdown(false);
                        }}
                      >
                        Account
                      </p>
                      </Link>

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

    </div>
  );
}
