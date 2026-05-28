import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import "./addPatients.css";
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

const menuItems = [
    {
        title: "MENU",

        items: [
            // {
            //     name: "Dashboard",
            //     icon: <LayoutDashboard size={18} />,
            //     path: "/receptionist/dashboard",
            // },

            {
                name: "Appointments",
                icon: <CalendarCheck size={18} />,
                path: "/receptionist/add-appointment",
            },

            {
                name: "Patients",
                icon: <Users size={18} />,
                path: "/receptionist/add-patient",
                active: true,

            },

            // {
            //     name: "Records",
            //     icon: <ClipboardList size={18} />,
            //     path: "",
            // },

            // {
            //     name: "About-us",
            //     icon: <Circle size={18} />,
            // },
        ],
    },

    {
        title: "SUPPORT",

        items: [
            {
                name: "Help & Support",
                icon: <HelpCircle size={18} />,
                path: "/support",
            },
        ],
    },
];

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
                menuItems={menuItems}
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

                    {/* ================= LAYOUT ================= */}

                    <div className="doctors-layout">

                        {/* FORM */}

                        {showForm && (
                            <div className="doctors-sideForm">

                                <div className="doctors-modalHeader">

                                    <h2>
                                        {editingId
                                            ? "Update Patient"
                                            : "Add Patient"}
                                    </h2>

                                    <button
                                        onClick={() => setShowForm(false)}
                                        className="doctors-closeBtn"
                                    >
                                        <X />
                                    </button>

                                </div>

                                <form
                                    onSubmit={
                                        editingId
                                            ? handleUpdatePatient
                                            : handleAddPatient
                                    }
                                    className="doctors-form"
                                >

                                    <input
                                        name="name"
                                        placeholder="Patient Name"
                                        onChange={handleChange}
                                        value={formData.name}
                                    />

                                    <input
                                        name="age"
                                        placeholder="Age"
                                        onChange={handleChange}
                                        value={formData.age}
                                    />

                                    <select
                                        name="gender"
                                        onChange={handleChange}
                                        value={formData.gender}
                                    >
                                        <option value="">
                                            Select Gender
                                        </option>

                                        <option value="Male">
                                            Male
                                        </option>

                                        <option value="Female">
                                            Female
                                        </option>

                                        <option value="Other">
                                            Other
                                        </option>
                                    </select>

                                    {/* <input
                                        name="disease"
                                        placeholder="Disease"
                                        onChange={handleChange}
                                        value={formData.disease}
                                    /> */}

                                    <input
                                        name="address"
                                        placeholder="Address"
                                        onChange={handleChange}
                                        value={formData.address}
                                    />

                                    <input
                                        name="phone"
                                        placeholder="Phone"
                                        onChange={handleChange}
                                        value={formData.phone}
                                    />

                                    {/* <input
                    name="image"
                    placeholder="Image URL"
                    onChange={handleChange}
                    value={formData.image}
                  /> */}

                                    <div className="doctors-form-actions">

                                        <button
                                            type="submit"
                                            className="doctors-submitBtn"
                                        >
                                            {editingId
                                                ? "Update Patient"
                                                : "Save Patient"}
                                        </button>

                                    </div>

                                </form>

                            </div>
                        )}

                        {/* ================= GRID ================= */}

                        <div className="patients-table-container">

                            {/* LOADING */}
                            {loading && (
                                <div className="patients-loading">
                                    Loading patients...
                                </div>
                            )}

                            {/* EMPTY STATE */}
                            {!loading && filteredPatients.length === 0 && (
                                <div className="patients-empty">
                                    No patients found
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
                                            <th>Actions</th>
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

                                                    <div className="patient-name">
                                                        {patient.name}
                                                    </div>

                                                </td>

                                                {/* AGE */}
                                                <td>{patient.age}</td>

                                                {/* GENDER */}
                                                <td>{patient.gender}</td>

                                                {/* ADDRESS */}
                                                <td>{patient.address}</td>

                                                {/* PHONE */}
                                                <td>{patient.phone}</td>

                                                {/* ACTIONS */}
                                                <td>

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
                                                        <div className="patients-actions">

                                                            <button
                                                                onClick={() => handleEdit(patient)}
                                                                className="patients-editBtn"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>

                                                            <button
                                                                onClick={() => handleDelete(patient._id)}
                                                                className="patients-deleteBtn"
                                                            >
                                                                <Trash2 size={16} />
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

                </div>

            </main>
        </div>
    );
}

export default AddPatients;