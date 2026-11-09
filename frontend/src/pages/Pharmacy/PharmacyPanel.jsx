import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { adminMenu, pharmacyMenu } from "../../config/panelMenus";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getMedicinesAPI,
  addMedicineAPI,
  updateMedicineAPI,
  restockMedicineAPI,
  dispenseMedicineAPI,
  getPharmacySalesAPI,
  updatePharmacySaleAPI,
  deletePharmacySaleAPI,
  deleteMedicineAPI,
  quarantineMedicineAPI,
} from "../../api/medicineApi";
import { getPatientsAPI } from "../../api/patientApi";
import { getDoctorsAPI } from "../../api/doctorApi";
import {
  Pill,
  PackageCheck,
  AlertTriangle,
  ShoppingCart,
  History,
  ClipboardList,
  Search,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  X,
  Boxes,
  RotateCw,
  LayoutDashboard,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check,
  Clock,
  Printer,
  Sparkles,
  ShoppingBag,
  User,
  Stethoscope,
  FileText,
} from "lucide-react";
import "./PharmacyPanel.css";

export default function PharmacyPanel() {
  const location = useLocation();
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [sales, setSales] = useState([]);
  const [registeredPatients, setRegisteredPatients] = useState([]);
  const [onDutyDoctors, setOnDutyDoctors] = useState([]);
  const [doctorPrescriptions, setDoctorPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [expiryFilter, setExpiryFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditSaleModal, setShowEditSaleModal] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [userName, setUserName] = useState("Pharmacist");
  const [userRole, setUserRole] = useState("pharmacist");

  // New Medicine Form State
  const [newMed, setNewMed] = useState({
    name: "",
    category: "Antibiotic",
    stock: "",
    minStock: "50",
    price: "",
    batch: "",
    expiry: "",
  });

  // New Prescription Sale Form State
  const [newSale, setNewSale] = useState({
    medicineId: "",
    patientName: "",
    patientId: "",
    doctorName: "",
    quantity: 1,
    paymentMethod: "Cash",
  });

  // Fetch live dynamic data from MongoDB API
  const fetchPharmacyData = async () => {
    try {
      setLoading(true);
      const [medRes, salesRes, patRes, docRes] = await Promise.allSettled([
        getMedicinesAPI(),
        getPharmacySalesAPI(),
        getPatientsAPI(false),
        getDoctorsAPI(false),
      ]);

      let loadedMedicines = [];
      if (medRes.status === "fulfilled" && medRes.value?.data?.medicines) {
        loadedMedicines = medRes.value.data.medicines;
        setMedicines(loadedMedicines);
        if (loadedMedicines.length > 0 && !newSale.medicineId) {
          setNewSale((prev) => ({
            ...prev,
            medicineId: loadedMedicines[0]._id || loadedMedicines[0].medicineId,
          }));
        }
      }

      if (salesRes.status === "fulfilled" && salesRes.value?.data?.sales) {
        setSales(salesRes.value.data.sales);
      }

      let parsedPatients = [];
      if (patRes.status === "fulfilled" && patRes.value?.data) {
        const rawPats = Array.isArray(patRes.value.data.patients)
          ? patRes.value.data.patients
          : Array.isArray(patRes.value.data)
          ? patRes.value.data
          : [];
        parsedPatients = rawPats.map((p, idx) => ({
          rawId: p._id,
          name: p.name || `Patient ${idx + 1}`,
          id: p.patientId || (p._id ? `PAT-${String(p._id).slice(-4).toUpperCase()}` : `PAT-${101 + idx}`),
          phone: p.phone || "",
          age: p.age || "",
          gender: p.gender || "",
        }));
        setRegisteredPatients(parsedPatients);
      }

      let parsedDoctors = [];
      if (docRes.status === "fulfilled" && docRes.value?.data) {
        const rawDocs = Array.isArray(docRes.value.data.doctors)
          ? docRes.value.data.doctors
          : Array.isArray(docRes.value.data)
          ? docRes.value.data
          : [];
        parsedDoctors = rawDocs.map((d) => ({
          rawId: d._id,
          name: d.name?.startsWith("Dr.") ? d.name : `Dr. ${d.name || "Physician"}`,
          specialty: d.specialization || d.department || "General Medicine",
        }));
        setOnDutyDoctors(parsedDoctors);
      }

      // Sync active clinical prescriptions from Doctor Clinical Hub
      const savedRxList = localStorage.getItem("doctor_prescriptions_list");
      if (savedRxList) {
        try {
          const parsed = JSON.parse(savedRxList);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDoctorPrescriptions(parsed);
          } else {
            generateFallbackPrescriptions(loadedMedicines, parsedPatients, parsedDoctors);
          }
        } catch {
          generateFallbackPrescriptions(loadedMedicines, parsedPatients, parsedDoctors);
        }
      } else {
        generateFallbackPrescriptions(loadedMedicines, parsedPatients, parsedDoctors);
      }
    } catch (err) {
      console.error("Failed to load live pharmacy records:", err);
      toast.error("Could not fetch latest pharmacy records.");
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackPrescriptions = (meds, pats, docs) => {
    if (!meds || meds.length === 0) return;
    const patientName = pats?.[0]?.name || "Shamil";
    const doctorName = docs?.[0]?.name || "Dr. Salman";
    const initialList = meds.slice(0, 4).map((m, idx) => ({
      id: `RX-${String(m._id || m.medicineId || idx + 1).slice(-4).toUpperCase()}`,
      patient: idx % 2 === 0 ? patientName : (pats?.[1]?.name || "Rinsha"),
      medication: `${m.name}`,
      dosage: idx % 2 === 0 ? "1 tablet twice daily" : "1 capsule after meals",
      duration: "7 Days",
      instructions: "Take with full glass of water after food",
      doctor: doctorName,
      date: new Date().toISOString().slice(0, 10),
      status: idx === 0 ? "ACTIVE" : "DISPENSED",
    }));
    setDoctorPrescriptions(initialList);
    localStorage.setItem("doctor_prescriptions_list", JSON.stringify(initialList));
  };

  useEffect(() => {
    fetchPharmacyData();
  }, []);

  useEffect(() => {
    const storedName = localStorage.getItem("userName") || localStorage.getItem("user");
    const storedRole = localStorage.getItem("userRole") || "pharmacist";
    if (storedName) setUserName(storedName);
    if (storedRole) setUserRole(storedRole.toLowerCase());
  }, []);

  // Determine current active subview based on URL pathname
  const getActiveTab = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes("sales-history")) return "sales-history";
    if (path.includes("sales")) return "sales";
    if (path.includes("inventory")) return "inventory";
    if (path.includes("add-medicine")) return "add-medicine";
    if (path.includes("stock")) return "stock";
    if (path.includes("expiry")) return "expiry";
    return "dashboard";
  };

  const activeTab = getActiveTab();

  // Admin access check for sidebar menu adaptation: keeps Admin in the Admin Portal without full pharmacist takeover
  const isAdminRoute = location.pathname.startsWith("/admin");
  const effectiveMenu = isAdminRoute ? adminMenu : pharmacyMenu;
  const panelSubtitle = isAdminRoute ? "HOSPITAL ADMIN" : "PHARMACY DEPT";

  // Key Statistics (computed dynamically from live database records)
  const totalStock = medicines.reduce((acc, m) => acc + Number(m.stock || 0), 0);
  const lowStockCount = medicines.filter(
    (m) => Number(m.stock) <= Number(m.minStock || 20)
  ).length;

  const now = new Date();
  const thirtyDaysOut = new Date(Date.now() + 30 * 24 * 3600 * 1000);
  const expiringSoonCount = medicines.filter((m) => {
    if (!m.expiryDate) return false;
    const d = new Date(m.expiryDate);
    return d <= thirtyDaysOut;
  }).length;

  const totalRevenue = sales.reduce((acc, s) => acc + (Number(s.total) || 0), 0);

  // Available therapeutic categories derived dynamically from live medicine catalog
  const availableCategories = useMemo(() => {
    const defaultCats = [
      "Antibiotic",
      "Analgesic",
      "Cardiovascular",
      "Antidiabetic",
      "Gastrointestinal",
      "Dermatology",
      "General",
    ];
    const set = new Set(defaultCats);
    medicines.forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return Array.from(set);
  }, [medicines]);

  // Helper: Format Date
  const formatDate = (dateVal) => {
    if (!dateVal) return "—";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      return d.toISOString().slice(0, 10);
    } catch {
      return String(dateVal);
    }
  };

  const handleToggleQuarantine = async (id) => {
    try {
      const res = await quarantineMedicineAPI(id);
      if (res.data?.success) {
        toast.success(res.data.message);
        fetchPharmacyData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update quarantine status.");
    }
  };

  const handleQuickFillPrescription = (rx) => {
    const matchMed = medicines.find(
      (m) =>
        (rx.medication && m.name.toLowerCase().includes(rx.medication.toLowerCase().split(" ")[0])) ||
        (rx.medication && m.name.toLowerCase() === rx.medication.toLowerCase())
    );
    const medId = matchMed ? (matchMed._id || matchMed.medicineId) : (medicines[0]?._id || medicines[0]?.medicineId || "");

    const matchedPatient = registeredPatients.find(
      (p) => p.name.toLowerCase() === (rx.patient || rx.patientName || "").toLowerCase()
    );

    setNewSale({
      medicineId: medId,
      patientName: rx.patient || rx.patientName || "",
      patientId: matchedPatient?.id || "",
      doctorName: rx.doctor || rx.doctorName || (onDutyDoctors[0]?.name || "Dr. Salman"),
      quantity: 1,
      paymentMethod: "Cash",
    });

    if (activeTab !== "sales") {
      navigate("/pharmacy/sales");
    }
    toast.info(`Loaded prescription for ${rx.patient || rx.patientName}! Ready to dispense.`);
  };

  // Filtered medicines for inventory and stock tabs
  const filteredMedicines = medicines.filter((m) => {
    const idStr = m.medicineId || m._id || "";
    const matchesSearch =
      (m.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.category || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.batch || "").toLowerCase().includes(search.toLowerCase()) ||
      idStr.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (categoryFilter !== "All" && m.category !== categoryFilter) return false;
    if (stockFilter === "Low" && Number(m.stock) > Number(m.minStock || 20)) return false;
    if (stockFilter === "Adequate" && Number(m.stock) <= Number(m.minStock || 20)) return false;
    return true;
  });

  // Filtered medicines for expiry tab
  const sixtyDaysOut = new Date(Date.now() + 60 * 24 * 3600 * 1000);
  const expiryMedicines = medicines.filter((m) => {
    if (!m.expiryDate) return true;
    const d = new Date(m.expiryDate);
    if (expiryFilter === "30d") return d <= thirtyDaysOut;
    if (expiryFilter === "60d") return d <= sixtyDaysOut;
    return true;
  });

  // Filtered sales history
  const filteredSales = sales.filter((s) => {
    const sId = s.id || s.invoiceId || "";
    const matchesSearch =
      (s.patient || s.patientName || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.doctor || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.items || s.service || "").toLowerCase().includes(search.toLowerCase()) ||
      sId.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (
      paymentFilter !== "All" &&
      (s.payment || s.paymentMethod || "").toLowerCase() !== paymentFilter.toLowerCase()
    )
      return false;
    return true;
  });

  // Handler: Add Medicine via Backend API
  const handleAddMedicine = async (e) => {
    e.preventDefault();
    if (!newMed.name || !newMed.stock || !newMed.price || !newMed.expiry) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const payload = {
        name: newMed.name.trim(),
        category: newMed.category,
        stock: Number(newMed.stock),
        minStock: Number(newMed.minStock) || 20,
        price: parseFloat(newMed.price),
        batch: newMed.batch.trim() || `BCH-${new Date().getFullYear()}`,
        expiryDate: newMed.expiry,
      };

      const res = await addMedicineAPI(payload);
      if (res.data?.success) {
        toast.success(res.data.message || `Medicine "${payload.name}" added to inventory!`);
        setShowAddModal(false);
        setNewMed({
          name: "",
          category: "Antibiotic",
          stock: "",
          minStock: "50",
          price: "",
          batch: "",
          expiry: "",
        });
        fetchPharmacyData();
        if (activeTab === "add-medicine") {
          navigate(isAdminRoute ? "/admin/pharmacy" : "/pharmacy/inventory");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add medicine.");
    }
  };

  // Handler: Restock Medicine via Backend API
  const handleRestock = async (id, amount = 100) => {
    try {
      const res = await restockMedicineAPI(id, amount);
      if (res.data?.success) {
        toast.success(res.data.message || `Restocked +${amount} units successfully.`);
        fetchPharmacyData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to restock medicine.");
    }
  };

  // Handler: Delete Medicine via Backend API
  const handleDeleteMedicine = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine record?")) return;
    try {
      const res = await deleteMedicineAPI(id);
      if (res.data?.success) {
        toast.info(res.data.message || "Medicine record removed from inventory.");
        fetchPharmacyData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete medicine.");
    }
  };

  // Handler: Complete Sale via Backend API
  const handleCompleteSale = async (e) => {
    e.preventDefault();
    const qty = Number(newSale.quantity);
    if (qty <= 0) {
      toast.error("Quantity must be at least 1.");
      return;
    }

    try {
      const matchedPatient = registeredPatients.find(
        (p) => p.name?.toLowerCase().trim() === newSale.patientName?.toLowerCase().trim()
      );

      const res = await dispenseMedicineAPI({
        medicineId: newSale.medicineId,
        patientName: newSale.patientName,
        patientId: matchedPatient?.id || newSale.patientId || "",
        doctorName: newSale.doctorName,
        quantity: qty,
        paymentMethod: newSale.paymentMethod,
      });

      if (res.data?.success) {
        toast.success(res.data.message || "Prescription dispensed successfully!");
        
        // Update local doctor prescriptions list to mark this prescription fulfilled
        const updatedRxList = doctorPrescriptions.map((rx) => {
          if (
            (rx.patient?.toLowerCase().trim() === newSale.patientName.toLowerCase().trim() ||
             rx.patientName?.toLowerCase().trim() === newSale.patientName.toLowerCase().trim()) &&
            rx.status !== "DISPENSED"
          ) {
            return { ...rx, status: "DISPENSED", dispensedAt: new Date().toISOString() };
          }
          return rx;
        });
        setDoctorPrescriptions(updatedRxList);
        localStorage.setItem("doctor_prescriptions_list", JSON.stringify(updatedRxList));

        setNewSale({
          medicineId: medicines[0]?._id || medicines[0]?.medicineId || "",
          patientName: "",
          patientId: "",
          doctorName: "",
          quantity: 1,
          paymentMethod: "Cash",
        });
        fetchPharmacyData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to dispense medicine.");
    }
  };

  // Handler: Open Edit Sale Modal
  const handleOpenEditSale = (sale) => {
    setEditingSale({
      id: sale.id || sale.invoiceId,
      _id: sale._id,
      patientName: sale.patient || sale.patientName || "",
      patientId: sale.patientId || "",
      doctorName: sale.doctor || "",
      items: sale.items || sale.service || "",
      total: sale.total || sale.amount || 0,
      paymentMethod: sale.payment || sale.paymentMethod || "Cash",
      status: sale.status || "Completed",
    });
    setShowEditSaleModal(true);
  };

  // Handler: Save Edit Sale
  const handleSaveEditSale = async (e) => {
    e.preventDefault();
    if (!editingSale) return;
    try {
      const res = await updatePharmacySaleAPI(editingSale._id || editingSale.id, {
        patientName: editingSale.patientName,
        patientId: editingSale.patientId,
        doctorName: editingSale.doctorName,
        items: editingSale.items,
        total: editingSale.total,
        paymentMethod: editingSale.paymentMethod,
        status: editingSale.status,
      });
      if (res.data?.success) {
        toast.success(res.data.message || "Transaction updated successfully!");
        setShowEditSaleModal(false);
        setEditingSale(null);
        fetchPharmacyData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update transaction.");
    }
  };

  // Handler: Delete Sale
  const handleDeleteSale = async (saleId) => {
    if (!window.confirm(`Are you sure you want to delete transaction "${saleId}"?`)) {
      return;
    }
    try {
      const res = await deletePharmacySaleAPI(saleId);
      if (res.data?.success) {
        toast.success(res.data.message || "Transaction deleted successfully.");
        fetchPharmacyData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete transaction.");
    }
  };

  // Handler: Print / Preview Sale Receipt
  const handlePrintSaleReceipt = (sale) => {
    const saleId = sale.id || sale.invoiceId;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.info("Please allow popups to view receipt.");
      return;
    }
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Dispensary Receipt - ${saleId}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #0f172a; }
            .header { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 16px; margin-bottom: 16px; }
            .hospital-name { font-size: 20px; font-weight: 800; color: #0ea5e9; text-transform: uppercase; }
            .receipt-title { font-size: 14px; font-weight: 700; color: #475569; margin-top: 4px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
            .label { color: #64748b; font-weight: 600; }
            .value { font-weight: 700; }
            .divider { border-top: 1px solid #e2e8f0; margin: 12px 0; }
            .total-row { font-size: 16px; font-weight: 800; color: #059669; }
            .footer { text-align: center; margin-top: 24px; font-size: 11px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="hospital-name">Ucare Multispeciality Hospital</div>
            <div class="receipt-title">Pharmacy Dispensary Official Receipt</div>
          </div>
          <div class="row"><span class="label">Receipt No:</span><span class="value">${saleId}</span></div>
          <div class="row"><span class="label">Date:</span><span class="value">${sale.time || formatDate(sale.createdAt)}</span></div>
          <div class="row"><span class="label">Patient Name:</span><span class="value">${sale.patient || sale.patientName}</span></div>
          ${sale.patientId ? `<div class="row"><span class="label">Patient ID:</span><span class="value">${sale.patientId}</span></div>` : ""}
          <div class="row"><span class="label">Prescribing Doctor:</span><span class="value">${sale.doctor || "Dr. Salman"}</span></div>
          <div class="divider"></div>
          <div class="row"><span class="label">Medication Items:</span><span class="value">${sale.items || sale.service}</span></div>
          <div class="row"><span class="label">Payment Mode:</span><span class="value">${sale.payment || sale.paymentMethod || "Cash"}</span></div>
          <div class="divider"></div>
          <div class="row total-row"><span class="label">Amount Paid:</span><span>$${Number(sale.total || sale.amount || 0).toFixed(2)}</span></div>
          <div class="footer">
            <p>Thank you for choosing Ucare Hospital. Please take medicines as prescribed.</p>
            <p>Helpline: +91 911 234 5678 | Emergency: 108</p>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="app spark-theme white-grid-layout">
      {/* SIDEBAR NAVIGATION */}
      <Sidebar menuItems={effectiveMenu} panelSubtitle={panelSubtitle} />

      <main className="main main-wrapper admin-main-canvas">
        {/* TOP NAVBAR BANNER */}
        <header className="navbar-custom">
          <div className="navbar-left">
            <span className="pharmacy-badge-pill">
              <Pill size={15} />{" "}
              {isAdminRoute
                ? "Hospital Pharmacy Operations"
                : activeTab === "dashboard"
                ? "Pharmacy Department Dashboard"
                : activeTab === "inventory"
                ? "Medicine Master Inventory"
                : activeTab === "add-medicine"
                ? "Add Medicine Catalog"
                : activeTab === "stock"
                ? "Stock & Reorder Management"
                : activeTab === "expiry"
                ? "Batch Expiry & Quarantine Tracker"
                : activeTab === "sales"
                ? "Prescription Dispense Point"
                : "Dispensary Sales History"}
            </span>
          </div>

          <div className="navbar-search-wrapper">
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Search medicines, batches, transactions, or patients..."
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
              onClick={() => {
                setShowAddModal(true);
              }}
            >
              <Plus size={16} /> Add Medicine
            </button>

            <button
              className="btn-pay-now"
              onClick={fetchPharmacyData}
              title="Refresh Live Data from Database"
            >
              <RotateCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
            </button>

            <div className="admin-chip">
              <div className="admin-chip-avatar">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="admin-chip-name">{userName}</span>
                <span className="admin-chip-role">
                  {isAdminRoute || userRole === "admin" ? "Hospital Administrator" : "Clinical Pharmacist"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE HEADER */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              {isAdminRoute && "Pharmacy Operations Dashboard"}
              {!isAdminRoute && activeTab === "dashboard" && "Pharmacy Operations Dashboard"}
              {!isAdminRoute && activeTab === "inventory" && "Medicine Master Catalog"}
              {!isAdminRoute && activeTab === "add-medicine" && "Register New Medicine Batch"}
              {!isAdminRoute && activeTab === "stock" && "Stock Thresholds & Reorder Center"}
              {!isAdminRoute && activeTab === "expiry" && "Batch Expiry & Quarantine Control"}
              {!isAdminRoute && activeTab === "sales" && "Point of Sale & Medicine Dispense"}
              {!isAdminRoute && activeTab === "sales-history" && "Prescription Sales History Log"}
            </h1>
            <p className="page-subtitle">
              {isAdminRoute
                ? "Live overview of hospital dispensary inventory, critical stock thresholds, and pharmaceutical revenue."
                : activeTab === "dashboard"
                ? "Live overview of hospital dispensary inventory, critical stock thresholds, and pharmaceutical revenue."
                : activeTab === "inventory"
                ? "Manage comprehensive medical products catalog, batches, active formulas, and availability."
                : activeTab === "add-medicine"
                ? "Register new pharmaceutical batches, therapeutic classifications, and initial units."
                : activeTab === "stock"
                ? "Monitor inventory stock levels, restock critical medicines, and prevent stock-outs."
                : activeTab === "expiry"
                ? "Track pharmaceutical expiration timelines, quarantine near-expiry lots, and maintain safety."
                : activeTab === "sales"
                ? "Dispense prescribed medications, calculate pricing, and register transaction logs."
                : "Audited log of all dispensed medicines, patient receipts, and payment breakdowns."}
            </p>
          </div>
        </div>

        {/* =====================================================================
            1. KPI STAT CARDS (Visible on Dashboard, Stock, and Expiry tabs)
            ===================================================================== */}
        {(activeTab === "dashboard" || activeTab === "stock" || activeTab === "expiry") && (
          <div className="spark-grid-top">
            <div
              className="card card-stat"
              onClick={() => {
                if (!isAdminRoute) navigate("/pharmacy/inventory");
              }}
              style={{ cursor: isAdminRoute ? "default" : "pointer" }}
              title={isAdminRoute ? "Total Units In Stock" : "View Medicine Inventory"}
            >
              <div className="stat-label">Total Units In Stock</div>
              <div className="stat-value text-blue">{totalStock.toLocaleString()}</div>
              <div className="trend-badge trend-up">
                <Boxes size={13} /> {medicines.length} Medicines in Database
              </div>
            </div>

            <div
              className="card card-stat"
              onClick={() => {
                if (!isAdminRoute) navigate("/pharmacy/stock");
                else setStockFilter((prev) => (prev === "Low" ? "All" : "Low"));
              }}
              style={{ cursor: "pointer" }}
              title={isAdminRoute ? "Filter Low Stock Items" : "View Low Stock Items"}
            >
              <div className="stat-label">Low / Critical Stock</div>
              <div className="stat-value text-amber">{lowStockCount} Items</div>
              <div className="trend-badge trend-down">
                <AlertTriangle size={13} /> {isAdminRoute && stockFilter === "Low" ? "Filtered: Low Stock Active" : "Reorder threshold reached"}
              </div>
            </div>

            <div
              className="card card-stat"
              onClick={() => {
                if (!isAdminRoute) navigate("/pharmacy/expiry");
                else setExpiryFilter((prev) => (prev === "30d" ? "All" : "30d"));
              }}
              style={{ cursor: "pointer" }}
              title={isAdminRoute ? "Filter Expiring Batches" : "View Expiring Medicines"}
            >
              <div className="stat-label">Expiring Soon (30d)</div>
              <div className="stat-value text-red">{expiringSoonCount} Batches</div>
              <div className="trend-badge trend-down">
                <Calendar size={13} /> {isAdminRoute && expiryFilter === "30d" ? "Filtered: Expiring 30d Active" : "Quarantine inspection needed"}
              </div>
            </div>

            <div
              className="card card-stat"
              onClick={() => {
                if (!isAdminRoute) navigate("/pharmacy/sales-history");
              }}
              style={{ cursor: isAdminRoute ? "default" : "pointer" }}
              title={isAdminRoute ? "Dispensary Revenue" : "View Sales History"}
            >
              <div className="stat-label">Dispensary Revenue</div>
              <div className="stat-value text-green">${totalRevenue.toFixed(2)}</div>
              <div className="trend-badge trend-up">
                <TrendingUp size={13} /> {sales.length} Active Records
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            2. VIEW: ADD MEDICINE (activeTab === "add-medicine") - FULL WIDTH LANDSCAPE
            ===================================================================== */}
        {activeTab === "add-medicine" && (
          <div className="card pharmacy-table-card pharmacy-landscape-card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Add Medicine to Hospital Catalog</h2>
                <span className="pharmacy-counter-pill">New Batch Registration</span>
              </div>
              <button
                className="filter-btn-pill"
                onClick={() => navigate("/pharmacy/inventory")}
              >
                ← Back to Inventory
              </button>
            </div>

            <form onSubmit={handleAddMedicine} className="pharmacy-form-landscape">
              <div className="pharmacy-landscape-grid">
                {/* 1. Medicine Name */}
                <div className="form-group col-span-2">
                  <label>Medicine Name with Strength (e.g. Amoxicillin 500mg) *</label>
                  <input
                    type="text"
                    placeholder="e.g. Ciprofloxacin 500mg"
                    value={newMed.name}
                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                    required
                  />
                </div>

                {/* 2. Category */}
                <div className="form-group">
                  <label>Therapeutic Category *</label>
                  <select
                    value={newMed.category}
                    onChange={(e) => setNewMed({ ...newMed, category: e.target.value })}
                  >
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Batch Number */}
                <div className="form-group">
                  <label>Batch / Lot Number</label>
                  <input
                    type="text"
                    placeholder="e.g. CIP-2026-A"
                    value={newMed.batch}
                    onChange={(e) => setNewMed({ ...newMed, batch: e.target.value })}
                  />
                </div>

                {/* 4. Stock Quantity */}
                <div className="form-group">
                  <label>Initial Stock Quantity (Units) *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 250"
                    value={newMed.stock}
                    onChange={(e) => setNewMed({ ...newMed, stock: e.target.value })}
                    required
                  />
                </div>

                {/* 5. Reorder Threshold */}
                <div className="form-group">
                  <label>Reorder Alert Threshold (Units) *</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 50"
                    value={newMed.minStock}
                    onChange={(e) => setNewMed({ ...newMed, minStock: e.target.value })}
                    required
                  />
                </div>

                {/* 6. Retail Price */}
                <div className="form-group">
                  <label>Unit Retail Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    placeholder="e.g. 18.50"
                    value={newMed.price}
                    onChange={(e) => setNewMed({ ...newMed, price: e.target.value })}
                    required
                  />
                </div>

                {/* 7. Expiry Date */}
                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input
                    type="date"
                    value={newMed.expiry}
                    onChange={(e) => setNewMed({ ...newMed, expiry: e.target.value })}
                    required
                  />
                </div>

                {/* 8. Live Calculated Status Preview */}
                <div className="pharmacy-preview-pill-box">
                  <span className="pharmacy-preview-label">Batch Classification Preview</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="status-pill status-active">
                      {Number(newMed.stock || 0) <= Number(newMed.minStock || 50)
                        ? "⚠️ Low Stock Alert"
                        : "✓ In Stock"}
                    </span>
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                      {newMed.category || "General"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="landscape-actions-bar">
                <span className="landscape-hint-text">
                  * All required fields will be logged directly into MongoDB database with real-time sync.
                </span>
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => navigate("/pharmacy/inventory")}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-quick-action">
                    <Plus size={16} /> Save to Inventory Catalog
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* =====================================================================
            3. VIEW: MEDICINE SALES / DISPENSE (activeTab === "sales") - FULL WIDTH LANDSCAPE
            ===================================================================== */}
        {activeTab === "sales" && (
          <>
            {/* ACTIVE CLINICAL DOCTOR PRESCRIPTIONS QUEUE */}
            <div className="card pharmacy-table-card pharmacy-landscape-card" style={{ marginBottom: "20px" }}>
              <div className="card-header">
                <div>
                  <h2 className="card-title">Doctor Prescriptions Awaiting Dispense</h2>
                  <span className="pharmacy-counter-pill">
                    {doctorPrescriptions.filter((rx) => rx.status !== "DISPENSED").length} Pending Fulfillment
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="live-sync-pill">
                    <span className="pulse-dot"></span> Clinical Hub Sync
                  </span>
                </div>
              </div>

              {doctorPrescriptions.filter((rx) => rx.status !== "DISPENSED").length === 0 ? (
                <div className="pharmacy-empty-queue">
                  <CheckCircle2 size={30} style={{ color: "#10b981", margin: "0 auto 6px auto" }} />
                  <p>All physician prescriptions have been dispensed!</p>
                  <span>New prescriptions issued by doctors will appear here dynamically in real-time.</span>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="pharmacy-table">
                    <thead>
                      <tr>
                        <th>Rx Code</th>
                        <th>Patient Name</th>
                        <th>Prescribed Medication</th>
                        <th>Dosage & Instructions</th>
                        <th>Prescribing Doctor</th>
                        <th>Status</th>
                        <th style={{ textAlign: "right" }}>Point-of-Sale Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctorPrescriptions
                        .filter((rx) => rx.status !== "DISPENSED")
                        .slice(0, 6)
                        .map((rx) => {
                          const matchedPat = registeredPatients.find(
                            (p) =>
                              p.name?.toLowerCase().trim() ===
                              (rx.patient || rx.patientName || "").toLowerCase().trim()
                          );
                          const patId = matchedPat?.id || (rx.patientId ? rx.patientId : "");
                          return (
                            <tr key={rx.id || rx._id}>
                              <td>
                                <span className="invoice-code">{rx.id || "RX-001"}</span>
                              </td>
                              <td>
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                  <strong>{rx.patient || rx.patientName}</strong>
                                  {patId && (
                                    <span style={{ fontSize: "11px", color: "#0284c7", fontWeight: "700" }}>
                                      {patId}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="med-name-cell">
                                  <span className="med-icon">💊</span>
                                  <strong>{rx.medication}</strong>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                  <span>{rx.dosage || "1 tablet daily"}</span>
                                  <span style={{ fontSize: "11px", color: "#64748b" }}>{rx.instructions || "After meals"}</span>
                                </div>
                              </td>
                              <td>
                                <span style={{ fontWeight: "600", color: "#334155" }}>
                                  {rx.doctor || rx.doctorName || "Dr. Salman"}
                                </span>
                              </td>
                              <td>
                                <span className="status-pill status-low">
                                  <Clock size={11} /> Pending Fill
                                </span>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <button
                                  className="btn-quick-action"
                                  style={{ padding: "6px 14px", fontSize: "12px" }}
                                  onClick={() => handleQuickFillPrescription(rx)}
                                  title="Fill and dispense this prescription"
                                >
                                  <ShoppingCart size={13} /> Fill & Dispense
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card pharmacy-table-card pharmacy-landscape-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Dispense Prescription & Record Sale</h2>
                  <span className="pharmacy-counter-pill">Live Point-of-Sale Desk</span>
                </div>
                <button
                  className="filter-btn-pill"
                  onClick={() => navigate("/pharmacy/sales-history")}
                >
                  View Sales History →
                </button>
              </div>

              <form onSubmit={handleCompleteSale} className="pharmacy-form-landscape">
                <div className="pharmacy-landscape-grid">
                  {/* 1. Medicine Dropdown */}
                  <div className="form-group col-span-2">
                    <label>Select Medicine from Live Inventory *</label>
                    <select
                      value={newSale.medicineId}
                      onChange={(e) => setNewSale({ ...newSale, medicineId: e.target.value })}
                      required
                    >
                      {medicines.map((m) => {
                        const idVal = m._id || m.medicineId;
                        return (
                          <option key={idVal} value={idVal}>
                            {m.name} (${Number(m.price || 0).toFixed(2)}) — Available: {m.stock} units
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* 2. Payment Method */}
                  <div className="form-group">
                    <label>Payment Method *</label>
                    <select
                      value={newSale.paymentMethod}
                      onChange={(e) => setNewSale({ ...newSale, paymentMethod: e.target.value })}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Credit Card">Credit / Debit Card</option>
                      <option value="Insurance">Health Insurance</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>

                  {/* 3. Patient Name with Live Registered Patient Matching */}
                  <div className="form-group">
                    <label>Patient Full Name *</label>
                    <input
                      list="pharmacy-patients-datalist"
                      type="text"
                      placeholder="Type or select patient..."
                      value={newSale.patientName}
                      onChange={(e) => {
                        const val = e.target.value;
                        const matched = registeredPatients.find(
                          (p) => p.name?.toLowerCase().trim() === val.toLowerCase().trim()
                        );
                        setNewSale({
                          ...newSale,
                          patientName: val,
                          patientId: matched?.id || "",
                        });
                      }}
                      required
                    />
                    <datalist id="pharmacy-patients-datalist">
                      {registeredPatients.map((p) => (
                        <option key={p.id || p.rawId} value={p.name}>
                          {p.name} ({p.id}) {p.phone ? `• ${p.phone}` : ""}
                        </option>
                      ))}
                    </datalist>
                    {(() => {
                      const matched = registeredPatients.find(
                        (p) => p.name?.toLowerCase().trim() === newSale.patientName?.toLowerCase().trim()
                      );
                      if (matched) {
                        return (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                            <span
                              style={{
                                fontSize: 11,
                                background: "#dcfce7",
                                color: "#15803d",
                                padding: "2px 8px",
                                borderRadius: 4,
                                fontWeight: 700,
                              }}
                            >
                              ✓ Verified: {matched.id} ({matched.age} yrs • {matched.gender})
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  {/* 4. Doctor Name with On-Duty Doctors Matching */}
                  <div className="form-group">
                    <label>Prescribing Doctor</label>
                    <input
                      list="pharmacy-doctors-datalist"
                      type="text"
                      placeholder="Select on-duty doctor..."
                      value={newSale.doctorName}
                      onChange={(e) => setNewSale({ ...newSale, doctorName: e.target.value })}
                    />
                    <datalist id="pharmacy-doctors-datalist">
                      {onDutyDoctors.map((d) => (
                        <option key={d.rawId || d.name} value={d.name}>
                          {d.name} — {d.specialty}
                        </option>
                      ))}
                    </datalist>
                  </div>

                  {/* 5. Quantity */}
                  <div className="form-group">
                    <label>Quantity to Dispense (Units) *</label>
                    <input
                      type="number"
                      min="1"
                      value={newSale.quantity}
                      onChange={(e) => setNewSale({ ...newSale, quantity: e.target.value })}
                      required
                    />
                  </div>
                </div>

              {/* LIVE TOTAL SUMMARY */}
              {(() => {
                const selected = medicines.find(
                  (m) => (m._id || m.medicineId) === newSale.medicineId
                );
                const subtotal = selected ? (selected.price || 0) * Number(newSale.quantity || 0) : 0;
                return (
                  <div
                    style={{
                      background: "#f0f9ff",
                      border: "1px solid #bae6fd",
                      borderRadius: 12,
                      padding: "18px 24px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 13, color: "#0369a1", fontWeight: 600 }}>
                        Estimated Dispensary Total:
                      </span>
                      <div style={{ fontSize: 26, fontWeight: 800, color: "#0284c7" }}>
                        ${subtotal.toFixed(2)}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        padding: "6px 14px",
                        background: "#ffffff",
                        borderRadius: 9999,
                        color: "#0369a1",
                        fontWeight: 700,
                        border: "1px solid #bae6fd",
                      }}
                    >
                      {newSale.paymentMethod} Payment
                    </span>
                  </div>
                );
              })()}

              <div className="landscape-actions-bar">
                <span className="landscape-hint-text">
                  * Dispense confirmation will immediately deduct live units from MongoDB and create an audited transaction record.
                </span>
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => navigate("/pharmacy/dashboard")}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-quick-action">
                    <CheckCircle2 size={16} /> Complete Dispense & Record
                  </button>
                </div>
              </div>
            </form>
          </div>
          </>
        )}

        {/* =====================================================================
            4. VIEW: STOCK MANAGEMENT (activeTab === "stock")
            ===================================================================== */}
        {activeTab === "stock" && (
          <div className="card pharmacy-table-card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Stock Thresholds & Restock Manager</h2>
                <span className="pharmacy-counter-pill">
                  {medicines.filter((m) => Number(m.stock) <= Number(m.minStock || 20)).length} Items Need Reorder
                </span>
              </div>

              {/* Stock Filter Pills */}
              <div className="filter-pill-group">
                <button
                  className={`filter-btn-pill ${stockFilter === "All" ? "active-pill" : ""}`}
                  onClick={() => setStockFilter("All")}
                >
                  All Items ({medicines.length})
                </button>
                <button
                  className={`filter-btn-pill ${stockFilter === "Low" ? "active-pill" : ""}`}
                  onClick={() => setStockFilter("Low")}
                >
                  Low / Critical Stock ({lowStockCount})
                </button>
                <button
                  className={`filter-btn-pill ${stockFilter === "Adequate" ? "active-pill" : ""}`}
                  onClick={() => setStockFilter("Adequate")}
                >
                  Adequate Stock ({medicines.length - lowStockCount})
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="pharmacy-table">
                <thead>
                  <tr>
                    <th>Item Code</th>
                    <th>Medicine Name</th>
                    <th>Current Stock</th>
                    <th>Safe Threshold</th>
                    <th>Stock Health</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Quick Restock Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedicines.map((med) => {
                    const isLow = Number(med.stock) <= Number(med.minStock || 20);
                    const safeMin = Number(med.minStock || 20);
                    const percent = Math.min(100, Math.round((Number(med.stock) / (safeMin * 2 || 1)) * 100));
                    const medId = med._id || med.medicineId;
                    return (
                      <tr key={medId}>
                        <td>
                          <span className="invoice-code">{med.medicineId || med._id?.slice(-6)}</span>
                        </td>
                        <td>
                          <div className="med-name-cell">
                            <span className="med-icon">💊</span>
                            <strong>{med.name}</strong>
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: isLow ? "#e11d48" : "#0f172a" }}>
                            {med.stock} units
                          </strong>
                        </td>
                        <td>{med.minStock || 20} units</td>
                        <td style={{ minWidth: 160 }}>
                          <div
                            style={{
                              width: "100%",
                              height: 8,
                              background: "#f1f5f9",
                              borderRadius: 4,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${percent}%`,
                                height: "100%",
                                background: isLow ? "#ef4444" : "#10b981",
                                borderRadius: 4,
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "inline-block" }}>
                            {percent}% capacity
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-pill ${
                              med.status === "In Stock"
                                ? "status-active"
                                : med.status === "Low Stock"
                                ? "status-low"
                                : "status-expiring"
                            }`}
                          >
                            {med.status || (isLow ? "Low Stock" : "In Stock")}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                            <button
                              className="btn-pay-now"
                              onClick={() => handleRestock(medId, 50)}
                              title="Restock +50 units"
                            >
                              +50 Units
                            </button>
                            <button
                              className="btn-pay-now"
                              onClick={() => handleRestock(medId, 100)}
                              title="Restock +100 units"
                            >
                              +100 Units
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =====================================================================
            5. VIEW: EXPIRY TRACKING (activeTab === "expiry")
            ===================================================================== */}
        {activeTab === "expiry" && (
          <div className="card pharmacy-table-card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Batch Expiry & Quarantine Tracker</h2>
                <span className="pharmacy-counter-pill">
                  {expiringSoonCount} Batches Expiring in Next 30 Days
                </span>
              </div>

              {/* Expiry Filter Pills */}
              <div className="filter-pill-group">
                <button
                  className={`filter-btn-pill ${expiryFilter === "All" ? "active-pill" : ""}`}
                  onClick={() => setExpiryFilter("All")}
                >
                  All Batches ({medicines.length})
                </button>
                <button
                  className={`filter-btn-pill ${expiryFilter === "30d" ? "active-pill" : ""}`}
                  onClick={() => setExpiryFilter("30d")}
                >
                  Expiring in 30 Days ({expiringSoonCount})
                </button>
                <button
                  className={`filter-btn-pill ${expiryFilter === "60d" ? "active-pill" : ""}`}
                  onClick={() => setExpiryFilter("60d")}
                >
                  Expiring in 60 Days
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="pharmacy-table">
                <thead>
                  <tr>
                    <th>Item Code</th>
                    <th>Medicine Name</th>
                    <th>Batch Lot</th>
                    <th>Expiration Date</th>
                    <th>Units Remaining</th>
                    <th>Safety Status</th>
                    <th style={{ textAlign: "right" }}>Quarantine Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expiryMedicines.map((med) => {
                    const expiryFormatted = formatDate(med.expiryDate || med.expiry);
                    const isExpiring = new Date(expiryFormatted) <= thirtyDaysOut;
                    const medId = med._id || med.medicineId;
                    return (
                      <tr key={medId}>
                        <td>
                          <span className="invoice-code">{med.medicineId || med._id?.slice(-6)}</span>
                        </td>
                        <td>
                          <div className="med-name-cell">
                            <span className="med-icon">💊</span>
                            <strong>{med.name}</strong>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontFamily: "monospace", fontWeight: 600 }}>
                            {med.batch || "—"}
                          </span>
                        </td>
                        <td>
                          <strong className={isExpiring ? "expiry-urgent" : "expiry-normal"}>
                            {expiryFormatted}
                          </strong>
                        </td>
                        <td>{med.stock} units</td>
                        <td>
                          <span
                            className={`status-pill ${
                              isExpiring ? "status-expiring" : "status-active"
                            }`}
                          >
                            {isExpiring ? "⚠️ Quarantined / Expiring Soon" : "✓ Verified Safe"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="btn-pay-now"
                            style={{
                              background:
                                med.status === "Quarantined" || isExpiring
                                  ? "#fee2e2"
                                  : "#e0f2fe",
                              color:
                                med.status === "Quarantined" || isExpiring
                                  ? "#dc2626"
                                  : "#0284c7",
                              borderColor:
                                med.status === "Quarantined" || isExpiring
                                  ? "#fca5a5"
                                  : "#bae6fd",
                            }}
                            onClick={() => handleToggleQuarantine(medId)}
                            title="Toggle quarantine inspection state"
                          >
                            {med.status === "Quarantined"
                              ? "Release to Stock"
                              : isExpiring
                              ? "Quarantine Batch"
                              : "Verify Batch"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =====================================================================
            6. VIEW: SALES HISTORY (activeTab === "sales-history")
            ===================================================================== */}
        {activeTab === "sales-history" && (
          <div className="card pharmacy-table-card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Dispensary Sales & Transaction Log</h2>
                <span className="pharmacy-counter-pill">
                  {filteredSales.length} Transactions Recorded in Database
                </span>
              </div>

              {/* Payment Method Filter Pills */}
              <div className="filter-pill-group">
                <button
                  className={`filter-btn-pill ${paymentFilter === "All" ? "active-pill" : ""}`}
                  onClick={() => setPaymentFilter("All")}
                >
                  All Methods
                </button>
                <button
                  className={`filter-btn-pill ${paymentFilter === "Cash" ? "active-pill" : ""}`}
                  onClick={() => setPaymentFilter("Cash")}
                >
                  Cash
                </button>
                <button
                  className={`filter-btn-pill ${paymentFilter === "Card" ? "active-pill" : ""}`}
                  onClick={() => setPaymentFilter("Card")}
                >
                  Card
                </button>
                <button
                  className={`filter-btn-pill ${paymentFilter === "Insurance" ? "active-pill" : ""}`}
                  onClick={() => setPaymentFilter("Insurance")}
                >
                  Insurance
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="pharmacy-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Patient Name</th>
                    <th>Prescribing Doctor</th>
                    <th>Items Dispensed</th>
                    <th>Total Amount</th>
                    <th>Payment Method</th>
                    <th>Timestamp</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => {
                    const saleId = sale.id || sale.invoiceId;
                    return (
                      <tr key={saleId}>
                        <td>
                          <span className="invoice-code">{saleId}</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <strong>{sale.patient || sale.patientName}</strong>
                            {sale.patientId && (
                              <span style={{ fontSize: "11px", color: "#0284c7", fontWeight: "700" }}>
                                {sale.patientId}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>{sale.doctor || "Dr. Salman"}</td>
                        <td>{sale.items || sale.service}</td>
                        <td>
                          <strong className="text-green">${Number(sale.total || sale.amount || 0).toFixed(2)}</strong>
                        </td>
                        <td>
                          <span className="billing-method-pill">{sale.payment || sale.paymentMethod || "Cash"}</span>
                        </td>
                        <td>{sale.time || formatDate(sale.createdAt)}</td>
                        <td>
                          <span className="status-pill status-active">
                            <CheckCircle2 size={11} /> {sale.status || "Completed"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div
                            style={{
                              display: "flex",
                              gap: "6px",
                              justifyContent: "flex-end",
                              alignItems: "center",
                            }}
                          >
                            <button
                              className="btn-action-icon"
                              onClick={() => handlePrintSaleReceipt(sale)}
                              title="Print Official Receipt"
                            >
                              <Printer size={13} />
                            </button>
                            <button
                              className="btn-action-icon text-blue"
                              onClick={() => handleOpenEditSale(sale)}
                              title="Edit Transaction Record"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              className="btn-action-icon text-danger"
                              onClick={() => handleDeleteSale(sale._id || sale.id)}
                              title="Delete Transaction Record"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =====================================================================
            7. VIEW: MEDICINE INVENTORY & DASHBOARD (activeTab === "dashboard" || "inventory")
            ===================================================================== */}
        {(activeTab === "dashboard" || activeTab === "inventory") && (
          <>
            {/* Dashboard: Doctor Prescriptions Awaiting Dispense */}
            {activeTab === "dashboard" && (
              <div className="card pharmacy-table-card" style={{ marginBottom: "24px" }}>
                <div className="card-header">
                  <div>
                    <h2 className="card-title">Doctor Prescriptions Awaiting Dispense</h2>
                    <span className="pharmacy-counter-pill">
                      {doctorPrescriptions.filter((rx) => rx.status !== "DISPENSED").length} Pending Fulfillment
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="live-sync-pill">
                      <span className="pulse-dot"></span> Clinical Hub Sync
                    </span>
                    {!isAdminRoute && (
                      <button
                        className="filter-btn-pill"
                        onClick={() => navigate("/pharmacy/sales")}
                      >
                        Open Dispense POS →
                      </button>
                    )}
                  </div>
                </div>

                {doctorPrescriptions.filter((rx) => rx.status !== "DISPENSED").length === 0 ? (
                  <div className="pharmacy-empty-queue">
                    <CheckCircle2 size={30} style={{ color: "#10b981", margin: "0 auto 6px auto" }} />
                    <p>All physician prescriptions have been dispensed!</p>
                    <span>New prescriptions issued by doctors will appear here dynamically in real-time.</span>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="pharmacy-table">
                      <thead>
                        <tr>
                          <th>Rx Code</th>
                          <th>Patient Name</th>
                          <th>Prescribed Medication</th>
                          <th>Dosage & Instructions</th>
                          <th>Prescribing Doctor</th>
                          <th>Status</th>
                          <th style={{ textAlign: "right" }}>Quick Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {doctorPrescriptions
                          .filter((rx) => rx.status !== "DISPENSED")
                          .slice(0, 5)
                          .map((rx) => {
                            const matchedPat = registeredPatients.find(
                              (p) =>
                                p.name?.toLowerCase().trim() ===
                                (rx.patient || rx.patientName || "").toLowerCase().trim()
                            );
                            const patId = matchedPat?.id || (rx.patientId ? rx.patientId : "");
                            return (
                              <tr key={rx.id || rx._id}>
                                <td>
                                  <span className="invoice-code">{rx.id || "RX-001"}</span>
                                </td>
                                <td>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                    <strong>{rx.patient || rx.patientName}</strong>
                                    {patId && (
                                      <span style={{ fontSize: "11px", color: "#0284c7", fontWeight: "700" }}>
                                        {patId}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <div className="med-name-cell">
                                    <span className="med-icon">💊</span>
                                    <strong>{rx.medication}</strong>
                                  </div>
                                </td>
                                <td>
                                  <div style={{ display: "flex", flexDirection: "column" }}>
                                    <span>{rx.dosage || "1 tablet daily"}</span>
                                    <span style={{ fontSize: "11px", color: "#64748b" }}>
                                      {rx.instructions || "After meals"}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <span style={{ fontWeight: "600", color: "#334155" }}>
                                    {rx.doctor || rx.doctorName || "Dr. Salman"}
                                  </span>
                                </td>
                                <td>
                                  <span className="status-pill status-low">
                                    <Clock size={11} /> Pending Fill
                                  </span>
                                </td>
                                <td style={{ textAlign: "right" }}>
                                  <button
                                    className="btn-quick-action"
                                    style={{ padding: "6px 14px", fontSize: "12px" }}
                                    onClick={() => {
                                      handleQuickFillPrescription(rx);
                                      if (!isAdminRoute) navigate("/pharmacy/sales");
                                    }}
                                    title="Fill and dispense this prescription"
                                  >
                                    <ShoppingCart size={13} /> Fill & Dispense
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div className="card pharmacy-table-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">
                    {activeTab === "dashboard"
                      ? "Dispensary Pharmaceuticals Catalog"
                      : "Master Medicine Inventory"}
                  </h2>
                  <span className="pharmacy-counter-pill">
                    {filteredMedicines.length} Medicines in Live Database
                  </span>
                </div>

                {/* Category Filter Pills */}
                <div className="filter-pill-group">
                  {["All", ...availableCategories].map((cat) => (
                    <button
                      key={cat}
                      className={`filter-btn-pill ${categoryFilter === cat ? "active-pill" : ""}`}
                      onClick={() => setCategoryFilter(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="table-responsive">
                <table className="pharmacy-table">
                  <thead>
                    <tr>
                      <th>Item Code</th>
                      <th>Medicine Name</th>
                      <th>Category</th>
                      <th>Available Stock</th>
                      <th>Unit Price</th>
                      <th>Batch No.</th>
                      <th>Expiry Date</th>
                      <th>Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedicines.map((med) => {
                      const medId = med._id || med.medicineId;
                      const expiryFormatted = formatDate(med.expiryDate || med.expiry);
                      const isLow = Number(med.stock) <= Number(med.minStock || 20);
                      return (
                        <tr key={medId}>
                          <td>
                            <span className="invoice-code">{med.medicineId || med._id?.slice(-6)}</span>
                          </td>
                          <td>
                            <div className="med-name-cell">
                              <span className="med-icon">💊</span>
                              <strong>{med.name}</strong>
                            </div>
                          </td>
                          <td>
                            <span className="category-pill">{med.category}</span>
                          </td>
                          <td>
                            <span
                              className={`stock-indicator ${
                                isLow ? "low-stock" : "good-stock"
                              }`}
                            >
                              {med.stock} units
                            </span>
                          </td>
                          <td>${Number(med.price || 0).toFixed(2)}</td>
                          <td>{med.batch || "—"}</td>
                          <td>
                            <span
                              className={
                                med.status === "Expiring Soon" ? "expiry-urgent" : ""
                              }
                            >
                              {expiryFormatted}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`status-pill ${
                                med.status === "In Stock"
                                  ? "status-active"
                                  : med.status === "Low Stock"
                                  ? "status-low"
                                  : "status-expiring"
                              }`}
                            >
                              {med.status || (isLow ? "Low Stock" : "In Stock")}
                            </span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div
                              className="pharmacy-actions"
                              style={{
                                justifyContent: "flex-end",
                                display: "flex",
                                gap: "6px",
                              }}
                            >
                              <button
                                className="btn-pay-now"
                                onClick={() => handleRestock(medId, 100)}
                                title="Restock +100 units"
                              >
                                <RotateCw size={12} /> Restock
                              </button>
                              <button
                                className="btn-action-icon text-danger"
                                onClick={() => handleDeleteMedicine(medId)}
                                title="Delete Record"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* If on Dashboard, show recent sales summary as well */}
            {activeTab === "dashboard" && (
              <div className="card pharmacy-table-card">
                <div className="card-header">
                  <div>
                    <h2 className="card-title">Recent Prescription Sales Log</h2>
                    <span className="pharmacy-counter-pill">
                      {sales.length} transactions recorded
                    </span>
                  </div>
                  {!isAdminRoute && (
                    <button
                      className="filter-btn-pill"
                      onClick={() => navigate("/pharmacy/sales-history")}
                    >
                      View All Sales →
                    </button>
                  )}
                </div>

                <div className="table-responsive">
                  <table className="pharmacy-table">
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Patient Name</th>
                        <th>Doctor</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Timestamp</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.slice(0, isAdminRoute ? 10 : 4).map((sale) => {
                        const saleId = sale.id || sale.invoiceId;
                        return (
                          <tr key={saleId}>
                            <td>
                              <span className="invoice-code">{saleId}</span>
                            </td>
                            <td>
                              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                <strong>{sale.patient || sale.patientName}</strong>
                                {sale.patientId && (
                                  <span style={{ fontSize: "11px", color: "#0284c7", fontWeight: "700" }}>
                                    {sale.patientId}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>{sale.doctor || "Dr. Salman"}</td>
                            <td>{sale.items || sale.service}</td>
                            <td>
                              <strong className="text-green">
                                ${Number(sale.total || sale.amount || 0).toFixed(2)}
                              </strong>
                            </td>
                            <td>
                              <span className="billing-method-pill">{sale.payment || sale.paymentMethod || "Cash"}</span>
                            </td>
                            <td>{sale.time || formatDate(sale.createdAt)}</td>
                            <td>
                              <span className="status-pill status-active">
                                <CheckCircle2 size={11} /> {sale.status || "Completed"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* =====================================================================
            MODAL: ADD MEDICINE (Shown when showAddModal is true)
            ===================================================================== */}
        {showAddModal && (
          <div className="admin-modal-backdrop" onClick={() => setShowAddModal(false)}>
            <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <div>
                  <h2>Add Medicine to Inventory</h2>
                  <p>Register new medicine batch into live hospital database</p>
                </div>
                <button
                  className="doctors-closeBtn"
                  onClick={() => setShowAddModal(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddMedicine} className="pharmacy-form">
                <div className="form-group">
                  <label>Medicine Name with Dosage *</label>
                  <input
                    type="text"
                    placeholder="e.g. Ciprofloxacin 500mg"
                    value={newMed.name}
                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Therapeutic Category</label>
                    <select
                      value={newMed.category}
                      onChange={(e) =>
                        setNewMed({ ...newMed, category: e.target.value })
                      }
                    >
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Batch Number</label>
                    <input
                      type="text"
                      placeholder="e.g. CIP-2026-A"
                      value={newMed.batch}
                      onChange={(e) =>
                        setNewMed({ ...newMed, batch: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Stock Quantity (Units) *</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 150"
                      value={newMed.stock}
                      onChange={(e) =>
                        setNewMed({ ...newMed, stock: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Reorder Alert Threshold</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 30"
                      value={newMed.minStock}
                      onChange={(e) =>
                        setNewMed({ ...newMed, minStock: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Unit Retail Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      placeholder="e.g. 18.50"
                      value={newMed.price}
                      onChange={(e) =>
                        setNewMed({ ...newMed, price: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Expiry Date *</label>
                    <input
                      type="date"
                      value={newMed.expiry}
                      onChange={(e) =>
                        setNewMed({ ...newMed, expiry: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-quick-action">
                    Add Medicine
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================================
            MODAL: EDIT TRANSACTION (Shown when showEditSaleModal is true)
            ===================================================================== */}
        {showEditSaleModal && editingSale && (
          <div className="admin-modal-backdrop" onClick={() => setShowEditSaleModal(false)}>
            <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <div>
                  <h2>Edit Dispensary Transaction</h2>
                  <p>Transaction ID: <span className="invoice-code">{editingSale.id}</span></p>
                </div>
                <button
                  className="doctors-closeBtn"
                  onClick={() => setShowEditSaleModal(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEditSale} className="pharmacy-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Patient Full Name *</label>
                    <input
                      type="text"
                      value={editingSale.patientName}
                      onChange={(e) => setEditingSale({ ...editingSale, patientName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Patient ID (PAT-XXXX)</label>
                    <input
                      type="text"
                      placeholder="e.g. PAT-2026"
                      value={editingSale.patientId}
                      onChange={(e) => setEditingSale({ ...editingSale, patientId: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Prescribing Doctor *</label>
                    <input
                      type="text"
                      value={editingSale.doctorName}
                      onChange={(e) => setEditingSale({ ...editingSale, doctorName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Payment Method *</label>
                    <select
                      value={editingSale.paymentMethod}
                      onChange={(e) => setEditingSale({ ...editingSale, paymentMethod: e.target.value })}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Credit Card">Credit / Debit Card</option>
                      <option value="Insurance">Health Insurance</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Direct Bill">Direct Bill</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Dispensed Medication Items *</label>
                  <input
                    type="text"
                    placeholder="e.g. Amoxicillin 500mg (x2)"
                    value={editingSale.items}
                    onChange={(e) => setEditingSale({ ...editingSale, items: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Total Billed Amount ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingSale.total}
                      onChange={(e) => setEditingSale({ ...editingSale, total: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Fulfillment Status *</label>
                    <select
                      value={editingSale.status}
                      onChange={(e) => setEditingSale({ ...editingSale, status: e.target.value })}
                    >
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowEditSaleModal(false)}
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
