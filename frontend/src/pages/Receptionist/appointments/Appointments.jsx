import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import "./Appointments.css";
import "../../Admin/AdminPharmacist/AddPharmacist.css";
import { toast } from "react-toastify";

import {
    LayoutDashboard,
    Circle,
    HelpCircle,
    Users,
    CalendarCheck,
    ClipboardList,
    Plus,
    Pencil,
    Trash2,
    X,
    Calendar,
    Clock,
    Stethoscope,
} from "lucide-react";



import {
    addAppointmentAPI,
    deleteAppointmentAPI,
    getAppointmentsAPI,
    updateAppointmentAPI,
    restoreAppointmentAPI,
} from "../../../api/appointmentsApi";
import { FaCalendarCheck, FaClipboardList, FaFilter, FaSearch, FaUsers, FaUserTie } from "react-icons/fa";
import { receptionistMenu } from "../../../config/panelMenus";

function Appointments() {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleted, setShowDeleted] = useState(false);
    const [filter, setFilter] = useState("All");
    
    const [userName, setUserName] = useState("Receptionist");
    const [userImage, setUserImage] = useState("");

    const [formData, setFormData] = useState({
        patientName: "",
        doctorName: "",
        date: "",
        time: "",
        status: "Scheduled",
        notes: "",
    });

    const [registeredPatients, setRegisteredPatients] = useState([]);

    // ================= FETCH =================
    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const [appRes, patRes] = await Promise.all([
                getAppointmentsAPI(showDeleted),
                getPatientsAPI(false).catch(() => ({ data: { patients: [] } })),
            ]);
            setAppointments(appRes.data || []);
            const rawPats = Array.isArray(patRes.data?.patients)
                ? patRes.data.patients
                : Array.isArray(patRes.data)
                ? patRes.data
                : [];
            setRegisteredPatients(rawPats);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setUserName(localStorage.getItem("userName") || "Receptionist");
        setUserImage(localStorage.getItem("userImage") || "");
        fetchAppointments();
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
            patientName: "",
            doctorName: "",
            date: "",
            time: "",
            status: "Scheduled",
            notes: "",
        });
    };

    // ================= VALIDATION =================
    const validateForm = () => {
        const { patientName, doctorName, date, time } = formData;

        if (!patientName.trim()) return toast.warn("Patient name required"), false;
        if (!doctorName.trim()) return toast.warn("Doctor name required"), false;
        if (!date) return toast.warn("Date required"), false;
        if (!time) return toast.warn("Time required"), false;

        return true;
    };

    // ================= ADD =================
    const handleAddAppointment = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await addAppointmentAPI(formData);
            toast.success("Appointment added");
            setShowForm(false);
            fetchAppointments();
        } catch {
            toast.error("Failed to add appointment");
        }
    };

    // ================= DELETE =================
    const handleDelete = async (id) => {
        try {
            await deleteAppointmentAPI(id);
            toast.success("Moved to trash");
            fetchAppointments();
        } catch {
            toast.error("Delete failed");
        }
    };

    // ================= EDIT =================
    const handleEdit = (data) => {
        setShowForm(true);
        setEditingId(data._id);
        setFormData({
            ...data,
            date: data.date ? data.date.split("T")[0] : "",
        });
    };

    // ================= UPDATE =================
    const handleUpdateAppointment = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await updateAppointmentAPI(editingId, formData);
            toast.success("Updated successfully");
            setShowForm(false);
            setEditingId(null);
            fetchAppointments();
        } catch {
            toast.error("Update failed");
        }
    };

    // ================= RESTORE =================
    const handleRestore = async (id) => {
        try {
            await restoreAppointmentAPI(id);
            toast.success("Restored");
            fetchAppointments();
        } catch {
            toast.error("Restore failed");
        }
    };

    // ================= FILTER LOGIC =================
    const today = new Date().toISOString().split("T")[0];

    const [stats, setStats] = useState({
        patients: "",
        appointments: "",
        receptionists: ""
    });

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const [patientsRes, appointmentsRes, receptionistsRes] = await Promise.all([
                    getPatientsAPI(),
                    getAppointmentsAPI(),
                    getReceptionistsAPI()
                ]);

                const appointmentsData = appointmentsRes.data?.data || appointmentsRes.data || [];
                const today = new Date().toISOString().split("T")[0];
                const todayAppointments = appointmentsData.filter(a => a.date?.split("T")[0] === today).length;

                setStats({
                    patients: patientsRes.data?.data?.length || patientsRes.data?.length || 0,
                    appointments: todayAppointments,
                    receptionists: receptionistsRes.data?.data?.length || receptionistsRes.data?.length || 0
                });
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            }
        };
        fetchDashboardStats();
    }, []);


    const filteredAppointments = appointments
        .filter((a) =>
            a.patientName?.toLowerCase().includes(search.toLowerCase())
        )
        .filter((a) => {
            const d = a.date?.split("T")[0];

            if (filter === "All") return true;
            if (filter === "Today") return d === today;

            if (filter === "Yesterday") {
                const y = new Date();
                y.setDate(y.getDate() - 1);
                return d === y.toISOString().split("T")[0];
            }

            if (filter === "Scheduled") return a.status === "Scheduled";
            if (filter === "Pending") return a.status === "Pending";
            if (filter === "Completed") return a.status === "Completed";

            return true;
        });

    return (
        <div className="app">

            <Sidebar logo="Ucare." menuItems={receptionistMenu} />

            <main className="main">

                {/* HEADER */}
                <div className="Dashboard-header">

                    <div className="dashboard-header-content">

                        {/* LEFT */}

                        <div>
                            <h1>Welcome Receptionist</h1>

                            <p className="dashboard-caption">
                                Manage appointments, patients, billing and
                                daily hospital activities.
                            </p>
                        </div>

                        {/* RIGHT PROFILE */}

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

                <div className="main-container">

                    {/* TOPBAR */}

                    <div className="dashboard-topbar">

                        <div>
                            <h2 className="dashboard-page-title">
                                Reception Overview
                            </h2>

                            <p className="dashboard-page-subtitle">
                                Monitor appointments and patient consultation schedules.
                            </p>
                        </div>

                        {/* FILTERS */}

                        <div className="dashboard-filters">

                            
                        </div>

                    </div>

                    {/* STATS */}

                    <div className="stats-grid">

                        <div className="stats-card">
                            <div>
                                <p>Total Patients</p>
                                <h2>{stats.patients}</h2>
                            </div>

                            <div className="stats-icon">
                                <FaUsers />
                            </div>
                        </div>

                        <div className="stats-card">
                            <div>
                                <p>Today's Appointments</p>
                                <h2>{stats.appointments}</h2>
                            </div>

                            <div className="stats-icon">
                                <FaCalendarCheck />
                            </div>
                        </div>

                        <div className="stats-card">
                            <div>
                                <p>Reception Staff</p>
                                <h2>{stats.receptionists}</h2>
                            </div>

                            <div className="stats-icon">
                                <FaUserTie />
                            </div>
                        </div>

                    </div>



                    {/* TOP BAR */}
                    <div className="doctors-topbar">

                        <div>
                            <h2>Appointments List</h2>
                            {/* <p>Schedule and manage patient visits</p> */}
                        </div>

                        <div className="doctors-actions-top">

                            <input
                                className="doctors-search"
                                placeholder="Search appointment..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />

                            <button onClick={openAddForm} className="doctors-addBtn">
                                <Plus size={18} /> Add Appointment
                            </button>

                            <button onClick={() => setShowDeleted(!showDeleted)} className="doctors-restoreBtn">
                                {showDeleted ? "View Active" : "View Trash"}
                            </button>

                        </div>
                    </div>

                    {/* FILTERS */}
                    <div className="appointment-filters">
                        {["All", "Yesterday", "Scheduled", "Pending", "Completed"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={filter === f ? "filter-active" : "filter-btn"}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* MODAL POPUP FOR ADD / EDIT APPOINTMENT */}
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
                                    {/* HEADER */}
                                    <div className="staff-modal-header">
                                        <div>
                                            <h3>{editingId ? "Update Appointment" : "Add Appointment"}</h3>
                                            <p>{editingId ? "Modify consultation schedule or update status" : "Schedule a new patient consultation with a doctor"}</p>
                                        </div>
                                        <button onClick={() => setShowForm(false)} className="close-btn">
                                            <X size={18} />
                                        </button>
                                    </div>

                                    {/* FORM */}
                                    <form
                                        onSubmit={
                                            editingId
                                                ? handleUpdateAppointment
                                                : handleAddAppointment
                                        }
                                        className="staff-form-grid"
                                    >
                                        <div className="form-group">
                                            <label>Patient Name *</label>
                                            <input
                                                list="registered-patients-datalist"
                                                name="patientName"
                                                placeholder="e.g. John Doe"
                                                onChange={handleChange}
                                                value={formData.patientName}
                                                required
                                            />
                                            <datalist id="registered-patients-datalist">
                                                {registeredPatients.map((p) => {
                                                    const pId =
                                                        p.patientId ||
                                                        (p._id
                                                            ? `PAT-${String(p._id).slice(-4).toUpperCase()}`
                                                            : "");
                                                    return (
                                                        <option key={p._id || p.name} value={p.name}>
                                                            {p.name} {pId ? `(${pId})` : ""}
                                                        </option>
                                                    );
                                                })}
                                            </datalist>
                                        </div>

                                        <div className="form-group">
                                            <label>Doctor Name *</label>
                                            <input
                                                name="doctorName"
                                                placeholder="e.g. Dr. Sarah Jenkins"
                                                onChange={handleChange}
                                                value={formData.doctorName}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Appointment Date *</label>
                                            <input
                                                type="date"
                                                name="date"
                                                onChange={handleChange}
                                                value={formData.date}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Appointment Time *</label>
                                            <input
                                                type="time"
                                                name="time"
                                                onChange={handleChange}
                                                value={formData.time}
                                                required
                                            />
                                        </div>

                                        <div className="form-group full-width">
                                            <label>Status</label>
                                            <select
                                                name="status"
                                                onChange={handleChange}
                                                value={formData.status}
                                            >
                                                <option value="Scheduled">Scheduled</option>
                                                <option value="Pending">Pending</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </div>

                                        <div className="form-group full-width">
                                            <label>Notes (optional)</label>
                                            <textarea
                                                name="notes"
                                                placeholder="Additional symptoms or consultation remarks..."
                                                onChange={handleChange}
                                                value={formData.notes}
                                                rows={3}
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
                                                    ? "Update Appointment"
                                                    : "Save Appointment"}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* TABLE CONTAINER */}
                    <div className="patients-table-container">

                        {/* LOADING */}
                        {loading && (
                            <div className="patients-loading">
                                <div className="table-spinner"></div>
                                <p>Loading appointments...</p>
                            </div>
                        )}

                        {/* EMPTY STATE */}
                        {!loading && filteredAppointments.length === 0 && (
                            <div className="empty-state-card">
                                <div className="empty-icon-box">
                                    <CalendarCheck size={36} />
                                </div>
                                <h4>{showDeleted ? "Trash is Empty" : "No Appointments Found"}</h4>
                                <p>
                                    {showDeleted
                                        ? "There are no deleted appointments in the trash bin."
                                        : filter !== "All"
                                        ? `No appointments found matching status "${filter}".`
                                        : search
                                        ? `No appointments matching "${search}" were found.`
                                        : "There are currently no scheduled appointments recorded."}
                                </p>
                                {!showDeleted && (
                                    <button onClick={openAddForm} className="empty-action-btn">
                                        <Plus size={16} /> Book New Appointment
                                    </button>
                                )}
                            </div>
                        )}

                        {/* TABLE */}
                        {!loading && filteredAppointments.length > 0 && (
                            <table className="patients-table">
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Doctor</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredAppointments.map((a) => {
                                        const matchPat = registeredPatients.find(
                                            (p) =>
                                                p.name?.trim().toLowerCase() ===
                                                a.patientName?.trim().toLowerCase()
                                        );
                                        const patId =
                                            a.patientId ||
                                            matchPat?.patientId ||
                                            (matchPat?._id
                                                ? `PAT-${String(matchPat._id).slice(-4).toUpperCase()}`
                                                : "");

                                        return (
                                        <tr key={a._id}>
                                            {/* PATIENT INFO */}
                                            <td className="patient-info-cell">
                                                <div className="patient-avatar">
                                                    {a.patientImage ? (
                                                        <img
                                                            src={a.patientImage}
                                                            alt={a.patientName}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src =
                                                                    "https://cdn-icons-png.flaticon.com/512/3774/3774299.png";
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="patient-avatar-fallback">
                                                            {a.patientName?.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="patient-name">
                                                        {a.patientName}
                                                    </div>
                                                    <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "2px" }}>
                                                        {patId && (
                                                            <span style={{ fontSize: "11px", fontWeight: "700", color: "#0284c7", background: "#e0f2fe", padding: "1px 6px", borderRadius: "4px" }}>
                                                                {patId}
                                                            </span>
                                                        )}
                                                        {a.notes && (
                                                            <span style={{ fontSize: "11.5px", color: "#64748b", maxWidth: "180px", display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={a.notes}>
                                                                {a.notes}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* DOCTOR */}
                                            <td>
                                                <span className="badge-doctor">
                                                    <Stethoscope size={13} />
                                                    {a.doctorName}
                                                </span>
                                            </td>

                                            {/* DATE */}
                                            <td>
                                                <span className="badge-date">
                                                    <Calendar size={13} style={{ color: "#0284c7" }} />
                                                    {a.date?.split("T")[0]}
                                                </span>
                                            </td>

                                            {/* TIME */}
                                            <td>
                                                <span className="badge-time">
                                                    <Clock size={13} style={{ color: "#0284c7" }} />
                                                    {a.time}
                                                </span>
                                            </td>

                                            {/* STATUS */}
                                            <td>
                                                <span className={`status ${a.status?.toLowerCase()}`}>
                                                    {a.status}
                                                </span>
                                            </td>

                                            {/* ACTIONS */}
                                            <td style={{ textAlign: "right" }}>
                                                {showDeleted ? (
                                                    <button
                                                        onClick={() => handleRestore(a._id)}
                                                        className="patients-restoreBtn"
                                                    >
                                                        Restore
                                                    </button>
                                                ) : (
                                                    <div className="patients-actions" style={{ justifyContent: "flex-end" }}>
                                                        <button
                                                            onClick={() => handleEdit(a)}
                                                            className="patients-editBtn"
                                                            title="Edit Appointment"
                                                        >
                                                            <Pencil size={15} />
                                                        </button>

                                                        <button
                                                            onClick={() => handleDelete(a._id)}
                                                            className="patients-deleteBtn"
                                                            title="Delete Appointment"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}

                    </div>

                </div>
            </main>
        </div>
    );
}

export default Appointments;