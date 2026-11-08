import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { adminMenu, billingMenu } from "../../config/panelMenus";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Receipt,
  DollarSign,
  Clock,
  TrendingUp,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  CreditCard,
  X,
  Building,
  User,
  ShieldCheck,
  ArrowUpRight,
  PieChart,
  Calendar,
  Layers,
  Banknote,
  Percent,
} from "lucide-react";
import "./BillingPanel.css";

const INITIAL_INVOICES = [
  {
    id: "INV-2026-001",
    patient: "Ahmed Mansoor",
    service: "Cardiac Consultation & ECG",
    amount: 180.0,
    status: "Paid",
    method: "Credit Card",
    date: "2026-11-06",
    dueDate: "2026-11-06",
    department: "Cardiology",
  },
  {
    id: "INV-2026-002",
    patient: "Fatima Al-Sabah",
    service: "Dental Cleaning & Ortho Checkup",
    amount: 95.0,
    status: "Pending",
    method: "Insurance",
    date: "2026-11-05",
    dueDate: "2026-11-19",
    department: "Dental Clinic",
  },
  {
    id: "INV-2026-003",
    patient: "David Chen",
    service: "Pediatric Consultation & Labs",
    amount: 240.0,
    status: "Paid",
    method: "Cash",
    date: "2026-11-04",
    dueDate: "2026-11-04",
    department: "Pediatrics",
  },
  {
    id: "INV-2026-004",
    patient: "Sarah Al-Rashidi",
    service: "Emergency Room Observation",
    amount: 450.0,
    status: "Pending",
    method: "Direct Bill",
    date: "2026-11-03",
    dueDate: "2026-11-17",
    department: "Emergency Care",
  },
  {
    id: "INV-2026-005",
    patient: "Michael Brown",
    service: "MRI Brain Scan & Specialist Review",
    amount: 620.0,
    status: "Paid",
    method: "Insurance",
    date: "2026-11-02",
    dueDate: "2026-11-02",
    department: "Radiology & Imaging",
  },
  {
    id: "INV-2026-006",
    patient: "Zainab Qasim",
    service: "Dental Extraction & Suturing",
    amount: 150.0,
    status: "Overdue",
    method: "Direct Bill",
    date: "2026-10-15",
    dueDate: "2026-10-29",
    department: "Dental Clinic",
  },
  {
    id: "INV-2026-007",
    patient: "Eleanor Vance",
    service: "General Checkup & Ultrasound",
    amount: 320.0,
    status: "Paid",
    method: "Credit Card",
    date: "2026-11-07",
    dueDate: "2026-11-07",
    department: "Internal Medicine",
  },
  {
    id: "INV-2026-008",
    patient: "Lucas Tremblay",
    service: "Orthopedic Knee Arthroscopy",
    amount: 1850.0,
    status: "Paid",
    method: "Insurance",
    date: "2026-11-01",
    dueDate: "2026-11-01",
    department: "Orthopedics",
  },
];

