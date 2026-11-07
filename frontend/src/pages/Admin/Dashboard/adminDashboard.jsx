import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import "./adminDashboard.css";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getPatientsAPI } from "../../../api/patientApi";
import { getDoctorsAPI } from "../../../api/doctorApi";
import { getAppointmentsAPI } from "../../../api/appointmentsApi";
import { setupAdminAPI } from "../../../api/authApi";
import { toast } from "react-toastify";

import {
  LayoutDashboard,
  Stethoscope,
  UserRoundCog,
  HelpCircle,
  Search,
  Plus,
  Bell,
  Maximize2,
  Calendar,
  ChevronDown,
  MoreVertical,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRight,
  Activity,
  HeartPulse,
  UserCheck,
  Building2,
  LogOut,
  Settings,
  User,
  X
} from "lucide-react";

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        name: "Dashboard",
        icon: <LayoutDashboard size={18} />,
        path: "/admin/dashboard",
        active: true,
      },
      {
        name: "Doctors",
        icon: <Stethoscope size={18} />,
        path: "/admin/add-doctor",
      },
      {
        name: "Receptionists",
        icon: <UserRoundCog size={18} />,
        path: "/admin/add-receptionist",
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      {
        name: "Help & Support",
        icon: <HelpCircle size={18} />,
        path: "/admin/ListSupport",
      },
    ],
  },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    patients: 1420,
    doctors: 28,
    appointments: 482,
    revenue: "$196.000",
  });

  const [showModal, setShowModal] = useState(false);
  const [adminData, setAdminData] = useState({ adminId: "", name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("Administrator");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".action-dropdown-wrapper")) {
        setShowProfileMenu(false);
        setShowNotificationMenu(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowProfileMenu(false);
        setShowNotificationMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("userName");
    if (stored) setUserName(stored);

    const fetchStats = async () => {
      try {
        const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
          getPatientsAPI(),
          getDoctorsAPI(),
          getAppointmentsAPI(),
        ]);

        const pCount = patientsRes.data?.data?.length ?? patientsRes.data?.length ?? 1420;
        const dCount = doctorsRes.data?.data?.length ?? doctorsRes.data?.length ?? 28;
        const aCount = appointmentsRes.data?.data?.length ?? appointmentsRes.data?.length ?? 482;

        setStats({
          patients: pCount,
          doctors: dCount,
          appointments: aCount,
          revenue: "$196.000",
        });
      } catch (err) {
        console.warn("Using dashboard default stats due to API response", err);
      }
    };

    fetchStats();
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await setupAdminAPI(adminData);
      if (res.data.success) {
        toast.success("Admin created successfully!");
        setShowModal(false);
        setAdminData({ adminId: "", name: "", email: "" });
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred while creating admin.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="app spark-theme">
      {/* SPARK ADMIN POLISHED SIDEBAR */}
      <Sidebar menuItems={menuItems} />

      {/* MAIN CONTENT AREA */}
      <main className="main main-wrapper">
        {/* TOP NAVBAR COMPONENT */}
        <header className="navbar-custom">
          <div className="navbar-left">
            <button
              className="btn-quick-action"
              onClick={() => setShowModal(true)}
              title="Add New Admin / Record"
            >
              <Plus size={16} />
              <span>Create</span>
            </button>
          </div>

          {/* Search Pill */}
          <div className="navbar-search-wrapper">
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Search anything in Ucare..."
            />
            <button className="navbar-search-btn" aria-label="Search">
              <Search size={15} />
            </button>
          </div>

          {/* Navbar Right Actions */}
          <div className="navbar-actions">
            <button
              className="navbar-action-btn"
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
              aria-label="Fullscreen"
            >
              <Maximize2 size={16} />
            </button>

            {/* Notification Bell */}
            <div className="action-dropdown-wrapper">
              <button
                className="navbar-action-btn"
                onClick={() => {
                  setShowNotificationMenu((prev) => !prev);
                  setShowProfileMenu(false);
                }}
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell size={16} />
                <span className="navbar-action-badge" />
              </button>

              {showNotificationMenu && (
                <div className="dropdown-menu-custom notification-dropdown">
                  <div className="dropdown-menu-header">
                    <h6>Notifications</h6>
                    <button className="btn-mark-read">Mark all read</button>
                  </div>
                  <div className="notification-list">
                    <div className="notification-item">
                      <div className="noti-icon noti-success">
                        <Activity size={15} />
                      </div>
                      <div className="noti-content">
                        <p>New consultation booked: <strong>Dr. Sarah</strong></p>
                        <span>2 mins ago</span>
                      </div>
                    </div>
                    <div className="notification-item">
                      <div className="noti-icon noti-primary">
                        <UserCheck size={15} />
                      </div>
                      <div className="noti-content">
                        <p>New patient registered: <strong>John Doe</strong></p>
                        <span>1 hour ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="action-dropdown-wrapper">
              <button
                className="navbar-profile-btn"
                onClick={() => {
                  setShowProfileMenu((prev) => !prev);
                  setShowNotificationMenu(false);
                }}
              >
                <div className="navbar-profile-avatar">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="navbar-profile-name">{userName}</span>
                <ChevronDown size={14} className="navbar-profile-caret" />
              </button>

              {showProfileMenu && (
                <div className="dropdown-menu-custom profile-dropdown">
                  <div className="profile-dropdown-header">
                    <strong>{userName}</strong>
                    <span>Hospital Administrator</span>
                  </div>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item" onClick={() => navigate("/admin/dashboard")}>
                    <User size={15} /> My Account
                  </button>
                  <button className="dropdown-item" onClick={() => navigate("/admin/ListSupport")}>
                    <Settings size={15} /> Help & Settings
                  </button>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* DASHBOARD PAGE HEADER BANNER */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">
              An easy way to manage patients and healthcare with care and precision.
            </p>
          </div>
          <button className="btn-date-picker">
            <Calendar size={15} />
            <span id="selected-date-range">January 12, 2026 - January 23, 2026</span>
            <ChevronDown size={14} />
          </button>
        </div>

        {/* TOP AREA: 3 STAT CARDS ROW (Exact Spark Admin Hero Layout) */}
        <div className="spark-grid-top">
          {/* Card 1: Green Alert Banner with 6-pointed Lime Star Watermark */}
          <div className="card alert-green-card">
            <div className="alert-content-inner">
              <span className="alert-green-badge">Update</span>
              <div className="alert-green-date">Feb 14th 2026</div>
              <div className="alert-green-text">
                Hospital recovery rate increased 40% in 1 week
              </div>
            </div>

            <a href="#stats" className="alert-green-link">
              <span>See Statistics</span>
              <ArrowRight size={14} />
            </a>

            {/* Spark signature 6-pointed star watermark SVG in Hospital Light Blue */}
            <svg
              className="alert-green-bg-shape"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g transform="translate(50,50)">
                <rect x="-6" y="-45" width="12" height="90" rx="6" ry="6" fill="#38BDF8" />
                <rect x="-6" y="-45" width="12" height="90" rx="6" ry="6" fill="#38BDF8" transform="rotate(60)" />
                <rect x="-6" y="-45" width="12" height="90" rx="6" ry="6" fill="#38BDF8" transform="rotate(120)" />
              </g>
            </svg>
          </div>

          {/* Card 2: Net Revenue / Total Patients with Sparkline */}
          <div className="card card-stat">
            <div className="stat-top">
              <div className="card-header">
                <span className="stat-label">Net Revenue</span>
                <button className="card-more-btn" aria-label="More options">
                  <MoreVertical size={16} />
                </button>
              </div>
              <div className="stat-value">{stats.revenue}</div>
              <div className="trend-badge trend-up">
                <ArrowUpRight size={13} />
                <span>+35% from last month</span>
              </div>
            </div>

            {/* Sparkline mini chart (SVG curved area in hospital light blue) */}
            <div className="sparkline-container">
              <svg viewBox="0 0 300 45" className="sparkline-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,40 Q30,35 60,38 T120,28 T180,32 T240,16 T300,8 L300,45 L0,45 Z"
                  fill="url(#incomeGradient)"
                />
                <path
                  d="M0,40 Q30,35 60,38 T120,28 T180,32 T240,16 T300,8"
                  fill="none"
                  stroke="#0EA5E9"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 3: Total Return / Appointments with Sparkline */}
          <div className="card card-stat">
            <div className="stat-top">
              <div className="card-header">
                <span className="stat-label">Total Appointments</span>
                <button className="card-more-btn" aria-label="More options">
                  <MoreVertical size={16} />
                </button>
              </div>
              <div className="stat-value">{stats.appointments}</div>
              <div className="trend-badge trend-down">
                <ArrowDownLeft size={13} />
                <span>-24% from last month</span>
              </div>
            </div>

            {/* Sparkline mini chart (SVG curved area in coral red) */}
            <div className="sparkline-container">
              <svg viewBox="0 0 300 45" className="sparkline-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="returnGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,10 Q30,14 60,8 T120,20 T180,18 T240,30 T300,38 L300,45 L0,45 Z"
                  fill="url(#returnGradient)"
                />
                <path
                  d="M0,10 Q30,14 60,8 T120,20 T180,18 T240,30 T300,38"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* MAIN LAYOUT SPLIT: LEFT (CHARTS & DETAILS) + RIGHT (PERFORMANCE PANE) */}
        <div className="spark-main-grid" id="stats">
          {/* LEFT COLUMN: Revenue Chart, Transactions, Overview */}
          <div className="spark-left-pane">
            {/* FULL-WIDTH REVENUE & ACTIVITY CHART */}
            <div className="card revenue-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Revenue & Inflow</h2>
                </div>
                {/* Custom Spark Admin Legends */}
                <div className="chart-legend-row">
                  <div className="chart-legend-item">
                    <span className="legend-dot bg-navy-medium" />
                    <span>Inflow</span>
                  </div>
                  <div className="chart-legend-item">
                    <span className="legend-dot bg-blue-accent" />
                    <span>Expenses</span>
                  </div>
                </div>
              </div>

              <div className="revenue-summary-row">
                <span className="stat-value-amount">$196.000</span>
                <span className="trend-badge trend-up">+35% from last month</span>
              </div>

              {/* Spark Admin Dual Bar Chart */}
              <div className="spark-bar-chart">
                {[
                  { month: "Jan", v1: 55, v2: 28 },
                  { month: "Feb", v1: 68, v2: 42 },
                  { month: "Mar", v1: 52, v2: 38 },
                  { month: "Apr", v1: 85, v2: 60 },
                  { month: "May", v1: 65, v2: 44 },
                  { month: "Jun", v1: 88, v2: 56 },
                  { month: "Jul", v1: 76, v2: 50 },
                  { month: "Aug", v1: 95, v2: 58 },
                ].map((bar, i) => (
                  <div key={i} className="bar-column-group">
                    <div className="bar-pair">
                      <div
                        className="bar-item bar-navy"
                        style={{ height: `${bar.v1}%` }}
                        title={`${bar.month} Inflow: ${bar.v1}%`}
                      />
                      <div
                        className="bar-item bar-blue"
                        style={{ height: `${bar.v2}%` }}
                        title={`${bar.month} Expenses: ${bar.v2}%`}
                      />
                    </div>
                    <span className="bar-label">{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SUB-GRID: Transactions & Overview Progress */}
            <div className="spark-sub-grid">
              {/* Transactions / Recent Activity */}
              <div className="card transaction-card">
                <div className="card-header">
                  <h2 className="card-title">Recent Activity</h2>
                  <button className="card-more-btn">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <div className="transaction-list">
                  <div className="transaction-item">
                    <div className="transaction-icon">
                      <Activity size={18} />
                    </div>
                    <div className="transaction-info">
                      <div className="transaction-name">Dr. Johnson Consultation</div>
                      <div className="transaction-date">Feb 14, 2026 • 12:40 PM</div>
                    </div>
                    <div className="transaction-amount text-success">+$150.00</div>
                  </div>

                  <div className="transaction-item">
                    <div className="transaction-icon">
                      <HeartPulse size={18} />
                    </div>
                    <div className="transaction-info">
                      <div className="transaction-name">Emergency Ward Intake</div>
                      <div className="transaction-date">Feb 13, 2026 • 08:15 AM</div>
                    </div>
                    <div className="transaction-amount text-success">+$1,250.00</div>
                  </div>

                  <div className="transaction-item">
                    <div className="transaction-icon">
                      <Stethoscope size={18} />
                    </div>
                    <div className="transaction-info">
                      <div className="transaction-name">Surgical Suite Booking</div>
                      <div className="transaction-date">Feb 11, 2026 • 04:30 PM</div>
                    </div>
                    <div className="transaction-amount text-success">+$3,400.00</div>
                  </div>

                  <div className="transaction-item">
                    <div className="transaction-icon">
                      <Building2 size={18} />
                    </div>
                    <div className="transaction-info">
                      <div className="transaction-name">Pharmacy Supplies</div>
                      <div className="transaction-date">Feb 09, 2026 • 09:20 AM</div>
                    </div>
                    <div className="transaction-amount text-main">-$45.00</div>
                  </div>
                </div>
              </div>

              {/* Product / Department Overview Progress */}
              <div className="card overview-card">
                <div className="card-header">
                  <h2 className="card-title">Hospital Overview</h2>
                  <button className="card-more-btn">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <div className="progress-container">
                  <div className="progress-label-row">
                    <span className="progress-label">Patients Admitted</span>
                    <span className="progress-value">233</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill bg-lime-accent" style={{ width: "65%" }} />
                  </div>
                </div>

                <div className="progress-container">
                  <div className="progress-label-row">
                    <span className="progress-label">Ongoing Treatments</span>
                    <span className="progress-value">23</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill bg-lime-accent" style={{ width: "40%", opacity: 0.6 }} />
                  </div>
                </div>

                <div className="progress-container">
                  <div className="progress-label-row">
                    <span className="progress-label">Discharged Recovered</span>
                    <span className="progress-value">482</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill bg-lime-accent" style={{ width: "85%" }} />
                  </div>
                </div>

                <div className="progress-container">
                  <div className="progress-label-row">
                    <span className="progress-label">Emergency Cases</span>
                    <span className="progress-value">8</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill bg-brand-orange" style={{ width: "35%" }} />
                  </div>
                </div>

                <div className="progress-container">
                  <div className="progress-label-row">
                    <span className="progress-label">Medicines In Stock</span>
                    <span className="progress-value">1,420</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill bg-lime-accent" style={{ width: "75%" }} />
                  </div>
                </div>

                <div className="progress-container">
                  <div className="progress-label-row">
                    <span className="progress-label">Pending Lab Reports</span>
                    <span className="progress-value">64</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill bg-lime-accent" style={{ width: "45%", opacity: 0.6 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Total View Performance Donut & Level Up Promo */}
          <div className="spark-right-pane">
            {/* Total View Performance Donut Chart */}
            <div className="card performance-donut-card">
              <div className="card-header">
                <h2 className="card-title">Total Performance</h2>
              </div>

              {/* Donut Visual with Center Badge */}
              <div className="donut-chart-wrapper">
                <svg viewBox="0 0 100 100" className="donut-svg">
                  {/* Segment 1: Light Sky Blue 68% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#38BDF8"
                    strokeWidth="14"
                    strokeDasharray="162 238"
                    strokeDashoffset="0"
                  />
                  {/* Segment 2: Hospital Navy 23% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#0A1F38"
                    strokeWidth="14"
                    strokeDasharray="55 238"
                    strokeDashoffset="-162"
                  />
                  {/* Segment 3: Medical Cyan 16% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#0284C7"
                    strokeWidth="14"
                    strokeDasharray="21 238"
                    strokeDashoffset="-217"
                  />
                </svg>

                <div className="donut-center-content">
                  <span className="donut-center-label">Total Visits</span>
                  <span className="donut-center-val">565K</span>
                </div>
              </div>

              {/* Custom Legends */}
              <div className="donut-legends-container">
                <div className="chart-legend-item">
                  <span className="legend-dot bg-blue-accent" />
                  <span>Consultations</span>
                </div>
                <div className="chart-legend-item">
                  <span className="legend-dot bg-navy-medium" />
                  <span>Surgeries</span>
                </div>
                <div className="chart-legend-item">
                  <span className="legend-dot" style={{ backgroundColor: "#0284C7" }} />
                  <span>Emergency</span>
                </div>
              </div>
            </div>

            {/* Level Up Promotion CTA Banner */}
            <div className="promo-banner-card">
              <svg
                className="promo-banner-bg-shape"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g transform="translate(50,50)">
                  <rect x="-6" y="-45" width="12" height="90" rx="6" ry="6" fill="#38BDF8" />
                  <rect x="-6" y="-45" width="12" height="90" rx="6" ry="6" fill="#38BDF8" transform="rotate(60)" />
                  <rect x="-6" y="-45" width="12" height="90" rx="6" ry="6" fill="#38BDF8" transform="rotate(120)" />
                </g>
              </svg>

              <h3 className="promo-title">
                Level up hospital management to the next level.
              </h3>
              <p className="promo-desc">
                An easy way to manage medical staff, patient flow, and records with precision.
              </p>
              <button
                className="btn-promo"
                onClick={() => navigate("/admin/add-doctor")}
              >
                Check the updates now
              </button>
            </div>
          </div>
        </div>

        {/* SPARK ADMIN FOOTER */}
        <footer className="footer-custom">
          <div className="footer-left">
            <span className="footer-logo">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--hospital-light-blue)">
                <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" />
              </svg>
              Ucare Admin
            </span>
            <span className="footer-separator">|</span>
            <span className="footer-copy">© 2026 Ucare Hospital Management System</span>
          </div>
          <div className="footer-right">
            <ul className="footer-links">
              <li><a href="#stats" className="footer-link">Overview</a></li>
              <li><a href="#stats" className="footer-link">Statistics</a></li>
              <li><a href="/admin/ListSupport" className="footer-link">Help & Docs</a></li>
              <li>
                <span className="footer-link status-online">
                  Operational <span className="status-dot" />
                </span>
              </li>
            </ul>
          </div>
        </footer>

        {/* CREATE ADMIN MODAL (SPARK ADMIN STYLING) */}
        <AnimatePresence>
          {showModal && (
            <div className="admin-modal-backdrop" onClick={() => setShowModal(false)}>
              <motion.div
                className="admin-modal-content"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <div className="admin-modal-header">
                  <div>
                    <h2 className="modal-title">Add New Admin</h2>
                    <p className="modal-subtitle">Create a new hospital manager account</p>
                  </div>
                  <button
                    className="close-modal-btn"
                    onClick={() => setShowModal(false)}
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleAddAdmin} className="admin-modal-form">
                  <div className="form-group">
                    <label>Admin ID</label>
                    <input
                      type="text"
                      placeholder="e.g. ADM01"
                      value={adminData.adminId}
                      onChange={(e) =>
                        setAdminData({ ...adminData, adminId: e.target.value })
                      }
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={adminData.name}
                      onChange={(e) =>
                        setAdminData({ ...adminData, name: e.target.value })
                      }
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="admin@ucare.com"
                      value={adminData.email}
                      onChange={(e) =>
                        setAdminData({ ...adminData, email: e.target.value })
                      }
                      required
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    className="submit-admin-btn"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Admin"}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default AdminDashboard;
