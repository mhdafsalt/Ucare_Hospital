import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { pharmacyMenu, adminMenu } from "../../config/panelMenus";
import { useLocation } from "react-router-dom";
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
  FileText,
  Boxes,
  RotateCw,
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
    batch: "AZM-2025-E",
    expiry: "2026-11-18",
    status: "Expiring Soon",
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
  const [medicines, setMedicines] = useState(INITIAL_MEDICINES);
  const [sales, setSales] = useState(INITIAL_SALES);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [userName, setUserName] = useState("Admin");

  const [newMed, setNewMed] = useState({
    name: "",
    category: "Antibiotic",
    stock: "",
    minStock: "",
    price: "",
    batch: "",
    expiry: "",
  });

  // Admin routing check
  const isAdmin = location.pathname.startsWith("/admin");
  const currentMenu = isAdmin ? adminMenu : pharmacyMenu;
  const panelSubtitle = isAdmin ? "HOSPITAL ADMIN" : "PHARMACY DEPT";

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "Administrator");
  }, []);

  // Determine current active subview based on URL pathname
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("inventory")) return "inventory";
    if (path.includes("add-medicine")) return "add-medicine";
    if (path.includes("stock")) return "stock";
    if (path.includes("expiry")) return "expiry";
    if (path.includes("sales-history")) return "sales-history";
    if (path.includes("sales")) return "sales";
    return "dashboard";
  };

  const activeTab = getActiveTab();

  // Statistics
  const totalStock = medicines.reduce((acc, m) => acc + Number(m.stock), 0);
  const lowStockCount = medicines.filter(
    (m) => Number(m.stock) <= Number(m.minStock)
  ).length;
  const expiringSoonCount = medicines.filter((m) =>
    m.expiry.startsWith("2026-11")
  ).length;
  const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);

  const filteredMedicines = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase()) ||
      m.batch.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (categoryFilter !== "All") return m.category === categoryFilter;
    return true;
  });

  const handleAddMedicine = (e) => {
    e.preventDefault();
    if (!newMed.name || !newMed.stock || !newMed.price || !newMed.expiry) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const medEntry = {
      id: `MED-${Math.floor(100 + Math.random() * 900)}`,
      name: newMed.name,
      category: newMed.category,
      stock: Number(newMed.stock),
      minStock: Number(newMed.minStock) || 50,
      price: parseFloat(newMed.price),
      batch: newMed.batch || `BCH-${new Date().getFullYear()}`,
      expiry: newMed.expiry,
      status: Number(newMed.stock) > 50 ? "In Stock" : "Low Stock",
    };
    setMedicines([medEntry, ...medicines]);
    toast.success(`Medicine ${newMed.name} added to dispensary catalog!`);
    setShowAddModal(false);
    setNewMed({
      name: "",
      category: "Antibiotic",
      stock: "",
      minStock: "",
      price: "",
      batch: "",
      expiry: "",
    });
  };

  const handleRestock = (id) => {
    setMedicines(
      medicines.map((m) =>
        m.id === id ? { ...m, stock: Number(m.stock) + 100, status: "In Stock" } : m
      )
    );
    toast.success("Added +100 units to inventory stock.");
  };

  const handleDeleteMedicine = (id) => {
    setMedicines(medicines.filter((m) => m.id !== id));
    toast.info("Medicine record removed.");
  };

  return (
    <div className={`app spark-theme ${isAdmin ? "white-grid-layout" : ""}`}>
      {/* SIDEBAR REMAINS ADMIN MENU WHEN ACCESSED IN ADMIN */}
      <Sidebar menuItems={currentMenu} panelSubtitle={panelSubtitle} />

      <main className="main main-wrapper admin-main-canvas">
        {/* TOP BANNER */}
        <header className="navbar-custom">
          <div className="navbar-left">
            <span className="pharmacy-badge-pill">
              <Pill size={15} />{" "}
              {isAdmin ? "Admin Pharmacy Overview" : "Pharmacy Department Operations"}
            </span>
          </div>

          <div className="navbar-search-wrapper">
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Search medicines, active batches, therapeutic categories..."
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
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} /> Add Medicine
            </button>

            <div className="admin-chip">
              <div className="admin-chip-avatar">{userName.charAt(0)}</div>
              <div>
                <span className="admin-chip-name">{userName}</span>
                <span className="admin-chip-role">
                  {isAdmin ? "Hospital Administrator" : "Clinical Pharmacist"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* HEADER TITLE */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              {isAdmin ? "Pharmacy Overview Dashboard" : "Pharmacy Department Dashboard"}
            </h1>
            <p className="page-subtitle">
              Overview of hospital pharmaceuticals inventory, critical stock alerts, batch expiry tracking, and dispensary revenue.
            </p>
          </div>
        </div>

        {/* KPI CARDS (DASHBOARD & OVERVIEW) */}
        <div className="spark-grid-top">
          <div className="card card-stat">
            <div className="stat-label">Total Units In Stock</div>
            <div className="stat-value">{totalStock.toLocaleString()}</div>
            <div className="trend-badge trend-up">
              <Boxes size={13} /> {medicines.length} Medicines Cataloged
            </div>
          </div>

          <div className="card card-stat">
            <div className="stat-label">Low / Critical Stock</div>
            <div className="stat-value text-amber">{lowStockCount} Items</div>
            <div className="trend-badge trend-down">
              <AlertTriangle size={13} /> Reorder threshold reached
            </div>
          </div>

          <div className="card card-stat">
            <div className="stat-label">Expiring Soon (30d)</div>
            <div className="stat-value text-red">{expiringSoonCount} Batches</div>
            <div className="trend-badge trend-down">
              <Calendar size={13} /> Review quarantine shelf
            </div>
          </div>

          <div className="card card-stat">
            <div className="stat-label">Dispensary Revenue</div>
            <div className="stat-value text-green">${(totalRevenue + 4300).toFixed(2)}</div>
            <div className="trend-badge trend-up">
              <TrendingUp size={13} /> +14.2% Prescription Growth
            </div>
          </div>
        </div>

        {/* MEDICINE INVENTORY TABLE */}
        <div className="card pharmacy-table-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Pharmaceuticals Master Inventory</h2>
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
                      <div className="pharmacy-actions" style={{ justifyContent: "flex-end", display: "flex", gap: "6px" }}>
                        <button
                          className="btn-pay-now"
                          onClick={() => handleRestock(med.id)}
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

        {/* SALES & DISPENSING HISTORY SECTION */}
        <div className="card pharmacy-table-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Recent Prescription Sales & Dispensary Log</h2>
              <span className="pharmacy-counter-pill">
                {sales.length} transactions recorded
              </span>
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
                  <th>Dispense Status</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
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
                      <strong className="text-success">${sale.total.toFixed(2)}</strong>
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

        {/* MODAL: ADD MEDICINE */}
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
                  <label>Medicine Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Ciprofloxacin 500mg"
                    value={newMed.name}
                    onChange={(e) =>
                      setNewMed({ ...newMed, name: e.target.value })
                    }
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
                    <label>Unit Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
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
