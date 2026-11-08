import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import "./addDocters.css";
import "../AdminPharmacist/AddPharmacist.css"; // Modal styling matching Pharmacist area
import { toast } from "react-toastify";

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
  Stethoscope,
} from "lucide-react";

import {
  addDoctorAPI,
  deleteDoctorAPI,
  getDoctorsAPI,
  updateDoctorAPI,
  restoreDoctorAPI,
} from "../../../api/doctorApi";
import { adminMenu } from "../../../config/panelMenus";

function AddDoctors() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewDoctor, setViewDoctor] = useState(null);
  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  const [userName, setUserName] = useState("Admin");

  const [formData, setFormData] = useState({
    doctorId: "",
    name: "",
    specialization: "",
    experience: "",
    email: "",
    phone: "",
    image: "",
    status: "Available",
  });

  // ================= FETCH =================
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await getDoctorsAPI(showDeleted);
      setDoctors(res.data.doctors || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "Admin");
    fetchDoctors();
  }, [showDeleted]);

  // ================= INPUT =================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ================= ADD / OPEN FORM =================
  const openAddForm = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      doctorId: `DOC${Math.floor(100 + Math.random() * 900)}`,
      name: "",
      specialization: "Cardiology",
      experience: "5 Years",
      email: "",
      phone: "",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
      status: "Available",
    });
  };

  // ================= EDIT =================
  const handleEdit = (doctor) => {
    setShowForm(true);
    setEditingId(doctor._id);
    setFormData({
      doctorId: doctor.doctorId || "",
      name: doctor.name || "",
      specialization: doctor.specialization || "General Medicine",
      experience: doctor.experience || "",
      email: doctor.email || "",
      phone: doctor.phone || "",
      image: doctor.image || "",
      status: doctor.status || "Available",
    });
  };

  // ================= VALIDATE =================
  const validateForm = () => {
    const { doctorId, name, specialization, experience, email, phone, image } = formData;
    if (!doctorId.trim()) {
      toast.warn("Doctor ID is required");
      return false;
    }
    if (!name.trim()) {
      toast.warn("Doctor name is required");
      return false;
    }
    if (!specialization.trim()) {
      toast.warn("Specialization is required");
      return false;
    }
    if (!experience.trim()) {
      toast.warn("Experience is required");
      return false;
    }
    if (!email.includes("@")) {
      toast.warn("Valid email is required");
      return false;
    }
    if (!phone || phone.length < 7) {
      toast.warn("Valid phone is required");
      return false;
    }
    if (!image.trim()) {
      toast.warn("Image URL is required");
      return false;
    }
    return true;
  };

  // ================= SUBMIT (ADD / UPDATE) =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingId) {
        await updateDoctorAPI(editingId, formData);
        toast.success("Doctor updated successfully");
      } else {
        await addDoctorAPI(formData);
        toast.success("Doctor registered successfully");
      }
      setShowForm(false);
      setEditingId(null);
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Move this doctor to trash?")) return;
    try {
      await deleteDoctorAPI(id);
      toast.success("Doctor moved to trash");
      fetchDoctors();
    } catch {
      toast.error("Delete failed");
    }
  };

  // ================= RESTORE =================
  const handleRestoreDoctor = async (id) => {
    try {
      await restoreDoctorAPI(id);
      toast.success("Doctor restored successfully");
      fetchDoctors();
    } catch {
      toast.error("Restore failed");
    }
  };

  const filteredDoctors = doctors.filter(
    (d) =>
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization?.toLowerCase().includes(search.toLowerCase()) ||
      d.doctorId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app spark-theme white-grid-layout">
      <Sidebar logo="Ucare." menuItems={adminMenu} panelSubtitle="HOSPITAL ADMIN" />

      <main className="main main-wrapper admin-main-canvas">
        {/* HEADER */}
        <div className="staff-header-row">
          <div>
            <h1 className="staff-page-title">Doctor Management</h1>
            <p className="staff-page-subtitle">
              Manage hospital physicians, clinical specialties, consulting hours, and medical staff records.
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
              placeholder="Search doctor by name, specialty, ID..."
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
              {showDeleted ? "View Active Doctors" : "Trash / Archive"}
            </button>

            <button onClick={openAddForm} className="btn-primary-action">
              <Plus size={16} />
              <span>Add Doctor</span>
            </button>
          </div>
        </div>

        {/* DOCTORS GRID DISPLAY */}
        <div className="doctors-grid-wrapper">
          {loading && (
            <div className="staff-loading-state">Loading doctors directory...</div>
          )}

          {!loading && filteredDoctors.length === 0 && (
            <div className="staff-empty-state">
              <Stethoscope size={36} />
              <p>No doctors found matching your query.</p>
            </div>
          )}

          <div className="doctors-grid">
            {filteredDoctors.map((doc) => (
              <div key={doc._id} className="doctors-card">
                <div className="doctor-avatar">
                  {doc.image ? (
                    <img
                      src={doc.image}
                      alt={doc.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80";
                      }}
                    />
                  ) : (
                    <div className="avatar-fallback">
                      {doc.name?.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="doctor-info">
                  <h2>Dr. {doc.name.replace(/^Dr\.\s*/i, "")}</h2>
                  <p>{doc.specialization}</p>
                  <span className="doctor-badge">
                    {doc.experience} Experience
                  </span>
                </div>

                <div className="doctors-actions">
                  <button
                    className="btn-action-icon"
                    onClick={() => setViewDoctor(doc)}
                    title="View Doctor Profile"
                  >
                    <Eye size={15} />
                  </button>

                  {showDeleted ? (
                    <button
                      onClick={() => handleRestoreDoctor(doc._id)}
                      className="btn-action-icon text-success"
                      title="Restore Doctor"
                    >
                      <RotateCcw size={15} />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(doc)}
                        className="btn-action-icon"
                        title="Edit Doctor"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="btn-action-icon text-danger"
                        title="Delete Doctor"
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

        {/* MODAL POPUP FOR ADD / EDIT DOCTOR (MATCHING PHARMACIST AREA) */}
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
                    <h3>{editingId ? "Edit Doctor Profile" : "Register New Doctor"}</h3>
                    <p>Assign credentials, specialization, and clinical permissions</p>
                  </div>
                  <button onClick={() => setShowForm(false)} className="close-btn">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="staff-form-grid">
                  <div className="form-group">
                    <label>Doctor ID</label>
                    <input
                      name="doctorId"
                      placeholder="e.g. DOC101"
                      value={formData.doctorId}
                      onChange={(e) =>
                        handleChange({
                          target: {
                            name: "doctorId",
                            value: `DOC${e.target.value.replace("DOC", "")}`,
                          },
                        })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Doctor Full Name</label>
                    <input
                      name="name"
                      placeholder="e.g. Alexander Wright"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Specialization</label>
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Specialization</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Dental">Dental</option>
                      <option value="General Medicine">General Medicine</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Surgery">Surgery</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Experience</label>
                    <input
                      name="experience"
                      placeholder="e.g. 8 Years"
                      value={formData.experience}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="doctor@ucare.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      name="phone"
                      placeholder="+1 (555) 019-2831"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Availability Status</label>
                    <select
                      name="status"
                      value={formData.status || "Available"}
                      onChange={handleChange}
                    >
                      <option value="Available">Available (On Duty)</option>
                      <option value="Unavailable">Unavailable (Off Duty)</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Profile Image URL</label>
                    <input
                      name="image"
                      placeholder="https://..."
                      value={formData.image}
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
                      {editingId ? "Save Changes" : "Register Doctor"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* VIEW DETAILS MODAL */}
        <AnimatePresence>
          {viewDoctor && (
            <div className="staff-modal-backdrop" onClick={() => setViewDoctor(null)}>
              <motion.div
                className="staff-view-card"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
              >
                <div className="view-card-header">
                  <h3>Doctor Profile Card</h3>
                  <button onClick={() => setViewDoctor(null)} className="close-btn">
                    <X size={18} />
                  </button>
                </div>
                <div className="view-card-body">
                  <img
                    src={
                      viewDoctor.image ||
                      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80"
                    }
                    alt={viewDoctor.name}
                    className="view-avatar-large"
                  />
                  <h4>Dr. {viewDoctor.name.replace(/^Dr\.\s*/i, "")}</h4>
                  <span className="view-role-tag">
                    {viewDoctor.specialization} • {viewDoctor.doctorId}
                  </span>

                  <div className="view-details-grid">
                    <div className="view-detail-item">
                      <span className="detail-label">Email</span>
                      <span className="detail-val">{viewDoctor.email}</span>
                    </div>
                    <div className="view-detail-item">
                      <span className="detail-label">Phone</span>
                      <span className="detail-val">{viewDoctor.phone}</span>
                    </div>
                    <div className="view-detail-item">
                      <span className="detail-label">Experience</span>
                      <span className="detail-val">{viewDoctor.experience}</span>
                    </div>
                    <div className="view-detail-item">
                      <span className="detail-label">Status</span>
                      <span className="staff-status-pill status-active">
                        {viewDoctor.status || "Available"}
                      </span>
                    </div>
                    <div className="view-detail-item full-width" style={{ gridColumn: "span 2" }}>
                      <span className="detail-label">System Access</span>
                      <span className="detail-val">Doctor Clinical Hub & Consultations Access</span>
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

export default AddDoctors;
