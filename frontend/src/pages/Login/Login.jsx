import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import { toast } from "react-toastify";
import { loginAPI } from "../../api/authApi";
import { AlertTriangle } from "lucide-react";

function Login() {
  const [role, setRole] = useState("admin");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // ERROR STATES
  const [errors, setErrors] = useState({
    userId: false,
    email: false,
  });

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // VALIDATION
    const newErrors = {
      userId: !userId.trim(),
      email: !email.trim(),
    };

    setErrors(newErrors);

    if (newErrors.userId || newErrors.email) {
      toast.error("Please enter both User ID and Email.");
      return;
    }

    try {
      setLoading(true);

      const res = await loginAPI({ role, userId, email });

      if (res.data.success) {
        toast.success(res.data.message);

        // SAVE USER INFO
        localStorage.setItem("userRole", role);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userId", userId);
        localStorage.setItem("userName", res.data.user.name);

        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }

        // USER IMAGE
        let imageUrl = "https://i.pravatar.cc/150?img=12";

        if (role === "doctor" && res.data.user.image) {
          imageUrl = res.data.user.image;
        } else if (
          role === "receptionist" &&
          res.data.user.receptionistimage
        ) {
          imageUrl = res.data.user.receptionistimage;
        }

        localStorage.setItem("userImage", imageUrl);

        // NAVIGATION
        if (role === "admin") {
          navigate("/admin/dashboard");
        } else if (role === "doctor") {
          navigate("/doctor/dashboard");
        } else if (role === "receptionist") {
          navigate("/receptionist/add-appointment");
        }
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred during login.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* LEFT SIDE */}
        <div className="auth-banner">
          <img
            src="./images/hospitalImage.png"
            alt="Hospital"
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="auth-content">

          <h1 className="auth-title">Sign in</h1>

          <p className="auth-subtitle">
            To keep things easy, just log in with your work email
            or hit that button to continue!
          </p>

          {/* FORM */}
          <form className="auth-form" onSubmit={handleLogin}>

            {/* USER ID */}
            <div className="form-group">
              <div className="password-wrapper">
                <input
                  type="text"
                  placeholder="User Id"
                  className={`form-input ${
                    errors.userId ? "input-error" : ""
                  }`}
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value);

                    setErrors({
                      ...errors,
                      userId: false,
                    });
                  }}
                  disabled={loading}
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="form-group">
              <input
                type="email"
                placeholder="example@gmail.com"
                className={`form-input ${
                  errors.email ? "input-error" : ""
                }`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);

                  setErrors({
                    ...errors,
                    email: false,
                  });
                }}
                disabled={loading}
              />
            </div>

            {/* ROLE */}
            <div className="form-group">
              <select
                className="form-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              >
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="receptionist">Receptionist</option>
              </select>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* WARNING */}
          <div className="login-warning">
            <AlertTriangle
              size={18}
              className="warning-icon"
            />

            <p>
              For security purposes, always log out after
              completing your work session. Users are required
              to sign in again before accessing the system.
            </p>
          </div>

          {/* FOOTER */}
          <p className="auth-footer">
            © 2026 Ucare Hospital. All rights reserved.
          </p>

        </div>
      </div>
    </div>
  );
}

export default Login;