import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import ResetPassword from "./ResetPassword";
import BACKEND_API from "../../Config/api";

function ForgotPassword({onOtpSent,onBack}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false)
  // const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    try{

      const res = await fetch(`${BACKEND_API}/api/v1/user/forgetPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        return alert(data.message);
      }
      
      alert(data.message);
      // setLoading(true)
      // 🔥 MOVE TO RESET PAGE
      onOtpSent()
    }catch(error){
      alert("Something went worng", error)
    }finally{
      setLoading(false)
    }
  };

  return (
    <div className="">
        <form onSubmit={handleSubmit} className="login-form">
          <h2 className="title">Forgot Password</h2>
          <p className="subtitle">
            We're here to help you recover access securely.
          </p>
          <div className="input-group">
            <span className="icon">📧</span>
            <input
              type="email"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-btn">
            {loading ? "Otp Sendig..." : "Send OTP"}
            
          </button>
        </form>
        <p>
          <span
          style={{ cursor: "pointer", color: "blue" }}
          onClick={onBack}
        >
          Back to Login
        </span>
        </p>
    </div>
  );
}

export default ForgotPassword;
