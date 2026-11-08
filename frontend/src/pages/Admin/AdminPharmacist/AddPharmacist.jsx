import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import "./AddPharmacist.css";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  RotateCcw,
  Eye,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getPharmacistsAPI,
  addPharmacistAPI,
  updatePharmacistAPI,
  togglePharmacistStatusAPI,
  deletePharmacistAPI,
  restorePharmacistAPI,
} from "../../../api/pharmacistApi";
import { adminMenu } from "../../../config/panelMenus";

function AddPharmacist() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewStaff, setViewStaff] = useState(null);
  const [search, setSearch] = useState("");
  const [pharmacists, setPharmacists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  const [userName, setUserName] = useState("Admin");

  const [formData, setFormData] = useState({
    pharmacistId: "",
    name: "",
    email: "",
    phone: "",
    licenseNumber: "",
    shift: "Morning",
    image: "",
    status: "Active",
  });

  const fetchPharmacists = async () => {
    try {
      setLoading(true);
      const res = await getPharmacistsAPI(showDeleted);
      setPharmacists(res.data.pharmacists || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load pharmacists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "Admin");
    fetchPharmacists();
  }, [showDeleted]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddForm = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      pharmacistId: `PH-${Math.floor(100 + Math.random() * 900)}`,
      name: "",
      email: "",
      phone: "",
      licenseNumber: "",
      shift: "Morning",
      image: "https://images.unsplash.com/photo-1594824813580-0a1f04dbf532?w=400&auto=format&fit=crop&q=80",
      status: "Active",
    });
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setFormData({
      pharmacistId: p.pharmacistId,
      name: p.name,
      email: p.email,
      phone: p.phone,
      licenseNumber: p.licenseNumber || "",
      shift: p.shift,
      image: p.image || "",
      status: p.status,
    });
    setShowForm(true);
  };

  const validateForm = () => {
    const { pharmacistId, name, email, phone } = formData;
    if (!pharmacistId.trim()) {
      toast.warn("Pharmacist ID required");
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
        await updatePharmacistAPI(editingId, formData);
        toast.success("Pharmacist updated successfully");
      } else {
        await addPharmacistAPI(formData);
        toast.success("Pharmacist created with login credentials");
      }
      setShowForm(false);
      fetchPharmacists();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleToggleStatus = async (p) => {
    const newStatus = p.status === "Active" ? "Inactive" : "Active";
    try {
      await togglePharmacistStatusAPI(p._id, newStatus);
      toast.success(`Account marked ${newStatus}`);
      fetchPharmacists();
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Move this pharmacist to trash?")) return;
    try {
      await deletePharmacistAPI(id);
      toast.success("Moved to trash");
      fetchPharmacists();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleRestore = async (id) => {
    try {
      await restorePharmacistAPI(id);
      toast.success("Pharmacist restored");
      fetchPharmacists();
    } catch (err) {
      toast.error("Restore failed");
    }
  };

  const filtered = pharmacists.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.pharmacistId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app spark-theme">
      <Sidebar menuItems={adminMenu} />

      <main className="main main-wrapper">
        {/* HEADER */}
        <div className="staff-header-row">
          <div>
            <h1 className="staff-page-title">Pharmacist Management</h1>
            <p className="staff-page-subtitle">
              Manage clinical pharmacy specialists, shifts, license numbers, and system access.
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
              placeholder="Search by name, ID, or email..."
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
              <span>Add Pharmacist</span>
            </button>
          </div>
        </div>

        {/* PHARMACIST GRID DISPLAY (MATCHING DOCTORS & RECEPTIONISTS CARD TYPE) */}
        <div className="doctors-grid-wrapper">
          {loading && (
            <div className="staff-loading-state">Loading pharmacist directory...</div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="staff-empty-state">
              <ShieldCheck size={36} />
              <p>No pharmacists found matching your query.</p>
            </div>
          )}

          <div className="doctors-grid">
            {filtered.map((p) => (
              <div key={p._id} className="doctors-card">
                <div className="doctor-avatar">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://images.unsplash.com/photo-1594824813580-0a1f04dbf532?w=400&auto=format&fit=crop&q=80";
                      }}
                    />
                  ) : (
                    <div className="avatar-fallback">
                      {p.name?.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="doctor-info">
                  <h2>{p.name}</h2>
                  <p>{p.licenseNumber ? `Lic: ${p.licenseNumber}` : "Clinical Pharmacist"} • ID: {p.pharmacistId}</p>
                  <div className="staff-card-badge-row">
                    <span className="doctor-badge">{p.shift} Shift</span>
                    <button
                      type="button"
                      className={`staff-status-pill ${
                        p.status === "Active" ? "status-active" : "status-inactive"
                      }`}
                      onClick={() => handleToggleStatus(p)}
                      title="Click to toggle status"
                      disabled={showDeleted}
                    >
                      {p.status === "Active" ? (
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
                    onClick={() => setViewStaff(p)}
                    title="View Pharmacist Profile"
                  >
                    <Eye size={15} />
                  </button>

                  {showDeleted ? (
                    <button
                      onClick={() => handleRestore(p._id)}
                      className="btn-action-icon text-success"
                      title="Restore Pharmacist"
                    >
                      <RotateCcw size={15} />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(p)}
                        className="btn-action-icon"
                        title="Edit Pharmacist"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        onClick={() => handleDelete(p._id)}
                        className="btn-action-icon text-danger"
                        title="Delete Pharmacist"
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
                    <h3>{editingId ? "Edit Pharmacist Profile" : "Register New Pharmacist"}</h3>
                    <p>Assign credentials, shifts, and hospital dispensary access</p>
                  </div>
                  <button onClick={() => setShowForm(false)} className="close-btn">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="staff-form-grid">
                  <div className="form-group">
                    <label>Pharmacist ID</label>
                    <input
                      name="pharmacistId"
                      value={formData.pharmacistId}
                      onChange={handleChange}
                      placeholder="e.g. PH-101"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Dr. Sarah Jenkins, PharmD"
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
                      placeholder="sarah.jenkins@ucare.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 321-7890"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>License / Registration Number</label>
                    <input
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      placeholder="RPH-992384"
                    />
                  </div>

                  <div className="form-group">
                    <label>Dispensary Shift</label>
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
                      {editingId ? "Save Changes" : "Create Pharmacist Account"}
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
                      "https://images.unsplash.com/photo-1594824813580-0a1f04dbf532?w=400&auto=format&fit=crop&q=80"
                    }
                    alt={viewStaff.name}
                    className="view-avatar-large"
                  />
                  <h4>{viewStaff.name}</h4>
                  <span className="view-role-tag">Pharmacist • {viewStaff.pharmacistId}</span>

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
                      <span className="detail-label">License</span>
                      <span className="detail-val">{viewStaff.licenseNumber || "RPH-Standard"}</span>
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
                      <span className="detail-val">Pharmacist Dashboard Access</span>
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

export default AddPharmacist;

