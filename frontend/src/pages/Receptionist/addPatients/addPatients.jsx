import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import "./addPatients.css";
import "../../Admin/AdminPharmacist/AddPharmacist.css";
import { toast } from "react-toastify";

import {
    LayoutDashboard,
    Circle,
    HelpCircle,
    Users,
    UserRoundCog,
    Stethoscope,
    Plus,
    Pencil,
    Trash2,
    X,
    CalendarCheck,
    ClipboardList,
    MapPin,
    Phone,
} from "lucide-react";


import {
    FaUsers,
    FaSearch,
    FaUserInjured,
    FaVenusMars,
} from "react-icons/fa";

import {
    addPatientAPI,
    deletePatientAPI,
    getPatientsAPI,
    updatePatientAPI,
    restorePatientAPI,
} from "../../../api/patientApi";
import { receptionistMenu } from "../../../config/panelMenus";

function AddPatients() {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleted, setShowDeleted] = useState(false);
    
    const [userName, setUserName] = useState("Receptionist");
    const [userImage, setUserImage] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        age: "",
        gender: "",
        // disease: "",
        address: "",
        phone: "",
        image: "",
    });

    // ================= FETCH =================

    const fetchPatients = async () => {
        try {
            setLoading(true);

            const res = await getPatientsAPI(showDeleted);

            setPatients(res.data.patients);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setUserName(localStorage.getItem("userName") || "Receptionist");
        setUserImage(localStorage.getItem("userImage") || "");
        fetchPatients();
    }, [showDeleted]);

    // ================= INPUT =================

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // ================= OPEN FORM =================

    const openAddForm = () => {
        setShowForm(true);

        setEditingId(null);

        setFormData({
            name: "",
            age: "",
            gender: "",
            // disease: "",
            address: "",
            phone: "",
            image: "",
        });
    };

    // ================= VALIDATION =================

    const validateForm = () => {
        const {
            name,
            age,
            gender,
            disease,
            address,
            phone,
        } = formData;

        if (!name.trim()) {
            toast.warn("Patient name is required");
            return false;
        }

        if (!age || isNaN(age)) {
            toast.warn("Enter valid age");
            return false;
        }

        if (!gender.trim()) {
            toast.warn("Gender is required");
            return false;
        }

        // if (!disease.trim()) {
        //   toast.warn("Disease field is required");
        //   return false;
        // }

        if (!address.trim()) {
            toast.warn("Address is required");
            return false;
        }

        if (!phone || phone.length < 10) {
            toast.warn("Enter valid phone number");
            return false;
        }

        return true;
    };

    // ================= ADD =================

    const handleAddPatient = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await addPatientAPI(formData);

            toast.success("Patient added successfully");

            setShowForm(false);

            setFormData({
                name: "",
                age: "",
                gender: "",
                // disease: "",
                address: "",
                phone: "",
                image: "",
            });

            fetchPatients();
        } catch (err) {
            toast.error("Failed to add patient");
        }
    };

    // ================= DELETE =================

    const handleDelete = async (id) => {
        try {
            await deletePatientAPI(id);

            toast.success("Patient moved to trash");

            fetchPatients();
        } catch {
            toast.error("Delete failed");
        }
    };

    // ================= EDIT =================

    const handleEdit = (patient) => {
        setShowForm(true);

        setEditingId(patient._id);

        setFormData(patient);
    };

    // ================= UPDATE =================

    const handleUpdatePatient = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await updatePatientAPI(editingId, formData);

            toast.success("Patient updated successfully");

            setShowForm(false);

            setEditingId(null);

            fetchPatients();
        } catch (err) {
            toast.error("Failed to update patient");
        }
    };

    // ================= RESTORE =================

    const handleRestorePatient = async (id) => {
        try {
            await restorePatientAPI(id);

            toast.success("Patient restored");

            fetchPatients();
        } catch {
            toast.error("Restore failed");
        }
    };

    // ================= SEARCH =================

    const filteredPatients = patients.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="app">

            {/* SIDEBAR */}

            <Sidebar
                logo="Ucare."
                menuItems={receptionistMenu}
            />

            {/* MAIN */}

            <main className="main">

                {/* ================= HEADER ================= */}

                <div className="Doctors-header">

                    <div className="doctors-header-content">

                        <div>
                            <h1>Patients Management</h1>

                            <p className="doctors-caption">
                                Manage hospital patients and medical records efficiently.
                            </p>
                        </div>

                        <div className="admin-profile">

                             <div className="admin-profile-circle">
                                <span>{userName?.charAt(0)}</span>
                            </div>

                            <div>
                                <h3>{userName}</h3>
                                <p>Receptionist</p>
                            </div>

                        </div>

                    </div>

                    <hr />

                </div>

                {/* ================= MAIN ================= */}

                <div className="main-container">

                    {/* TOPBAR */}

                    <div className="doctors-topbar">

                        <div>
                            <h2 className="dashboard-page-title">
                                Patients List
                            </h2>

                            <p className="dashboard-page-subtitle">
                                Add, update and manage patient details.
                            </p>
                        </div>

                        <div className="doctors-actions-top">

                            <input
                                className="doctors-search"
                                placeholder="Search patient..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                            <button
                                onClick={openAddForm}
                                className="doctors-addBtn"
                            >
                                <Plus size={18} />
                                Add Patient
                            </button>

                            <button
                                type="button"
                                className="doctors-restoreBtn"
                                onClick={() => setShowDeleted(!showDeleted)}
                                style={{ marginLeft: "10px" }}
                            >
                                {showDeleted ? "View Active" : "View Trash"}
                            </button>

                        </div>

                    </div>

                    {/* MODAL POPUP FOR ADD / EDIT PATIENT */}
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
                                            <h3>{editingId ? "Update Patient Record" : "Register New Patient"}</h3>
                                            <p>{editingId ? "Modify demographic or contact details" : "Record patient credentials and medical contact information"}</p>
                                        </div>
                                        <button onClick={() => setShowForm(false)} className="close-btn">
                                            <X size={18} />
                                        </button>
                                    </div>

                                    <form
                                        onSubmit={
                                            editingId
                                                ? handleUpdatePatient
                                                : handleAddPatient
                                        }
                                        className="staff-form-grid"
                                    >
                                        <div className="form-group">
                                            <label>Full Patient Name *</label>
                                            <input
                                                name="name"
                                                placeholder="e.g. John Doe"
                                                onChange={handleChange}
                                                value={formData.name}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Age *</label>
                                            <input
                                                type="number"
                                                name="age"
                                                placeholder="e.g. 32"
                                                onChange={handleChange}
                                                value={formData.age}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Gender *</label>
                                            <select
                                                name="gender"
                                                onChange={handleChange}
                                                value={formData.gender}
                                                required
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Phone Number *</label>
                                            <input
                                                name="phone"
                                                placeholder="e.g. +1 (555) 019-2834"
                                                onChange={handleChange}
                                                value={formData.phone}
                                                required
                                            />
                                        </div>

                                        <div className="form-group full-width">
                                            <label>Residential Address *</label>
                                            <input
                                                name="address"
                                                placeholder="e.g. 124 Medical Plaza, Suite 4B, New York"
                                                onChange={handleChange}
                                                value={formData.address}
                                                required
                                            />
                                        </div>

                                        <div className="form-group full-width">
                                            <label>Profile Image URL (optional)</label>
                                            <input
                                                name="image"
                                                placeholder="https://..."
                                                onChange={handleChange}
                                                value={formData.image}
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
                                            <button
                                                type="submit"
                                                className="btn-submit"
                                            >
                                                {editingId
                                                    ? "Update Patient"
                                                    : "Save Patient"}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* ================= TABLE CONTAINER ================= */}
                    <div className="patients-table-container">

                        {/* LOADING */}
                        {loading && (
                            <div className="patients-loading">
                                <div className="table-spinner"></div>
                                <p>Loading patient records...</p>
                            </div>
                        )}

                        {/* EMPTY STATE */}
                        {!loading && filteredPatients.length === 0 && (
                            <div className="empty-state-card">
                                <div className="empty-icon-box">
                                    <Users size={36} />
                                </div>
                                <h4>{showDeleted ? "Trash is Empty" : "No Patients Found"}</h4>
                                <p>
                                    {showDeleted
                                        ? "There are no deleted patient records in the trash bin."
                                        : search
                                        ? `No registered patients matching "${search}" were found.`
                                        : "No patient records have been added to the system yet."}
                                </p>
                                {!showDeleted && (
                                    <button onClick={openAddForm} className="empty-action-btn">
                                        <Plus size={16} /> Register New Patient
                                    </button>
                                )}
                            </div>
                        )}

                        {/* TABLE */}
                        {!loading && filteredPatients.length > 0 && (
                            <table className="patients-table">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Age</th>
                                        <th>Gender</th>
                                        <th>Address</th>
                                        <th>Phone</th>
                                        <th style={{ textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredPatients.map((patient) => (
                                        <tr key={patient._id}>
                                            {/* PATIENT INFO */}
                                            <td className="patient-info-cell">
                                                <div className="patient-avatar">
                                                    {patient.image ? (
                                                        <img
                                                            src={patient.image}
                                                            alt={patient.name}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src =
                                                                    "https://cdn-icons-png.flaticon.com/512/3774/3774299.png";
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="patient-avatar-fallback">
                                                            {patient.name?.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="patient-name">
                                                        {patient.name}
                                                    </div>
                                                    <span style={{ fontSize: "11px", color: "#64748b" }}>
                                                        ID: #{patient._id?.slice(-6).toUpperCase()}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* AGE */}
                                            <td>
                                                <span className="badge-age">{patient.age} yrs</span>
                                            </td>

                                            {/* GENDER */}
                                            <td>
                                                <span className={`badge-gender ${patient.gender?.toLowerCase() || ""}`}>
                                                    {patient.gender}
                                                </span>
                                            </td>

                                            {/* ADDRESS */}
                                            <td>
                                                <span className="cell-address" title={patient.address}>
                                                    <MapPin size={13} style={{ flexShrink: 0, color: "#94a3b8" }} />
                                                    {patient.address}
                                                </span>
                                            </td>

                                            {/* PHONE */}
                                            <td>
                                                <span className="cell-phone">
                                                    <Phone size={13} style={{ flexShrink: 0, color: "#94a3b8" }} />
                                                    {patient.phone}
                                                </span>
                                            </td>

                                            {/* ACTIONS */}
                                            <td style={{ textAlign: "right" }}>
                                                {showDeleted ? (
                                                    <button
                                                        onClick={() =>
                                                            handleRestorePatient(patient._id)
                                                        }
                                                        className="patients-restoreBtn"
                                                    >
                                                        Restore
                                                    </button>
                                                ) : (
                                                    <div className="patients-actions" style={{ justifyContent: "flex-end" }}>
                                                        <button
                                                            onClick={() => handleEdit(patient)}
                                                            className="patients-editBtn"
                                                            title="Edit Patient"
                                                        >
                                                            <Pencil size={15} />
                                                        </button>

                                                        <button
                                                            onClick={() => handleDelete(patient._id)}
                                                            className="patients-deleteBtn"
                                                            title="Delete Patient"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                </div>

            </main>
        </div>
    );
}

export default AddPatients;