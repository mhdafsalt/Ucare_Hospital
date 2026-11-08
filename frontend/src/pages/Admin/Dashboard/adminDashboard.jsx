import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import "./adminDashboard.css";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getAdminDashboardOverviewAPI } from "../../../api/adminApi";
import { setupAdminAPI } from "../../../api/authApi";
import { toast } from "react-toastify";

import {
  Stethoscope,
  UserRoundCog,
  Pill,
  Receipt,
  Users,
  CalendarCheck,
  DollarSign,
  Clock,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  MoreVertical,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Bell,
  Maximize2,
  Calendar,
  ChevronDown,
  User,
  Settings,
  LogOut,
  X,
  CreditCard,
  Package,
  ShieldAlert,
} from "lucide-react";
import { adminMenu } from "../../../config/panelMenus";

function AdminDashboard() {
  const navigate = useNavigate();

  // Dynamic Dashboard Data State from Backend
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState({
    overviewCards: {
      totalDoctors: 0,
      totalReceptionists: 0,
      totalPharmacists: 0,
      totalBillingStaff: 0,
      totalPatients: 0,
      todayAppointments: 0,
      totalRevenue: 0,
      pendingPayments: 0,
    },
    billingOverview: {
      totalInvoices: 0,
      totalCollected: 0,
      pendingPayments: 0,
      partiallyPaidInvoices: 0,
      recentTransactions: [],
      recentBillingActivities: [],
      revenueCharts: {
        daily: [],
        weekly: [],
        monthly: [],
        yearly: [],
      },
    },
    pharmacyOverview: {
      totalMedicines: 0,
      availableStock: 0,
      lowStockMedicines: 0,
      expiredMedicines: 0,
      todaySales: 0,
      totalPharmacyRevenue: 0,
      recentMedicines: [],
      recentSales: [],
    },
    doctorOverview: {
      totalDoctors: 0,
      availableDoctors: 0,
      unavailableDoctors: 0,
      onLeaveDoctors: 0,
      recentDoctors: [],
    },
    receptionistOverview: {
      totalReceptionists: 0,
      activeReceptionists: 0,
      inactiveReceptionists: 0,
      recentReceptionists: [],
    },
    patientOverview: {
      totalPatients: 0,
      newPatientsToday: 0,
      recentPatients: [],
      todayAppointments: [],
      upcomingAppointments: [],
    },
    recentActivities: [],
  });

  // Revenue chart period switcher (daily, weekly, monthly, yearly)
  const [revenuePeriod, setRevenuePeriod] = useState("monthly");

  // Admin Quick Create Modal State
  const [showModal, setShowModal] = useState(false);
  const [adminData, setAdminData] = useState({ adminId: "", name: "", email: "" });
  const [submittingAdmin, setSubmittingAdmin] = useState(false);

  // User Profile & Notification dropdown state
  const [userName, setUserName] = useState("Administrator");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  // Fetch live dashboard statistics from database
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await getAdminDashboardOverviewAPI();
      if (res.data && res.data.success) {
        setOverviewData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard overview data:", err);
      toast.error("Could not fetch real-time overview data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("userName");
    if (stored) setUserName(stored);
    fetchDashboardData();
  }, []);

  // Dropdown close listeners
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

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      setSubmittingAdmin(true);
      const res = await setupAdminAPI(adminData);
      if (res.data.success) {
        toast.success("Admin created successfully!");
        setShowModal(false);
        setAdminData({ adminId: "", name: "", email: "" });
        fetchDashboardData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating admin");
    } finally {
      setSubmittingAdmin(false);
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

  // Safe formatting helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(val) || 0);
  };

  // Extract revenue chart bars for active period
  const activeChartData =
    overviewData.billingOverview?.revenueCharts?.[revenuePeriod] || [];
  const maxRevenueVal = Math.max(...activeChartData.map((d) => d.amount), 100);

  return (
    <div className="app spark-theme white-grid-layout">
      {/* SIDEBAR */}
      <Sidebar menuItems={adminMenu} />

      {/* MAIN CONTENT AREA */}
      <main className="main main-wrapper admin-main-canvas">
        {/* TOP NAVBAR COMPONENT */}
        <header className="navbar-custom">
          <div className="navbar-left">
            <button
              className="btn-quick-action"
              onClick={() => setShowModal(true)}
              title="Add New Admin Account"
            >
              <Plus size={16} />
              <span>Add Admin</span>
            </button>
          </div>

          {/* Search Pill */}
          <div className="navbar-search-wrapper">
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Search patients, staff, clinical records..."
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
                    <h6>Live System Notifications</h6>
                    <button className="btn-mark-read" onClick={fetchDashboardData}>
                      Refresh
                    </button>
                  </div>
                  <div className="notification-list">
                    {(overviewData.recentActivities || []).slice(0, 5).map((act, idx) => (
                      <div key={idx} className="notification-item">
                        <div className="noti-icon noti-primary">
                          <Activity size={15} />
                        </div>
                        <div className="noti-content">
                          <p>
                            <strong>{act.title}</strong>: {act.description}
                          </p>
                          <span>{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    ))}
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

        {/* DASHBOARD PAGE HEADER BANNER (SPARK MODERN REFERENCE) */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Hospital Overview & Operations</h1>
            <p className="page-subtitle">
              An easy way to manage healthcare operations with care and precision.
            </p>
          </div>
          <div className="page-header-actions">
            <span className="live-pill">
              <span className="status-dot-pulse" /> Live DB Connected
            </span>
            <button className="btn-date-picker">
              <Calendar size={15} />
              <span>January 12, 2026 – January 23, 2026</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        {/* ===================================================================
            HERO STAT CARDS (EXACT SPARK MODERN COLOR & DESIGN AS ATTACHED)
            =================================================================== */}
        <div className="modern-hero-cards-grid">
          {/* Card 1: Deep Forest Green Hero Accent Card with Vibrant Lime Asterisk */}
          <div className="modern-hero-dark-card">
            <div className="hero-dark-top">
              
              <div className="hero-dark-date">Feb 14th 2026</div>
              <h2 className="hero-dark-title">
                Hospital recovery & operational throughput increased 40% in 1 week
              </h2>
            </div>

            <div className="hero-dark-bottom">
              <a
                href="#billing-overview"
                className="hero-dark-link"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("billing-overview-section")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <span>See Statistics</span>
                <ArrowUpRight size={16} />
              </a>
            </div>

            {/* Signature Frosted White 6-Pointed Rounded Starburst / Asterisk Watermark */}
            <svg
              className="hero-lime-starburst"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g transform="translate(50,50)">
                <rect x="-7" y="-45" width="14" height="90" rx="7" ry="7" fill="#ffffff" />
                <rect x="-7" y="-45" width="14" height="90" rx="7" ry="7" fill="#ffffff" transform="rotate(60)" />
                <rect x="-7" y="-45" width="14" height="90" rx="7" ry="7" fill="#ffffff" transform="rotate(120)" />
              </g>
            </svg>
          </div>

          {/* Card 2: Modern White Net Income / Revenue Card with Smooth Green Wave */}
          <div className="modern-stat-wave-card">
            <div className="wave-card-content">
              <div className="wave-card-header">
                <span className="wave-card-label">Net Income</span>
                <button className="wave-card-more-btn" aria-label="More options">
                  <MoreVertical size={16} />
                </button>
              </div>
              <div className="wave-card-value">
                {loading ? "..." : (overviewData.overviewCards.totalRevenue ? formatCurrency(overviewData.overviewCards.totalRevenue) : "$196.000")}
              </div>
              <div className="wave-trend-badge wave-trend-up">
                <ArrowUpRight size={14} />
                <span>+35% from last month</span>
              </div>
            </div>

            {/* Smooth Green Curved SVG Wave Sparkline */}
            <div className="wave-sparkline-wrap">
              <svg viewBox="0 0 300 65" className="wave-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="incomeWaveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,52 Q40,42 80,46 T160,34 T240,24 T300,14 L300,65 L0,65 Z"
                  fill="url(#incomeWaveGrad)"
                />
                <path
                  d="M0,52 Q40,42 80,46 T160,34 T240,24 T300,14"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 3: Modern White Total Return / Appointments Card with Smooth Red Wave */}
          <div className="modern-stat-wave-card">
            <div className="wave-card-content">
              <div className="wave-card-header">
                <span className="wave-card-label">Total Return</span>
                <button className="wave-card-more-btn" aria-label="More options">
                  <MoreVertical size={16} />
                </button>
              </div>
              <div className="wave-card-value">
                {loading ? "..." : (overviewData.overviewCards.todayAppointments ? `$${(overviewData.overviewCards.todayAppointments * 65).toLocaleString()}` : "$32.000")}
              </div>
              <div className="wave-trend-badge wave-trend-down">
                <ArrowDownLeft size={14} />
                <span>-24% from last month</span>
              </div>
            </div>

            {/* Smooth Red/Coral Curved SVG Wave Sparkline */}
            <div className="wave-sparkline-wrap">
              <svg viewBox="0 0 300 65" className="wave-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="returnWaveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,18 Q40,24 80,16 T160,36 T240,32 T300,50 L300,65 L0,65 Z"
                  fill="url(#returnWaveGrad)"
                />
                <path
                  d="M0,18 Q40,24 80,16 T160,36 T240,32 T300,50"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* ===================================================================
            SECTION 1: DASHBOARD OVERVIEW CARDS (8 METRICS)
            Do not redirect on card click; overview display only.
            =================================================================== */}
        <div className="dashboard-overview-cards-grid">
          {/* 1. Total Doctors */}
          <div className="overview-summary-card">
            <div className="card-top-line">
              <span className="card-kicker">Medical Staff</span>
              <div className="card-kicker-icon kicker-blue">
                <Stethoscope size={18} />
              </div>
            </div>
            <div className="card-metric-number">
              {loading ? "..." : overviewData.overviewCards.totalDoctors}
            </div>
            <div className="card-metric-label">Total Doctors</div>
            <div className="card-metric-footer">
              <span className="metric-tag tag-success">
                {overviewData.doctorOverview?.availableDoctors || 0} Available
              </span>
              <span className="metric-subdetail">
                {overviewData.doctorOverview?.onLeaveDoctors || 0} on leave
              </span>
            </div>
          </div>

          {/* 2. Total Receptionists */}
          <div className="overview-summary-card">
            <div className="card-top-line">
              <span className="card-kicker">Front Desk</span>
              <div className="card-kicker-icon kicker-purple">
                <UserRoundCog size={18} />
              </div>
            </div>
            <div className="card-metric-number">
              {loading ? "..." : overviewData.overviewCards.totalReceptionists}
            </div>
            <div className="card-metric-label">Total Receptionists</div>
            <div className="card-metric-footer">
              <span className="metric-tag tag-success">
                {overviewData.receptionistOverview?.activeReceptionists || 0} Active
              </span>
              <span className="metric-subdetail">All shifts active</span>
            </div>
          </div>

          {/* 3. Total Pharmacists */}
          <div className="overview-summary-card">
            <div className="card-top-line">
              <span className="card-kicker">Pharmacy</span>
              <div className="card-kicker-icon kicker-emerald">
                <Pill size={18} />
              </div>
            </div>
            <div className="card-metric-number">
              {loading ? "..." : overviewData.overviewCards.totalPharmacists}
            </div>
            <div className="card-metric-label">Total Pharmacists</div>
            <div className="card-metric-footer">
              <span className="metric-tag tag-info">
                {overviewData.pharmacyOverview?.availableStock || 0} Medicines in stock
              </span>
            </div>
          </div>

          {/* 4. Total Billing Staff */}
          <div className="overview-summary-card">
            <div className="card-top-line">
              <span className="card-kicker">Finance</span>
              <div className="card-kicker-icon kicker-amber">
                <Receipt size={18} />
              </div>
            </div>
            <div className="card-metric-number">
              {loading ? "..." : overviewData.overviewCards.totalBillingStaff}
            </div>
            <div className="card-metric-label">Total Billing Staff</div>
            <div className="card-metric-footer">
              <span className="metric-tag tag-neutral">
                {overviewData.billingOverview?.totalInvoices || 0} Invoices handled
              </span>
            </div>
          </div>

          {/* 5. Total Patients */}
          <div className="overview-summary-card">
            <div className="card-top-line">
              <span className="card-kicker">Clinical Care</span>
              <div className="card-kicker-icon kicker-indigo">
                <Users size={18} />
              </div>
            </div>
            <div className="card-metric-number">
              {loading ? "..." : overviewData.overviewCards.totalPatients}
            </div>
            <div className="card-metric-label">Total Patients</div>
            <div className="card-metric-footer">
              <span className="metric-tag tag-success">
                +{overviewData.patientOverview?.newPatientsToday || 0} New Today
              </span>
            </div>
          </div>

          {/* 6. Today's Appointments */}
          <div className="overview-summary-card">
            <div className="card-top-line">
              <span className="card-kicker">Scheduling</span>
              <div className="card-kicker-icon kicker-cyan">
                <CalendarCheck size={18} />
              </div>
            </div>
            <div className="card-metric-number">
              {loading ? "..." : overviewData.overviewCards.todayAppointments}
            </div>
            <div className="card-metric-label">Today's Appointments</div>
            <div className="card-metric-footer">
              <span className="metric-tag tag-info">Active Slots</span>
              <span className="metric-subdetail">Across specialties</span>
            </div>
          </div>

          {/* 7. Total Revenue */}
          <div className="overview-summary-card revenue-highlight-card">
            <div className="card-top-line">
              <span className="card-kicker">Collected Revenue</span>
              <div className="card-kicker-icon kicker-green">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="card-metric-number text-revenue">
              {loading ? "..." : formatCurrency(overviewData.overviewCards.totalRevenue)}
            </div>
            <div className="card-metric-label">Total Revenue Collected</div>
            <div className="card-metric-footer">
              <span className="metric-tag tag-success">
                <TrendingUp size={12} /> Live Paid Invoices
              </span>
            </div>
          </div>

          {/* 8. Pending Payments */}
          <div className="overview-summary-card">
            <div className="card-top-line">
              <span className="card-kicker">Accounts Receivable</span>
              <div className="card-kicker-icon kicker-rose">
                <Clock size={18} />
              </div>
            </div>
            <div className="card-metric-number text-pending">
              {loading ? "..." : formatCurrency(overviewData.overviewCards.pendingPayments)}
            </div>
            <div className="card-metric-label">Pending Payments</div>
            <div className="card-metric-footer">
              <span className="metric-tag tag-warning">
                {overviewData.billingOverview?.partiallyPaidInvoices || 0} Partial Invoices
              </span>
            </div>
          </div>
        </div>

        {/* ===================================================================
            SECTION 2: BILLING OVERVIEW SECTION (With Revenue Chart & View All Button)
            =================================================================== */}
        <section id="billing-overview-section" className="dashboard-section-block">
          <div className="section-header-row">
            <div>
              <div className="section-tag">Finance & Revenue Intelligence</div>
              <h2 className="section-title">Billing & Revenue Overview</h2>
              <p className="section-subtitle">
                Track hospital invoice volumes, collected revenues, payment methods, and historical period analysis.
              </p>
            </div>
            <button
              className="btn-view-all"
              onClick={() => navigate("/admin/billing")}
              title="Navigate to complete Billing Management module"
            >
              <span>View All Billing</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* 4 Mini Stat Badges for Billing */}
          <div className="mini-stats-quad-grid">
            <div className="mini-stat-box">
              <span className="mini-stat-label">Total Invoices</span>
              <span className="mini-stat-value">
                {overviewData.billingOverview?.totalInvoices || 0}
              </span>
            </div>
            <div className="mini-stat-box">
              <span className="mini-stat-label">Total Collected</span>
              <span className="mini-stat-value text-success">
                {formatCurrency(overviewData.billingOverview?.totalCollected)}
              </span>
            </div>
            <div className="mini-stat-box">
              <span className="mini-stat-label">Pending Balance</span>
              <span className="mini-stat-value text-pending">
                {formatCurrency(overviewData.billingOverview?.pendingPayments)}
              </span>
            </div>
            <div className="mini-stat-box">
              <span className="mini-stat-label">Partially Paid Invoices</span>
              <span className="mini-stat-value">
                {overviewData.billingOverview?.partiallyPaidInvoices || 0}
              </span>
            </div>
          </div>

          {/* Split: Chart Left, Transactions Table Right */}
          <div className="billing-split-grid">
            {/* LEFT: Dynamic Period Revenue Chart */}
            <div className="card billing-chart-card">
              <div className="card-header-with-tabs">
                <div>
                  <h3 className="card-block-title">Hospital Revenue Inflow</h3>
                  <span className="card-block-subtitle">
                    Periodically calculated from paid hospital invoices
                  </span>
                </div>
                {/* Period Switcher: Daily, Weekly, Monthly, Yearly */}
                <div className="period-tabs-wrapper">
                  {["daily", "weekly", "monthly", "yearly"].map((period) => (
                    <button
                      key={period}
                      className={`period-tab-btn ${
                        revenuePeriod === period ? "period-tab-active" : ""
                      }`}
                      onClick={() => setRevenuePeriod(period)}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bar Chart Canvas */}
              <div className="revenue-bars-canvas">
                {activeChartData.length === 0 ? (
                  <div className="chart-empty-state">No revenue data for this interval</div>
                ) : (
                  activeChartData.map((item, idx) => {
                    const heightPercent = Math.max(
                      Math.round((item.amount / maxRevenueVal) * 100),
                      12
                    );
                    return (
                      <div key={idx} className="revenue-bar-col">
                        <div className="bar-hover-val">${item.amount.toLocaleString()}</div>
                        <div className="bar-track-wrap">
                          <div
                            className="bar-fill-dynamic"
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>
                        <span className="bar-axis-label">{item.label}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT: Recent Invoices Table Preview */}
            <div className="card billing-preview-card">
              <div className="card-header-clean">
                <h3 className="card-block-title">Recent Invoices & Transactions</h3>
                <span className="badge-pill-count">
                  {overviewData.billingOverview?.recentTransactions?.length || 0} preview
                </span>
              </div>

              <div className="compact-table-wrap">
                <table className="compact-data-table">
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Patient</th>
                      <th>Service</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(overviewData.billingOverview?.recentTransactions || []).map((t, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className="invoice-code">{t.invoiceId}</span>
                        </td>
                        <td>
                          <strong>{t.patientName}</strong>
                        </td>
                        <td className="truncate-text">{t.service}</td>
                        <td className="amount-col">{formatCurrency(t.amount)}</td>
                        <td>
                          <span
                            className={`badge-status ${
                              t.status === "Paid"
                                ? "badge-paid"
                                : t.status === "Partially Paid"
                                ? "badge-partial"
                                : "badge-pending"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 3: PHARMACY OVERVIEW SECTION (With View All Button)
            =================================================================== */}
        <section className="dashboard-section-block">
          <div className="section-header-row">
            <div>
              <div className="section-tag">Pharmacy & Dispensary Control</div>
              <h2 className="section-title">Pharmacy Overview</h2>
              <p className="section-subtitle">
                Real-time pharmaceuticals inventory, low stock thresholds, expiry alerts, and dispensary revenue.
              </p>
            </div>
            <button
              className="btn-view-all"
              onClick={() => navigate("/admin/pharmacy")}
              title="Navigate to complete Pharmacy Management module"
            >
              <span>View All Pharmacy</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Mini Stat Row for Pharmacy */}
          <div className="pharmacy-stats-strip">
            <div className="pharmacy-stat-pill">
              <Package size={18} className="text-blue" />
              <div>
                <span className="strip-val">{overviewData.pharmacyOverview?.totalMedicines || 0}</span>
                <span className="strip-lbl">Total Medicines</span>
              </div>
            </div>
            <div className="pharmacy-stat-pill">
              <CheckCircle2 size={18} className="text-emerald" />
              <div>
                <span className="strip-val">{overviewData.pharmacyOverview?.availableStock || 0}</span>
                <span className="strip-lbl">Units Available</span>
              </div>
            </div>
            <div className="pharmacy-stat-pill">
              <AlertTriangle size={18} className="text-amber" />
              <div>
                <span className="strip-val">{overviewData.pharmacyOverview?.lowStockMedicines || 0}</span>
                <span className="strip-lbl">Low Stock Alerts</span>
              </div>
            </div>
            <div className="pharmacy-stat-pill">
              <ShieldAlert size={18} className="text-rose" />
              <div>
                <span className="strip-val">{overviewData.pharmacyOverview?.expiredMedicines || 0}</span>
                <span className="strip-lbl">Expired Items</span>
              </div>
            </div>
            <div className="pharmacy-stat-pill">
              <DollarSign size={18} className="text-emerald" />
              <div>
                <span className="strip-val">
                  {formatCurrency(overviewData.pharmacyOverview?.totalPharmacyRevenue)}
                </span>
                <span className="strip-lbl">Dispensary Revenue</span>
              </div>
            </div>
          </div>

          {/* Pharmacy Inventory Table Preview */}
          <div className="card table-preview-card">
            <div className="card-header-clean">
              <h3 className="card-block-title">Key Pharmaceuticals Inventory Status</h3>
              <span className="badge-pill-count">Live Stock Monitor</span>
            </div>

            <div className="compact-table-wrap">
              <table className="compact-data-table">
                <thead>
                  <tr>
                    <th>Item ID</th>
                    <th>Medicine Name</th>
                    <th>Category</th>
                    <th>Batch</th>
                    <th>Stock Units</th>
                    <th>Unit Price</th>
                    <th>Inventory Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(overviewData.pharmacyOverview?.recentMedicines || []).map((m, idx) => (
                    <tr key={idx}>
                      <td>
                        <span className="invoice-code">{m.medicineId}</span>
                      </td>
                      <td>
                        <strong>{m.name}</strong>
                      </td>
                      <td>{m.category}</td>
                      <td>{m.batch}</td>
                      <td>
                        <span className="stock-number-pill">{m.stock} units</span>
                      </td>
                      <td>${Number(m.price).toFixed(2)}</td>
                      <td>
                        <span
                          className={`badge-status ${
                            m.status === "In Stock"
                              ? "badge-paid"
                              : m.status === "Low Stock"
                              ? "badge-partial"
                              : "badge-pending"
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 4: DOCTOR, RECEPTIONIST & PATIENT OVERVIEWS (3-COL TRI-GRID)
            =================================================================== */}
        <section className="dashboard-section-block">
          <div className="tri-overview-grid">
            {/* 1. DOCTOR OVERVIEW */}
            <div className="card tri-col-card">
              <div className="tri-header">
                <div>
                  <span className="tri-subtitle">Clinical Staff</span>
                  <h3 className="tri-title">Doctor Overview</h3>
                </div>
                <button
                  className="btn-tri-view-all"
                  onClick={() => navigate("/admin/add-doctor")}
                  title="View All Doctors"
                >
                  View All Doctors <ArrowRight size={13} />
                </button>
              </div>

              {/* Status Chips */}
              <div className="tri-metrics-row">
                <div className="tri-badge bg-blue-subtle">
                  <span>Total: <strong>{overviewData.doctorOverview?.totalDoctors || 0}</strong></span>
                </div>
                <div className="tri-badge bg-green-subtle">
                  <span>Available: <strong>{overviewData.doctorOverview?.availableDoctors || 0}</strong></span>
                </div>
                <div className="tri-badge bg-rose-subtle">
                  <span>On Leave: <strong>{overviewData.doctorOverview?.onLeaveDoctors || 0}</strong></span>
                </div>
              </div>

              {/* Recently Added Doctors Preview */}
              <div className="tri-list-container">
                <span className="tri-list-heading">Recently Added Doctors</span>
                {(overviewData.doctorOverview?.recentDoctors || []).slice(0, 4).map((d, idx) => (
                  <div key={idx} className="tri-list-item">
                    <img
                      src={
                        d.image ||
                        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80"
                      }
                      alt={d.name}
                      className="tri-avatar"
                    />
                    <div className="tri-item-info">
                      <div className="tri-name">{d.name}</div>
                      <div className="tri-detail">{d.specialization}</div>
                    </div>
                    <span
                      className={`badge-status ${
                        d.status === "Available" ? "badge-paid" : "badge-partial"
                      }`}
                    >
                      {d.status || "Available"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. RECEPTIONIST OVERVIEW */}
            <div className="card tri-col-card">
              <div className="tri-header">
                <div>
                  <span className="tri-subtitle">Front Desk Operations</span>
                  <h3 className="tri-title">Receptionist Overview</h3>
                </div>
                <button
                  className="btn-tri-view-all"
                  onClick={() => navigate("/admin/add-receptionist")}
                  title="View All Receptionists"
                >
                  View All Receptionists <ArrowRight size={13} />
                </button>
              </div>

              {/* Status Chips */}
              <div className="tri-metrics-row">
                <div className="tri-badge bg-purple-subtle">
                  <span>Total: <strong>{overviewData.receptionistOverview?.totalReceptionists || 0}</strong></span>
                </div>
                <div className="tri-badge bg-green-subtle">
                  <span>Active: <strong>{overviewData.receptionistOverview?.activeReceptionists || 0}</strong></span>
                </div>
                <div className="tri-badge bg-slate-subtle">
                  <span>Inactive: <strong>{overviewData.receptionistOverview?.inactiveReceptionists || 0}</strong></span>
                </div>
              </div>

              {/* Recently Added Receptionists Preview */}
              <div className="tri-list-container">
                <span className="tri-list-heading">Recently Added Receptionists</span>
                {(overviewData.receptionistOverview?.recentReceptionists || []).slice(0, 4).map((r, idx) => (
                  <div key={idx} className="tri-list-item">
                    <img
                      src={
                        r.receptionistimage ||
                        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"
                      }
                      alt={r.name}
                      className="tri-avatar"
                    />
                    <div className="tri-item-info">
                      <div className="tri-name">{r.name}</div>
                      <div className="tri-detail">{r.shift} Shift</div>
                    </div>
                    <span
                      className={`badge-status ${
                        r.status === "Active" ? "badge-paid" : "badge-pending"
                      }`}
                    >
                      {r.status || "Active"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. PATIENT & APPOINTMENT OVERVIEW */}
            <div className="card tri-col-card">
              <div className="tri-header">
                <div>
                  <span className="tri-subtitle">Admissions & Bookings</span>
                  <h3 className="tri-title">Patient Overview</h3>
                </div>
                <button
                  className="btn-tri-view-all"
                  onClick={() => navigate("/admin/patients")}
                  title="View All Patients"
                >
                  View All Patients <ArrowRight size={13} />
                </button>
              </div>

              {/* Status Chips */}
              <div className="tri-metrics-row">
                <div className="tri-badge bg-indigo-subtle">
                  <span>Registered: <strong>{overviewData.patientOverview?.totalPatients || 0}</strong></span>
                </div>
                <div className="tri-badge bg-green-subtle">
                  <span>Today's Appts: <strong>{overviewData.overviewCards?.todayAppointments || 0}</strong></span>
                </div>
                <div className="tri-badge bg-cyan-subtle">
                  <span>New: <strong>+{overviewData.patientOverview?.newPatientsToday || 0}</strong></span>
                </div>
              </div>

              {/* Recently Registered Patients Preview */}
              <div className="tri-list-container">
                <span className="tri-list-heading">Recent Patient Registrations</span>
                {(overviewData.patientOverview?.recentPatients || []).slice(0, 4).map((p, idx) => (
                  <div key={idx} className="tri-list-item">
                    <div className="patient-avatar-circle">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="tri-item-info">
                      <div className="tri-name">{p.name}</div>
                      <div className="tri-detail">
                        {p.gender}, {p.age} yrs • {p.phone}
                      </div>
                    </div>
                    <span className="patient-time-badge">Admitted</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            SECTION 5: SYSTEM-WIDE RECENT ACTIVITIES TIMELINE
            =================================================================== */}
        <section className="dashboard-section-block">
          <div className="card activities-timeline-card">
            <div className="card-header-clean">
              <div>
                <div className="section-tag">Audit & Event Stream</div>
                <h3 className="card-block-title">Hospital Recent Activities Feed</h3>
              </div>
              <button className="btn-refresh-feed" onClick={fetchDashboardData}>
                Refresh Stream
              </button>
            </div>

            <div className="activities-timeline-stream">
              {(overviewData.recentActivities || []).length === 0 ? (
                <div className="chart-empty-state">No recent activities logged yet.</div>
              ) : (
                overviewData.recentActivities.map((act, idx) => (
                  <div key={idx} className="activity-stream-item">
                    <div className="activity-icon-node">
                      {act.type === "patient_registered" ? (
                        <Users size={16} />
                      ) : act.type === "doctor_added" ? (
                        <Stethoscope size={16} />
                      ) : act.type === "pharmacist_added" ? (
                        <Pill size={16} />
                      ) : act.type === "billing_staff_added" ? (
                        <Receipt size={16} />
                      ) : act.type === "appointment_booked" ? (
                        <CalendarCheck size={16} />
                      ) : act.type === "payment_completed" ? (
                        <DollarSign size={16} />
                      ) : (
                        <Activity size={16} />
                      )}
                    </div>
                    <div className="activity-content-box">
                      <div className="activity-title-line">
                        <span className="activity-title-bold">{act.title}</span>
                        <span className="activity-timestamp">
                          {new Date(act.createdAt).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="activity-desc-text">{act.description}</p>
                      <div className="activity-meta-footer">
                        <span className="activity-user-badge">By: {act.user}</span>
                        {act.amount && (
                          <span className="activity-amount-tag">
                            Amount: ${act.amount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer-custom">
          <div className="footer-left">
            <span className="footer-logo">Ucare Admin Engine</span>
            <span className="footer-separator">|</span>
            <span className="footer-copy">© 2026 Ucare Hospital Management System</span>
          </div>
          <div className="footer-right">
            <span className="footer-link status-online">
              System Live & Operational <span className="status-dot" />
            </span>
          </div>
        </footer>

        {/* CREATE ADMIN MODAL */}
        <AnimatePresence>
          {showModal && (
            <div className="admin-modal-backdrop" onClick={() => setShowModal(false)}>
              <motion.div
                className="admin-modal-content"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="admin-modal-header">
                  <div>
                    <h2 className="modal-title">Create New Administrator</h2>
                    <p className="modal-subtitle">Assign system administrator privileges</p>
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
                      placeholder="e.g. ADM02"
                      value={adminData.adminId}
                      onChange={(e) =>
                        setAdminData({ ...adminData, adminId: e.target.value })
                      }
                      required
                      disabled={submittingAdmin}
                    />
                  </div>

                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Eleanor Vance"
                      value={adminData.name}
                      onChange={(e) =>
                        setAdminData({ ...adminData, name: e.target.value })
                      }
                      required
                      disabled={submittingAdmin}
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
                      disabled={submittingAdmin}
                    />
                  </div>

                  <button
                    type="submit"
                    className="submit-admin-btn"
                    disabled={submittingAdmin}
                  >
                    {submittingAdmin ? "Creating..." : "Create Admin Account"}
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
