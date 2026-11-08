import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { pharmacyMenu } from "../../config/panelMenus";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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
} from "lucide-react";
import "./PharmacyPanel.css";

const INITIAL_MEDICINES = [
  {
    id: "MED-101",
    name: "Amoxicillin 500mg",
    category: "Antibiotic",
    stock: 240,
    minStock: 50,
    price: 14.5,
    batch: "AMX-2026-A",
    expiry: "2026-11-20",
    status: "In Stock",
  },
  {
    id: "MED-102",
    name: "Paracetamol 650mg",
    category: "Analgesic",
    stock: 580,
    minStock: 100,
    price: 4.2,
    batch: "PCM-2026-C",
    expiry: "2027-05-15",
    status: "In Stock",
  },
  {
    id: "MED-103",
    name: "Metformin 850mg",
    category: "Antidiabetic",
    stock: 24,
    minStock: 60,
    price: 12.0,
    batch: "MET-2025-F",
    expiry: "2026-12-01",
    status: "Low Stock",
  },
  {
    id: "MED-104",
    name: "Atorvastatin 20mg",
    category: "Cardiovascular",
    stock: 15,
    minStock: 40,
    price: 28.5,
    batch: "ATV-2025-B",
    expiry: "2026-11-14",
    status: "Expiring Soon",
  },
  {
    id: "MED-105",
    name: "Omeprazole 20mg",
    category: "Gastrointestinal",
    stock: 310,
    minStock: 50,
    price: 9.8,
    batch: "OMP-2027-A",
    expiry: "2027-08-30",
    status: "In Stock",
  },
  {
    id: "MED-106",
    name: "Ibuprofen 400mg",
    category: "Analgesic",
    stock: 420,
    minStock: 80,
    price: 6.5,
    batch: "IBU-2026-D",
    expiry: "2027-01-10",
    status: "In Stock",
  },
  {
    id: "MED-107",
    name: "Azithromycin 250mg",
    category: "Antibiotic",
    stock: 18,
    minStock: 50,
    price: 22.0,
    batch: "AZI-2025-H",
    expiry: "2026-11-28",
    status: "Low Stock",
  },
];

const INITIAL_SALES = [
  {
    id: "TXN-9021",
    patient: "Ahmed Mansoor",
    doctor: "Dr. Sarah Mitchell",
    items: "Amoxicillin (x2), Paracetamol (x1)",
    total: 33.2,
    time: "Today, 10:45 AM",
    payment: "Card",
    status: "Completed",
  },
  {
    id: "TXN-9020",
    patient: "Fatima Al-Sabah",
    doctor: "Dr. James Wilson",
    items: "Metformin (x3)",
    total: 36.0,
    time: "Today, 09:20 AM",
    payment: "Cash",
    status: "Completed",
  },
  {
    id: "TXN-9019",
    patient: "David Chen",
    doctor: "Dr. Emma Roberts",
    items: "Omeprazole (x1), Ibuprofen (x1)",
    total: 18.7,
    time: "Yesterday, 04:15 PM",
    payment: "Insurance",
    status: "Completed",
  },
  {
    id: "TXN-9018",
    patient: "Eleanor Vance",
    doctor: "Dr. Alexander Wright",
    items: "Atorvastatin 20mg (x1)",
    total: 28.5,
    time: "Yesterday, 02:30 PM",
    payment: "Card",
    status: "Completed",
  },
];

