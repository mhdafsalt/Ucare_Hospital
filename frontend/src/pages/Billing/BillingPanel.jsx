import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { adminMenu, billingMenu } from "../../config/panelMenus";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getInvoicesAPI,
  createInvoiceAPI,
  updateInvoiceAPI,
  deleteInvoiceAPI,
} from "../../api/billingApi";
import { getPatientsAPI } from "../../api/patientApi";
import { getDoctorsAPI } from "../../api/doctorApi";
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
  RotateCw,
  Edit2,
  Trash2,
  Printer,
  LayoutDashboard,
  FolderClock,
  Check,
} from "lucide-react";
import "./BillingPanel.css";

export default function BillingPanel() {
  const location = useLocation();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [registeredPatients, setRegisteredPatients] = useState([]);
  const [onDutyDoctors, setOnDutyDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInv, setEditingInv] = useState(null);
  const [userName, setUserName] = useState("Admin");

  // New Invoice Form State with Patient and Doctor Linking
  const [newInv, setNewInv] = useState({
    patient: "",
    patientId: "",
    doctorName: "",
    service: "",
    amount: "",
    method: "Credit Card",
    status: "Pending",
    department: "Cardiology",
  });

  // Check if accessed in Admin context
  const isAdmin = location.pathname.startsWith("/admin");
  const currentMenu = isAdmin ? adminMenu : billingMenu;
  const panelSubtitle = isAdmin ? "HOSPITAL ADMIN" : "BILLING & ACCOUNTS";

  // Normalize incoming backend invoices for clean, robust UI rendering
  const normalizeInvoice = (inv) => ({
    _id: inv._id,
    id: inv.invoiceId || inv.id || `INV-${String(inv._id).slice(-6)}`,
    patient: inv.patientName || inv.patient || "Walk-in Patient",
    patientId: inv.patientId || "",
    doctorName: inv.doctorName || "Dr. Salman",
    service: inv.service || "Clinical Consultation",
    amount: Number(inv.amount || 0),
    paidAmount: Number(inv.paidAmount || 0),
    status: inv.status || "Pending",
    method: inv.paymentMethod || inv.method || "Credit Card",
    department: inv.department || "General Clinic",
    date: inv.createdAt
      ? new Date(inv.createdAt).toISOString().split("T")[0]
      : inv.date || new Date().toISOString().split("T")[0],
    dueDate: inv.dueDate
      ? new Date(inv.dueDate).toISOString().split("T")[0]
      : new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
  });

  // Fetch live invoices, patients, and doctors from MongoDB database
  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const [invRes, patRes, docRes] = await Promise.allSettled([
        getInvoicesAPI(),
        getPatientsAPI(false),
        getDoctorsAPI(false),
      ]);

      if (invRes.status === "fulfilled" && invRes.value?.data?.invoices) {
        setInvoices(invRes.value.data.invoices.map(normalizeInvoice));
      }

      if (patRes.status === "fulfilled" && patRes.value?.data) {
        const rawPats = Array.isArray(patRes.value.data.patients)
          ? patRes.value.data.patients
          : Array.isArray(patRes.value.data)
          ? patRes.value.data
          : [];
        setRegisteredPatients(
          rawPats.map((p, idx) => ({
            rawId: p._id,
            name: p.name || `Patient ${idx + 1}`,
            id: p.patientId || (p._id ? `PAT-${String(p._id).slice(-4).toUpperCase()}` : `PAT-${101 + idx}`),
            phone: p.phone || "",
          }))
        );
      }

      if (docRes.status === "fulfilled" && docRes.value?.data) {
        const rawDocs = Array.isArray(docRes.value.data.doctors)
          ? docRes.value.data.doctors
          : Array.isArray(docRes.value.data)
          ? docRes.value.data
          : [];
        setOnDutyDoctors(
          rawDocs.map((d) => ({
            rawId: d._id,
            name: d.name?.startsWith("Dr.") ? d.name : `Dr. ${d.name || "Physician"}`,
            specialty: d.specialization || d.department || "General Medicine",
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load live billing data:", err);
      toast.error("Could not fetch latest billing records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  // Determine active view based on current URL path
  const getInitialTab = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes("pending")) return "pending";
    if (path.includes("history")) return "history";
    if (path.includes("payments")) return "payments";
    if (path.includes("reports")) return "reports";
    if (path.includes("invoices")) return "invoices";
    return "dashboard";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "Administrator");
  }, []);

  // Financial Metrics Calculation (100% Dynamic from live DB records)
  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const totalPaid = invoices
    .filter((inv) => inv.status === "Paid")
    .reduce((acc, inv) => acc + (inv.paidAmount || inv.amount), 0);
  const totalPending = invoices
    .filter((inv) => inv.status === "Pending" || inv.status === "Overdue" || inv.status === "Partially Paid")
    .reduce((acc, inv) => acc + (inv.amount - (inv.paidAmount || 0)), 0);
  const pendingCount = invoices.filter(
    (inv) => inv.status === "Pending" || inv.status === "Overdue"
  ).length;

  const settleRate = totalInvoiced > 0 ? ((totalPaid / totalInvoiced) * 100).toFixed(1) : "0.0";
  const avgInvoiceValue = Math.round(totalInvoiced / (invoices.length || 1));

  // Payment Breakdown by Method (100% Dynamic from live DB records)
  const cardPayments = invoices
    .filter((inv) => inv.status === "Paid" && inv.method === "Credit Card")
    .reduce((acc, inv) => acc + (inv.paidAmount || inv.amount), 0);
  const insurancePayments = invoices
    .filter((inv) => inv.status === "Paid" && inv.method === "Insurance")
    .reduce((acc, inv) => acc + (inv.paidAmount || inv.amount), 0);
  const cashPayments = invoices
    .filter((inv) => inv.status === "Paid" && inv.method === "Cash")
    .reduce((acc, inv) => acc + (inv.paidAmount || inv.amount), 0);
  const directPayments = invoices
    .filter((inv) => inv.status === "Paid" && (inv.method === "Direct Bill" || inv.method === "Bank Transfer"))
    .reduce((acc, inv) => acc + (inv.paidAmount || inv.amount), 0);

  const cardPercent = totalPaid > 0 ? Math.round((cardPayments / totalPaid) * 100) : 0;
  const insurancePercent = totalPaid > 0 ? Math.round((insurancePayments / totalPaid) * 100) : 0;
  const cashPercent = totalPaid > 0 ? Math.round((cashPayments / totalPaid) * 100) : 0;
  const directPercent = totalPaid > 0 ? Math.round((directPayments / totalPaid) * 100) : 0;

  // Department Breakdown (100% Dynamic from live DB records)
  const departmentStats = useMemo(() => {
    const map = {};
    invoices.forEach((inv) => {
      const dept = inv.department || "General Clinic";
      if (!map[dept]) {
        map[dept] = { total: 0, count: 0, paid: 0 };
      }
      map[dept].total += inv.amount;
      map[dept].count += 1;
      if (inv.status === "Paid") {
        map[dept].paid += inv.paidAmount || inv.amount;
      }
    });

    const list = Object.entries(map).map(([name, data]) => ({
      name,
      total: data.total,
      count: data.count,
      paid: data.paid,
      pct: totalInvoiced > 0 ? Math.round((data.total / totalInvoiced) * 100) : 0,
    }));

    list.sort((a, b) => b.total - a.total);
    return list;
  }, [invoices, totalInvoiced]);

  // Guaranteed 4-department view for clean layout
  const departmentBreakdown = useMemo(() => {
    if (departmentStats.length >= 4) return departmentStats.slice(0, 4);
    const defaults = [
      { name: "Cardiology", total: 0, count: 0, pct: 0 },
      { name: "Internal Medicine", total: 0, count: 0, pct: 0 },
      { name: "Orthopedics", total: 0, count: 0, pct: 0 },
      { name: "Dental Clinic", total: 0, count: 0, pct: 0 },
    ];
    const existing = new Set(departmentStats.map((d) => d.name));
    const combined = [...departmentStats];
    defaults.forEach((d) => {
      if (!existing.has(d.name) && combined.length < 4) {
        combined.push(d);
      }
    });
    return combined;
  }, [departmentStats]);

  // Filtered Invoices based on search, active subview, and status filter
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.patient.toLowerCase().includes(search.toLowerCase()) ||
        inv.id.toLowerCase().includes(search.toLowerCase()) ||
        (inv.patientId && inv.patientId.toLowerCase().includes(search.toLowerCase())) ||
        inv.service.toLowerCase().includes(search.toLowerCase()) ||
        (inv.doctorName && inv.doctorName.toLowerCase().includes(search.toLowerCase())) ||
        (inv.department && inv.department.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeTab === "payments" || activeTab === "history") {
        return inv.status === "Paid";
      }

      if (activeTab === "pending") {
        return inv.status === "Pending" || inv.status === "Overdue" || inv.status === "Partially Paid";
      }

      if (statusFilter !== "All") {
        return inv.status === statusFilter;
      }

      return true;
    });
  }, [invoices, search, activeTab, statusFilter]);

  // Handler: Patient selection and auto-fill in Create Invoice modal
  const handleSelectPatient = (e) => {
    const val = e.target.value;
    const matched = registeredPatients.find(
      (p) => p.name.toLowerCase() === val.toLowerCase() || p.id.toLowerCase() === val.toLowerCase()
    );
    if (matched) {
      setNewInv({
        ...newInv,
        patient: matched.name,
        patientId: matched.id,
      });
    } else {
      setNewInv({ ...newInv, patient: val });
    }
  };

  // Handler: Create Invoice via Backend API
  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!newInv.patient || !newInv.service || !newInv.amount) {
      toast.error("Please fill in patient name, service, and amount.");
      return;
    }

    try {
      const payload = {
        patientName: newInv.patient.trim(),
        patientId: newInv.patientId || "",
        doctorName: newInv.doctorName || (onDutyDoctors[0]?.name || "Dr. Salman"),
        service: newInv.service.trim(),
        amount: parseFloat(newInv.amount),
        status: newInv.status,
        paymentMethod: newInv.method,
        department: newInv.department || "Cardiology",
        dueDate: new Date(Date.now() + 14 * 86400000),
      };

      const res = await createInvoiceAPI(payload);
      if (res.data?.success) {
        toast.success(`Invoice ${res.data.invoice.invoiceId} generated and saved to database!`);
        setShowInvoiceModal(false);
        setNewInv({
          patient: "",
          patientId: "",
          doctorName: "",
          service: "",
          amount: "",
          method: "Credit Card",
          status: "Pending",
          department: "Cardiology",
        });
        fetchBillingData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate invoice.");
    }
  };

  // Handler: Open Edit Invoice Modal
  const handleOpenEdit = (inv) => {
    setEditingInv({
      _id: inv._id,
      id: inv.id,
      patient: inv.patient,
      patientId: inv.patientId || "",
      doctorName: inv.doctorName || "Dr. Salman",
      service: inv.service,
      amount: inv.amount,
      department: inv.department || "General Clinic",
      method: inv.method,
      status: inv.status,
      dueDate: inv.dueDate,
    });
    setShowEditModal(true);
  };

  // Handler: Save Edit Invoice
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingInv) return;
    try {
      const res = await updateInvoiceAPI(editingInv._id || editingInv.id, {
        patientName: editingInv.patient,
        patientId: editingInv.patientId,
        doctorName: editingInv.doctorName,
        service: editingInv.service,
        amount: parseFloat(editingInv.amount),
        department: editingInv.department,
        paymentMethod: editingInv.method,
        status: editingInv.status,
        dueDate: editingInv.dueDate,
      });
      if (res.data?.success) {
        toast.success(`Invoice ${editingInv.id} updated successfully!`);
        setShowEditModal(false);
        setEditingInv(null);
        fetchBillingData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update invoice.");
    }
  };

  // Handler: Delete Invoice
  const handleDeleteInvoice = async (inv) => {
    if (!window.confirm(`Are you sure you want to delete invoice "${inv.id}"?`)) return;
    try {
      const res = await deleteInvoiceAPI(inv._id || inv.id);
      if (res.data?.success) {
        toast.success(`Invoice ${inv.id} removed from ledger.`);
        fetchBillingData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete invoice.");
    }
  };

  // Handler: Quick Settle & Mark as Paid
  const handleMarkAsPaid = async (id, mongoId) => {
    try {
      const targetId = mongoId || id;
      const res = await updateInvoiceAPI(targetId, { status: "Paid" });
      if (res.data?.success) {
        toast.success(`Payment recorded and cleared for Invoice ${id}`);
        fetchBillingData();
      }
    } catch (err) {
      toast.error("Failed to update invoice payment status");
    }
  };

  // Handler: Print Official Medical Bill / Receipt
  const handlePrintInvoice = (inv) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.info("Please allow popups to view printable invoice.");
      return;
    }
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Medical Bill - ${inv.id}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #0f172a; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 24px; }
            .hospital-name { font-size: 22px; font-weight: 800; color: #0284c7; }
            .hospital-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
            .inv-meta { text-align: right; }
            .inv-title { font-size: 20px; font-weight: 800; color: #0f172a; }
            .inv-num { font-family: monospace; font-size: 14px; font-weight: 700; color: #0284c7; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; padding: 14px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; }
            .table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 13px; }
            .table th { background: #f1f5f9; padding: 10px; text-align: left; font-size: 12px; color: #475569; border-bottom: 1px solid #cbd5e1; }
            .table td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; }
            .total-box { margin-left: auto; width: 280px; margin-top: 16px; font-size: 14px; }
            .total-row { display: flex; justify-content: space-between; padding: 6px 0; }
            .grand-total { font-size: 18px; font-weight: 800; color: #0284c7; border-top: 2px solid #0284c7; padding-top: 8px; }
            .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center; }
            .badge { display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; }
            .badge-paid { background: #dcfce7; color: #15803d; }
            .badge-pending { background: #ffedd5; color: #c2410c; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="hospital-name">UCARE MULTISPECIALITY HOSPITAL</div>
              <div class="hospital-sub">Center for Advanced Clinical Medicine & Trauma Care</div>
              <div class="hospital-sub">Tel: 040-27796644 | Emergency: 108 | billing@ucarehospital.com</div>
            </div>
            <div class="inv-meta">
              <div class="inv-title">OFFICIAL MEDICAL BILL</div>
              <div class="inv-num">${inv.id}</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Billing Date: ${inv.date}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Patient & Clinical Details</div>
            <div class="info-grid">
              <div><strong>Patient Name:</strong> ${inv.patient}</div>
              <div><strong>Patient ID:</strong> ${inv.patientId || "PAT-2026"}</div>
              <div><strong>Clinical Department:</strong> ${inv.department || "Cardiology"}</div>
              <div><strong>Attending Physician:</strong> ${inv.doctorName || "Dr. Salman"}</div>
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Description of Clinical Service / Procedure</th>
                <th>Department</th>
                <th>Payment Channel</th>
                <th style="text-align: right;">Billed Amount ($)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${inv.service}</strong></td>
                <td>${inv.department || "Clinical"}</td>
                <td>${inv.method}</td>
                <td style="text-align: right; font-weight: 700;">$${inv.amount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="total-box">
            <div class="total-row"><span>Subtotal:</span><span>$${inv.amount.toFixed(2)}</span></div>
            <div class="total-row"><span>Status:</span><span class="badge ${inv.status === 'Paid' ? 'badge-paid' : 'badge-pending'}">${inv.status.toUpperCase()}</span></div>
            <div class="total-row grand-total"><span>Total Settled:</span><span>$${inv.amount.toFixed(2)}</span></div>
          </div>

          <div class="footer">
            <p>This is an authentic computer-generated billing statement issued by Ucare Multispeciality Hospital Accounts Department.</p>
            <p>Road No. 14, Banjara Hills, Hyderabad | 24x7 Emergency Helpline: 108 / +91 911 234 5678</p>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className={`app spark-theme ${isAdmin ? "white-grid-layout" : ""}`}>
      {/* SIDEBAR NAVIGATION */}
      <Sidebar menuItems={currentMenu} panelSubtitle={panelSubtitle} />

      <main className="main main-wrapper admin-main-canvas">
        {/* TOP NAVBAR */}
        <header className="navbar-custom">
          <div className="navbar-left">
            <span className="billing-badge-pill">
              {activeTab === "payments" ? (
                <>
                  <CreditCard size={15} /> Payment Overview & Settlement
                </>
              ) : activeTab === "reports" ? (
                <>
                  <TrendingUp size={15} /> Revenue Performance & Audit
                </>
              ) : activeTab === "pending" ? (
                <>
                  <Clock size={15} /> Pending & Overdue Accounts
                </>
              ) : activeTab === "history" ? (
                <>
                  <FolderClock size={15} /> Settled Transactions History
                </>
              ) : activeTab === "invoices" ? (
                <>
                  <Receipt size={15} /> Master Invoices Registry
                </>
              ) : (
                <>
                  <LayoutDashboard size={15} /> Billing & Accounts Dashboard
                </>
              )}
            </span>
          </div>

          <div className="navbar-search-wrapper">
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Search by patient, PAT-ID, invoice number, doctor, service..."
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

            <button
              className="btn-pay-now"
              onClick={fetchBillingData}
              title="Refresh Live Billing Records"
            >
              <RotateCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
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
              {activeTab === "payments" && "Payment Settlement & Channels Overview"}
              {activeTab === "reports" && "Revenue Yield & Department Performance"}
              {activeTab === "pending" && "Pending Accounts & Unsettled Invoices"}
              {activeTab === "history" && "Cleared Transactions & Patient Receipts"}
              {activeTab === "invoices" && "Master Invoices Registry"}
              {activeTab === "dashboard" && "Billing & Accounts Executive Dashboard"}
            </h1>
            <p className="page-subtitle">
              {activeTab === "payments"
                ? "Live multi-channel payment reconciliation across credit cards, health insurance, and cash desks."
                : activeTab === "reports"
                ? "Departmental revenue yields, fiscal audit metrics, and dynamic collections performance."
                : activeTab === "pending"
                ? "Immediate collection queue for outstanding patient receivables and pending medical claims."
                : activeTab === "history"
                ? "Complete archive of settled patient bills, audit receipts, and verified payment transactions."
                : activeTab === "invoices"
                ? "Full institutional invoice master ledger with clinical service codes and status tracking."
                : "Real-time hospital invoicing, patient account balances, fee schedules, and financial collections."}
            </p>
          </div>

          {/* QUICK SUB-VIEW SWITCHER IN OPERATIONS & FINANCE */}
          <div className="admin-subview-tabs">
            <button
              className={`btn-subview-tab ${activeTab === "dashboard" ? "subview-active" : ""}`}
              onClick={() => {
                setActiveTab("dashboard");
                if (isAdmin) navigate("/admin/billing");
                else navigate("/billing/dashboard");
              }}
            >
              <LayoutDashboard size={14} /> Dashboard
            </button>
            <button
              className={`btn-subview-tab ${activeTab === "invoices" ? "subview-active" : ""}`}
              onClick={() => {
                setActiveTab("invoices");
                if (isAdmin) navigate("/admin/billing");
                else navigate("/billing/invoices");
              }}
            >
              <Receipt size={14} /> Invoices ({invoices.length})
            </button>
            <button
              className={`btn-subview-tab ${activeTab === "payments" ? "subview-active" : ""}`}
              onClick={() => {
                setActiveTab("payments");
                if (isAdmin) navigate("/admin/payments");
                else navigate("/billing/payments");
              }}
            >
              <CreditCard size={14} /> Payments ({invoices.filter((i) => i.status === "Paid").length})
            </button>
            <button
              className={`btn-subview-tab ${activeTab === "pending" ? "subview-active" : ""}`}
              onClick={() => {
                setActiveTab("pending");
                navigate("/billing/pending");
              }}
            >
              <Clock size={14} /> Pending ({pendingCount})
            </button>
            <button
              className={`btn-subview-tab ${activeTab === "reports" ? "subview-active" : ""}`}
              onClick={() => {
                setActiveTab("reports");
                if (isAdmin) navigate("/admin/reports");
                else navigate("/billing/reports");
              }}
            >
              <TrendingUp size={14} /> Reports
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
                <div className="stat-value text-green">${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                <div className="trend-badge trend-up">
                  <CheckCircle2 size={13} /> {invoices.filter((i) => i.status === "Paid").length} Receipts Cleared
                </div>
              </div>

              <div className="card card-stat">
                <div className="stat-label">Credit / Debit Card</div>
                <div className="stat-value">${cardPayments.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                <div className="trend-badge trend-up">
                  <CreditCard size={13} /> {cardPercent}% of collections
                </div>
              </div>

              <div className="card card-stat">
                <div className="stat-label">Insurance Reimbursements</div>
                <div className="stat-value">${insurancePayments.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                <div className="trend-badge trend-up">
                  <ShieldCheck size={13} /> {insurancePercent}% through insurers
                </div>
              </div>

              <div className="card card-stat">
                <div className="stat-label">Cash & Point-of-Sale</div>
                <div className="stat-value text-amber">
                  ${(cashPayments + directPayments).toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
                  <span className="channel-amt">${cardPayments.toLocaleString("en-US", { minimumFractionDigits: 2 })} Collected</span>
                </div>

                <div className="channel-box">
                  <div className="channel-top">
                    <span className="channel-name">Health Insurance Providers</span>
                    <span className="channel-pct">{insurancePercent}%</span>
                  </div>
                  <div className="channel-progress">
                    <div className="channel-bar bar-emerald" style={{ width: `${insurancePercent}%` }} />
                  </div>
                  <span className="channel-amt">${insurancePayments.toLocaleString("en-US", { minimumFractionDigits: 2 })} Direct Claims</span>
                </div>

                <div className="channel-box">
                  <div className="channel-top">
                    <span className="channel-name">Hospital Cash Desk</span>
                    <span className="channel-pct">{cashPercent}%</span>
                  </div>
                  <div className="channel-progress">
                    <div className="channel-bar bar-amber" style={{ width: `${cashPercent}%` }} />
                  </div>
                  <span className="channel-amt">${cashPayments.toLocaleString("en-US", { minimumFractionDigits: 2 })} Cash Inflow</span>
                </div>

                <div className="channel-box">
                  <div className="channel-top">
                    <span className="channel-name">Direct Corporate Invoicing</span>
                    <span className="channel-pct">{directPercent}%</span>
                  </div>
                  <div className="channel-progress">
                    <div className="channel-bar bar-purple" style={{ width: `${directPercent}%` }} />
                  </div>
                  <span className="channel-amt">${directPayments.toLocaleString("en-US", { minimumFractionDigits: 2 })} Invoiced</span>
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
                      <th>Transaction ID</th>
                      <th>Patient Name</th>
                      <th>Department & Doctor</th>
                      <th>Settled Service</th>
                      <th>Amount</th>
                      <th>Channel</th>
                      <th>Payment Date</th>
                      <th>Settlement Status</th>
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
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <strong>{inv.patient}</strong>
                            {inv.patientId && (
                              <span style={{ fontSize: "11px", color: "#0284c7", fontWeight: "700" }}>
                                {inv.patientId}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div><strong>{inv.department || "Clinical"}</strong></div>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>{inv.doctorName || "Dr. Salman"}</span>
                        </td>
                        <td>{inv.service}</td>
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
                          <div className="billing-actions" style={{ justifyContent: "flex-end" }}>
                            <button
                              className="btn-action-icon"
                              onClick={() => handlePrintInvoice(inv)}
                              title="Print Official Medical Bill"
                            >
                              <Printer size={14} />
                            </button>
                            <button
                              className="btn-action-icon text-blue"
                              onClick={() => handleOpenEdit(inv)}
                              title="Edit Invoice Details"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn-action-icon text-danger"
                              onClick={() => handleDeleteInvoice(inv)}
                              title="Delete Record"
                            >
                              <Trash2 size={14} />
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
            VIEW 2: BILLING OVERVIEW & INVOICES (activeTab === "dashboard" || "invoices" || "pending" || "history")
            =================================================================== */}
        {(activeTab === "dashboard" || activeTab === "invoices" || activeTab === "pending" || activeTab === "history") && (
          <>
            {/* 4 BILLING KPI CARDS */}
            <div className="spark-grid-top">
              <div className="card card-stat">
                <div className="stat-label">Total Amount Invoiced</div>
                <div className="stat-value">${totalInvoiced.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                <div className="trend-badge trend-up">
                  <TrendingUp size={13} /> {invoices.length} Generated Invoices
                </div>
              </div>

              <div className="card card-stat">
                <div className="stat-label">Total Amount Collected</div>
                <div className="stat-value text-green">${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                <div className="trend-badge trend-up">
                  <CheckCircle2 size={13} /> Settle Rate {settleRate}%
                </div>
              </div>

              <div className="card card-stat">
                <div className="stat-label">Pending Balance</div>
                <div className="stat-value text-amber">${totalPending.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                <div className="trend-badge trend-down">
                  <Clock size={13} /> {pendingCount} Pending Accounts
                </div>
              </div>

              <div className="card card-stat">
                <div className="stat-label">Average Invoice Value</div>
                <div className="stat-value text-blue">
                  ${avgInvoiceValue.toLocaleString()}
                </div>
                <div className="trend-badge trend-up">Across {departmentStats.length || 1} Departments</div>
              </div>
            </div>

            {/* DYNAMIC DEPARTMENT BILLING BREAKDOWN (Calculated 100% from MongoDB) */}
            <div className="card billing-report-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Hospital Department Billing Breakdown</h2>
                  <p className="card-subtitle-small">Live revenue performance per specialty</p>
                </div>
                <span className="trend-badge trend-up">Current Fiscal Ledger</span>
              </div>

              <div className="report-breakdown-grid">
                {departmentBreakdown.map((dept) => (
                  <div key={dept.name} className="report-mini-box">
                    <span className="box-label">{dept.name}</span>
                    <strong>${dept.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                    <span className="box-sub">
                      {dept.count} Invoices ({dept.pct}% Share)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* INVOICES TABLE WITH STATUS FILTERS */}
            <div className="card billing-table-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">
                    {activeTab === "pending"
                      ? "Pending & Overdue Patient Accounts"
                      : activeTab === "history"
                      ? "Settled Payment History Ledger"
                      : "Hospital Invoices Master Registry"}
                  </h2>
                  <span className="billing-counter-pill">
                    {filteredInvoices.length} invoices displayed
                  </span>
                </div>

                {/* Filter Pills (active when not in pending/history tabs) */}
                {activeTab !== "pending" && activeTab !== "history" && (
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
                )}
              </div>

              <div className="table-responsive">
                <table className="billing-table">
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Patient Name</th>
                      <th>Department & Doctor</th>
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
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <strong>{inv.patient}</strong>
                            {inv.patientId && (
                              <span style={{ fontSize: "11px", color: "#0284c7", fontWeight: "700" }}>
                                {inv.patientId}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div><strong>{inv.department || "Clinical"}</strong></div>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>{inv.doctorName || "Dr. Salman"}</span>
                        </td>
                        <td>{inv.service}</td>
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
                                onClick={() => handleMarkAsPaid(inv.id, inv._id)}
                                title="Collect & Settle Payment"
                              >
                                Mark Paid
                              </button>
                            )}
                            <button
                              className="btn-action-icon"
                              onClick={() => handlePrintInvoice(inv)}
                              title="Print Official Medical Bill"
                            >
                              <Printer size={14} />
                            </button>
                            <button
                              className="btn-action-icon text-blue"
                              onClick={() => handleOpenEdit(inv)}
                              title="Edit Invoice Record"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn-action-icon text-danger"
                              onClick={() => handleDeleteInvoice(inv)}
                              title="Delete Record"
                            >
                              <Trash2 size={14} />
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
            VIEW 3: REVENUE & REPORTS DASHBOARD (100% Dynamic from live DB records)
            =================================================================== */}
        {activeTab === "reports" && (
          <>
            <div className="spark-grid-top">
              <div className="card card-stat">
                <div className="stat-label">Total Realized Revenue</div>
                <div className="stat-value text-green">${totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                <div className="trend-badge trend-up">
                  <TrendingUp size={13} /> {invoices.filter((i) => i.status === "Paid").length} Cleared Invoices
                </div>
              </div>

              <div className="card card-stat">
                <div className="stat-label">Settlement Collection Rate</div>
                <div className="stat-value">{settleRate}%</div>
                <div className="trend-badge trend-up">
                  <CheckCircle2 size={13} /> Live Ledger Audit
                </div>
              </div>

              <div className="card card-stat">
                <div className="stat-label">Outstanding Receivables</div>
                <div className="stat-value text-amber">${totalPending.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                <div className="trend-badge trend-down">
                  <Clock size={13} /> {pendingCount} Pending Accounts
                </div>
              </div>

              <div className="card card-stat">
                <div className="stat-label">Average Claim Value</div>
                <div className="stat-value text-blue">
                  ${avgInvoiceValue.toLocaleString()}
                </div>
                <div className="trend-badge trend-neutral">
                  <Layers size={13} /> Across {departmentStats.length || 1} Departments
                </div>
              </div>
            </div>

            {/* Department Contributions Table (100% Dynamic) */}
            <div className="card billing-report-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Hospital Department Revenue Performance</h2>
                  <p className="card-subtitle-small">Dynamic yield calculated from live hospital ledger</p>
                </div>
                <span className="trend-badge trend-up">Fiscal Year 2026 Audit</span>
              </div>

              <div className="report-breakdown-grid">
                {departmentBreakdown.map((dept) => (
                  <div key={dept.name} className="report-mini-box">
                    <span className="box-label">{dept.name}</span>
                    <strong>${dept.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                    <span className="box-sub">
                      {dept.pct}% of Gross Hospital Inflow ({dept.count} Invoices)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ===================================================================
            MODAL: GENERATE INVOICE (With Live Registered Patient & Doctor Matching)
            =================================================================== */}
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
                <div className="form-row">
                  <div className="form-group">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label>Patient Full Name *</label>
                      {newInv.patientId && (
                        <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: "700" }}>
                          ✓ Verified: {newInv.patientId}
                        </span>
                      )}
                    </div>
                    <input
                      list="billing-patients-datalist"
                      type="text"
                      placeholder="Type patient name or PAT-ID..."
                      value={newInv.patient}
                      onChange={handleSelectPatient}
                      required
                    />
                    <datalist id="billing-patients-datalist">
                      {registeredPatients.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name} ({p.id}) — {p.phone || "No phone"}
                        </option>
                      ))}
                    </datalist>
                  </div>

                  <div className="form-group">
                    <label>Attending Physician</label>
                    <input
                      list="billing-doctors-datalist"
                      type="text"
                      placeholder="e.g. Dr. Salman"
                      value={newInv.doctorName}
                      onChange={(e) => setNewInv({ ...newInv, doctorName: e.target.value })}
                    />
                    <datalist id="billing-doctors-datalist">
                      {onDutyDoctors.map((d) => (
                        <option key={d.rawId || d.name} value={d.name}>
                          {d.name} ({d.specialty})
                        </option>
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="form-group">
                  <label>Medical Service / Treatment *</label>
                  <input
                    type="text"
                    placeholder="e.g. Cardiac Consultation & 12-Lead ECG"
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
                      min="0.1"
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
                      <option value="Radiology & Scans">Radiology & Scans</option>
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

        {/* ===================================================================
            MODAL: EDIT INVOICE
            =================================================================== */}
        {showEditModal && editingInv && (
          <div className="admin-modal-backdrop" onClick={() => setShowEditModal(false)}>
            <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <div>
                  <h2>Edit Medical Invoice</h2>
                  <p>Invoice ID: <span className="invoice-code">{editingInv.id}</span></p>
                </div>
                <button
                  className="doctors-closeBtn"
                  onClick={() => setShowEditModal(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="pharmacy-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Patient Full Name *</label>
                    <input
                      type="text"
                      value={editingInv.patient}
                      onChange={(e) => setEditingInv({ ...editingInv, patient: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Patient ID (PAT-XXXX)</label>
                    <input
                      type="text"
                      placeholder="e.g. PAT-2026"
                      value={editingInv.patientId}
                      onChange={(e) => setEditingInv({ ...editingInv, patientId: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Attending Physician</label>
                    <input
                      type="text"
                      value={editingInv.doctorName}
                      onChange={(e) => setEditingInv({ ...editingInv, doctorName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <select
                      value={editingInv.department}
                      onChange={(e) => setEditingInv({ ...editingInv, department: e.target.value })}
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Dental Clinic">Dental Clinic</option>
                      <option value="Emergency Care">Emergency Care</option>
                      <option value="Internal Medicine">Internal Medicine</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Radiology & Scans">Radiology & Scans</option>
                      <option value="General Clinic">General Clinic</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Medical Service / Treatment *</label>
                  <input
                    type="text"
                    value={editingInv.service}
                    onChange={(e) => setEditingInv({ ...editingInv, service: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Billed Amount ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      value={editingInv.amount}
                      onChange={(e) => setEditingInv({ ...editingInv, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Status *</label>
                    <select
                      value={editingInv.status}
                      onChange={(e) => setEditingInv({ ...editingInv, status: e.target.value })}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Payment Method</label>
                    <select
                      value={editingInv.method}
                      onChange={(e) => setEditingInv({ ...editingInv, method: e.target.value })}
                    >
                      <option value="Credit Card">Credit Card</option>
                      <option value="Cash">Cash</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Direct Bill">Direct Bill</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={editingInv.dueDate}
                      onChange={(e) => setEditingInv({ ...editingInv, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-quick-action">
                    Save Changes
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
