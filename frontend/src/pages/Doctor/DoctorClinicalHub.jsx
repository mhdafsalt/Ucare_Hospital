import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { doctorMenu } from "../../config/panelMenus";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Users,
  CalendarCheck,
  ClipboardList,
  FileText,
  Activity,
  FileCheck2,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Stethoscope,
  HeartPulse,
  Printer,
  ChevronRight,
  User,
} from "lucide-react";
import "./DoctorClinicalHub.css";

const SAMPLE_PATIENTS = [
  {
    id: "PAT-081",
    name: "Ahmed Mansoor",
    age: 48,
    gender: "Male",
    condition: "Hypertension Stage 2",
    lastVisit: "2026-11-04",
    status: "Stable",
    allergies: "Penicillin",
  },
  {
    id: "PAT-082",
    name: "Fatima Al-Sabah",
    age: 32,
    gender: "Female",
    condition: "Type 2 Diabetes Mellitus",
    lastVisit: "2026-11-05",
    status: "Follow-up",
    allergies: "Sulfa Drugs",
  },
  {
    id: "PAT-083",
    name: "David Chen",
    age: 26,
    gender: "Male",
    condition: "Acute Bronchitis",
    lastVisit: "2026-11-06",
    status: "Recovering",
    allergies: "None",
  },
  {
    id: "PAT-084",
    name: "Sarah Al-Rashidi",
    age: 54,
    gender: "Female",
    condition: "Post-op Knee Replacement",
    lastVisit: "2026-11-07",
    status: "Observation",
    allergies: "Aspirin",
  },
];

const SAMPLE_PRESCRIPTIONS = [
  {
    id: "RX-8841",
    patient: "Ahmed Mansoor",
    medication: "Amlodipine 5mg",
    dosage: "1 tablet once daily in morning",
    duration: "30 Days",
    date: "2026-11-06",
    status: "Dispensed",
  },
  {
    id: "RX-8842",
    patient: "Fatima Al-Sabah",
    medication: "Metformin 500mg ER",
    dosage: "1 tablet twice daily with meals",
    duration: "60 Days",
    date: "2026-11-05",
    status: "Active",
  },
  {
    id: "RX-8843",
    patient: "David Chen",
    medication: "Azithromycin 250mg",
    dosage: "2 tablets day 1, then 1 tablet daily",
    duration: "5 Days",
    date: "2026-11-04",
    status: "Completed",
  },
];

const SAMPLE_DIAGNOSES = [
  {
    code: "I10",
    name: "Essential (primary) hypertension",
    patient: "Ahmed Mansoor",
    severity: "Moderate",
    date: "2026-11-06",
  },
  {
    code: "E11.9",
    name: "Type 2 diabetes mellitus without complications",
    patient: "Fatima Al-Sabah",
    severity: "Chronic",
    date: "2026-11-05",
  },
  {
    code: "J20.9",
    name: "Acute bronchitis, unspecified",
    patient: "David Chen",
    severity: "Mild",
    date: "2026-11-04",
  },
];

