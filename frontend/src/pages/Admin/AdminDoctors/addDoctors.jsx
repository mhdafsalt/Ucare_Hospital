import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { motion } from "framer-motion";
import "./addDocters.css";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  LayoutDashboard,
  Circle,
  HelpCircle,
  Stethoscope,
  UserRoundCog,
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import {
  addDoctorAPI,
  deleteDoctorAPI,
  getDoctorsAPI,
  updateDoctorAPI,
  restoreDoctorAPI,
} from "../../../api/doctorApi";

const menuItems = [
  {
    title: "MENU",
    items: [
      { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/admin/dashboard" },
      { name: "Doctors", icon: <Stethoscope size={18} />, path: "/admin/add-doctor", active: true },
      { name: "Receptionist", icon: <UserRoundCog size={18} />, path: "/admin/add-receptionist" },
      // { name: "About-us", icon: <Circle size={18} /> },
    ],
  },
  {
    title: "USER",
    items: [
      // { name: "Clients", icon: <Users size={18} /> },
      { name: "Help & Support", icon: <HelpCircle size={18} />, path: "/admin/ListSupport" },
    ],
  },
];

function AddDoctors() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  const [userName, setUserName] = useState("Admin");
  const [userImage, setUserImage] = useState("");

  const [formData, setFormData] = useState({

    doctorId: "",
    name: "",
    specialization: "",
    experience: "",
    email: "",
    phone: "",
    image: "",

  });

  // ================= FETCH =================
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await getDoctorsAPI(showDeleted);
      setDoctors(res.data.doctors);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "Admin");
    setUserImage(localStorage.getItem("userImage") || "");
    fetchDoctors();
  }, [showDeleted]);

  // ================= INPUT =================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ================= ADD =================
  const openAddForm = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      doctorId: "",
      name: "",
      specialization: "",
      experience: "",
      email: "",
      phone: "",
      image: "",
    });
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await addDoctorAPI(formData);

      toast.success("Doctor added successfully");

      setShowForm(false);

      setFormData({
        doctorId: "",
        name: "",
        specialization: "",
        experience: "",
        email: "",
        phone: "",
        image: "",
      });

      fetchDoctors();
    } catch (err) {
      toast.error("Failed to add doctor");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await deleteDoctorAPI(id);
      toast.success("Doctor moved to trash");
      fetchDoctors();
    } catch {
      toast.error("Delete failed");
    }
  };

  // ================= EDIT =================
  const handleEdit = (doctor) => {
    setShowForm(true);
    setEditingId(doctor._id);
    setFormData(doctor);
  };

  // ================= UPDATE =================
  const handleUpdateDoctor = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await updateDoctorAPI(editingId, formData);

      toast.success("Doctor updated successfully");

      setShowForm(false);
      setEditingId(null);

      fetchDoctors();
    } catch (err) {
      toast.error("Failed to update doctor");
    }
  };

  // ================= RESTORE =================
  const handleRestore = () => {
    if (editingId) {
      const doctor = doctors.find((d) => d._id === editingId);
      if (doctor) setFormData(doctor);
    } else {
      setFormData({
        doctorId: "",
        name: "",
        specialization: "",
        experience: "",
        email: "",
        phone: "",
        image: "",
      });
    }
  };

  const validateForm = () => {
    const { doctorId, name, specialization, experience, email, phone } = formData;

    if (!doctorId.trim()) {
      toast.warn("Doctor ID is required");
      return false;
    }

    if (!name.trim()) {
      toast.warn("Name is required");
      return false;
    }

    if (!specialization.trim()) {
      toast.warn("Specialization is required");
      return false;
    }

    if (!experience || isNaN(experience)) {
      toast.warn("Enter valid experience");
      return false;
    }

    if (!email.includes("@")) {
      toast.warn("Enter valid email");
      return false;
    }

    if (!phone || phone.length < 10) {
      toast.warn("Enter valid phone number");
      return false;
    }

    return true;
  };

  // ================= RESTORE DOCTOR (FROM TRASH) =================
  const handleRestoreDoctor = async (id) => {
    try {
      await restoreDoctorAPI(id);
      toast.success("Doctor restored");
      fetchDoctors();
    } catch {
      toast.error("Restore failed");
    }
  };

  const filteredDoctors = doctors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app">

      {/* SIDEBAR */}
      <Sidebar logo="Ucare." menuItems={menuItems} />

      {/* MAIN */}
      <main className="main">

        {/* ================= HEADER (DASHBOARD STYLE) ================= */}
        <div
          className="Doctors-header"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <div className="doctors-header-content">

            <div>
              <h1>Doctors Management</h1>
              <p className="doctors-caption">
                Manage doctors, appointments, and hospital staff efficiently.
              </p>
            </div>

            <div className="admin-profile">

              <div className="admin-profile-circle">
                <span>{userName?.charAt(0)}</span>
              </div>

              <div>
                <h3>{userName}</h3>
                <p>Hospital Manager</p>
              </div>

            </div>

          </div>
          <hr />
        </div>

        {/* ================= MAIN CONTAINER ================= */}
        <div className="main-container">

          {/* TOPBAR */}
          <div className="doctors-topbar">

            <div>
              <h2 className="dashboard-page-title">Doctors List</h2>
              <p className="dashboard-page-subtitle">
                Add, edit, and manage hospital doctors.
              </p>
            </div>

            <div className="doctors-actions-top">

              <input
                className="doctors-search"
                placeholder="Search doctor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button onClick={openAddForm} className="doctors-addBtn">
                <Plus size={18} /> Add Doctor
              </button>

              <button
                type="button"
                className="doctors-restoreBtn"
                onClick={() => setShowDeleted(!showDeleted)}
                style={{ marginLeft: '10px' }}
              >
                {showDeleted ? "View Active" : "View Trash"}
              </button>

            </div>

          </div>

          {/* BODY */}
          <div className="doctors-layout">



            {/* RIGHT FORM PANEL */}
            {showForm && (
              <div className="doctors-sideForm">

                <div className="doctors-modalHeader">
                  <h2>{editingId ? "Update Doctor" : "Add Doctor"}</h2>

                  <button
                    onClick={() => setShowForm(false)}
                    className="doctors-closeBtn"
                  >
                    <X />
                  </button>
                </div>

                <form
                  onSubmit={editingId ? handleUpdateDoctor : handleAddDoctor}
                  className="doctors-form"
                >
                  <input
                    name="doctorId"
                    placeholder="Doctor ID"
                    onChange={(e) =>
                      handleChange({
                        target: {
                          name: "doctorId",
                          value: `DOC${e.target.value.replace("DOC", "")}`,
                        },
                      })
                    }
                    value={formData.doctorId}
                  />
                  <input name="name" placeholder="Name" onChange={handleChange} value={formData.name} />
                  <select
                    name="specialization"
                    onChange={handleChange}
                    value={formData.specialization}
                  >
                    <option value="">Select Specialization</option>

                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Dental">Dental</option>
                    <option value="General Medicine">General Medicine</option>
                  </select>
                  <input name="experience" placeholder="Experience" onChange={handleChange} value={formData.experience} />
                  <input name="email" placeholder="Email" onChange={handleChange} value={formData.email} />
                  <input name="phone" placeholder="Phone" onChange={handleChange} value={formData.phone} />
                  <input name="image" placeholder="Image URL" onChange={handleChange} value={formData.image} />

                  <div className="doctors-form-actions">
                    <button type="submit" className="doctors-submitBtn">
                      {editingId ? "Update Doctor" : "Save Doctor"}
                    </button>

                  </div>
                </form>

              </div>
            )}




            {/* LEFT GRID */}
            <div className="doctors-grid">

              {loading && (
                <div className="doctors-loading">Loading doctors...</div>
              )}

              {!loading && filteredDoctors.length === 0 && (
                <div className="doctors-empty">No doctors found</div>
              )}

              {filteredDoctors.map((doc) => (
                <div key={doc._id} className="doctors-card">

                  <div className="doctor-avatar">
                    {doc.image ? (
                      <img
                        key={doc.image}
                        src={doc.image}
                        alt={doc.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://cdn-icons-png.flaticon.com/512/3774/3774299.png";
                        }}
                      />
                    ) : (
                      <div className="avatar-fallback">
                        {doc.name?.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="doctor-info">
                    <h2>Dr.{doc.name}</h2>
                    <p>{doc.specialization}</p>
                    {/* <p>{doc.doctorId}</p> */}

                    <span className="doctor-badge">
                      {doc.experience} yrs experience
                    </span>
                  </div>

                  <div className="doctors-actions">
                    {showDeleted ? (
                      <button onClick={() => handleRestoreDoctor(doc._id)} className="doctors-submitBtn" style={{ padding: '8px', fontSize: '14px', width: '100%' }}>
                        Restore Doctor
                      </button>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(doc)} className="doctors-editBtn">
                          <Pencil size={16} />
                        </button>

                        <button onClick={() => handleDelete(doc._id)} className="doctors-deleteBtn">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>

                </div>
              ))}

            </div>
          </div>

        </div>

      </main>
    </div>
  );
}

export default AddDoctors;