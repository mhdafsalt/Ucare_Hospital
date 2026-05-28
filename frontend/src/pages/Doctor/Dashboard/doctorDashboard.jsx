import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import "./doctorDashboard.css";

import {
    LayoutDashboard,
    Stethoscope,
    CalendarCheck,
    FileText,
    Users,
    HelpCircle,
    Pencil,
    Trash2,
    Search,
    Circle,
} from "lucide-react";

import {
    FaUserInjured,
    FaCalendarAlt,
    FaNotesMedical,
    FaClock,
} from "react-icons/fa";

import { getAppointmentsAPI, deleteAppointmentAPI, restoreAppointmentAPI, updateAppointmentAPI } from "../../../api/appointmentsApi";

const menuItems = [
    {
        title: "MENU",
        items: [
            {
                name: "Dashboard",
                icon: <LayoutDashboard size={18} />,
                path: "/doctor/dashboard",
                active: true,
            },
          
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

function DoctorDashboard() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleted, setShowDeleted] = useState(false);
    const [searchDoctor, setSearchDoctor] = useState("");

    const [userName, setUserName] = useState("Doctor");
    const [userImage, setUserImage] = useState("");

    useEffect(() => {
        setUserName(localStorage.getItem("userName") || "Doctor");
        setUserImage(localStorage.getItem("userImage") || "");
        fetchAppointments();
    }, [showDeleted]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const { data } = await getAppointmentsAPI(showDeleted);
            setAppointments(data);
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteAppointmentAPI(id);
            fetchAppointments();
        } catch (error) {
            console.error("Error deleting appointment", error);
        }
    };

    const handleRestore = async (id) => {
        try {
            await restoreAppointmentAPI(id);
            fetchAppointments();
        } catch (error) {
            console.error("Error restoring appointment", error);
        }
    };

    const handleEdit = (appointment) => {
        console.log("Edit appointment", appointment);
    };

    const handleStatusChange = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === "Completed" ? "Pending" : "Completed";
            await updateAppointmentAPI(id, { status: newStatus });
            fetchAppointments();
        } catch (error) {
            console.error("Error updating appointment status", error);
        }
    };

    const filteredAppointments = appointments.filter((app) =>
        app.doctorName?.toLowerCase().includes(searchDoctor.toLowerCase())
    );

    const uniquePatients = new Set(appointments.map(a => a.patientName)).size;
    const today = new Date().toISOString().split("T")[0];
    const todayAppointments = appointments.filter(a => a.date?.split("T")[0] === today).length;
    const pendingAppointments = appointments.filter(a => a.status === "Pending").length;
    const workingHours = todayAppointments > 0 ? `${Math.ceil(todayAppointments * 0.5)}h` : "0h";

    return (
        <div className="app">

            {/* SIDEBAR */}
            <Sidebar logo="Ucare." menuItems={menuItems} />

            {/* MAIN */}
            <main className="main">

                {/* HEADER */}
                <div className="Dashboard-header">
                    <div className="dashboard-header-content">

                        <div>
                            <h1>Doctor Dashboard</h1>
                            <p className="dashboard-caption">
                                Manage your patients, appointments, and medical activities.
                            </p>
                        </div>


                        <div className="admin-profile">
                            <div className="admin-profile-circle">
                                <span>{userName?.charAt(0)}</span>
                            </div>
                            <div>
                                <h3>{userName}</h3>
                                <p>Doctor</p>
                            </div>
                        </div>

                    </div>

                    <hr />
                </div>

                {/* CONTENT */}
                <div className="main-container">

                    {/* TOP BAR */}
                    <div className="dashboard-topbar">

                        <div>
                            <h2 className="dashboard-page-title">
                                Doctor Overview
                            </h2>
                            <p className="dashboard-page-subtitle">
                                Daily patient activity and schedule tracking.
                            </p>
                        </div>

                    </div>

                    {/* STATS */}
                    <div className="stats-grid">

                        <div className="stats-card">
                            <div>
                                <p>My Patients</p>
                                <h2>{uniquePatients}</h2>
                            </div>
                            <div className="stats-icon">
                                <FaUserInjured />
                            </div>
                        </div>

                        <div className="stats-card">
                            <div>
                                <p>Today Appointments</p>
                                <h2>{todayAppointments}</h2>
                            </div>
                            <div className="stats-icon">
                                <FaCalendarAlt />
                            </div>
                        </div>

                        <div className="stats-card">
                            <div>
                                <p>Pending Reports</p>
                                <h2>{pendingAppointments}</h2>
                            </div>
                            <div className="stats-icon">
                                <FaNotesMedical />
                            </div>
                        </div>

                        <div className="stats-card">
                            <div>
                                <p>Working Hours</p>
                                <h2>{workingHours}</h2>
                            </div>
                            <div className="stats-icon">
                                <FaClock />
                            </div>
                        </div>

                    </div>







                    {/* TABLE */}
                    <div className="patients-table-container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3>Appointments List</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f5f5f5', padding: '8px 12px', borderRadius: '8px' }}>
                                <Search size={16} color="#666" />
                                <input
                                    type="text"
                                    placeholder="Filter by doctor name..."
                                    value={searchDoctor}
                                    onChange={(e) => setSearchDoctor(e.target.value)}
                                    style={{ border: 'none', background: 'transparent', outline: 'none' }}
                                />
                            </div>
                        </div>

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
                                                            onClick={() => handleStatusChange(a._id, a.status)}
                                                            className="patients-editBtn"
                                                            style={a.status === "Completed" ? { backgroundColor: "#10b981", color: "white", borderColor: "#10b981" } : {}}
                                                        >
                                                            {a.status === "Completed" ? "Completed" : "Pending"}
                                                        </button>

                                                        {/* <button
                                                        onClick={() => handleDelete(a._id)}
                                                        className="patients-deleteBtn"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button> */}

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

export default DoctorDashboard;