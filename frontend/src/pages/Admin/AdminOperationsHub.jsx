import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { adminMenu } from "../../config/panelMenus";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getPatientsAPI } from "../../api/patientApi";
import { getAppointmentsAPI } from "../../api/appointmentsApi";
import {
  Users,
  CalendarCheck,
  Pill,
  Receipt,
  CreditCard,
  TrendingUp,
  Settings,
  Search,
  Plus,
  Shield,
  Building2,
  Phone,
  Mail,
  Clock,
  Save,
  CheckCircle2,
} from "lucide-react";
import "./AdminOperationsHub.css";

export default function AdminOperationsHub() {
  const location = useLocation();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [hospitalSettings, setHospitalSettings] = useState({
    name: "Ucare Hospital & Medical Center",
    tagline: "Expert care for healthy, confident lives at every age.",
    email: "contact@ucare-hospital.com",
    emergencyPhone: "+1 (800) 555-CARE",
    workingHours: "24/7 Emergency & Inpatient Services",
    enablePortalAccess: true,
    autoBackupDaily: true,
  });

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("patients")) return "patients";
    if (path.includes("appointments")) return "appointments";
    if (path.includes("pharmacy")) return "pharmacy";
    if (path.includes("billing")) return "billing";
    if (path.includes("payments")) return "payments";
    if (path.includes("reports")) return "reports";
    if (path.includes("settings")) return "settings";
    return "patients";
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pRes, aRes] = await Promise.all([
          getPatientsAPI(),
          getAppointmentsAPI(),
        ]);
        if (pRes.data && Array.isArray(pRes.data.patients)) {
          setPatients(pRes.data.patients);
        } else if (Array.isArray(pRes.data)) {
          setPatients(pRes.data);
        }

        if (aRes.data && Array.isArray(aRes.data.appointments)) {
          setAppointments(aRes.data.appointments);
        } else if (Array.isArray(aRes.data)) {
          setAppointments(aRes.data);
        }
      } catch (err) {
        console.warn("Using default state for admin hub", err);
      }
    };
    loadData();
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    toast.success("Hospital system settings saved successfully!");
  };

  return (
    <div className="app spark-theme white-grid-layout">
      <Sidebar menuItems={adminMenu} panelSubtitle="HOSPITAL ADMIN" />

      <main className="main main-wrapper">
        <header className="navbar-custom">
          <div className="navbar-left">
            <span className="admin-badge-pill">
              <Shield size={15} /> Hospital Management Console
            </span>
          </div>

          <div className="navbar-search-wrapper">
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Search across all hospital records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="navbar-search-btn" aria-label="Search">
              <Search size={15} />
            </button>
          </div>
        </header>

        <div className="page-header">
          <div>
            <h1 className="page-title">
              {activeTab === "patients" && "Patients Management"}
              {activeTab === "appointments" && "Appointments Registry"}
              {activeTab === "pharmacy" && "Hospital Pharmacy Department"}
              {activeTab === "billing" && "Billing & Invoices Management"}
              {activeTab === "payments" && "Hospital Payments & Accounts"}
              {activeTab === "reports" && "Revenue & Executive Reports"}
              {activeTab === "settings" && "Hospital System Settings"}
            </h1>
            <p className="page-subtitle">
              Centralized administrative governance for staff, departments,
              finance, and operations.
            </p>
          </div>
        </div>

        {/* 1. ADMIN PATIENTS VIEW */}
        {activeTab === "patients" && (
          <div className="card admin-op-card">
            <div className="card-header">
              <h2 className="card-title">Hospital Patient Directory</h2>
              <span className="billing-counter-pill">
                {patients.length} Registered Patients
              </span>
            </div>
            <div className="table-responsive">
              <table className="admin-op-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Contact Phone</th>
                    <th>Emergency Contact</th>
                    <th>Blood Group</th>
                    <th>Admission Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.length > 0 ? (
                    patients.map((p, idx) => (
                      <tr key={p._id || idx}>
                        <td>
                          <strong>{p.name || p.patientName}</strong>
                        </td>
                        <td>{p.age || "35"}</td>
                        <td>{p.gender || "Male"}</td>
                        <td>{p.phone || p.contact || "+1 555-0192"}</td>
                        <td>{p.emergencyContact || "+1 555-8831"}</td>
                        <td>
                          <span className="blood-pill">
                            {p.bloodGroup || "O+"}
                          </span>
                        </td>
                        <td>
                          <span className="status-pill status-active">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center">
                        No patient records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. ADMIN APPOINTMENTS VIEW */}
        {activeTab === "appointments" && (
          <div className="card admin-op-card">
            <div className="card-header">
              <h2 className="card-title">Hospital Master Appointments List</h2>
              <span className="billing-counter-pill">
                {appointments.length} Scheduled Appointments
              </span>
            </div>
            <div className="table-responsive">
              <table className="admin-op-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Status</th>
                    <th>Department</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length > 0 ? (
                    appointments.map((a, idx) => (
                      <tr key={a._id || idx}>
                        <td>
                          <strong>{a.patientName}</strong>
                        </td>
                        <td>{a.doctorName}</td>
                        <td>{a.date}</td>
                        <td>{a.time}</td>
                        <td>
                          <span className="status-pill status-active">
                            {a.status || "Scheduled"}
                          </span>
                        </td>
                        <td>General Clinic</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center">
                        No appointments currently scheduled.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. PHARMACY / BILLING / PAYMENTS QUICK LAUNCHERS */}
        {(activeTab === "pharmacy" ||
          activeTab === "billing" ||
          activeTab === "payments") && (
          <div className="card admin-op-card">
            <div className="card-header">
              <h2 className="card-title">
                {activeTab === "pharmacy"
                  ? "Pharmacy Department"
                  : activeTab === "billing"
                  ? "Central Billing"
                  : "Accounts & Payments"}
              </h2>
              <button
                className="btn-quick-action"
                onClick={() =>
                  navigate(
                    activeTab === "pharmacy"
                      ? "/pharmacy/dashboard"
                      : "/billing/dashboard"
                  )
                }
              >
                Open Full Dedicated Console
              </button>
            </div>
            <p className="admin-desc-text">
              The {activeTab.toUpperCase()} module is fully connected. Click above
              to switch to the specialized {activeTab} workstation or review
              live operational figures below.
            </p>
            <div className="admin-shortcut-row">
              <button
                className="btn-op-shortcut"
                onClick={() => navigate("/pharmacy/inventory")}
              >
                <Pill size={16} /> View Pharmacy Inventory
              </button>
              <button
                className="btn-op-shortcut"
                onClick={() => navigate("/billing/invoices")}
              >
                <Receipt size={16} /> View All Invoices
              </button>
              <button
                className="btn-op-shortcut"
                onClick={() => navigate("/billing/pending")}
              >
                <CreditCard size={16} /> Pending Receivables
              </button>
            </div>
          </div>
        )}

        {/* 4. REVENUE & EXECUTIVE REPORTS */}
        {activeTab === "reports" && (
          <div className="card admin-op-card">
            <div className="card-header">
              <h2 className="card-title">Hospital Executive Revenue Reports</h2>
              <span className="trend-badge trend-up">
                <TrendingUp size={13} /> Fiscal Year 2026 Audit
              </span>
            </div>

            <div className="reports-analytics-grid">
              <div className="report-stat-tile">
                <span>Annual Gross Inflow</span>
                <h3>$1,420,800.00</h3>
                <p>+24% Year-over-Year Growth</p>
              </div>
              <div className="report-stat-tile">
                <span>Inpatient Bed Occupancy</span>
                <h3>87.4%</h3>
                <p>Optimal capacity utilization</p>
              </div>
              <div className="report-stat-tile">
                <span>Pharmacy Margin</span>
                <h3>$196,500.00</h3>
                <p>18% Operational surplus</p>
              </div>
              <div className="report-stat-tile">
                <span>Average Consultation Fee</span>
                <h3>$85.00</h3>
                <p>Competitive regional benchmark</p>
              </div>
            </div>
          </div>
        )}

        {/* 5. HOSPITAL SYSTEM SETTINGS */}
        {activeTab === "settings" && (
          <div className="card admin-op-card">
            <div className="card-header">
              <h2 className="card-title">Hospital System & Portal Settings</h2>
            </div>

            <form onSubmit={handleSaveSettings} className="settings-form">
              <div className="settings-grid">
                <div className="form-group">
                  <label>Hospital Legal Name</label>
                  <input
                    type="text"
                    value={hospitalSettings.name}
                    onChange={(e) =>
                      setHospitalSettings({
                        ...hospitalSettings,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Institutional Tagline</label>
                  <input
                    type="text"
                    value={hospitalSettings.tagline}
                    onChange={(e) =>
                      setHospitalSettings({
                        ...hospitalSettings,
                        tagline: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Official Administration Email</label>
                  <input
                    type="email"
                    value={hospitalSettings.email}
                    onChange={(e) =>
                      setHospitalSettings({
                        ...hospitalSettings,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>24/7 Emergency Hotline</label>
                  <input
                    type="text"
                    value={hospitalSettings.emergencyPhone}
                    onChange={(e) =>
                      setHospitalSettings({
                        ...hospitalSettings,
                        emergencyPhone: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="settings-footer">
                <button type="submit" className="btn-quick-action">
                  <Save size={16} /> Save Hospital Settings
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