export default function BillingPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [userName, setUserName] = useState("Admin");

  const [newInv, setNewInv] = useState({
    patient: "",
    service: "",
    amount: "",
    method: "Credit Card",
    status: "Pending",
    department: "General Clinic",
  });

  // Check if accessed in Admin context
  const isAdmin = location.pathname.startsWith("/admin");
  const currentMenu = isAdmin ? adminMenu : billingMenu;
  const panelSubtitle = isAdmin ? "HOSPITAL ADMIN" : "BILLING & ACCOUNTS";

  // Determine active view: payments, reports, or billing
  const getInitialTab = () => {
    const path = location.pathname;
    if (path.includes("payments")) return "payments";
    if (path.includes("reports")) return "reports";
    return "billing";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "Administrator");
  }, []);

  // Financial Metrics Calculation
  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const totalPaid = invoices
    .filter((inv) => inv.status === "Paid")
    .reduce((acc, inv) => acc + inv.amount, 0);
  const totalPending = invoices
    .filter((inv) => inv.status === "Pending" || inv.status === "Overdue")
    .reduce((acc, inv) => acc + inv.amount, 0);
  const pendingCount = invoices.filter(
    (inv) => inv.status === "Pending" || inv.status === "Overdue"
  ).length;

  // Payment Breakdown by Method
  const cardPayments = invoices
    .filter((inv) => inv.status === "Paid" && inv.method === "Credit Card")
    .reduce((acc, inv) => acc + inv.amount, 0);
  const insurancePayments = invoices
    .filter((inv) => inv.status === "Paid" && inv.method === "Insurance")
    .reduce((acc, inv) => acc + inv.amount, 0);
  const cashPayments = invoices
    .filter((inv) => inv.status === "Paid" && inv.method === "Cash")
    .reduce((acc, inv) => acc + inv.amount, 0);
  const directPayments = invoices
    .filter((inv) => inv.status === "Paid" && inv.method === "Direct Bill")
    .reduce((acc, inv) => acc + inv.amount, 0);

  const cardPercent = totalPaid > 0 ? Math.round((cardPayments / totalPaid) * 100) : 45;
  const insurancePercent = totalPaid > 0 ? Math.round((insurancePayments / totalPaid) * 100) : 35;
  const cashPercent = totalPaid > 0 ? Math.round((cashPayments / totalPaid) * 100) : 12;
  const directPercent = totalPaid > 0 ? Math.round((directPayments / totalPaid) * 100) : 8;

  // Filtered Invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.patient.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.service.toLowerCase().includes(search.toLowerCase()) ||
      (inv.department && inv.department.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === "payments") {
      return inv.status === "Paid";
    }

    if (statusFilter !== "All") {
      return inv.status === statusFilter;
    }

    return true;
  });

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    if (!newInv.patient || !newInv.service || !newInv.amount) {
      toast.error("Please fill in patient, service, and amount.");
      return;
    }

    const created = {
      id: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      patient: newInv.patient,
      service: newInv.service,
      amount: parseFloat(newInv.amount),
      status: newInv.status,
      method: newInv.method,
      department: newInv.department || "General Clinic",
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    };

    setInvoices([created, ...invoices]);
    toast.success(`Invoice ${created.id} generated successfully!`);
    setShowInvoiceModal(false);
    setNewInv({
      patient: "",
      service: "",
      amount: "",
      method: "Credit Card",
      status: "Pending",
      department: "General Clinic",
    });
  };

  const handleMarkAsPaid = (id) => {
    setInvoices(
      invoices.map((inv) =>
        inv.id === id ? { ...inv, status: "Paid" } : inv
      )
    );
    toast.success(`Payment recorded and cleared for Invoice ${id}`);
  };

  return (
    <div className={`app spark-theme ${isAdmin ? "white-grid-layout" : ""}`}>
      {/* SIDEBAR REMAINS ADMIN MENU WHEN ACCESSED IN ADMIN */}
      <Sidebar menuItems={currentMenu} panelSubtitle={panelSubtitle} />

      <main className="main main-wrapper admin-main-canvas">
        {/* TOP NAVBAR */}
        <header className="navbar-custom">
          <div className="navbar-left">
            <span className="billing-badge-pill">
              {activeTab === "payments" ? (
                <>
                  <CreditCard size={15} /> Admin Payment Overview
                </>
              ) : activeTab === "reports" ? (
                <>
                  <TrendingUp size={15} /> Admin Revenue Reports
                </>
              ) : (
                <>
                  <Receipt size={15} /> Admin Billing Overview
                </>
              )}
            </span>
          </div>

          <div className="navbar-search-wrapper">
            <input
              type="text"
              className="navbar-search-input"
              placeholder={
                activeTab === "payments"
                  ? "Search payments by patient, invoice ID, or method..."
                  : "Search invoices, patients, services, departments..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="navbar-search-btn" aria-label="Search">
              <Search size={15} />
            </button>
          </div>

          <div className="navbar-actions">
            <button
              className="btn-quick-action"
              onClick={() => setShowInvoiceModal(true)}
            >
              <Plus size={16} /> Create Invoice
            </button>

            <div className="admin-chip">
              <div className="admin-chip-avatar">{userName.charAt(0)}</div>
              <div>
                <span className="admin-chip-name">{userName}</span>
                <span className="admin-chip-role">
                  {isAdmin ? "Hospital Administrator" : "Billing Staff"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE HEADER BANNER */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              {activeTab === "payments" && "Payment Overview Dashboard"}
              {activeTab === "reports" && "Revenue & Executive Reports Dashboard"}
              {activeTab === "billing" && "Billing Overview Dashboard"}
            </h1>
            <p className="page-subtitle">
              {activeTab === "payments"
                ? "Hospital-wide oversight of cleared transactions, multi-channel payment flows, and patient receipts."
                : activeTab === "reports"
                ? "Departmental revenue yields, fiscal audit metrics, annual collections, and growth analysis."
                : "Real-time hospital invoicing, patient account balances, fee schedules, and collections."}
            </p>
          </div>

          {/* QUICK SUB-VIEW SWITCHER IN OPERATIONS & FINANCE */}
          <div className="admin-subview-tabs">
            <button
              className={`btn-subview-tab ${activeTab === "billing" ? "subview-active" : ""}`}
              onClick={() => {
                setActiveTab("billing");
                if (isAdmin) navigate("/admin/billing");
              }}
            >
              <Receipt size={14} /> Invoices & Billing
            </button>
            <button
              className={`btn-subview-tab ${activeTab === "payments" ? "subview-active" : ""}`}
              onClick={() => {
                setActiveTab("payments");
                if (isAdmin) navigate("/admin/payments");
              }}
            >
              <CreditCard size={14} /> Payment Overview
            </button>
            <button
              className={`btn-subview-tab ${activeTab === "reports" ? "subview-active" : ""}`}
              onClick={() => {
                setActiveTab("reports");
                if (isAdmin) navigate("/admin/reports");
              }}
            >
              <TrendingUp size={14} /> Revenue Reports
            </button>
          </div>
        </div>

        {/* ===================================================================
            VIEW 1: PAYMENTS OVERVIEW DASHBOARD
            =================================================================== */}
        {activeTab === "payments" && (
          <>
            {/* 4 PAYMENT KPI CARDS */}
            <div className="spark-grid-top">
              <div className="card card-stat">
                <div className="stat-label">Total Payments Settled</div>
                <div className="stat-value text-green">${totalPaid.toLocaleString()}</div>
                <div className="trend-badge trend-up">
                  <CheckCircle2 size={13} /> {invoices.filter((i) => i.status === "Paid").length} Receipts Cleared
                </div>
              </div>

              <div className="card card-stat">
                <div className="stat-label">Credit / Debit Card</div>
                <div className="stat-value">${cardPayments.toLocaleString()}</div>
                <div className="trend-badge trend-up">
                  <CreditCard size={13} /> {cardPercent}% of collections
                </div>
              </div>

              <div className="card card-stat">
                <div className="stat-label">Insurance Reimbursements</div>
                <div className="stat-value">${insurancePayments.toLocaleString()}</div>
                <div className="trend-badge trend-up">
                  <ShieldCheck size={13} /> {insurancePercent}% through insurers
                </div>
              </div>

              <div className="card card-stat">
                <div className="stat-label">Cash & Point-of-Sale</div>
                <div className="stat-value text-amber">
                  ${(cashPayments + directPayments).toLocaleString()}
                </div>
                <div className="trend-badge trend-neutral">
                  <Banknote size={13} /> Counter & Direct Bill
                </div>
              </div>
            </div>

            {/* PAYMENT METHODS DISTRIBUTION CHANNELS */}
            <div className="card payment-channels-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Payment Settlement Channels & Distribution</h2>
                  <p className="card-subtitle-small">
                    Real-time payment breakdown across clinical patient inflow
                  </p>
                </div>
                <span className="trend-badge trend-up">Audit Status: 100% Balanced</span>
              </div>

              <div className="channels-grid">
                <div className="channel-box">
                  <div className="channel-top">
                    <span className="channel-name">Credit & Debit Cards</span>
                    <span className="channel-pct">{cardPercent}%</span>
                  </div>
                  <div className="channel-progress">
                    <div className="channel-bar bar-blue" style={{ width: `${cardPercent}%` }} />
                  </div>
                  <span className="channel-amt">${cardPayments.toLocaleString()} Collected</span>
                </div>

                <div className="channel-box">
                  <div className="channel-top">
                    <span className="channel-name">Health Insurance Providers</span>
                    <span className="channel-pct">{insurancePercent}%</span>
                  </div>
                  <div className="channel-progress">
                    <div className="channel-bar bar-emerald" style={{ width: `${insurancePercent}%` }} />
                  </div>
                  <span className="channel-amt">${insurancePayments.toLocaleString()} Direct Claims</span>
                </div>

                <div className="channel-box">
                  <div className="channel-top">
                    <span className="channel-name">Hospital Cash Desk</span>
                    <span className="channel-pct">{cashPercent}%</span>
                  </div>
                  <div className="channel-progress">
                    <div className="channel-bar bar-amber" style={{ width: `${cashPercent}%` }} />
                  </div>
                  <span className="channel-amt">${cashPayments.toLocaleString()} Cash Inflow</span>
                </div>

                <div className="channel-box">
                  <div className="channel-top">
                    <span className="channel-name">Direct Corporate Invoicing</span>
                    <span className="channel-pct">{directPercent}%</span>
                  </div>
                  <div className="channel-progress">
                    <div className="channel-bar bar-purple" style={{ width: `${directPercent}%` }} />
                  </div>
                  <span className="channel-amt">${directPayments.toLocaleString()} Invoiced</span>
                </div>
              </div>
            </div>

            {/* PROCESSED PAYMENTS & TRANSACTIONS LOG TABLE */}
            <div className="card billing-table-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Settled Transactions & Patient Receipts</h2>
                  <span className="billing-counter-pill">
                    {filteredInvoices.length} Cleared Transactions
                  </span>
                </div>
              </div>

              <div className="table-responsive">
                <table className="billing-table">
                  <thead>
                    <tr>
                      <th>Transaction / Inv ID</th>
                      <th>Patient Name</th>
                      <th>Department / Service</th>
                      <th>Settled Amount</th>
                      <th>Channel</th>
                      <th>Payment Date</th>
                      <th>Settlement Status</th>
                      <th style={{ textAlign: "right" }}>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id}>
                        <td>
                          <span className="invoice-code">{inv.id}</span>
                        </td>
                        <td>
                          <strong>{inv.patient}</strong>
                        </td>
                        <td>
                          <div>{inv.service}</div>
                          <span className="dept-tag">{inv.department || "Clinical"}</span>
                        </td>
                        <td>
                          <strong className="text-success">${inv.amount.toFixed(2)}</strong>
                        </td>
                        <td>
                          <span className="billing-method-pill">{inv.method}</span>
                        </td>
                        <td>{inv.date}</td>
                        <td>
                          <span className="status-pill status-active">
                            <CheckCircle2 size={11} /> Settled & Cleared
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="btn-action-icon"
                            onClick={() =>
                              toast.info(`Receipt for ${inv.id} sent to printing terminal.`)
                            }
                            title="Download Receipt"
                          >
                            <Download size={14} /> Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ===================================================================
            VIEW 2: BILLING OVERVIEW DASHBOARD
            =================================================================== */}
        {activeTab === "billing" && (
          <>
            {/* 4 BILLING KPI CARDS */}
            <div className="spark-grid-top">
              <div className="card card-stat">
                <div className="stat-label">Total Amount Invoiced</div>
                <div className="stat-value">${totalInvoiced.toLocaleString()}</div>
                <div className="trend-badge trend-up">
                  <TrendingUp size={13} /> {invoices.length} Generated Invoices
                </div>
              </div>

              <div className="card card-stat">
                <div className="stat-label">Total Amount Collected</div>
                <div className="stat-value text-green">${totalPaid.toLocaleString()}</div>
                <div className="trend-badge trend-up">
                  <CheckCircle2 size={13} /> Settle Rate 84.6%
                </div>
              </div>

              <div className="card card-stat">
                <div className="stat-label">Pending Balance</div>
                <div className="stat-value text-amber">${totalPending.toLocaleString()}</div>
                <div className="trend-badge trend-down">
                  <Clock size={13} /> {pendingCount} Pending Accounts
                </div>
              </div>

              <div className="card card-stat">
                <div className="stat-label">Average Invoice Value</div>
                <div className="stat-value text-blue">
                  ${Math.round(totalInvoiced / (invoices.length || 1))}
                </div>
                <div className="trend-badge trend-up">Standard Clinical Fee</div>
              </div>
            </div>

            {/* DEPARTMENT REVENUE BREAKDOWN */}
            <div className="card billing-report-card">
              <div className="card-header">
                <h2 className="card-title">Hospital Department Billing Breakdown</h2>
                <span className="trend-badge trend-up">Current Fiscal Month</span>
              </div>

              <div className="report-breakdown-grid">
                <div className="report-mini-box">
                  <span className="box-label">Outpatient Consultations</span>
                  <strong>$42,850.00</strong>
                  <span className="box-sub">420 Invoices Issued</span>
                </div>
                <div className="report-mini-box">
                  <span className="box-label">Inpatient & Surgical Wards</span>
                  <strong>$118,400.00</strong>
                  <span className="box-sub">84 Inpatient Claims</span>
                </div>
                <div className="report-mini-box">
                  <span className="box-label">Hospital Pharmacy Dispensing</span>
                  <strong>$22,650.00</strong>
                  <span className="box-sub">310 Prescriptions Billed</span>
                </div>
                <div className="report-mini-box">
                  <span className="box-label">Diagnostic Laboratory & Scans</span>
                  <strong>$12,100.00</strong>
                  <span className="box-sub">195 Lab Tests Invoiced</span>
                </div>
              </div>
            </div>

            {/* INVOICES TABLE WITH STATUS FILTERS */}
            <div className="card billing-table-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Hospital Invoices Master Registry</h2>
                  <span className="billing-counter-pill">
                    {filteredInvoices.length} invoices displayed
                  </span>
                </div>

                {/* Filter Pills */}
                <div className="filter-pill-group">
                  {["All", "Paid", "Pending", "Overdue"].map((st) => (
                    <button
                      key={st}
                      className={`filter-btn-pill ${statusFilter === st ? "active-pill" : ""}`}
                      onClick={() => setStatusFilter(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="table-responsive">
                <table className="billing-table">
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Patient Name</th>
                      <th>Medical Service</th>
                      <th>Amount</th>
                      <th>Payment Channel</th>
                      <th>Issue Date</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id}>
                        <td>
                          <span className="invoice-code">{inv.id}</span>
                        </td>
                        <td>
                          <strong>{inv.patient}</strong>
                        </td>
                        <td>
                          <div>{inv.service}</div>
                          <span className="dept-tag">{inv.department || "Clinical"}</span>
                        </td>
                        <td>
                          <strong>${inv.amount.toFixed(2)}</strong>
                        </td>
                        <td>
                          <span className="billing-method-pill">{inv.method}</span>
                        </td>
                        <td>{inv.date}</td>
                        <td>{inv.dueDate}</td>
                        <td>
                          <span
                            className={`status-pill ${
                              inv.status === "Paid"
                                ? "status-active"
                                : inv.status === "Pending"
                                ? "status-low"
                                : "status-expiring"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div className="billing-actions" style={{ justifyContent: "flex-end" }}>
                            {inv.status !== "Paid" && (
                              <button
                                className="btn-pay-now"
                                onClick={() => handleMarkAsPaid(inv.id)}
                                title="Collect & Settle Payment"
                              >
                                Mark Paid
                              </button>
                            )}
                            <button
                              className="btn-action-icon"
                              onClick={() =>
                                toast.info(`Downloading PDF invoice for ${inv.id}...`)
                              }
                              title="Download PDF"
                            >
                              <Download size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ===================================================================
            VIEW 3: REVENUE & REPORTS DASHBOARD
            =================================================================== */}
        {activeTab === "reports" && (
          <>
            <div className="spark-grid-top">
              <div className="card card-stat">
                <div className="stat-label">Annual Gross Inflow</div>
                <div className="stat-value text-green">$1,420,800.00</div>
                <div className="trend-badge trend-up">
                  <TrendingUp size={13} /> +24% Year-over-Year
                </div>
              </div>

              <div className="card card-stat">
                <div className="stat-label">Average Collection Rate</div>
                <div className="stat-value">92.5%</div>
                <div className="trend-badge trend-up">Audit Verified</div>
              </div>

              <div className="card card-stat">
                <div className="stat-label">Bed Occupancy Revenue</div>
                <div className="stat-value text-blue">$480,200.00</div>
                <div className="trend-badge trend-up">87.4% Bed Capacity</div>
              </div>

              <div className="card card-stat">
                <div className="stat-label">Net Operating Margin</div>
                <div className="stat-value text-emerald">36.8%</div>
                <div className="trend-badge trend-up">Sustainable Healthcare</div>
              </div>
            </div>

            {/* Department Contributions Table */}
            <div className="card billing-report-card">
              <div className="card-header">
                <h2 className="card-title">Hospital Department Revenue Performance</h2>
                <span className="trend-badge trend-up">Fiscal Year 2026 Audit</span>
              </div>

              <div className="report-breakdown-grid">
                <div className="report-mini-box">
                  <span className="box-label">Surgical & Operation Theatres</span>
                  <strong>$542,000.00</strong>
                  <span className="box-sub">38.1% of Gross Hospital Inflow</span>
                </div>
                <div className="report-mini-box">
                  <span className="box-label">Inpatient Ward Admissions</span>
                  <strong>$380,400.00</strong>
                  <span className="box-sub">26.8% of Gross Hospital Inflow</span>
                </div>
                <div className="report-mini-box">
                  <span className="box-label">Outpatient & Specialist Consultations</span>
                  <strong>$290,150.00</strong>
                  <span className="box-sub">20.4% of Gross Hospital Inflow</span>
                </div>
                <div className="report-mini-box">
                  <span className="box-label">Dispensary & Pharmaceuticals</span>
                  <strong>$208,250.00</strong>
                  <span className="box-sub">14.7% of Gross Hospital Inflow</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* MODAL: GENERATE INVOICE */}
        {showInvoiceModal && (
          <div className="admin-modal-backdrop" onClick={() => setShowInvoiceModal(false)}>
            <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <div>
                  <h2>Generate Medical Invoice</h2>
                  <p>Issue patient invoice and assign department code</p>
                </div>
                <button
                  className="doctors-closeBtn"
                  onClick={() => setShowInvoiceModal(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateInvoice} className="pharmacy-form">
                <div className="form-group">
                  <label>Patient Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Mariam Al-Hassan"
                    value={newInv.patient}
                    onChange={(e) =>
                      setNewInv({ ...newInv, patient: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Medical Service / Treatment *</label>
                  <input
                    type="text"
                    placeholder="e.g. Dental Implant & Anesthesia"
                    value={newInv.service}
                    onChange={(e) =>
                      setNewInv({ ...newInv, service: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Amount ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 250.00"
                      value={newInv.amount}
                      onChange={(e) =>
                        setNewInv({ ...newInv, amount: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Department</label>
                    <select
                      value={newInv.department}
                      onChange={(e) =>
                        setNewInv({ ...newInv, department: e.target.value })
                      }
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Dental Clinic">Dental Clinic</option>
                      <option value="Emergency Care">Emergency Care</option>
                      <option value="Internal Medicine">Internal Medicine</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="General Clinic">General Clinic</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Payment Method</label>
                    <select
                      value={newInv.method}
                      onChange={(e) =>
                        setNewInv({ ...newInv, method: e.target.value })
                      }
                    >
                      <option value="Credit Card">Credit Card</option>
                      <option value="Cash">Cash</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Direct Bill">Direct Bill</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Initial Status</label>
                    <select
                      value={newInv.status}
                      onChange={(e) =>
                        setNewInv({ ...newInv, status: e.target.value })
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowInvoiceModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-quick-action">
                    Issue Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