export default function PharmacyPanel() {
  const location = useLocation();
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState(INITIAL_MEDICINES);
  const [sales, setSales] = useState(INITIAL_SALES);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [expiryFilter, setExpiryFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
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
    medicineId: "MED-101",
    patientName: "",
    doctorName: "",
    quantity: 1,
    paymentMethod: "Cash",
  });

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

  // Admin access check for sidebar menu adaptation
  const isAdminUser = userRole === "admin";
  const effectiveMenu = isAdminUser
    ? [
        {
          title: "ADMIN PORTAL",
          items: [
            {
              name: "Back to Admin",
              icon: <LayoutDashboard size={18} />,
              path: "/admin/dashboard",
            },
          ],
        },
        ...pharmacyMenu,
      ]
    : pharmacyMenu;

  // Key Statistics
  const totalStock = medicines.reduce((acc, m) => acc + Number(m.stock), 0);
  const lowStockCount = medicines.filter(
    (m) => Number(m.stock) <= Number(m.minStock)
  ).length;
  const expiringSoonCount = medicines.filter((m) =>
    m.expiry.startsWith("2026-11")
  ).length;
  const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);

  // Filtered medicines for inventory tab
  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase()) ||
      m.batch.toLowerCase().includes(search.toLowerCase()) ||
      m.id.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (categoryFilter !== "All" && m.category !== categoryFilter) return false;
    if (stockFilter === "Low" && Number(m.stock) > Number(m.minStock)) return false;
    if (stockFilter === "Adequate" && Number(m.stock) <= Number(m.minStock)) return false;
    return true;
  });

  // Filtered medicines for expiry tab
  const expiryMedicines = medicines.filter((m) => {
    if (expiryFilter === "30d") return m.expiry.startsWith("2026-11");
    if (expiryFilter === "60d") return m.expiry.startsWith("2026-11") || m.expiry.startsWith("2026-12");
    return true;
  });

  // Filtered sales history
  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.patient.toLowerCase().includes(search.toLowerCase()) ||
      s.doctor.toLowerCase().includes(search.toLowerCase()) ||
      s.items.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (paymentFilter !== "All" && s.payment.toLowerCase() !== paymentFilter.toLowerCase())
      return false;
    return true;
  });

  // Handler: Add Medicine
  const handleAddMedicine = (e) => {
    e.preventDefault();
    if (!newMed.name || !newMed.stock || !newMed.price || !newMed.expiry) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const medEntry = {
      id: `MED-${Math.floor(100 + Math.random() * 900)}`,
      name: newMed.name.trim(),
      category: newMed.category,
      stock: Number(newMed.stock),
      minStock: Number(newMed.minStock) || 50,
      price: parseFloat(newMed.price),
      batch: newMed.batch.trim() || `BCH-${new Date().getFullYear()}`,
      expiry: newMed.expiry,
      status:
        Number(newMed.stock) <= (Number(newMed.minStock) || 50)
          ? "Low Stock"
          : newMed.expiry.startsWith("2026-11")
          ? "Expiring Soon"
          : "In Stock",
    };
    setMedicines([medEntry, ...medicines]);
    toast.success(`Medicine "${medEntry.name}" added to catalog!`);
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

    if (activeTab === "add-medicine") {
      navigate("/pharmacy/inventory");
    }
  };

  // Handler: Restock
  const handleRestock = (id, amount = 100) => {
    setMedicines(
      medicines.map((m) =>
        m.id === id
          ? {
              ...m,
              stock: Number(m.stock) + amount,
              status: Number(m.stock) + amount > m.minStock ? "In Stock" : "Low Stock",
            }
          : m
      )
    );
    toast.success(`Restocked +${amount} units successfully.`);
  };

  // Handler: Delete Medicine
  const handleDeleteMedicine = (id) => {
    setMedicines(medicines.filter((m) => m.id !== id));
    toast.info("Medicine record removed from inventory.");
  };

  // Handler: Complete Sale
  const handleCompleteSale = (e) => {
    e.preventDefault();
    const selectedMed = medicines.find((m) => m.id === newSale.medicineId);
    if (!selectedMed) {
      toast.error("Please select a medicine.");
      return;
    }
    const qty = Number(newSale.quantity);
    if (qty <= 0) {
      toast.error("Quantity must be at least 1.");
      return;
    }
    if (selectedMed.stock < qty) {
      toast.error(`Insufficient stock! Only ${selectedMed.stock} units available.`);
      return;
    }

    const totalCost = selectedMed.price * qty;
    const saleEntry = {
      id: `TXN-${Math.floor(9000 + Math.random() * 1000)}`,
      patient: newSale.patientName.trim() || "Walk-in Patient",
      doctor: newSale.doctorName.trim() || "Dr. Staff On-Duty",
      items: `${selectedMed.name} (x${qty})`,
      total: totalCost,
      time: "Just now",
      payment: newSale.paymentMethod,
      status: "Completed",
    };

    // Update stock
    setMedicines(
      medicines.map((m) => {
        if (m.id === selectedMed.id) {
          const remaining = m.stock - qty;
          return {
            ...m,
            stock: remaining,
            status: remaining <= m.minStock ? "Low Stock" : "In Stock",
          };
        }
        return m;
      })
    );

    setSales([saleEntry, ...sales]);
    toast.success(`Dispensed ${selectedMed.name} (x${qty}) for $${totalCost.toFixed(2)}!`);
    setNewSale({
      medicineId: medicines[0]?.id || "MED-101",
      patientName: "",
      doctorName: "",
      quantity: 1,
      paymentMethod: "Cash",
    });
  };

  return (
    <div className="app spark-theme white-grid-layout">
      {/* SIDEBAR NAVIGATION */}
      <Sidebar menuItems={effectiveMenu} panelSubtitle="PHARMACY DEPT" />

      <main className="main main-wrapper admin-main-canvas">
        {/* TOP NAVBAR BANNER */}
        <header className="navbar-custom">
          <div className="navbar-left">
            <span className="pharmacy-badge-pill">
              <Pill size={15} />{" "}
              {activeTab === "dashboard" && "Pharmacy Department Dashboard"}
              {activeTab === "inventory" && "Medicine Master Inventory"}
              {activeTab === "add-medicine" && "Add Medicine Catalog"}
              {activeTab === "stock" && "Stock & Reorder Management"}
              {activeTab === "expiry" && "Batch Expiry & Quarantine Tracker"}
              {activeTab === "sales" && "Prescription Dispense Point"}
              {activeTab === "sales-history" && "Dispensary Sales History"}
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
                if (activeTab !== "add-medicine") {
                  setShowAddModal(true);
                }
              }}
            >
              <Plus size={16} /> Add Medicine
            </button>

            <div className="admin-chip">
              <div className="admin-chip-avatar">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="admin-chip-name">{userName}</span>
                <span className="admin-chip-role">
                  {isAdminUser ? "Hospital Administrator" : "Clinical Pharmacist"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE HEADER */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              {activeTab === "dashboard" && "Pharmacy Operations Dashboard"}
              {activeTab === "inventory" && "Medicine Master Catalog"}
              {activeTab === "add-medicine" && "Register New Medicine Batch"}
              {activeTab === "stock" && "Stock Thresholds & Reorder Center"}
              {activeTab === "expiry" && "Batch Expiry & Quarantine Control"}
              {activeTab === "sales" && "Point of Sale & Medicine Dispense"}
              {activeTab === "sales-history" && "Prescription Sales History Log"}
            </h1>
            <p className="page-subtitle">
              {activeTab === "dashboard" &&
                "Live overview of hospital dispensary inventory, critical stock thresholds, and pharmaceutical revenue."}
              {activeTab === "inventory" &&
                "Manage comprehensive medical products catalog, batches, active formulas, and availability."}
              {activeTab === "add-medicine" &&
                "Register new pharmaceutical batches, therapeutic classifications, and initial units."}
              {activeTab === "stock" &&
                "Monitor inventory stock levels, restock critical medicines, and prevent stock-outs."}
              {activeTab === "expiry" &&
                "Track pharmaceutical expiration timelines, quarantine near-expiry lots, and maintain safety."}
              {activeTab === "sales" &&
                "Dispense prescribed medications, calculate pricing, and register transaction logs."}
              {activeTab === "sales-history" &&
                "Audited log of all dispensed medicines, patient receipts, and payment breakdowns."}
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
              onClick={() => navigate("/pharmacy/inventory")}
              style={{ cursor: "pointer" }}
              title="View Medicine Inventory"
            >
              <div className="stat-label">Total Units In Stock</div>
              <div className="stat-value text-blue">{totalStock.toLocaleString()}</div>
              <div className="trend-badge trend-up">
                <Boxes size={13} /> {medicines.length} Medicines Cataloged
              </div>
            </div>

            <div
              className="card card-stat"
              onClick={() => navigate("/pharmacy/stock")}
              style={{ cursor: "pointer" }}
              title="View Low Stock Items"
            >
              <div className="stat-label">Low / Critical Stock</div>
              <div className="stat-value text-amber">{lowStockCount} Items</div>
              <div className="trend-badge trend-down">
                <AlertTriangle size={13} /> Reorder threshold reached
              </div>
            </div>

            <div
              className="card card-stat"
              onClick={() => navigate("/pharmacy/expiry")}
              style={{ cursor: "pointer" }}
              title="View Expiring Medicines"
            >
              <div className="stat-label">Expiring Soon (30d)</div>
              <div className="stat-value text-red">{expiringSoonCount} Batches</div>
              <div className="trend-badge trend-down">
                <Calendar size={13} /> Quarantine inspection needed
              </div>
            </div>

            <div
              className="card card-stat"
              onClick={() => navigate("/pharmacy/sales-history")}
              style={{ cursor: "pointer" }}
              title="View Sales History"
            >
              <div className="stat-label">Dispensary Revenue</div>
              <div className="stat-value text-green">${(totalRevenue + 4300).toFixed(2)}</div>
              <div className="trend-badge trend-up">
                <TrendingUp size={13} /> +14.2% Prescription Growth
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
                    <option value="Antibiotic">Antibiotic</option>
                    <option value="Analgesic">Analgesic</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Antidiabetic">Antidiabetic</option>
                    <option value="Gastrointestinal">Gastrointestinal</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="General">General</option>
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
                  * All required fields will be logged with batch traceability and catalog reference.
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
          <div className="card pharmacy-table-card pharmacy-landscape-card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Dispense Prescription & Record Sale</h2>
                <span className="pharmacy-counter-pill">Point-of-Sale Desk</span>
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
                  <label>Select Medicine to Dispense *</label>
                  <select
                    value={newSale.medicineId}
                    onChange={(e) => setNewSale({ ...newSale, medicineId: e.target.value })}
                    required
                  >
                    {medicines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (${m.price.toFixed(2)}) — Available: {m.stock} units
                      </option>
                    ))}
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
                    <option value="Card">Credit / Debit Card</option>
                    <option value="Insurance">Health Insurance</option>
                  </select>
                </div>

                {/* 3. Patient Name */}
                <div className="form-group">
                  <label>Patient Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Ahmed Mansoor"
                    value={newSale.patientName}
                    onChange={(e) => setNewSale({ ...newSale, patientName: e.target.value })}
                    required
                  />
                </div>

                {/* 4. Doctor Name */}
                <div className="form-group">
                  <label>Prescribing Doctor</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Sarah Mitchell"
                    value={newSale.doctorName}
                    onChange={(e) => setNewSale({ ...newSale, doctorName: e.target.value })}
                  />
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
                const selected = medicines.find((m) => m.id === newSale.medicineId);
                const subtotal = selected ? selected.price * Number(newSale.quantity || 0) : 0;
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
                  * Dispense confirmation will immediately deduct inventory units and generate a transaction receipt.
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
                  {medicines.filter((m) => m.stock <= m.minStock).length} Items Need Reorder
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
                    const isLow = Number(med.stock) <= Number(med.minStock);
                    const percent = Math.min(100, Math.round((med.stock / (med.minStock * 2)) * 100));
                    return (
                      <tr key={med.id}>
                        <td>
                          <span className="invoice-code">{med.id}</span>
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
                        <td>{med.minStock} units</td>
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
                            {med.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                            <button
                              className="btn-pay-now"
                              onClick={() => handleRestock(med.id, 50)}
                              title="Restock +50 units"
                            >
                              +50 Units
                            </button>
                            <button
                              className="btn-pay-now"
                              onClick={() => handleRestock(med.id, 100)}
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
                    const isExpiring = med.expiry.startsWith("2026-11");
                    return (
                      <tr key={med.id}>
                        <td>
                          <span className="invoice-code">{med.id}</span>
                        </td>
                        <td>
                          <div className="med-name-cell">
                            <span className="med-icon">💊</span>
                            <strong>{med.name}</strong>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontFamily: "monospace", fontWeight: 600 }}>
                            {med.batch}
                          </span>
                        </td>
                        <td>
                          <strong className={isExpiring ? "expiry-urgent" : "expiry-normal"}>
                            {med.expiry}
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
                              background: isExpiring ? "#fee2e2" : "#e0f2fe",
                              color: isExpiring ? "#dc2626" : "#0284c7",
                              borderColor: isExpiring ? "#fca5a5" : "#bae6fd",
                            }}
                            onClick={() => {
                              toast.info(`Marked lot ${med.batch} for routine inspection.`);
                            }}
                          >
                            {isExpiring ? "Inspect Quarantine" : "Verify Batch"}
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
                  {filteredSales.length} Transactions Recorded
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
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale.id}>
                      <td>
                        <span className="invoice-code">{sale.id}</span>
                      </td>
                      <td>
                        <strong>{sale.patient}</strong>
                      </td>
                      <td>{sale.doctor}</td>
                      <td>{sale.items}</td>
                      <td>
                        <strong className="text-green">${sale.total.toFixed(2)}</strong>
                      </td>
                      <td>
                        <span className="billing-method-pill">{sale.payment}</span>
                      </td>
                      <td>{sale.time}</td>
                      <td>
                        <span className="status-pill status-active">
                          <CheckCircle2 size={11} /> {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))}
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
            <div className="card pharmacy-table-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">
                    {activeTab === "dashboard"
                      ? "Dispensary Pharmaceuticals Catalog"
                      : "Master Medicine Inventory"}
                  </h2>
                  <span className="pharmacy-counter-pill">
                    {filteredMedicines.length} Medicines Displayed
                  </span>
                </div>

                {/* Category Filter Pills */}
                <div className="filter-pill-group">
                  {[
                    "All",
                    "Antibiotic",
                    "Analgesic",
                    "Cardiovascular",
                    "Antidiabetic",
                    "Gastrointestinal",
                  ].map((cat) => (
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
                    {filteredMedicines.map((med) => (
                      <tr key={med.id}>
                        <td>
                          <span className="invoice-code">{med.id}</span>
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
                              Number(med.stock) <= Number(med.minStock)
                                ? "low-stock"
                                : "good-stock"
                            }`}
                          >
                            {med.stock} units
                          </span>
                        </td>
                        <td>${med.price.toFixed(2)}</td>
                        <td>{med.batch}</td>
                        <td>
                          <span
                            className={
                              med.status === "Expiring Soon" ? "expiry-urgent" : ""
                            }
                          >
                            {med.expiry}
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
                            {med.status}
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
                              onClick={() => handleRestock(med.id, 100)}
                              title="Restock +100 units"
                            >
                              <RotateCw size={12} /> Restock
                            </button>
                            <button
                              className="btn-action-icon text-danger"
                              onClick={() => handleDeleteMedicine(med.id)}
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
                  <button
                    className="filter-btn-pill"
                    onClick={() => navigate("/pharmacy/sales-history")}
                  >
                    View All Sales →
                  </button>
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
                      {sales.slice(0, 4).map((sale) => (
                        <tr key={sale.id}>
                          <td>
                            <span className="invoice-code">{sale.id}</span>
                          </td>
                          <td>
                            <strong>{sale.patient}</strong>
                          </td>
                          <td>{sale.doctor}</td>
                          <td>{sale.items}</td>
                          <td>
                            <strong className="text-green">${sale.total.toFixed(2)}</strong>
                          </td>
                          <td>
                            <span className="billing-method-pill">{sale.payment}</span>
                          </td>
                          <td>{sale.time}</td>
                          <td>
                            <span className="status-pill status-active">
                              <CheckCircle2 size={11} /> {sale.status}
                            </span>
                          </td>
                        </tr>
                      ))}
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
                  <p>Register new medicine batch into hospital dispensary</p>
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
                      <option value="Antibiotic">Antibiotic</option>
                      <option value="Analgesic">Analgesic</option>
                      <option value="Cardiovascular">Cardiovascular</option>
                      <option value="Antidiabetic">Antidiabetic</option>
                      <option value="Gastrointestinal">Gastrointestinal</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="General">General</option>
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
      </main>
    </div>
  );
}