export default function DoctorClinicalHub() {
  const location = useLocation();
  const [patients, setPatients] = useState(SAMPLE_PATIENTS);
  const [prescriptions, setPrescriptions] = useState(SAMPLE_PRESCRIPTIONS);
  const [diagnoses, setDiagnoses] = useState(SAMPLE_DIAGNOSES);
  const [search, setSearch] = useState("");
  const [consultNotes, setConsultNotes] = useState({
    patient: "Ahmed Mansoor",
    subjective:
      "Patient reports mild morning headaches, compliant with medication.",
    objective: "BP 138/88 mmHg, HR 74 bpm regular, Lungs clear to auscultation.",
    assessment: "Hypertension adequately managed with current regimen.",
    plan: "Continue Amlodipine 5mg. Schedule routine metabolic panel in 4 weeks.",
  });

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("patients")) return "patients";
    if (path.includes("appointments")) return "appointments";
    if (path.includes("medical-history")) return "medical-history";
    if (path.includes("prescriptions")) return "prescriptions";
    if (path.includes("diagnosis")) return "diagnosis";
    if (path.includes("consultation-notes")) return "consultation-notes";
    return "patients";
  };

  const activeTab = getActiveTab();

  const handleSaveNotes = (e) => {
    e.preventDefault();
    toast.success(`Clinical notes saved for ${consultNotes.patient}!`);
  };

  return (
    <div className="app spark-theme">
      <Sidebar menuItems={doctorMenu} panelSubtitle="DOCTOR PORTAL" />

      <main className="main main-wrapper">
        <header className="navbar-custom">
          <div className="navbar-left">
            <span className="doctor-badge-pill">
              <Stethoscope size={15} /> Clinical Workspace
            </span>
          </div>

          <div className="navbar-search-wrapper">
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Search patients, charts, prescriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="navbar-search-btn" aria-label="Search">
              <Search size={15} />
            </button>
          </div>
        </header>

        <div className="page-header">
          <div>
            <h1 className="page-title">
              {activeTab === "patients" && "My Patient Roster"}
              {activeTab === "appointments" && "Doctor Appointments Schedule"}
              {activeTab === "medical-history" && "Patient Medical Histories"}
              {activeTab === "prescriptions" && "Digital Prescription Pad"}
              {activeTab === "diagnosis" && "Clinical Diagnosis Records"}
              {activeTab === "consultation-notes" && "SOAP Consultation Notes"}
            </h1>
            <p className="page-subtitle">
              Manage patient diagnoses, digital prescriptions, and clinical
              progress notes.
            </p>
          </div>
        </div>

        {/* 1. PATIENTS & MEDICAL HISTORY VIEW */}
        {(activeTab === "patients" ||
          activeTab === "appointments" ||
          activeTab === "medical-history") && (
          <div className="card clinical-table-card">
            <div className="card-header">
              <h2 className="card-title">Patient Case Files</h2>
              <span className="clinical-counter-pill">
                {patients.length} active patients
              </span>
            </div>

            <div className="table-responsive">
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Name</th>
                    <th>Age / Gender</th>
                    <th>Primary Diagnosis</th>
                    <th>Allergies</th>
                    <th>Last Visit</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.id}</strong>
                      </td>
                      <td>
                        <div className="patient-name-cell">
                          <User size={14} /> {p.name}
                        </div>
                      </td>
                      <td>
                        {p.age} yrs • {p.gender}
                      </td>
                      <td>
                        <strong>{p.condition}</strong>
                      </td>
                      <td>
                        <span
                          className={`allergy-pill ${
                            p.allergies !== "None" ? "has-allergy" : ""
                          }`}
                        >
                          {p.allergies}
                        </span>
                      </td>
                      <td>{p.lastVisit}</td>
                      <td>
                        <span className="status-pill status-active">
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-open-chart"
                          onClick={() => {
                            setConsultNotes({
                              ...consultNotes,
                              patient: p.name,
                            });
                            toast.info(`Opened chart for ${p.name}`);
                          }}
                        >
                          View Chart
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. DIGITAL PRESCRIPTIONS VIEW */}
        {activeTab === "prescriptions" && (
          <div className="card clinical-table-card">
            <div className="card-header">
              <h2 className="card-title">Active Patient Prescriptions</h2>
              <button
                className="btn-quick-action"
                onClick={() =>
                  toast.success("Ready to prescribe new medication")
                }
              >
                <Plus size={15} /> Write Prescription
              </button>
            </div>

            <div className="table-responsive">
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>Rx ID</th>
                    <th>Patient</th>
                    <th>Medication</th>
                    <th>Dosage & Instructions</th>
                    <th>Duration</th>
                    <th>Date Issued</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((rx) => (
                    <tr key={rx.id}>
                      <td>
                        <strong>{rx.id}</strong>
                      </td>
                      <td>{rx.patient}</td>
                      <td>
                        <strong>{rx.medication}</strong>
                      </td>
                      <td>{rx.dosage}</td>
                      <td>{rx.duration}</td>
                      <td>{rx.date}</td>
                      <td>
                        <span className="status-pill status-active">
                          {rx.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-action-icon"
                          onClick={() =>
                            toast.info(`Printing Rx slip for ${rx.patient}...`)
                          }
                          title="Print Prescription"
                        >
                          <Printer size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. DIAGNOSIS VIEW */}
        {activeTab === "diagnosis" && (
          <div className="card clinical-table-card">
            <div className="card-header">
              <h2 className="card-title">ICD-10 Clinical Diagnoses Log</h2>
              <span className="trend-badge trend-up">
                Standard Medical Classification
              </span>
            </div>

            <div className="table-responsive">
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>ICD-10 Code</th>
                    <th>Diagnosis Description</th>
                    <th>Patient</th>
                    <th>Severity</th>
                    <th>Recorded Date</th>
                  </tr>
                </thead>
                <tbody>
                  {diagnoses.map((d, i) => (
                    <tr key={i}>
                      <td>
                        <span className="icd-badge">{d.code}</span>
                      </td>
                      <td>
                        <strong>{d.name}</strong>
                      </td>
                      <td>{d.patient}</td>
                      <td>
                        <span className="status-pill status-low">
                          {d.severity}
                        </span>
                      </td>
                      <td>{d.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. SOAP CONSULTATION NOTES VIEW */}
        {activeTab === "consultation-notes" && (
          <div className="card clinical-notes-card">
            <div className="card-header">
              <h2 className="card-title">
                SOAP Consultation Notes • {consultNotes.patient}
              </h2>
              <span className="clinical-counter-pill">
                Medical Records Protected
              </span>
            </div>

            <form onSubmit={handleSaveNotes} className="soap-form">
              <div className="soap-grid">
                <div className="soap-box">
                  <label className="soap-tag tag-s">S • Subjective</label>
                  <textarea
                    rows={3}
                    value={consultNotes.subjective}
                    onChange={(e) =>
                      setConsultNotes({
                        ...consultNotes,
                        subjective: e.target.value,
                      })
                    }
                    placeholder="Patient symptoms and complaints..."
                  />
                </div>

                <div className="soap-box">
                  <label className="soap-tag tag-o">O • Objective</label>
                  <textarea
                    rows={3}
                    value={consultNotes.objective}
                    onChange={(e) =>
                      setConsultNotes({
                        ...consultNotes,
                        objective: e.target.value,
                      })
                    }
                    placeholder="Vital signs, lab values, exam observations..."
                  />
                </div>

                <div className="soap-box">
                  <label className="soap-tag tag-a">A • Assessment</label>
                  <textarea
                    rows={3}
                    value={consultNotes.assessment}
                    onChange={(e) =>
                      setConsultNotes({
                        ...consultNotes,
                        assessment: e.target.value,
                      })
                    }
                    placeholder="Diagnosis and clinical judgment..."
                  />
                </div>

                <div className="soap-box">
                  <label className="soap-tag tag-p">P • Plan</label>
                  <textarea
                    rows={3}
                    value={consultNotes.plan}
                    onChange={(e) =>
                      setConsultNotes({ ...consultNotes, plan: e.target.value })
                    }
                    placeholder="Treatments, prescriptions, follow-up..."
                  />
                </div>
              </div>

              <div className="soap-actions">
                <button type="submit" className="btn-quick-action">
                  <CheckCircle2 size={16} /> Save Consultation Notes
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

