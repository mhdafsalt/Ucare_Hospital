import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import "./addReceptionist.css";
import "../AdminPharmacist/AddPharmacist.css"; // Modal styling matching Pharmacist area
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Eye,
  RotateCcw,
  CheckCircle,
  XCircle,
  Search,
  UserRoundCog,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  addReceptionistAPI,
  getReceptionistsAPI,
  updateReceptionistAPI,
  deleteReceptionistAPI,
  restoreReceptionistAPI,
} from "../../../api/receptionistApi";
import { adminMenu } from "../../../config/panelMenus";

function AddReceptionist() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewReceptionist, setViewReceptionist] = useState(null);
  const [search, setSearch] = useState("");
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  const [userName, setUserName] = useState("Admin");

  const [formData, setFormData] = useState({
    receptionistId: "",
    name: "",
    email: "",
    phone: "",
    shift: "Morning",
    receptionistimage: "",
    status: "Active",
  });

  // ================= FETCH =================
  const fetchReceptionists = async () => {
    try {
      setLoading(true);
      const res = await getReceptionistsAPI(showDeleted);
      setReceptionists(res.data.receptionists || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load receptionists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "Admin");
    fetchReceptionists();
  }, [showDeleted]);

  // ================= INPUT =================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ================= OPEN FORM =================
  const openAddForm = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      receptionistId: `REC${Math.floor(100 + Math.random() * 900)}`,
      name: "",
      email: "",
      phone: "",
      shift: "Morning",
      receptionistimage:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      status: "Active",
    });
  };

  // ================= EDIT =================
  const handleEdit = (r) => {
    setShowForm(true);
    setEditingId(r._id);
    setFormData({
      receptionistId: r.receptionistId || "",
      name: r.name || "",
      email: r.email || "",
      phone: r.phone || "",
      shift: r.shift || "Morning",
      receptionistimage: r.receptionistimage || "",
      status: r.status || "Active",
    });
  };

  // ================= VALIDATE =================
  const validateForm = () => {
    const { receptionistId, name, email, phone, shift, receptionistimage } = formData;

    if (!receptionistId.trim()) {
      toast.warn("Receptionist ID required");
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
    if (!shift.trim()) {
      toast.warn("Shift required");
      return false;
    }
    if (!receptionistimage.trim()) {
      toast.warn("Image URL required");
      return false;
    }

    return true;
  };

  // ================= SUBMIT (ADD / UPDATE) =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        ...formData,
        userId: formData.receptionistId,
        role: "receptionist",
      };
      if (editingId) {
        await updateReceptionistAPI(editingId, payload);
        toast.success("Receptionist updated successfully");
      } else {
        await addReceptionistAPI(payload);
        toast.success("Receptionist registered successfully");
      }
      setShowForm(false);
      setEditingId(null);
      fetchReceptionists();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Move this receptionist to trash?")) return;
    try {
      await deleteReceptionistAPI(id);
      toast.success("Receptionist moved to trash");
      fetchReceptionists();
    } catch {
      toast.error("Delete failed");
    }
  };

  // ================= RESTORE =================
  const handleRestore = async (id) => {
    try {
      await restoreReceptionistAPI(id);
      toast.success("Receptionist restored successfully");
      fetchReceptionists();
    } catch {
      toast.error("Restore failed");
    }
  };

  const filtered = receptionists.filter(
    (r) =>
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.email?.toLowerCase().includes(search.toLowerCase()) ||
      r.receptionistId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app spark-theme white-grid-layout">
      <Sidebar logo="Ucare." menuItems={adminMenu} panelSubtitle="HOSPITAL ADMIN" />

      <main className="main main-wrapper admin-main-canvas">
        {/* HEADER */}
        <div className="staff-header-row">
          <div className="staff-header-info">
            <h1 className="staff-page-title">Receptionist Management</h1>
            <p className="staff-page-subtitle">
              Manage front-desk coordinators, admission desks, customer service shifts, and staff credentials.
            </p>
          </div>

          <div className="admin-chip">
            <div className="admin-chip-avatar">{userName?.charAt(0)}</div>
            <div>
              <span className="admin-chip-name">{userName}</span>
              <span className="admin-chip-role">Hospital Administrator</span>
            </div>
          </div>
        </div>

        {/* TOPBAR CONTROLS */}
        <div className="staff-controls-bar">
          <div className="staff-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search receptionist by name, ID, shift..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="staff-actions-group">
            <button
              type="button"
              className={`btn-filter-toggle ${showDeleted ? "active-trash" : ""}`}
              onClick={() => setShowDeleted(!showDeleted)}
            >
              {showDeleted ? "View Active Receptionists" : "Trash / Archive"}
            </button>

            <button onClick={openAddForm} className="btn-primary-action">
              <Plus size={16} />
              <span>Add Receptionist</span>
            </button>
          </div>
        </div>

        {/* RECEPTIONIST GRID / CARDS DISPLAY */}
        <div className="doctors-grid-wrapper">
          {loading && (
            <div className="staff-loading-state">Loading receptionists directory...</div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="staff-empty-state">
              <UserRoundCog size={36} />
              <p>No receptionists found matching your query.</p>
            </div>
          )}

          <div className="doctors-grid">
            {filtered.map((r) => (
              <div key={r._id} className="doctors-card">
                <div className="doctor-avatar">
                  {r.receptionistimage ? (
                    <img
                      src={r.receptionistimage}
                      alt={r.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80";
                      }}
                    />
                  ) : (
                    <div className="avatar-fallback">
                      {r.name?.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="doctor-info">
                  <h2>{r.name}</h2>
                  <p>{r.email}</p>
                  <span className="doctor-badge">{r.shift} Shift</span>
                </div>

                <div className="doctors-actions">
                  <button
                    className="btn-action-icon"
                    onClick={() => setViewReceptionist(r)}
                    title="View Receptionist Profile"
                  >
                    <Eye size={15} />
                  </button>

                  {showDeleted ? (
                    <button
                      onClick={() => handleRestore(r._id)}
                      className="btn-action-icon text-success"
                      title="Restore Receptionist"
                    >
                      <RotateCcw size={15} />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(r)}
                        className="btn-action-icon"
                        title="Edit Receptionist"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        onClick={() => handleDelete(r._id)}
                        className="btn-action-icon text-danger"
                        title="Delete Receptionist"
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

        {/* MODAL POPUP FOR ADD / EDIT RECEPTIONIST (MATCHING PHARMACIST AREA) */}
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
                    <h3>{editingId ? "Edit Receptionist Profile" : "Register New Receptionist"}</h3>
                    <p>Assign credentials, shift schedule, and front-desk permissions</p>
                  </div>
                  <button onClick={() => setShowForm(false)} className="close-btn">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="staff-form-grid">
                  <div className="form-group">
                    <label>Receptionist ID</label>
                    <input
                      name="receptionistId"
                      placeholder="e.g. REC101"
                      value={formData.receptionistId}
                      onChange={(e) =>
                        handleChange({
                          target: {
                            name: "receptionistId",
                            value: `REC${e.target.value.replace("REC", "")}`,
                          },
                        })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      name="name"
                      placeholder="e.g. Emily Clark"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="emily.clark@ucare.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      name="phone"
                      placeholder="+1 (555) 492-1082"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Assigned Shift</label>
                    <select
                      name="shift"
                      value={formData.shift}
                      onChange={handleChange}
                      required
                    >
                      <option value="Morning">Morning (08:00 - 16:00)</option>
                      <option value="Evening">Evening (16:00 - 00:00)</option>
                      <option value="Night">Night (00:00 - 08:00)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status || "Active"}
                      onChange={handleChange}
                    >
                      <option value="Active">Active (Permitted)</option>
                      <option value="Inactive">Inactive (Suspended)</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Profile Image URL</label>
                    <input
                      name="receptionistimage"
                      placeholder="https://..."
                      value={formData.receptionistimage}
                      onChange={handleChange}
                      required
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
                      {editingId ? "Save Changes" : "Register Receptionist"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* VIEW DETAILS MODAL */}
        <AnimatePresence>
          {viewReceptionist && (
            <div className="staff-modal-backdrop" onClick={() => setViewReceptionist(null)}>
              <motion.div
                className="staff-view-card"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
              >
                <div className="view-card-header">
                  <h3>Receptionist Profile Card</h3>
                  <button onClick={() => setViewReceptionist(null)} className="close-btn">
                    <X size={18} />
                  </button>
                </div>
                <div className="view-card-body">
                  <img
                    src={
                      viewReceptionist.receptionistimage ||
                      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"
                    }
                    alt={viewReceptionist.name}
                    className="view-avatar-large"
                  />
                  <h4>{viewReceptionist.name}</h4>
                  <span className="view-role-tag">
                    Front Desk Coordinator • {viewReceptionist.receptionistId}
                  </span>

                  <div className="view-details-grid">
                    <div className="view-detail-item">
                      <span className="detail-label">Email</span>
                      <span className="detail-val">{viewReceptionist.email}</span>
                    </div>
                    <div className="view-detail-item">
                      <span className="detail-label">Phone</span>
                      <span className="detail-val">{viewReceptionist.phone}</span>
                    </div>
                    <div className="view-detail-item">
                      <span className="detail-label">Shift</span>
                      <span className="detail-val">{viewReceptionist.shift}</span>
                    </div>
                    <div className="view-detail-item">
                      <span className="detail-label">Status</span>
                      <span className="staff-status-pill status-active">
                        {viewReceptionist.status || "Active"}
                      </span>
                    </div>
                    <div className="view-detail-item full-width" style={{ gridColumn: "span 2" }}>
                      <span className="detail-label">System Access</span>
                      <span className="detail-val">Front Desk & Receptionist Portal Access</span>
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

export default AddReceptionist;
