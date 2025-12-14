import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";


export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true); /* 🟢 UPDATED */
  const [lastScrollY, setLastScrollY] = useState(0); /* 🟢 UPDATED */
  const [isLogin, setIsLogIn] = useState(false);
  // const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const blackRoutes = ["/Pg","/AdminDashboard" ]; /* 🟢 UPDATED */

  useEffect(() => {
    if (blackRoutes.includes(location.pathname)) {
      setIsScrolled(false);
      // 🟢 handle scroll hide/show for /Pg page
      const handleScroll = () => {
        if (window.scrollY > lastScrollY) {
          // scrolling down
          setIsVisible(false);
        } else {
          // scrolling up
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }

    // 🟢 Default scroll behavior for other pages
    const handleScroll = () => {
      if (window.scrollY > 50) setIsScrolled(true);
      else setIsScrolled(false);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname, lastScrollY]);

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
        // setUserRole("");
      } 
    };
    LoginStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8080/api/v1/user/logout",
        {},
        { withCredentials: true }
      );
      setIsLogIn(false);
      // setUserRole("");
      navigate("/");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  const handleAdminDashboard = () => {
    navigate("/AdminDashboard");
  }  

  return (
    <div>
      <nav
  className={`Nav-box ${
    location.pathname === "/Pg" ||
    location.pathname.startsWith("/pg/") ||
    location.pathname === "/AdminDashboard" , "/Contact"
      ? `black-bg ${isVisible ? "show" : "hide"}`
      : isScrolled
      ? "scrolled"
      : ""
    
  }`}
>

        <div className="Nav-container">
          <div className="logo-container">
            <Link to={'/'} className="logo">Comfy</Link>
          </div>

          <div className="Nav-list">
            <div className="list">
              <a href="/AddYourProperty">Add Your Property</a>
              <a href="/Pg">PG</a>
              {/* <a href="#">About</a> */}
              <a href="/contact">Contact</a>
              {
                
              }
              {isLogin && userRole === "admin" && (
                <button className="Log-btn" onClick={handleAdminDashboard}>
                  Admin Dashboard
                </button>
              )}
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
                <button onClick={handleLogout} className="Log-btn">Logout</button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
