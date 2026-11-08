import React, { useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { receptionistMenu } from "../../config/panelMenus";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  UserPlus,
  Users,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  Check,
  Stethoscope,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import "./ReceptionistHub.css";

const DOCTOR_SCHEDULES = [
  {
    name: "Dr. Sarah Mitchell",
    specialty: "Cardiology",
    room: "Room 102",
    status: "Available",
    nextSlot: "11:00 AM",
    booked: 8,
  },
  {
    name: "Dr. James Wilson",
    specialty: "Neurology",
    room: "Room 205",
    status: "In Consultation",
    nextSlot: "11:45 AM",
    booked: 12,
  },
  {
    name: "Dr. Elena Vance",
    specialty: "Pediatrics",
    room: "Room 108",
    status: "Available",
    nextSlot: "10:30 AM",
    booked: 6,
  },
  {
    name: "Dr. Emma Roberts",
    specialty: "Dental Surgery",
    room: "Dental Suite 3",
    status: "On Break",
    nextSlot: "01:00 PM",
    booked: 9,
  },
];

const CHECKIN_QUEUE = [
  {
    id: "CHK-001",
    patient: "Ahmed Mansoor",
    doctor: "Dr. Sarah Mitchell",
    time: "10:30 AM",
    type: "Cardio Review",
    checkedIn: true,
  },
  {
    id: "CHK-002",
    patient: "Fatima Al-Sabah",
    doctor: "Dr. James Wilson",
    time: "10:45 AM",
    type: "Diabetes Follow-up",
    checkedIn: false,
  },
  {
    id: "CHK-003",
    patient: "David Chen",
    doctor: "Dr. Elena Vance",
    time: "11:00 AM",
    type: "Childhood Immunization",
    checkedIn: false,
  },
];

export default function ReceptionistHub() {
  const location = useLocation();
  const navigate = useNavigate();
  const [queue, setQueue] = useState(CHECKIN_QUEUE);
  const [doctors, setDoctors] = useState(DOCTOR_SCHEDULES);
  const [search, setSearch] = useState("");

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("check-in")) return "check-in";
    if (path.includes("doctor-availability")) return "doctor-availability";
    if (path.includes("patients-list")) return "patients-list";
    return "dashboard";
  };

  const activeTab = getActiveTab();

  const handleCheckInToggle = (id) => {
    setQueue(
      queue.map((q) =>
        q.id === id ? { ...q, checkedIn: !q.checkedIn } : q
      )
    );
    toast.success("Patient check-in status updated!");
  };

  return (
    <div className="app spark-theme">
      <Sidebar menuItems={receptionistMenu} panelSubtitle="RECEPTION DESK" />

      <main className="main main-wrapper">
        <header className="navbar-custom">
          <div className="navbar-left">
            <span className="reception-badge-pill">
              <CalendarCheck size={15} /> Reception Desk
            </span>
          </div>

          <div className="navbar-search-wrapper">
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Search incoming patients, appointments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="navbar-search-btn" aria-label="Search">
              <Search size={15} />
            </button>
          </div>

          <button
            className="btn-quick-action"
            onClick={() => navigate("/receptionist/add-patient")}
          >
            <UserPlus size={16} /> Register Patient
          </button>
        </header>

        <div className="page-header">
          <div>
            <h1 className="page-title">
              {activeTab === "check-in" && "Patient Arrival & Check-In Desk"}
              {activeTab === "doctor-availability" && "Doctor Schedule & Availability"}
              {activeTab === "patients-list" && "Registered Patient Directory"}
              {activeTab === "dashboard" && "Reception Desk Dashboard"}
            </h1>
            <p className="page-subtitle">
              Welcome patients, coordinate appointments, verify doctor rooms, and
              assist with check-ins.
            </p>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="spark-grid-top">
          <div className="card card-stat">
            <div className="stat-label">Today's Check-ins</div>
            <div className="stat-value">
              {queue.filter((q) => q.checkedIn).length} / {queue.length}
            </div>
            <div className="trend-badge trend-up">
              <CheckCircle2 size={13} /> Active reception lobby
            </div>
          </div>

          <div className="card card-stat">
            <div className="stat-label">Available Doctors</div>
            <div className="stat-value">
              {doctors.filter((d) => d.status === "Available").length}
            </div>
            <div className="trend-badge trend-up">
              <Clock size={13} /> Ready for consultation
            </div>
          </div>

          <div className="card card-stat">
            <div className="stat-label">Quick Actions</div>
            <div className="quick-reception-buttons">
              <button
                className="btn-reception-link"
                onClick={() => navigate("/receptionist/add-appointment")}
              >
                + Book Appointment
              </button>
              <button
                className="btn-reception-link"
                onClick={() => navigate("/receptionist/add-patient")}
              >
                + New Patient
              </button>
            </div>
          </div>
        </div>

        {/* PATIENT CHECK-IN TABLE */}
        {(activeTab === "dashboard" || activeTab === "check-in") && (
          <div className="card reception-table-card">
            <div className="card-header">
              <h2 className="card-title">Live Arrival Queue</h2>
              <span className="reception-counter-pill">
                {queue.length} patients scheduled
              </span>
            </div>

            <div className="table-responsive">
              <table className="reception-table">
                <thead>
                  <tr>
                    <th>Check-in ID</th>
                    <th>Patient Name</th>
                    <th>Attending Doctor</th>
                    <th>Appointment Time</th>
                    <th>Visit Purpose</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((q) => (
                    <tr key={q.id}>
                      <td>
                        <strong>{q.id}</strong>
                      </td>
                      <td>{q.patient}</td>
                      <td>{q.doctor}</td>
                      <td>{q.time}</td>
                      <td>{q.type}</td>
                      <td>
                        <span
                          className={`status-pill ${
                            q.checkedIn ? "status-active" : "status-low"
                          }`}
                        >
                          {q.checkedIn ? "Checked In" : "Waiting Arrival"}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn-checkin-action ${
                            q.checkedIn ? "is-checked" : ""
                          }`}
                          onClick={() => handleCheckInToggle(q.id)}
                        >
                          <Check size={14} />{" "}
                          {q.checkedIn ? "Checked In" : "Check In"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DOCTOR AVAILABILITY GRID */}
        {(activeTab === "dashboard" ||
          activeTab === "doctor-availability") && (
          <div className="card reception-table-card">
            <div className="card-header">
              <h2 className="card-title">On-Duty Doctors & Room Roster</h2>
              <span className="trend-badge trend-up">Live Hospital Status</span>
            </div>

            <div className="doctor-schedule-grid">
              {doctors.map((doc, idx) => (
                <div key={idx} className="doc-schedule-card">
                  <div className="doc-header">
                    <div className="doc-avatar-circle">
                      {doc.name.replace("Dr. ", "").charAt(0)}
                    </div>
                    <div>
                      <strong>{doc.name}</strong>
                      <span className="doc-spec">{doc.specialty}</span>
                    </div>
                  </div>
                  <div className="doc-details">
                    <span>
                      <strong>Room:</strong> {doc.room}
                    </span>
                    <span>
                      <strong>Next Available:</strong> {doc.nextSlot}
                    </span>
                  </div>
                  <div className="doc-footer">
                    <span
                      className={`status-pill ${
                        doc.status === "Available"
                          ? "status-active"
                          : doc.status === "In Consultation"
                          ? "status-low"
                          : "status-expiring"
                      }`}
                    >
                      {doc.status}
                    </span>
                    <span className="doc-booked-count">
                      {doc.booked} patients booked
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

