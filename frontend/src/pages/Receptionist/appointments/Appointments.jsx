import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import "./Appointments.css";
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
} from "lucide-react";



import {
    addAppointmentAPI,
    deleteAppointmentAPI,
    getAppointmentsAPI,
    updateAppointmentAPI,
    restoreAppointmentAPI,
} from "../../../api/appointmentsApi";
import { FaCalendarCheck, FaClipboardList, FaFilter, FaMoneyBillWave, FaSearch, FaUsers, FaUserTie } from "react-icons/fa";
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

    // ================= FETCH =================
    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const res = await getAppointmentsAPI(showDeleted);
            setAppointments(res.data || []);
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
        billing: "",
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
                    billing: 0,
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
                                Monitor appointments, patient flow and billing.
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
                                <p>Billing Completed</p>
                                <h2>{stats.billing}</h2>
                            </div>

                            <div className="stats-icon">
                                <FaMoneyBillWave />
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

                    {/* FORM */}
                    {showForm && (
                        <div className="doctors-sideForm">

                            {/* HEADER */}
                            <div className="doctors-modalHeader">

                                <h2>
                                    {editingId ? "Update Appointment" : "Add Appointment"}
                                </h2>

                                <button
                                    onClick={() => setShowForm(false)}
                                    className="doctors-closeBtn"
                                >
                                    <X />
                                </button>

                            </div>

                            {/* FORM */}
                            <form
                                onSubmit={
                                    editingId
                                        ? handleUpdateAppointment
                                        : handleAddAppointment
                                }
                                className="doctors-form"
                            >

                                {/* PATIENT NAME */}
                                <input
                                    name="patientName"
                                    placeholder="Patient Name"
                                    onChange={handleChange}
                                    value={formData.patientName}
                                />

                                {/* DOCTOR NAME */}
                                <input
                                    name="doctorName"
                                    placeholder="Doctor Name"
                                    onChange={handleChange}
                                    value={formData.doctorName}
                                />

                                {/* DATE */}
                                <input
                                    type="date"
                                    name="date"
                                    onChange={handleChange}
                                    value={formData.date}
                                />

                                {/* TIME */}
                                <input
                                    type="time"
                                    name="time"
                                    onChange={handleChange}
                                    value={formData.time}
                                />

                                {/* STATUS */}
                                <select
                                    name="status"
                                    onChange={handleChange}
                                    value={formData.status}
                                >
                                    <option value="">Select Status</option>
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="Pending">Pending</option>
                                    {/* <option value="Completed">Completed</option> */}
                                </select>

                                {/* NOTES */}
                                <textarea
                                    name="notes"
                                    placeholder="Notes (optional)"
                                    onChange={handleChange}
                                    value={formData.notes}
                                />

                                {/* SUBMIT */}
                                <div className="doctors-form-actions">

                                    <button
                                        type="submit"
                                        className="doctors-submitBtn"
                                    >
                                        {editingId
                                            ? "Update Appointment"
                                            : "Save Appointment"}
                                    </button>

                                </div>

                            </form>

                        </div>
                    )}

                    {/* TABLE */}
                    <div className="patients-table-container">

                        {loading && <p>Loading...</p>}

                        {!loading && filteredAppointments.length === 0 && (
                            <p>No appointments found</p>
                        )}

                        {!loading && filteredAppointments.length > 0 && (
                            <table className="patients-table">

                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Doctor</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredAppointments.map((a) => (
                                        <tr key={a._id}>

                                            {/* PATIENT INFO (LIKE PATIENT UI) */}
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

                                                <div className="patient-name">
                                                    {a.patientName}
                                                </div>

                                            </td>

                                            {/* DOCTOR */}
                                            <td>{a.doctorName}</td>

                                            {/* DATE */}
                                            <td>{a.date?.split("T")[0]}</td>

                                            {/* TIME */}
                                            <td>{a.time}</td>

                                            {/* STATUS */}
                                            <td>
                                                <span className={`status ${a.status?.toLowerCase()}`}>
                                                    {a.status}
                                                </span>
                                            </td>

                                            {/* ACTIONS */}
                                            <td>

                                                {showDeleted ? (
                                                    <button
                                                        onClick={() => handleRestore(a._id)}
                                                        className="patients-restoreBtn"
                                                    >
                                                        Restore
                                                    </button>
                                                ) : (
                                                    <div className="patients-actions">

                                                        <button
                                                            onClick={() => handleEdit(a)}
                                                            className="patients-editBtn"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>

                                                        <button
                                                            onClick={() => handleDelete(a._id)}
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
            </main>
        </div>
    );
}

export default Appointments;