import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import BACKEND_API from "../../Config/api";
import "../Register/Login.css";
import Login from "../Register/Login";
function ResetPassword({onResetSuccess}) {
  // const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!otp || !password) {
      return alert("OTP and Password are required");
    }
    setLoading(true);
    
    try {
      const res = await fetch(`${BACKEND_API}/api/v1/user/resetPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        return alert(data.message);
      }
      
      alert(data.message);
      onResetSuccess()
    } catch (error) {
      alert("Something went wrong", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      
        <form onSubmit={handleReset} className="login-form">
          <h2 className="title">Reset Password</h2>
          <p className="subtitle">Otp vaild for 10 Min..</p>
          <div className="input-group">
            {/* <p className="title">Otp</p> */}
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      
    </div>
  );
}

export default ResetPassword;
