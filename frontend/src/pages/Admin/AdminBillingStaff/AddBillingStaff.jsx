import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import "../AdminPharmacist/AddPharmacist.css"; // Reuse shared polished staff styling
import {
  Plus,
  Pencil,
  Trash2,
  X,
  RotateCcw,
  Eye,
  CreditCard,
  CheckCircle,
  XCircle,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getBillingStaffAPI,
  addBillingStaffAPI,
  updateBillingStaffAPI,
  toggleBillingStaffStatusAPI,
  deleteBillingStaffAPI,
  restoreBillingStaffAPI,
} from "../../../api/billingStaffApi";
import { adminMenu } from "../../../config/panelMenus";

function AddBillingStaff() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewStaff, setViewStaff] = useState(null);
  const [search, setSearch] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  const [userName, setUserName] = useState("Admin");

  const [formData, setFormData] = useState({
    staffId: "",
    name: "",
    email: "",
    phone: "",
    department: "Inpatient Claims & Insurance",
    shift: "Morning",
    image: "",
    status: "Active",
  });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await getBillingStaffAPI(showDeleted);
      setStaffList(res.data.billingStaff || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load billing staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "Admin");
    fetchStaff();
  }, [showDeleted]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddForm = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      staffId: `BIL-${Math.floor(200 + Math.random() * 800)}`,
      name: "",
      email: "",
      phone: "",
      department: "Inpatient Claims & Insurance",
      shift: "Morning",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      status: "Active",
    });
  };

  const handleEdit = (s) => {
    setEditingId(s._id);
    setFormData({
      staffId: s.staffId,
      name: s.name,
      email: s.email,
      phone: s.phone,
      department: s.department || "Inpatient Claims & Insurance",
      shift: s.shift,
      image: s.image || "",
      status: s.status,
    });
    setShowForm(true);
  };

  const validateForm = () => {
    const { staffId, name, email, phone } = formData;
    if (!staffId.trim()) {
      toast.warn("Staff ID required");
      return false;
    }
    if (!name.trim()) {
      toast.warn("Name required");
      return false;
    }
    if (!email.includes("@")) {
      toast.warn("Valid email required");
      return false;
    }
    if (!phone || phone.length < 7) {
      toast.warn("Valid phone number required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingId) {
        await updateBillingStaffAPI(editingId, formData);
        toast.success("Billing staff updated successfully");
      } else {
        await addBillingStaffAPI(formData);
        toast.success("Billing officer registered with credentials");
      }
      setShowForm(false);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleToggleStatus = async (s) => {
    const newStatus = s.status === "Active" ? "Inactive" : "Active";
    try {
      await toggleBillingStaffStatusAPI(s._id, newStatus);
      toast.success(`Account marked ${newStatus}`);
      fetchStaff();
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Move this staff member to trash?")) return;
    try {
      await deleteBillingStaffAPI(id);
      toast.success("Moved to trash");
      fetchStaff();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreBillingStaffAPI(id);
      toast.success("Staff member restored");
      fetchStaff();
    } catch (err) {
      toast.error("Restore failed");
    }
  };

  const filtered = staffList.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.staffId?.toLowerCase().includes(search.toLowerCase()) ||
      s.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app spark-theme">
      <Sidebar menuItems={adminMenu} />

      <main className="main main-wrapper">
        {/* HEADER */}
        <div className="staff-header-row">
          <div>
            <h1 className="staff-page-title">Billing Staff Management</h1>
            <p className="staff-page-subtitle">
              Manage hospital billing officers, finance specialists, revenue clerks, and accounts access.
            </p>
          </div>
          <div className="admin-chip">
            <div className="admin-chip-avatar">{userName.charAt(0)}</div>
            <div>
              <span className="admin-chip-name">{userName}</span>
              <span className="admin-chip-role">Hospital Administrator</span>
            </div>
          </div>
        </div>

        {/* TOP CONTROLS */}
        <div className="staff-controls-bar">
          <div className="staff-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by name, ID, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="staff-actions-group">
            <button
              className={`btn-filter-toggle ${showDeleted ? "active-trash" : ""}`}
              onClick={() => setShowDeleted(!showDeleted)}
            >
              {showDeleted ? "View Active Records" : "Trash / Archive"}
            </button>
            <button className="btn-primary-action" onClick={openAddForm}>
              <Plus size={16} />
              <span>Add Billing Staff</span>
            </button>
          </div>
        </div>

        {/* BILLING STAFF GRID DISPLAY (MATCHING DOCTORS & RECEPTIONISTS CARD TYPE) */}
        <div className="doctors-grid-wrapper">
          {loading && (
            <div className="staff-loading-state">Loading billing staff directory...</div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="staff-empty-state">
              <CreditCard size={36} />
              <p>No billing staff records found matching your query.</p>
            </div>
          )}

          <div className="doctors-grid">
            {filtered.map((s) => (
              <div key={s._id} className="doctors-card">
                <div className="doctor-avatar">
                  {s.image ? (
                    <img
                      src={s.image}
                      alt={s.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80";
                      }}
                    />
                  ) : (
                    <div className="avatar-fallback">
                      {s.name?.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="doctor-info">
                  <h2>{s.name}</h2>
                  <p>{s.department || "Billing Specialist"} • ID: {s.staffId}</p>
                  <div className="staff-card-badge-row">
                    <span className="doctor-badge">{s.shift} Shift</span>
                    <button
                      type="button"
                      className={`staff-status-pill ${
                        s.status === "Active" ? "status-active" : "status-inactive"
                      }`}
                      onClick={() => handleToggleStatus(s)}
                      title="Click to toggle status"
                      disabled={showDeleted}
                    >
                      {s.status === "Active" ? (
                        <>
                          <CheckCircle size={11} /> Active
                        </>
                      ) : (
                        <>
                          <XCircle size={11} /> Inactive
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="doctors-actions">
                  <button
                    className="btn-action-icon"
                    onClick={() => setViewStaff(s)}
                    title="View Billing Staff Profile"
                  >
                    <Eye size={15} />
                  </button>

                  {showDeleted ? (
                    <button
                      onClick={() => handleRestore(s._id)}
                      className="btn-action-icon text-success"
                      title="Restore Staff"
                    >
                      <RotateCcw size={15} />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(s)}
                        className="btn-action-icon"
                        title="Edit Information"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        onClick={() => handleDelete(s._id)}
                        className="btn-action-icon text-danger"
                        title="Delete Staff"
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MODAL / SIDE FORM FOR ADD/EDIT */}
        <AnimatePresence>
          {showForm && (
            <div className="staff-modal-backdrop" onClick={() => setShowForm(false)}>
              <motion.div
                className="staff-modal-box"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="staff-modal-header">
                  <div>
                    <h3>{editingId ? "Edit Billing Staff" : "Add Billing Staff Member"}</h3>
                    <p>Assign credentials, department, and billing terminal permissions</p>
                  </div>
                  <button onClick={() => setShowForm(false)} className="close-btn">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="staff-form-grid">
                  <div className="form-group">
                    <label>Staff ID</label>
                    <input
                      name="staffId"
                      value={formData.staffId}
                      onChange={handleChange}
                      placeholder="e.g. BIL-201"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Rachel Morgan"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Work Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="rachel.morgan@ucare.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 876-5432"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Department / Desk</label>
                    <input
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. Inpatient Claims & Insurance"
                    />
                  </div>

                  <div className="form-group">
                    <label>Assigned Shift</label>
                    <select name="shift" value={formData.shift} onChange={handleChange}>
                      <option value="Morning">Morning (08:00 - 16:00)</option>
                      <option value="Evening">Evening (16:00 - 00:00)</option>
                      <option value="Night">Night (00:00 - 08:00)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                      <option value="Active">Active (Permitted)</option>
                      <option value="Inactive">Inactive (Suspended)</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Profile Image URL</label>
                    <input
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="form-actions-row full-width">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-submit">
                      {editingId ? "Save Changes" : "Register Billing Staff"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* VIEW DETAILS MODAL */}
        <AnimatePresence>
          {viewStaff && (
            <div className="staff-modal-backdrop" onClick={() => setViewStaff(null)}>
              <motion.div
                className="staff-view-card"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
              >
                <div className="view-card-header">
                  <h3>Staff Profile Card</h3>
                  <button onClick={() => setViewStaff(null)} className="close-btn">
                    <X size={18} />
                  </button>
                </div>
                <div className="view-card-body">
                  <img
                    src={
                      viewStaff.image ||
                      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"
                    }
                    alt={viewStaff.name}
                    className="view-avatar-large"
                  />
                  <h4>{viewStaff.name}</h4>
                  <span className="view-role-tag">Billing Staff • {viewStaff.staffId}</span>

                  <div className="view-details-grid">
                    <div className="view-detail-item">
                      <span className="detail-label">Email</span>
                      <span className="detail-val">{viewStaff.email}</span>
                    </div>
                    <div className="view-detail-item">
                      <span className="detail-label">Phone</span>
                      <span className="detail-val">{viewStaff.phone}</span>
                    </div>
                    <div className="view-detail-item">
                      <span className="detail-label">Department</span>
                      <span className="detail-val">{viewStaff.department}</span>
                    </div>
                    <div className="view-detail-item">
                      <span className="detail-label">Shift</span>
                      <span className="detail-val">{viewStaff.shift}</span>
                    </div>
                    <div className="view-detail-item">
                      <span className="detail-label">Account Status</span>
                      <span
                        className={`staff-status-pill ${
                          viewStaff.status === "Active" ? "status-active" : "status-inactive"
                        }`}
                      >
                        {viewStaff.status}
                      </span>
                    </div>
                    <div className="view-detail-item">
                      <span className="detail-label">System Role</span>
                      <span className="detail-val">Billing & Invoicing Panel Access</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default AddBillingStaff;

