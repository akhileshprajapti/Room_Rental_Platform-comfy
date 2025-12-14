import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "./Register.css";
import axios from "axios";
import BACKEND_API from "../../Config/api";

const Register = ({ onClose }) => {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    conformpassword: ""
  })
  const [message, setMessage] = useState("");

  const navigate  = useNavigate();

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    try{
      const res = await fetch(`${BACKEND_API}/api/v1/user/sendOtp`,{
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email}),
      // credentials: 'include',
      })  
      const data = await res.json();
      if(res.status === 200 ){
        setMessage(data.message || "Otp sent successfully");
        setStep('otp')
      } else{
        setMessage(data.message || "Failed to send Otp")
      }
      }catch(error){
      console.error("Server Error sending OTP:", error);
      setMessage( "Server Error Sending OTP" );
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async() => {
   try{
    const res = await fetch(`${BACKEND_API}/api/v1/user/verifyOtp`,{
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, otp}),
    })
    const data = await res.json()
    if(res.status === 200){
      setMessage(data.message || "OTP verified successfully");
      setForm((prev) => ({ ...prev, email }));
      setStep("Register")
    } else{
      setMessage(data.message || "Invalid OTP");
    }
   }catch(error){
    console.log("Error verifying OTP:", error);
    setMessage( "Server Error Verifying OTP" );
   }
  };

  // Step 3: Register
  const handleRegister = async(e) => {
    e.preventDefault();
    try{
      const res = await fetch(`${BACKEND_API}/api/v1/user/register`,{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body:  JSON.stringify({...form, email}),
        credentials: 'include',
      })
      const data = await res.json()
      if(res.status === 200 || res.status === 201){
        setMessage(data.message || "Register successfully")
        navigate("/");
      }else{
        setMessage(data.message || "User Not Register")
      }
    }catch(error){
      console.log("Registration failed. Please try again.", error)
      setMessage( "Registration failed. Please try again." );
    }
  };

  return (
    <div className="modal-overlay">
      <div className="register-card">
        <button className="close-btn" onClick={() => navigate("/")}> {/* ToDo */}
          ✖
        </button>

        {/* Left Side - Image (stays same for all steps) */}
        <div className="left-side">
          <img
            className="decor-img"
            src="https://aormifyarea.co/static/media/LoginImg.6fcf0cbbe7c63471bd97.jpg"
            alt="Decor"
          />
          <div className="overlay-text">
            <h3>Join us!</h3>
            <p>Enjoy a smooth and easy registration experience.</p>
          </div>
        </div>

        {/* Right Side - Dynamic Steps */}
        <div className="right-side">
          {step === 'email' && (
            <div className="step-content">
              <h2>Register or Sign In</h2>
              <hr className="divider" />
              <p className="or-text">or</p>
              <input
                type="email"
                placeholder="Enter your Email or Phone"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="continue-btn" onClick={handleSendOtp}>
                Continue
              </button>
              <button className="cancel-btn" onClick={onClose}> {/* ToDo */}
                Cancel
              </button>
              {message && <p className="message">{message}</p>}
            </div>
          )}

          {step === 'otp' && (
            <div className="step-content">
              <h2>Verify your Email</h2>
              <p>We’ve sent an OTP to {email}</p>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button className="continue-btn" onClick={handleVerifyOtp}>
                Verify OTP
              </button>
              <button className="cancel-btn" onClick={() => setStep('email')}> 
                Back
              </button>
              {message && <p className="message">{message}</p>}
            </div>
          )}

          {step === 'Register' && (
            <form className="step-content" onSubmit={handleRegister}>
              <h2>Create Your Account</h2>
              <input 
                type="text" 
                value={form.name} 
                onChange={((e) => setForm({...form, name: e.target.value}))} 
                placeholder="Full Name" 
                required 
              />
               <input
                type="email"
                value={form.email}
                disabled
                placeholder="Verified Email"
              />
              <input 
                type="Number" 
                value={form.phone}
                onChange={((e) => setForm({...form, phone: e.target.value}))}
                placeholder="Enter Your Number"

              />

              <input 
                type="password" 
                value={form.password} 
                onChange={((e) => setForm({...form, password: e.target.value}))} 
                placeholder="Password" 
                required 
              />
              <input 
                type="password" 
                value={form.conformpassword}
                onChange={((e) => setForm({...form, conformpassword: e.target.value}))}
                placeholder="Confirm Password" 
                required 
              />
              <button type="submit" className="continue-btn">
                Register
              </button>
              <button className="cancel-btn" onClick={() => setStep('email')}> 
                Cancel
              </button>
              {message && <p className="message">{message}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
