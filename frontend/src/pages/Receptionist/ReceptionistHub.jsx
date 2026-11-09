import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { receptionistMenu } from "../../config/panelMenus";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getDoctorsAPI } from "../../api/doctorApi";
import { getAppointmentsAPI, updateAppointmentAPI } from "../../api/appointmentsApi";
import { getPatientsAPI } from "../../api/patientApi";
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
  RefreshCw,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  Activity,
} from "lucide-react";
import "./ReceptionistHub.css";

export default function ReceptionistHub() {
  const location = useLocation();
  const navigate = useNavigate();

  const [queue, setQueue] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [checkInFilter, setCheckInFilter] = useState("all"); // "all", "checkedIn", "waiting"
  const [doctorFilter, setDoctorFilter] = useState("all"); // "all", "Available", "In Consultation"

  // Fetch all live Reception Desk data from MongoDB
  const fetchReceptionData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const [docRes, appRes, patRes] = await Promise.allSettled([
        getDoctorsAPI(),
        getAppointmentsAPI(),
        getPatientsAPI(),
      ]);

      let rawPats = [];
      if (patRes.status === "fulfilled" && patRes.value?.data) {
        rawPats = Array.isArray(patRes.value.data.patients)
          ? patRes.value.data.patients
          : Array.isArray(patRes.value.data)
          ? patRes.value.data
          : [];

        setPatients(
          rawPats.map((p, idx) => ({
            rawId: p._id,
            id: p.patientId || (p._id ? `PAT-${String(p._id).slice(-4).toUpperCase()}` : `PAT-00${idx + 1}`),
            name: p.name || "Patient",
            age: p.age || "N/A",
            gender: p.gender || "Not specified",
            phone: p.phone || "No phone listed",
            address: p.address || "City Clinic Area",
            createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent",
          }))
        );
      }

      let rawAppointments = [];
      if (appRes.status === "fulfilled" && appRes.value?.data) {
        rawAppointments = Array.isArray(appRes.value.data.appointments)
          ? appRes.value.data.appointments
          : Array.isArray(appRes.value.data)
          ? appRes.value.data
          : [];

        setQueue(
          rawAppointments.map((a, idx) => {
            const matchPat = rawPats.find(
              (p) =>
                p.name?.trim().toLowerCase() ===
                (a.patientName || "").trim().toLowerCase()
            );
            const patId =
              a.patientId ||
              matchPat?.patientId ||
              (matchPat?._id
                ? `PAT-${String(matchPat._id).slice(-4).toUpperCase()}`
                : "");

            return {
              rawId: a._id,
              id:
                a.appointmentId ||
                (a._id
                  ? `CHK-${String(a._id).slice(-4).toUpperCase()}`
                  : `CHK-00${idx + 1}`),
              patient: a.patientName || "Walk-in Patient",
              patientId: patId,
              doctor: a.doctorName || "Staff Physician",
              date: a.date
                ? new Date(a.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "Today",
              time: a.time || "10:30 AM",
              type: a.notes || a.department || "Consultation",
              status: a.status || "Scheduled",
              checkedIn: a.status === "Completed" || a.status === "Checked In",
            };
          })
        );
      }

      if (docRes.status === "fulfilled" && docRes.value?.data) {
        const rawDocs = Array.isArray(docRes.value.data.doctors)
          ? docRes.value.data.doctors
          : Array.isArray(docRes.value.data)
          ? docRes.value.data
          : [];

        setDoctors(
          rawDocs.map((d, idx) => {
            const rawName = d.name || d.doctorName || "Physician";
            const docName = rawName.startsWith("Dr.") ? rawName : `Dr. ${rawName}`;
            // Dynamic count of real appointments for this doctor from live MongoDB
            const bookedCount = rawAppointments.filter(
              (a) =>
                a.doctorName?.toLowerCase() === rawName.toLowerCase() ||
                a.doctorName?.toLowerCase() === docName.toLowerCase() ||
                (d._id && a.doctorId === d._id)
            ).length;

            return {
              rawId: d._id,
              name: docName,
              image: d.image || d.avatar || "",
              specialty: d.specialization || d.department || "General Medicine",
              room: d.room || `Room ${101 + idx * 2}`,
              status: d.status || "Available",
              nextSlot: d.workingHours || "10:30 AM",
              booked: bookedCount,
            };
          })
        );
      }
    } catch (err) {
      console.warn("Could not load reception hub data:", err);
      if (!isSilent) toast.error("Could not fetch reception desk data from server");
    } finally {
      if (!isSilent) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReceptionData(false);

    // Dynamic real-time auto-sync every 10 seconds & on window focus
    const interval = setInterval(() => {
      fetchReceptionData(true);
    }, 10000);

    const onFocus = () => {
      fetchReceptionData(true);
    };
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("check-in")) return "check-in";
    if (path.includes("doctor-availability")) return "doctor-availability";
    if (path.includes("patients-list")) return "patients-list";
    return "dashboard";
  };

  const activeTab = getActiveTab();

  // Persistent Check-in toggle that updates MongoDB directly
  const handleCheckInToggle = async (queueItem) => {
    const nextCheckedIn = !queueItem.checkedIn;
    const nextStatus = nextCheckedIn ? "Checked In" : "Scheduled";

    // Optimistic local state update
    setQueue((prev) =>
      prev.map((q) =>
        q.id === queueItem.id
          ? { ...q, checkedIn: nextCheckedIn, status: nextStatus }
          : q
      )
    );

    try {
      if (queueItem.rawId) {
        await updateAppointmentAPI(queueItem.rawId, { status: nextStatus });
      }
      toast.success(
        nextCheckedIn
          ? `${queueItem.patient} has been marked as Checked In!`
          : `${queueItem.patient} check-in reverted to Scheduled.`
      );
    } catch (err) {
      // Revert if API fails
      setQueue((prev) =>
        prev.map((q) =>
          q.id === queueItem.id
            ? { ...q, checkedIn: !nextCheckedIn, status: queueItem.status }
            : q
        )
      );
      toast.error("Failed to update check-in status in database.");
    }
  };

  // Search and Filter logic for Arrival Queue
  const filteredQueue = queue.filter((q) => {
    const matchesSearch =
      q.patient.toLowerCase().includes(search.toLowerCase()) ||
      q.doctor.toLowerCase().includes(search.toLowerCase()) ||
      q.id.toLowerCase().includes(search.toLowerCase()) ||
      q.type.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (checkInFilter === "checkedIn") return q.checkedIn;
    if (checkInFilter === "waiting") return !q.checkedIn;
    return true;
  });

  // Search and Filter logic for Doctors
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(search.toLowerCase()) ||
      doc.room.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (doctorFilter !== "all") return doc.status === doctorFilter;
    return true;
  });

  // Search logic for Patients Directory
  const filteredPatients = patients.filter((p) => {
    return (
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase())
    );
  });

  const checkedInCount = queue.filter((q) => q.checkedIn).length;
  const availableDoctorsCount = doctors.filter((d) => d.status === "Available").length;
  const consultingDoctorsCount = doctors.filter((d) => d.status === "In Consultation").length;

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
              placeholder={
                activeTab === "patients-list"
                  ? "Search registered patients by name, phone, ID..."
                  : activeTab === "doctor-availability"
                  ? "Search doctors by name, specialty, room..."
                  : "Search arrival queue, patient, doctor..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="navbar-search-btn" aria-label="Search">
              <Search size={15} />
            </button>
          </div>

          <div className="navbar-actions-group">
            <button
              className="btn-refresh-hub"
              onClick={() => fetchReceptionData(false)}
              title="Refresh live reception desk data"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            </button>
            <button
              className="btn-quick-action"
              onClick={() => navigate("/receptionist/add-patient")}
            >
              <UserPlus size={16} /> Register Patient
            </button>
          </div>
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
              assist with check-ins in real-time.
            </p>
          </div>
        </div>

        {/* DYNAMIC 4-METRIC TOP ROW */}
        <div className="spark-grid-top">
          {/* Card 1: Today's Check-ins */}
          <div className="card card-stat">
            <div className="stat-label">Today's Check-ins</div>
            <div className="stat-value">
              {checkedInCount} / {queue.length}
            </div>
            <div className="trend-badge trend-up">
              <CheckCircle2 size={13} />{" "}
              {queue.length > 0 ? `${Math.round((checkedInCount / queue.length) * 100)}% Arrived` : "No visits queued"}
            </div>
          </div>

          {/* Card 2: Available Doctors */}
          <div className="card card-stat">
            <div className="stat-label">Available Doctors</div>
            <div className="stat-value">{availableDoctorsCount}</div>
            <div className="trend-badge trend-up">
              <Clock size={13} /> {consultingDoctorsCount > 0 ? `${consultingDoctorsCount} in Consultation` : `${doctors.length} on roster`}
            </div>
          </div>

          {/* Card 3: Total Registered Patients */}
          <div className="card card-stat">
            <div className="stat-label">Total Patients</div>
            <div className="stat-value">{patients.length}</div>
            <div className="trend-badge trend-up">
              <Users size={13} /> Live hospital registry
            </div>
          </div>

          {/* Card 4: Quick Desk Coordination */}
          <div className="card card-stat">
            <div className="stat-label">Quick Actions</div>
            <div className="quick-reception-buttons">
              <button
                className="btn-reception-link"
                onClick={() => navigate("/receptionist/add-appointment")}
              >
                <Plus size={13} /> Appointment
              </button>
              <button
                className="btn-reception-link"
                onClick={() => navigate("/receptionist/add-patient")}
              >
                <Plus size={13} /> Patient
              </button>
            </div>
          </div>
        </div>

        {/* 1. PATIENT CHECK-IN TABLE (Dashboard and Check-In tab) */}
        {(activeTab === "dashboard" || activeTab === "check-in") && (
          <div className="card reception-table-card">
            <div className="card-header">
              <div className="card-header-left">
                <h2 className="card-title">Live Arrival & Check-In Queue</h2>
                <span className="reception-counter-pill">
                  {queue.length} Scheduled Appointments
                </span>
              </div>

              {/* Status Filter Pills */}
              <div className="reception-filter-pills">
                <button
                  className={`btn-filter-pill ${checkInFilter === "all" ? "active" : ""}`}
                  onClick={() => setCheckInFilter("all")}
                >
                  All ({queue.length})
                </button>
                <button
                  className={`btn-filter-pill ${checkInFilter === "waiting" ? "active" : ""}`}
                  onClick={() => setCheckInFilter("waiting")}
                >
                  Waiting ({queue.filter((q) => !q.checkedIn).length})
                </button>
                <button
                  className={`btn-filter-pill ${checkInFilter === "checkedIn" ? "active" : ""}`}
                  onClick={() => setCheckInFilter("checkedIn")}
                >
                  Checked In ({checkedInCount})
                </button>
              </div>
            </div>

            {loading ? (
              <div className="reception-loading-state">Loading live appointment queue from database...</div>
            ) : filteredQueue.length === 0 ? (
              <div className="reception-empty-state">
                <AlertCircle size={28} style={{ margin: "0 auto 8px auto", opacity: 0.5 }} />
                <p>No appointments found {search ? `matching "${search}"` : "for the selected filter."}</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="reception-table">
                  <thead>
                    <tr>
                      <th>Check-in ID</th>
                      <th>Patient Name</th>
                      <th>Attending Doctor</th>
                      <th>Date & Time</th>
                      <th>Visit Purpose</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQueue.map((q) => (
                      <tr key={q.id}>
                        <td>
                          <strong>{q.id}</strong>
                        </td>
                        <td>
                          <div className="patient-name-cell">
                            <div className="patient-avatar-circle">
                              {q.patient.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span style={{ fontWeight: "700" }}>{q.patient}</span>
                              {q.patientId && (
                                <span style={{ display: "block", fontSize: "11px", color: "#0ea5e9", fontWeight: "700" }}>
                                  {q.patientId}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: "600", color: "#334155" }}>{q.doctor}</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontWeight: "600" }}>{q.time}</span>
                            <span style={{ fontSize: "11px", color: "#64748b" }}>{q.date}</span>
                          </div>
                        </td>
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
                            onClick={() => handleCheckInToggle(q)}
                            title={q.checkedIn ? "Click to revert to Scheduled" : "Click to mark Checked In"}
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
            )}
          </div>
        )}

        {/* 2. DOCTOR AVAILABILITY GRID (Dashboard and Doctor-Availability tab) */}
        {(activeTab === "dashboard" || activeTab === "doctor-availability") && (
          <div className="card reception-table-card">
            <div className="card-header">
              <div className="card-header-left">
                <h2 className="card-title">On-Duty Doctors & Room Roster</h2>
                <span className="trend-badge trend-up">
                  {availableDoctorsCount} of {doctors.length} Doctors Available
                </span>
              </div>

              {/* Doctor Status Filters */}
              <div className="reception-filter-pills">
                <button
                  className={`btn-filter-pill ${doctorFilter === "all" ? "active" : ""}`}
                  onClick={() => setDoctorFilter("all")}
                >
                  All ({doctors.length})
                </button>
                <button
                  className={`btn-filter-pill ${doctorFilter === "Available" ? "active" : ""}`}
                  onClick={() => setDoctorFilter("Available")}
                >
                  Available ({availableDoctorsCount})
                </button>
                <button
                  className={`btn-filter-pill ${doctorFilter === "In Consultation" ? "active" : ""}`}
                  onClick={() => setDoctorFilter("In Consultation")}
                >
                  In Consultation ({consultingDoctorsCount})
                </button>
              </div>
            </div>

            {loading ? (
              <div className="reception-loading-state">Loading on-duty doctors roster...</div>
            ) : filteredDoctors.length === 0 ? (
              <div className="reception-empty-state">
                <AlertCircle size={28} style={{ margin: "0 auto 8px auto", opacity: 0.5 }} />
                <p>No doctors found {search ? `matching "${search}"` : "in this category."}</p>
              </div>
            ) : (
              <div className="doctor-schedule-grid">
                {filteredDoctors.map((doc, idx) => (
                  <div key={doc.rawId || idx} className="doc-schedule-card">
                    <div className="doc-header">
                      {doc.image ? (
                        <img
                          src={doc.image}
                          alt={doc.name}
                          className="doc-avatar-img"
                          onError={(e) => {
                            e.target.style.display = "none";
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = "flex";
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className="doc-avatar-circle"
                        style={{ display: doc.image ? "none" : "flex" }}
                      >
                        {doc.name.replace("Dr. ", "").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="doc-title-name">{doc.name}</div>
                        <span className="doc-spec-badge">
                          <Stethoscope size={11} /> {doc.specialty}
                        </span>
                      </div>
                    </div>

                    <div className="doc-details-grid">
                      <div className="doc-detail-item">
                        <MapPin size={13} className="doc-detail-icon" />
                        <span>
                          <strong>Room:</strong> {doc.room}
                        </span>
                      </div>
                      <div className="doc-detail-item">
                        <Clock size={13} className="doc-detail-icon" />
                        <span>
                          <strong>Hours:</strong> {doc.nextSlot}
                        </span>
                      </div>
                    </div>

                    <div className="doc-footer">
                      <span
                        className={`doc-status-badge ${
                          doc.status === "Available"
                            ? "doc-status-available"
                            : doc.status === "In Consultation"
                            ? "doc-status-consulting"
                            : "doc-status-break"
                        }`}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background:
                              doc.status === "Available"
                                ? "#059669"
                                : doc.status === "In Consultation"
                                ? "#d97706"
                                : "#dc2626",
                            display: "inline-block",
                          }}
                        />
                        {doc.status}
                      </span>
                      <span className="doc-booked-count">
                        <CalendarCheck size={13} style={{ color: "#0ea5e9" }} />
                        {doc.booked} {doc.booked === 1 ? "patient" : "patients"} booked
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. REGISTERED PATIENTS DIRECTORY (Patients-List tab) */}
        {activeTab === "patients-list" && (
          <div className="card reception-table-card">
            <div className="card-header">
              <div className="card-header-left">
                <h2 className="card-title">Hospital Patient Directory</h2>
                <span className="reception-counter-pill">
                  {patients.length} Registered Patients
                </span>
              </div>

              <button
                className="btn-quick-action btn-table-header-action"
                onClick={() => navigate("/receptionist/add-patient")}
              >
                <UserPlus size={14} /> New Registration
              </button>
            </div>

            {loading ? (
              <div className="reception-loading-state">Loading registered patients from database...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="reception-empty-state">
                <Users size={28} style={{ margin: "0 auto 8px auto", opacity: 0.5 }} />
                <p>No patients found {search ? `matching "${search}"` : "in the registry."}</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="reception-table">
                  <thead>
                    <tr>
                      <th>Patient ID</th>
                      <th>Patient Name</th>
                      <th>Age & Gender</th>
                      <th>Contact Phone</th>
                      <th>Residential Address</th>
                      <th>Registered On</th>
                      <th>Desk Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.id}</strong>
                        </td>
                        <td>
                          <div className="patient-name-cell">
                            <div className="patient-avatar-circle">
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: "700" }}>{p.name}</span>
                          </div>
                        </td>
                        <td>
                          {p.age} yrs • {p.gender}
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Phone size={13} style={{ color: "#0ea5e9" }} />
                            <span>{p.phone}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <MapPin size={13} style={{ color: "#94a3b8" }} />
                            <span>{p.address}</span>
                          </div>
                        </td>
                        <td>{p.createdAt}</td>
                        <td>
                          <button
                            className="btn-reception-link"
                            onClick={() => navigate("/receptionist/add-appointment")}
                            title="Schedule appointment for this patient"
                          >
                            <CalendarCheck size={13} /> Book Visit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
