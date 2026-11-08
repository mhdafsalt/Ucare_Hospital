import React, { useState, useEffect, useMemo } from "react";
import "./Home.css";
import Navbar from "../../components/Navbar/Navbar";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import AuthDropdown from "../../components/AuthDropdown/AuthDropdown";
import { getDoctorsAPI } from "../../api/doctorApi";

// High-fidelity fallback doctor profiles if database has fewer than 4 doctors
const DEFAULT_DOCTORS = [
  {
    _id: "default-1",
    name: "Dr. Sarah Mitchell",
    specialization: "Dental Care",
    image: "./images/avatar-1.jpg",
  },
  {
    _id: "default-2",
    name: "Dr. James Wilson",
    specialization: "Cardiology",
    image: "./images/avatar-2.jpg",
  },
  {
    _id: "default-3",
    name: "Dr. Elena Vance",
    specialization: "Orthodontics",
    image: "./images/avatar-3.jpg",
  },
  {
    _id: "default-4",
    name: "Dr. Emma Roberts",
    specialization: "Dental Surgeon",
    image: "./images/doctor-emma.jpg",
  },
];

function Home() {
  // activeAuth is null (hidden) by default. Only set to 'navbar' or 'hero' when clicked!
  const [activeAuth, setActiveAuth] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch actual dashboard-added doctors from backend API
  useEffect(() => {
    let isMounted = true;
    const fetchDoctors = async () => {
      try {
        const res = await getDoctorsAPI(false);
        if (isMounted && res.data && Array.isArray(res.data.doctors)) {
          const active = res.data.doctors.filter((doc) => !doc.isDeleted);
          setDoctors(active);
        }
      } catch (err) {
        console.warn("Could not fetch dashboard doctors for homepage:", err);
      }
    };

    fetchDoctors();
    return () => {
      isMounted = false;
    };
  }, []);

  // Display actual added doctors first, padding with defaults if fewer than 4
  const displayedDoctors = useMemo(() => {
    if (!doctors || doctors.length === 0) {
      return DEFAULT_DOCTORS;
    }
    if (doctors.length >= 4) {
      return doctors.slice(0, 4);
    }
    const needed = 4 - doctors.length;
    return [...doctors, ...DEFAULT_DOCTORS.slice(0, needed)];
  }, [doctors]);

  // If URL has ?auth=true, open once and clean up the URL so it doesn't linger on refresh
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("auth") === "true") {
      setActiveAuth("navbar");
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, location.pathname, navigate]);

  return (
    <div className="home">
      {/* =========================================================================
          HERO SECTION - VITALCARE STYLE (FRAMER MEDICAL LANDING)
          ========================================================================= */}
      <div id="Home" className="vital-hero-wrapper">
        <Navbar
          isAuthOpen={activeAuth === "navbar"}
          onToggleAuth={() =>
            setActiveAuth((prev) => (prev === "navbar" ? null : "navbar"))
          }
          onCloseAuth={() => setActiveAuth(null)}
          onOpenAuth={() => setActiveAuth("navbar")}
        />

        <section className={`vital-hero ${activeAuth ? "has-active-auth" : ""}`}>
          {/* Subtle Grid Pattern Overlay */}
          <div className="vital-hero-grid"></div>

          {/* Ambient Radial Spotlight Glow */}
          <div className="vital-hero-ambient-glow"></div>

          {/* MAIN HERO STAGE */}
          <div className="vital-hero-stage">
            {/* GIANT DISPLAY TYPOGRAPHY: HEALTHCARE */}
            <div className="vital-typography-layer" aria-label="HEALTHCARE">
              <span className="vital-type-chunk">HEALT</span>
              <span className="vital-type-chunk">CARE</span>
            </div>

            {/* 3D ANATOMICAL HEART CENTERPIECE - 100% STATIC (NO MOTION HOVER) */}
            <div className={`vital-heart-centerpiece ${activeAuth === "hero" ? "has-active-auth" : ""}`}>
              <div className="vital-heart-motion-box">
                <div className="vital-heart-glow-ring"></div>
                <img
                  src="./images/heart.png"
                  alt="VitalCare 3D Anatomical Heart"
                  className="vital-heart-img"
                />
              </div>

              {/* JOIN NOW PILL BUTTON & HERO AUTH POPOVER (SHOWN ONLY WHEN CLICKED) */}
              <div className="vital-hero-cta-wrap">
                <button
                  type="button"
                  onClick={() =>
                    setActiveAuth((prev) => (prev === "hero" ? null : "hero"))
                  }
                  className={`vital-explore-pill-btn ${activeAuth === "hero" ? "active" : ""}`}
                >
                  Join Now
                </button>

                {/* VIEW ONLY WHEN BUTTON IS CLICKED, ANOTHER TIME IS HIDDEN - OPENS ON TOP SIDE */}
                {activeAuth === "hero" && (
                  <AuthDropdown
                    isOpen={true}
                    onClose={() => setActiveAuth(null)}
                    placement="top"
                  />
                )}
              </div>
            </div>

            {/* FLANKING SUB-ELEMENTS */}
            <div className="vital-flank-row">
              <div className="vital-flank-left">
                Personalized care for healthier living.
              </div>

              <div className="vital-flank-right">
                <span className="vital-since-label">Since</span>
                <span className="vital-ecg-pulse">
                  <svg width="26" height="15" viewBox="0 0 26 15" fill="none">
                    <path
                      d="M1 7.5H6.5L9 1.5L13.5 13.5L16.5 4.5L18.5 9.5H25"
                      stroke="#bef264"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="vital-since-year">2025</span>
              </div>
            </div>
          </div>

          {/* =========================================================================
              LOWER FEATURE ROW (3 INTERACTIVE FLOATING WIDGETS)
              ========================================================================= */}
          <div className="vital-bottom-dock">
            {/* WIDGET 1: LEFT SOCIAL PROOF & BADGE */}
            <div className="vital-dock-col vital-left-col">
              <div className="vital-social-proof">
                <div className="vital-avatar-stack">
                  {displayedDoctors.map((doc, idx) => {
                    const fallbackSrc =
                      DEFAULT_DOCTORS[idx % DEFAULT_DOCTORS.length].image;
                    const docSrc =
                      doc.image && doc.image.trim() ? doc.image : fallbackSrc;
                    const docName = doc.name
                      ? doc.name.startsWith("Dr.")
                        ? doc.name
                        : `Dr. ${doc.name}`
                      : `Specialist ${idx + 1}`;
                    const docTitle = `${docName}${
                      doc.specialization ? ` • ${doc.specialization}` : ""
                    }`;

                    return (
                      <img
                        key={doc._id || doc.doctorId || idx}
                        src={docSrc}
                        alt={docName}
                        title={docTitle}
                        className="vital-avatar-circle"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = fallbackSrc;
                        }}
                      />
                    );
                  })}
                </div>
                <div className="vital-rating-text">
                  {doctors.length > 0 ? `${doctors.length}+` : "3k+"}{" "}
                  <span className="vital-star">★</span> (4.9)
                </div>
              </div>

              {/* STEM CONNECTOR */}
              <div className="vital-connector-stem">
                <div className="vital-stem-line"></div>
                <div className="vital-stem-dot"></div>
              </div>

              {/* FROSTED CAPSULE BADGE */}
              <div className="vital-frosted-capsule">
                Your health in your hands.
              </div>
            </div>

            {/* WIDGET 2: CENTER TYPOGRAPHY STATEMENT (NO BORDER) */}
            <div className="vital-dock-col vital-center-col">
              <p className="vital-hero-statement">
                Expert dental care for healthy,
                <br />
                confident smiles at every age—
                <br />
                delivered with comfort, precision,
                <br />
                and trust.
              </p>
            </div>

            {/* WIDGET 3: RIGHT GLOBAL REACH & 3D WIREFRAME GLOBE */}
            <div className="vital-dock-col vital-right-col">
              <div className="vital-global-reach-title">
                Serving patients
                <br />
                across 25+ countries
              </div>

              {/* STEM CONNECTOR */}
              <div className="vital-connector-stem">
                <div className="vital-stem-line"></div>
                <div className="vital-stem-dot"></div>
              </div>

              {/* HOLOGRAPHIC 3D WIREFRAME GLOBE */}
              <div className="vital-globe-wrapper">
                <div className="vital-globe-sphere">
                  <svg
                    className="vital-globe-svg"
                    viewBox="0 0 100 100"
                    fill="none"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#38bdf8"
                      strokeWidth="1.5"
                      strokeOpacity="0.8"
                    />
                    <ellipse
                      cx="50"
                      cy="50"
                      rx="40"
                      ry="18"
                      stroke="#38bdf8"
                      strokeWidth="1.2"
                      strokeOpacity="0.75"
                    />
                    <ellipse
                      cx="50"
                      cy="50"
                      rx="18"
                      ry="40"
                      stroke="#38bdf8"
                      strokeWidth="1.2"
                      strokeOpacity="0.75"
                    />
                    <line
                      x1="10"
                      y1="50"
                      x2="90"
                      y2="50"
                      stroke="#38bdf8"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                      strokeOpacity="0.5"
                    />
                    <line
                      x1="50"
                      y1="10"
                      x2="50"
                      y2="90"
                      stroke="#38bdf8"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                      strokeOpacity="0.5"
                    />
                    <ellipse
                      cx="50"
                      cy="50"
                      rx="38"
                      ry="32"
                      transform="rotate(30 50 50)"
                      stroke="#0ea5e9"
                      strokeWidth="1"
                      strokeOpacity="0.6"
                    />
                    <circle cx="50" cy="50" r="4" fill="#bef264" />
                  </svg>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveAuth("navbar");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="vital-learn-more-link"
              >
                Learn More
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
