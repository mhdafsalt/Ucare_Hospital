import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { toast } from "react-toastify";
import { loginAPI } from "../../api/authApi";
import { AlertTriangle, ArrowLeft, ShieldCheck, UserCheck, Stethoscope, UserCog } from "lucide-react";

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
    <div className="vital-auth-page">
      {/* Blueprint Grid Overlay */}
      <div className="vital-auth-grid"></div>

      {/* Ambient Radial Spotlight */}
      <div className="vital-auth-ambient-glow"></div>

      {/* TOP FLOATING NAV */}
      <header className="vital-auth-topbar">
        <a href="/" className="vital-auth-logo">
          <div className="vital-auth-logo-badge">
            <img src="./images/favicon.png" alt="Ucare Logo" />
          </div>
          <div className="vital-auth-logo-text">
            <span className="vital-auth-brand-name">Ucare</span>
            <span className="vital-auth-brand-sub">HOSPITAL</span>
          </div>
        </a>

        <a href="/" className="vital-auth-back-btn">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </a>
      </header>

      {/* MAIN AUTH CONTAINER */}
      <div className="vital-auth-shell">
        <div className="vital-auth-card">
          {/* LEFT HERO SHOWCASE PANEL */}
          <div className="vital-auth-showcase">
            <div className="vital-showcase-grid-bg"></div>
            <div className="vital-showcase-glow"></div>

            <div className="vital-showcase-content">
              <span className="vital-showcase-badge">
                <ShieldCheck size={14} />
                <span>SECURE MEDICAL PORTAL</span>
              </span>

              <h2 className="vital-showcase-title">
                Expert care for
                <br />
                healthy, confident
                <br />
                lives at every age.
              </h2>

              <p className="vital-showcase-desc">
                Log in to your specialized clinical workspace to manage appointments,
                patient care, doctor schedules, and digital records.
              </p>

              {/* 3D CENTERPIECE VISUAL */}
              <div className="vital-showcase-visual">
                <img
                  src="./images/heart.png"
                  alt="3D Heart Visual"
                  className="vital-showcase-heart"
                />
              </div>

              {/* SOCIAL PROOF CAPSULE */}
              <div className="vital-showcase-proof">
                <div className="vital-showcase-avatars">
                  <img src="./images/avatar-1.jpg" alt="User 1" />
                  <img src="./images/avatar-2.jpg" alt="User 2" />
                  <img src="./images/avatar-3.jpg" alt="User 3" />
                </div>
                <span className="vital-showcase-proof-text">
                  Your health in your hands.
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT SIGN IN FORM PANEL */}
          <div className="vital-auth-form-panel">
            <div className="vital-form-header">
              <h1 className="vital-form-title">Sign In</h1>
              <p className="vital-form-subtitle">
                Select your account role and enter your credentials to access the platform.
              </p>
            </div>

            {/* ROLE SELECTOR TABS */}
            <div className="vital-role-selector">
              <button
                type="button"
                className={`vital-role-btn ${role === "admin" ? "active" : ""}`}
                onClick={() => setRole("admin")}
                disabled={loading}
              >
                <UserCog size={16} />
                <span>Admin</span>
              </button>

              <button
                type="button"
                className={`vital-role-btn ${role === "doctor" ? "active" : ""}`}
                onClick={() => setRole("doctor")}
                disabled={loading}
              >
                <Stethoscope size={16} />
                <span>Doctor</span>
              </button>

              <button
                type="button"
                className={`vital-role-btn ${role === "receptionist" ? "active" : ""}`}
                onClick={() => setRole("receptionist")}
                disabled={loading}
              >
                <UserCheck size={16} />
                <span>Receptionist</span>
              </button>
            </div>

            {/* SIGN IN FORM */}
            <form className="vital-signin-form" onSubmit={handleLogin}>
              {/* USER ID INPUT */}
              <div className="vital-input-group">
                <label className="vital-input-label">User ID</label>
                <input
                  type="text"
                  placeholder="Enter your user ID"
                  className={`vital-form-input ${
                    errors.userId ? "vital-input-error" : ""
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

              {/* EMAIL INPUT */}
              <div className="vital-input-group">
                <label className="vital-input-label">Email Address</label>
                <input
                  type="email"
                  placeholder="name@ucare.com"
                  className={`vital-form-input ${
                    errors.email ? "vital-input-error" : ""
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

              {/* SUBMIT BUTTON - VITALCARE ACCENT PILL */}
              <button
                type="submit"
                className="vital-submit-pill-btn"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In to Dashboard →"}
              </button>
            </form>

            {/* SECURITY WARNING */}
            <div className="vital-auth-warning">
              <AlertTriangle size={18} className="vital-warning-icon" />
              <p>
                For security purposes, always log out after completing your work session.
                Authorized medical personnel only.
              </p>
            </div>

            {/* FOOTER */}
            <div className="vital-form-footer">
              © 2026 Ucare Hospital. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
