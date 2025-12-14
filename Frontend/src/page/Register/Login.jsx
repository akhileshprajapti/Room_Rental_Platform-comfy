import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BACKEND_API from "../../Config/api";

const Login = () => {
  const [method, setMethod] = useState("password"); // 'password' or 'otp'
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handelPasswordLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");

  try {
    const res = await axios.post(
      `${BACKEND_API}/api/v1/user/login`,
      { email, password },
      { withCredentials: true }
    );

      // Navigate based on role
      if (res?.data?.role === "admin") {
        const successMsg = res?.data?.message || "Login Successful as admin"
        setMessage(successMsg)
        setTimeout(() =>{
          navigate("/AdminDashboard");
        }, 1500)
      } else {
        const successMsg = res?.data?.message || "Login Successful as User"
        setMessage(successMsg)
        setTimeout(() =>{
          navigate("/");

        },1500)
      }

   

  } catch (error) {
    console.log("login error", error);

    // backend error
    setMessage(error.response?.data?.message || "Invalid credentials");

  } finally {
    setLoading(false);
  }
};


const handelOtp = async () => {
    if (!email) {
      return setMessage("First provide the Email");
    }
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(
        `${BACKEND_API}/api/v1/user/sendOtp`,
        { email }
      );
      setMessage(res?.data?.message || "otp send to email");
      setOtpSent(true);
    } catch (error) {
      console.log("Send otp error", error);
      setMessage(error.response?.data?.message || "send otp error");
    } finally {
      setLoading(false);
    }
};

const handelOtpLogin = async (e) => {
  e.preventDefault();

  if (!otp) {
    return setMessage("Please enter OTP");
  }

  setLoading(true);
  setMessage("");

  try {
    const res = await axios.post(
      `${BACKEND_API}/api/v1/user/verifyOtp`,
      { email, otp },
      { withCredentials: true }
    );

    // Navigate ONLY if success
    if (res?.data?.user?.role === "admin") {
      setMessage(res?.data?.message || "OTP login successful as admin");
      setTimeout(() =>{
        navigate("/AdminDashboard");

      }, 1500)
    } else {
      const successMsg = res?.data?.message || "Invalid OTP"
      setMessage(successMsg);
      setTimeout(() =>{
        navigate("/")
      }, 1500)
    }

  } catch (error) {
    console.log("otp login error", error);
    setMessage(error.response?.data?.message || "Invalid OTP");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="login-container">
      <div className="login-box">
        {/* Left Side */}
        <div className="login-left">
          <img
            src="https://aormifyarea.co/static/media/LoginImg.6fcf0cbbe7c63471bd97.jpg"
            alt="Living room"
          />
          <div className="login-overlay">
            <h2>Join us!</h2>
            <p>Just go through the boring process of creating an account.</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="login-right">
          <h2 className="title">Login to your Account</h2>
          <p className="subtitle">Welcome back! Select method to log in:</p>

          <div className="toggle-buttons">
            <button
              className={method === "password" ? "active" : ""}
              onClick={() => setMethod("password")}
            >
              Login with Password
            </button>
            <button
              className={method === "otp" ? "active" : ""}
              onClick={() => setMethod("otp")}
            >
              Login with OTP
            </button>
          </div>

          <form
            className="login-form"
            onSubmit={
              method === "password" ? handelPasswordLogin : handelOtpLogin
            }
          >
            <div className="input-group">
              <span className="icon">📧</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your Email"
              />
            </div>

            {method === "password" ? (
              <div className="input-group">
                <span className="icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
                <span
                  className="toggle-eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>
            ) : (
              <div className="input-group">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                />

                <button
                  type="button"
                  onClick={handelOtp}
                  className="send-otp-btn"
                  disabled={loading}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </div>
            )}
            {message && <p className="message">{message}</p>}
            {/* <div className="options">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <a href="#">Forgot Password?</a>
            </div> */}

            <button type="submit" className="login-btn">
              {method === "password"
                ? "Log In with Password"
                : "Log In with OTP"}
            </button>

            <p className="footer-text">
              Don't have an account? <a href="/SignIn">Create an account</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
