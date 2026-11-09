import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { doctorMenu } from "../../config/panelMenus";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getPatientsAPI, updatePatientAPI } from "../../api/patientApi";
import { getAppointmentsAPI, updateAppointmentAPI } from "../../api/appointmentsApi";
import { getMedicinesAPI } from "../../api/medicineApi";
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
  RefreshCw,
  Loader2,
  X,
  FileSignature,
  Pencil,
  Trash2,
} from "lucide-react";
import "./DoctorClinicalHub.css";

export default function DoctorClinicalHub() {
  const location = useLocation();
  const navigate = useNavigate();

  // Dynamic state from MongoDB
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals & Chart inspection
  const [selectedPatientChart, setSelectedPatientChart] = useState(null);
  const [showRxModal, setShowRxModal] = useState(false);
  const [editRx, setEditRx] = useState(null);
  const [rxToDelete, setRxToDelete] = useState(null);
  const [newRx, setNewRx] = useState({
    patientName: "",
    medication: "",
    dosage: "1 tablet once daily",
    duration: "14 Days",
    instructions: "Take with food",
  });

  // Comprehensive 9-Section Authentic Clinical Prescription & SOAP Pad State
  const [prescriptionSheet, setPrescriptionSheet] = useState({
    hospital: {
      name: "Ucare Multispeciality Hospital & Research Centre",
      subtitle: "Center for Advanced Clinical Medicine & Trauma Care",
      address:
        "",
      phone: "040-27796644 / 23542835",
      emergency: "+91 911 234 5678",
      email: "care@ucarehospital.com",
      web: "www.ucarehospital.com",
    },
    doctor: {
      name: localStorage.getItem("userName") ,
      qualification: "M.B.B.S., M.D. (Internal Medicine), F.I.P.S.",
      specialization: "Consultant Physician & Cardiologist",
      regNo: "Regd. No. 8373 (A.P. / N.M.C.)",
      room: "OPD Consultation Suite 101",
      timings: "10:00 AM - 04:00 PM (Mon-Sat)",
    },
    patient: {
      name: "",
      id: "",
      age: "",
      gender: "",
      phone: "",
      consultDate: new Date().toISOString().split("T")[0],
      consultType: "OPD Consultation",
    },
    subjectiveText: "",
    objectiveText: "",
    assessmentText: "",
    planText: "",
    subjective: {
      chiefComplaints: "",
      hpi: "",
      medicalHistory: "",
      symptoms: "",
    },
    objective: {
      vitals: {
        bp: "128/82",
        pulse: "74",
        temp: "98.6",
        spo2: "98",
        weight: "72",
      },
      physicalExam: "",
      clinicalFindings: "",
      labResults: "",
    },
    assessment: {
      primaryDiagnosis: "",
      differentialDiagnosis: "",
      clinicalAssessment: "",
      icdCode: "Z00.00",
    },
    plan: {
      treatmentPlan: "",
      medications: [],
      investigations: "",
      counselling: "",
      followUp: "",
    },
    auth: {
      doctorSignature: localStorage.getItem("userName") || "Salman",
      regNo: "Regd. No. 8373 (A.P.)",
      signedDate: new Date().toISOString().split("T")[0],
    },
    footer: {
      hospitalName: "Ucare Multispeciality Hospital & Research Institute",
      contacts: "Telephone: 040-27796644 / 23542835 | Email: info@ucarehospital.com",
      emergencyNotice:
        "In Emergency / If the doctor is not available, please admit at Ucare 24/7 Emergency & Trauma Care, Road No. 14, Banjara Hills. 24x7  / +91 911 234 5678",
    },
    saved: true,
    lastSaved: "",
  });

  // Dynamic Prescription Sheet Generator (9-Section Clinical Pad)
  const generateDynamicPrescription = (p, currentRx = []) => {
    if (!p) return null;

    const docName = localStorage.getItem("userName") || "Dr. Salman";
    const condition =
      p.condition && p.condition !== "Clinical Consultation"
        ? p.condition
        : "Hypertension & Cardiometabolic Evaluation";

    let icdCode = "Z00.00";
    const condLower = condition.toLowerCase();
    if (
      condLower.includes("hypertens") ||
      condLower.includes("bp") ||
      condLower.includes("pressure")
    )
      icdCode = "I10";
    else if (condLower.includes("diabet") || condLower.includes("sugar"))
      icdCode = "E11.9";
    else if (
      condLower.includes("bronch") ||
      condLower.includes("cough") ||
      condLower.includes("respir")
    )
      icdCode = "J20.9";
    else if (condLower.includes("cardio") || condLower.includes("heart"))
      icdCode = "I25.1";
    else if (condLower.includes("fever") || condLower.includes("infect"))
      icdCode = "R50.9";
    else if (
      condLower.includes("knee") ||
      condLower.includes("joint") ||
      condLower.includes("ortho")
    )
      icdCode = "M25.5";
    else if (
      condLower.includes("gast") ||
      condLower.includes("stomach") ||
      condLower.includes("ulcer")
    )
      icdCode = "K29.7";

    return {
      hospital: {
        name: "Ucare Multispeciality Hospital & Research Centre",
        subtitle: "Center for Advanced Clinical Medicine & Trauma Care",
        address:
          "",
        phone: "040-27796644 / 23542835",
        emergency: "+91 911 234 5678 / Helpline: 108",
        email: "care@ucarehospital.com",
        web: "www.ucarehospital.com",
      },
      doctor: {
        name: docName,
        qualification: "M.B.B.S., M.D. (Internal Medicine), F.I.P.S.",
        specialization: "Consultant Physician & Cardiologist",
        regNo: "Regd. No. 8373 (A.P. / N.M.C.)",
        room: "OPD Consultation Suite 101",
        timings: "10:00 AM - 04:00 PM (Mon-Sat)",
      },
      patient: {
        name: p.name || "",
        id:
          p.id ||
          (p.rawId || p._id
            ? `PAT-${String(p.rawId || p._id).slice(-4).toUpperCase()}`
            : "PAT-001"),
        age: p.age && p.age !== "—" ? String(p.age) : "",
        gender: p.gender && p.gender !== "Adult" ? p.gender : "",
        phone: p.phone && p.phone !== "—" ? p.phone : "",
        consultDate:
          p.lastVisit && p.lastVisit !== "Recent"
            ? p.lastVisit
            : new Date().toISOString().split("T")[0],
        consultType: "OPD Consultation",
      },
      subjectiveText: "",
      objectiveText: "",
      assessmentText: "",
      planText: "",
      subjective: {
        chiefComplaints: "",
        hpi: "",
        medicalHistory: "",
        symptoms: "",
      },
      objective: {
        vitals: {
          bp: "",
          pulse: "",
          temp: "",
          spo2: "",
          weight: "",
        },
        physicalExam: "",
        clinicalFindings: "",
        labResults: "",
      },
      assessment: {
        primaryDiagnosis: "",
        differentialDiagnosis: "",
        clinicalAssessment: "",
        icdCode: "",
      },
      plan: {
        treatmentPlan: "",
        medications: [],
        investigations: "",
        counselling: "",
        followUp: "",
      },
      auth: {
        doctorSignature: docName,
        regNo: "Regd. No. 8373 (A.P.)",
        signedDate: new Date().toISOString().split("T")[0],
      },
      footer: {
        hospitalName: "Ucare Multispeciality Hospital & Research Institute",
        contacts: "Telephone: 040-27796644 / 23542835 | Email: info@ucarehospital.com",
        emergencyNotice:
          "",
      },
      saved: true,
      lastSaved: "Generated from Live Data",
    };
  };

  // =========================================================================
  // FETCH CLINICAL DATA FROM MONGODB
  // =========================================================================
  const fetchClinicalData = async () => {
    setLoading(true);
    try {
      const [patRes, appRes, medRes] = await Promise.allSettled([
        getPatientsAPI(),
        getAppointmentsAPI(),
        getMedicinesAPI(),
      ]);

      const rawPatients =
        patRes.status === "fulfilled" && patRes.value?.data
          ? Array.isArray(patRes.value.data.patients)
            ? patRes.value.data.patients
            : Array.isArray(patRes.value.data)
            ? patRes.value.data
            : []
          : [];

      const rawAppointments =
        appRes.status === "fulfilled" && appRes.value?.data
          ? Array.isArray(appRes.value.data.appointments)
            ? appRes.value.data.appointments
            : Array.isArray(appRes.value.data)
            ? appRes.value.data
            : []
          : [];

      const rawMedicines =
        medRes.status === "fulfilled" && medRes.value?.data
          ? Array.isArray(medRes.value.data.medicines)
            ? medRes.value.data.medicines
            : Array.isArray(medRes.value.data)
            ? medRes.value.data
            : []
          : [];

      setAppointments(rawAppointments);
      setMedicines(rawMedicines);

      // Unify patients: merge MongoDB Patient records with any patients booked in appointments
      const patientMap = new Map();

      rawPatients.forEach((p, idx) => {
        const pName = (p.name || p.patientName || `Patient ${idx + 1}`).trim();
        const key = pName.toLowerCase();

        // Check for matching appointment
        const matchApp = rawAppointments.find(
          (a) =>
            (a.patientName && a.patientName.toLowerCase().trim() === key) ||
            (p._id && a.patientId === p._id)
        );

        patientMap.set(key, {
          rawId: p._id,
          id:
            p.patientId ||
            (p._id
              ? `PAT-${String(p._id).slice(-4).toUpperCase()}`
              : `PAT-${String(101 + idx)}`),
          name: pName,
          age: p.age || "—",
          gender: p.gender || "Adult",
          condition:
            matchApp?.notes ||
            p.disease ||
            p.condition ||
            "Clinical Consultation",
          allergies: p.allergies || "None Reported",
          lastVisit: matchApp?.date
            ? new Date(matchApp.date).toISOString().split("T")[0]
            : p.createdAt
            ? new Date(p.createdAt).toISOString().split("T")[0]
            : "Recent",
          status:
            matchApp?.status === "Completed"
              ? "Stable"
              : matchApp?.status || "Active",
          phone: p.phone || "—",
          address: p.address || "—",
          image: p.image || "",
        });
      });

      // Also include any patients scheduled via appointments not yet in patientMap
      rawAppointments.forEach((a, idx) => {
        if (!a.patientName) return;
        const key = a.patientName.toLowerCase().trim();
        if (!patientMap.has(key)) {
          const existingPat = rawPatients.find(
            (p) =>
              (p.name && p.name.toLowerCase().trim() === key) ||
              (p._id && a.patientId === p._id)
          );

          const patId = existingPat
            ? existingPat.patientId ||
              (existingPat._id
                ? `PAT-${String(existingPat._id).slice(-4).toUpperCase()}`
                : `PAT-${101 + idx}`)
            : a.patientId ||
              (a._id
                ? `PAT-${String(a._id).slice(-4).toUpperCase()}`
                : `PAT-${201 + idx}`);

          patientMap.set(key, {
            rawId: existingPat?._id || a._id,
            id: patId,
            name: a.patientName.trim(),
            age: a.patientAge || existingPat?.age || "—",
            gender: a.patientGender || existingPat?.gender || "Adult",
            condition: a.notes || "Clinical Consultation",
            allergies: existingPat?.allergies || "None Reported",
            lastVisit: a.date
              ? new Date(a.date).toISOString().split("T")[0]
              : "Recent",
            status:
              a.status === "Completed" ? "Stable" : a.status || "Active",
            phone: a.patientPhone || existingPat?.phone || "—",
            address: a.patientAddress || existingPat?.address || "—",
            image: existingPat?.image || "",
          });
        }
      });

      const unifiedPatients = Array.from(patientMap.values());
      setPatients(unifiedPatients);

      // Build Prescriptions dynamically from medicines and active patients
      const dynamicPrescriptions = rawMedicines.map((m, idx) => {
        const assignedPatient =
          unifiedPatients.length > 0
            ? unifiedPatients[idx % unifiedPatients.length].name
            : "Clinical Outpatient";

        return {
          id:
            m.medicineId ||
            (m._id
              ? `RX-${String(m._id).slice(-4).toUpperCase()}`
              : `RX-${8801 + idx}`),
          patient: assignedPatient,
          medication: `${m.name || "Medication"} ${m.dosage || ""}`.trim(),
          dosage:
            m.dosage || (m.category ? `${m.category} oral dose` : "1 tablet daily"),
          duration: "14 Days",
          date: m.createdAt
            ? new Date(m.createdAt).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          status: m.stock > 0 ? "Dispensed" : "Pending",
        };
      });

      // Maintain persisted local changes (edits/deletions/creations) across refreshes
      const savedRxList = localStorage.getItem("doctor_prescriptions_list");
      if (savedRxList) {
        try {
          const parsed = JSON.parse(savedRxList);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPrescriptions(parsed);
          } else {
            setPrescriptions(dynamicPrescriptions);
            localStorage.setItem(
              "doctor_prescriptions_list",
              JSON.stringify(dynamicPrescriptions)
            );
          }
        } catch {
          setPrescriptions(dynamicPrescriptions);
        }
      } else {
        setPrescriptions(dynamicPrescriptions);
        localStorage.setItem(
          "doctor_prescriptions_list",
          JSON.stringify(dynamicPrescriptions)
        );
      }

      // Build Diagnoses dynamically with standard ICD-10 medical coding
      const dynamicDiagnoses = unifiedPatients.map((p, idx) => {
        let code = "Z00.00";
        const cond = (p.condition || "").toLowerCase();
        if (cond.includes("hypertens") || cond.includes("bp") || cond.includes("pressure"))
          code = "I10";
        else if (cond.includes("diabet") || cond.includes("sugar"))
          code = "E11.9";
        else if (cond.includes("bronch") || cond.includes("cough") || cond.includes("respir"))
          code = "J20.9";
        else if (cond.includes("cardio") || cond.includes("heart"))
          code = "I25.1";
        else if (cond.includes("fever") || cond.includes("infect"))
          code = "R50.9";
        else if (cond.includes("knee") || cond.includes("joint") || cond.includes("ortho"))
          code = "M25.5";
        else if (cond.includes("gast") || cond.includes("stomach") || cond.includes("ulcer"))
          code = "K29.7";
        else code = `Z0${(idx % 9) + 1}.0`;

        return {
          code,
          name: p.condition || "Clinical Medical Evaluation",
          patient: p.name,
          severity:
            p.status === "Critical"
              ? "Severe"
              : p.status === "Follow-up"
              ? "Moderate"
              : "Mild",
          date: p.lastVisit,
        };
      });
      setDiagnoses(dynamicDiagnoses);

      // Initialize prescription pad & consultation notes with first patient dynamically
      if (unifiedPatients.length > 0) {
        const first =
          unifiedPatients.find((p) =>
            p.name?.toLowerCase().includes("shamil")
          ) || unifiedPatients[0];
        const savedSheet = localStorage.getItem(
          `doctor_prescription_sheet_${first.name}`
        );
        if (savedSheet) {
          try {
            const parsed = JSON.parse(savedSheet);
            if (
              parsed.subjectiveText?.includes("• Chief Complaints") ||
              parsed.objectiveText?.includes("• Vital Signs")
            ) {
              parsed.subjectiveText = "";
              parsed.objectiveText = "";
              parsed.assessmentText = "";
              parsed.planText = "";
            }
            parsed.patient = {
              ...parsed.patient,
              name: first.name,
              id: first.id,
              age: first.age && first.age !== "—" ? first.age : parsed.patient?.age || "",
              gender: first.gender && first.gender !== "Adult" ? first.gender : parsed.patient?.gender || "",
              phone: first.phone && first.phone !== "—" ? first.phone : parsed.patient?.phone || "",
            };
            localStorage.setItem(
              `doctor_prescription_sheet_${first.name}`,
              JSON.stringify(parsed)
            );
            setPrescriptionSheet(parsed);
          } catch {
            const fresh = generateDynamicPrescription(
              first,
              dynamicPrescriptions
            );
            if (fresh) setPrescriptionSheet(fresh);
          }
        } else {
          const fresh = generateDynamicPrescription(
            first,
            dynamicPrescriptions
          );
          if (fresh) setPrescriptionSheet(fresh);
        }

        // Set default patient for new prescription modal
        setNewRx((prev) => ({
          ...prev,
          patientName: prev.patientName || unifiedPatients[0].name,
          medication: prev.medication || (rawMedicines[0]?.name || ""),
        }));
      }
    } catch (err) {
      console.warn("Could not load clinical hub data:", err);
      toast.error("Failed to load clinical data from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinicalData();
  }, []);

  // Determine active tab based on route
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

  // =========================================================================
  // DYNAMIC SEARCH FILTERING
  // =========================================================================
  const filteredPatients = useMemo(() => {
    if (!search.trim()) return patients;
    const q = search.toLowerCase();
    return patients.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.id?.toLowerCase().includes(q) ||
        p.condition?.toLowerCase().includes(q) ||
        p.gender?.toLowerCase().includes(q) ||
        p.allergies?.toLowerCase().includes(q) ||
        p.phone?.toLowerCase().includes(q)
    );
  }, [patients, search]);

  const filteredAppointments = useMemo(() => {
    if (!search.trim()) return appointments;
    const q = search.toLowerCase();
    return appointments.filter(
      (a) =>
        a.patientName?.toLowerCase().includes(q) ||
        a.doctorName?.toLowerCase().includes(q) ||
        a.notes?.toLowerCase().includes(q) ||
        a.status?.toLowerCase().includes(q)
    );
  }, [appointments, search]);

  const filteredPrescriptions = useMemo(() => {
    if (!search.trim()) return prescriptions;
    const q = search.toLowerCase();
    return prescriptions.filter(
      (rx) =>
        rx.patient?.toLowerCase().includes(q) ||
        rx.medication?.toLowerCase().includes(q) ||
        rx.id?.toLowerCase().includes(q)
    );
  }, [prescriptions, search]);

  const filteredDiagnoses = useMemo(() => {
    if (!search.trim()) return diagnoses;
    const q = search.toLowerCase();
    return diagnoses.filter(
      (d) =>
        d.patient?.toLowerCase().includes(q) ||
        d.name?.toLowerCase().includes(q) ||
        d.code?.toLowerCase().includes(q)
    );
  }, [diagnoses, search]);

  // =========================================================================
  // ACTIONS & PRESCRIPTION SHEET HANDLERS
  // =========================================================================
  const handlePatientSelectForSheet = (patientName) => {
    const selPat = patients.find(
      (p) => p.name?.trim().toLowerCase() === patientName.trim().toLowerCase()
    );
    if (!selPat) return;

    const saved = localStorage.getItem(`doctor_prescription_sheet_${selPat.name}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.patient = {
          ...parsed.patient,
          name: selPat.name,
          id: selPat.id,
          age: selPat.age && selPat.age !== "—" ? selPat.age : parsed.patient?.age || "",
          gender: selPat.gender && selPat.gender !== "Adult" ? selPat.gender : parsed.patient?.gender || "",
          phone: selPat.phone && selPat.phone !== "—" ? selPat.phone : parsed.patient?.phone || "",
        };
        setPrescriptionSheet(parsed);
        return;
      } catch {
        // fall through
      }
    }

    const fresh = generateDynamicPrescription(selPat, prescriptions);
    if (fresh) {
      setPrescriptionSheet(fresh);
    }
  };

  const handlePrescriptionFieldChange = (section, field, value) => {
    setPrescriptionSheet((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
      saved: false,
    }));
  };

  const handleVitalMetricChange = (field, value) => {
    setPrescriptionSheet((prev) => ({
      ...prev,
      objective: {
        ...prev.objective,
        vitals: {
          ...prev.objective.vitals,
          [field]: value,
        },
      },
      saved: false,
    }));
  };

  const handleAddMedicationRow = () => {
    const newId = prescriptionSheet.plan.medications.length + 1;
    const defaultMed = medicines[0]?.name || "New Medication";
    setPrescriptionSheet((prev) => ({
      ...prev,
      plan: {
        ...prev.plan,
        medications: [
          ...prev.plan.medications,
          {
            id: newId,
            name: defaultMed,
            dosage: "1 Tab",
            frequency: "1 — 0 — 1",
            timing: "After Food",
            duration: "14 Days",
            instructions: "Take with water as directed",
          },
        ],
      },
      saved: false,
    }));
  };

  const handleRemoveMedicationRow = (id) => {
    setPrescriptionSheet((prev) => ({
      ...prev,
      plan: {
        ...prev.plan,
        medications: prev.plan.medications.filter((m) => m.id !== id),
      },
      saved: false,
    }));
  };

  const handleMedicationChange = (id, field, value) => {
    setPrescriptionSheet((prev) => ({
      ...prev,
      plan: {
        ...prev.plan,
        medications: prev.plan.medications.map((m) =>
          m.id === id ? { ...m, [field]: value } : m
        ),
      },
      saved: false,
    }));
  };

  const handleAddQuickMed = (medName) => {
    const newId = prescriptionSheet.plan.medications.length + 1;
    setPrescriptionSheet((prev) => ({
      ...prev,
      plan: {
        ...prev.plan,
        medications: [
          ...prev.plan.medications,
          {
            id: newId,
            name: `Tab. ${medName}`,
            dosage: "1 Tab",
            frequency: "1 — 0 — 1",
            timing: "After Food",
            duration: "14 Days",
            instructions: "Take with water as directed",
          },
        ],
      },
      saved: false,
    }));
    toast.success(`Added ${medName} to Prescription Pad!`);
  };

  const handleSavePrescriptionSheet = async (e) => {
    if (e) e.preventDefault();
    if (!prescriptionSheet.patient.name) {
      toast.warning("Please select a patient before saving.");
      return;
    }

    try {
      const matchApp = appointments.find(
        (a) =>
          a.patientName &&
          a.patientName.toLowerCase() ===
            prescriptionSheet.patient.name.toLowerCase()
      );

      if (matchApp && matchApp._id) {
        await updateAppointmentAPI(matchApp._id, {
          notes: `${prescriptionSheet.assessment.primaryDiagnosis} • Rx: ${prescriptionSheet.plan.medications
            .map((m) => m.name)
            .join(", ")}`.slice(0, 150),
        });
      }

      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const updated = {
        ...prescriptionSheet,
        saved: true,
        lastSaved: `Today, ${timestamp}`,
      };

      localStorage.setItem(
        `doctor_prescription_sheet_${prescriptionSheet.patient.name}`,
        JSON.stringify(updated)
      );
      setPrescriptionSheet(updated);
      toast.success(
        `Clinical Prescription Sheet saved for ${prescriptionSheet.patient.name}!`
      );
    } catch (err) {
      console.warn("Could not sync to backend:", err);
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const updated = {
        ...prescriptionSheet,
        saved: true,
        lastSaved: `Today, ${timestamp}`,
      };
      localStorage.setItem(
        `doctor_prescription_sheet_${prescriptionSheet.patient.name}`,
        JSON.stringify(updated)
      );
      setPrescriptionSheet(updated);
      toast.success(
        `Prescription saved locally for ${prescriptionSheet.patient.name}!`
      );
    }
  };

  const handleResetBaseline = () => {
    const selPat =
      patients.find((p) => p.name === prescriptionSheet.patient.name) ||
      patients[0];
    if (selPat) {
      const fresh = generateDynamicPrescription(selPat, prescriptions);
      if (fresh) {
        setPrescriptionSheet(fresh);
        toast.info(`Reset to dynamic clinical baseline for ${selPat.name}`);
      }
    }
  };

  const handlePrintPrescription = () => {
    toast.info(
      `Printing Clinical Prescription for ${prescriptionSheet.patient.name}...`
    );
    window.print();
  };

  const handleSoapTextChange = (field, value) => {
    setPrescriptionSheet((prev) => ({
      ...prev,
      [field]: value,
      saved: false,
    }));
  };

  const handleSaveNotes = async (e) => {
    e.preventDefault();
    if (!consultNotes.patient) {
      toast.warning("Please select a patient before saving clinical notes.");
      return;
    }

    try {
      // 1. Sync assessment & plan summary to matching appointment in MongoDB
      const matchApp = appointments.find(
        (a) =>
          a.patientName &&
          a.patientName.toLowerCase() === consultNotes.patient.toLowerCase()
      );

      if (matchApp && matchApp._id) {
        await updateAppointmentAPI(matchApp._id, {
          notes: `${consultNotes.chiefComplaint || "Consultation"} — ${
            consultNotes.assessment ? consultNotes.assessment.split("\n")[0] : ""
          }`.slice(0, 150),
        });
      }

      // 2. Persist full SOAP to localStorage
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const updatedNotes = {
        ...consultNotes,
        saved: true,
        lastSaved: `Today, ${timestamp}`,
      };

      localStorage.setItem(
        `doctor_soap_notes_${consultNotes.patient}`,
        JSON.stringify(updatedNotes)
      );
      setConsultNotes(updatedNotes);

      // 3. Update patient condition in state if chief complaint was changed
      if (consultNotes.chiefComplaint) {
        setPatients((prev) =>
          prev.map((p) =>
            p.name === consultNotes.patient
              ? { ...p, condition: consultNotes.chiefComplaint }
              : p
          )
        );
      }

      toast.success(
        `Clinical SOAP notes saved and synced for ${consultNotes.patient}!`
      );
    } catch (err) {
      console.warn("Could not sync SOAP note to MongoDB:", err);
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const updatedNotes = {
        ...consultNotes,
        saved: true,
        lastSaved: `Today, ${timestamp}`,
      };
      localStorage.setItem(
        `doctor_soap_notes_${consultNotes.patient}`,
        JSON.stringify(updatedNotes)
      );
      setConsultNotes(updatedNotes);
      toast.success(
        `Clinical SOAP notes saved locally for ${consultNotes.patient}!`
      );
    }
  };

  const handlePatientSelectForSOAP = (patientName) => {
    const selPat = patients.find(
      (p) => p.name?.trim().toLowerCase() === patientName.trim().toLowerCase()
    );
    if (!selPat) return;

    const saved = localStorage.getItem(`doctor_soap_notes_${selPat.name}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConsultNotes({
          ...parsed,
          patient: selPat.name,
          patientId: selPat.id,
          saved: true,
        });
        return;
      } catch {
        // fall through
      }
    }

    const fresh = generateDynamicSOAP(selPat, prescriptions);
    if (fresh) {
      setConsultNotes(fresh);
    }
  };

  const handleVitalChange = (field, value) => {
    const updatedVitals = {
      ...(consultNotes.vitals || {
        bp: "120/80",
        hr: "74",
        temp: "98.6",
        spo2: "98",
        weight: "70",
      }),
      [field]: value,
    };

    // Auto-sync into Objective note
    let newObjective = consultNotes.objective || "";
    const vitalsPattern = /Vital Signs: BP [^|]+ \| Heart Rate [^|]+ \| Temp [^|]+ \| SpO2 [^|]+ \| Weight [^\n]+/;
    const newVitalsLine = `Vital Signs: BP ${updatedVitals.bp} mmHg | Heart Rate ${updatedVitals.hr} bpm | Temp ${updatedVitals.temp} °F | SpO2 ${updatedVitals.spo2}% on room air | Weight ${updatedVitals.weight} kg`;

    if (vitalsPattern.test(newObjective)) {
      newObjective = newObjective.replace(vitalsPattern, newVitalsLine);
    } else {
      newObjective = `${newVitalsLine}.\n${newObjective}`.trim();
    }

    setConsultNotes((prev) => ({
      ...prev,
      vitals: updatedVitals,
      objective: newObjective,
      saved: false,
    }));
  };

  const handleApplyClinicalChip = (chipLabel, icdCode) => {
    const p = patients.find((pat) => pat.name === consultNotes.patient) || {
      name: consultNotes.patient,
    };
    const newSubj = `Patient ${p.name} presents for comprehensive clinical evaluation of ${chipLabel}. Clinical triage confirms acute/subacute symptom presentation. Patient denies severe functional impairment or chest distress.`;
    const newAssess = `1. ${chipLabel} (ICD-10: ${icdCode}) - active clinical consideration.\n2. Physiological vitals documented within acceptable clinical ranges.\n3. Standard management protocol indicated with symptom surveillance.`;

    setConsultNotes((prev) => ({
      ...prev,
      chiefComplaint: chipLabel,
      subjective: newSubj,
      assessment: newAssess,
      saved: false,
    }));
    toast.info(`Applied template: ${chipLabel} (${icdCode})`);
  };

  const handleAddMedToPlan = (medText) => {
    setConsultNotes((prev) => {
      const currentPlan = prev.plan || "";
      const bullet = `   - ${medText}`;
      if (currentPlan.includes(medText)) {
        toast.info(`${medText} is already in the Plan`);
        return prev;
      }
      let newPlan = "";
      if (currentPlan.includes("Pharmacotherapy:")) {
        newPlan = currentPlan.replace(
          "Pharmacotherapy:",
          `Pharmacotherapy:\n${bullet}`
        );
      } else {
        newPlan = `1. Pharmacotherapy:\n${bullet}\n\n${currentPlan}`;
      }
      return {
        ...prev,
        plan: newPlan,
        saved: false,
      };
    });
    toast.success(`Added ${medText} to Plan!`);
  };

  const handleOpenChart = (patient) => {
    setSelectedPatientChart(patient);
  };

  const handleWritePrescriptionSubmit = (e) => {
    e.preventDefault();
    if (!newRx.patientName || !newRx.medication) {
      toast.warning("Please enter patient and medication details.");
      return;
    }

    const createdRx = {
      id: `RX-${Math.floor(1000 + Math.random() * 9000)}`,
      patient: newRx.patientName,
      medication: newRx.medication,
      dosage: newRx.dosage,
      duration: newRx.duration,
      date: new Date().toISOString().split("T")[0],
      status: "Active",
    };

    const updated = [createdRx, ...prescriptions];
    setPrescriptions(updated);
    localStorage.setItem("doctor_prescriptions_list", JSON.stringify(updated));
    setShowRxModal(false);
    toast.success(`Prescription issued for ${newRx.patientName}!`);
  };

  const handleOpenEditRx = (rx) => {
    setEditRx({
      id: rx.id,
      patient: rx.patient,
      medication: rx.medication,
      dosage: rx.dosage,
      duration: rx.duration,
      date: rx.date,
      status: rx.status || "Active",
    });
  };

  const handleSaveEditRx = (e) => {
    e.preventDefault();
    if (!editRx) return;

    const updated = prescriptions.map((item) =>
      item.id === editRx.id ? { ...item, ...editRx } : item
    );
    setPrescriptions(updated);
    localStorage.setItem("doctor_prescriptions_list", JSON.stringify(updated));
    setEditRx(null);
    toast.success(`Prescription ${editRx.id} updated successfully!`);
  };

  const handlePromptDeleteRx = (rx) => {
    setRxToDelete(rx);
  };

  const handleConfirmDeleteRx = () => {
    if (!rxToDelete) return;

    const updated = prescriptions.filter((item) => item.id !== rxToDelete.id);
    setPrescriptions(updated);
    localStorage.setItem("doctor_prescriptions_list", JSON.stringify(updated));
    const deletedId = rxToDelete.id;
    setRxToDelete(null);
    toast.success(`Prescription ${deletedId} deleted successfully!`);
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
            <button
              className="navbar-search-btn"
              aria-label="Search"
              onClick={() => {}}
            >
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
              Manage patient diagnoses, digital prescriptions, and clinical progress notes.
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 1. PATIENTS & MEDICAL HISTORY VIEW                             */}
        {/* ============================================================== */}
        {(activeTab === "patients" || activeTab === "medical-history") && (
          <div className="card clinical-table-card">
            <div className="card-header">
              <h2 className="card-title">Patient Case Files</h2>
              <div className="clinical-card-actions">
                <span className="clinical-counter-pill">
                  {filteredPatients.length} active{" "}
                  {filteredPatients.length === 1 ? "patient" : "patients"}
                </span>
                <button
                  className="clinical-refresh-btn"
                  onClick={fetchClinicalData}
                  title="Reload patient records"
                  aria-label="Reload records"
                >
                  <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                </button>
              </div>
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
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="clinical-empty-cell">
                        <div className="empty-state-content">
                          <Loader2 size={32} className="animate-spin text-sky-600" />
                          <p className="empty-title">Loading clinical patient records...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="clinical-empty-cell">
                        <div className="empty-state-content">
                          <Users size={38} className="empty-icon" />
                          <p className="empty-title">
                            {search
                              ? `No patients found matching "${search}"`
                              : "No patient case files recorded yet"}
                          </p>
                          <span className="empty-desc">
                            {search
                              ? "Try clearing or modifying your search query."
                              : "New patient registrations and appointments from MongoDB will appear here dynamically."}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((p) => (
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
                          {p.age} {p.age !== "—" ? "yrs" : ""} • {p.gender}
                        </td>
                        <td>
                          <strong>{p.condition}</strong>
                        </td>
                        <td>
                          <span
                            className={`allergy-pill ${
                              p.allergies &&
                              p.allergies !== "None" &&
                              p.allergies !== "None Reported"
                                ? "has-allergy"
                                : ""
                            }`}
                          >
                            {p.allergies}
                          </span>
                        </td>
                        <td>{p.lastVisit}</td>
                        <td>
                          <span
                            className={`status-pill ${
                              p.status?.toLowerCase().includes("stable")
                                ? "status-stable"
                                : p.status?.toLowerCase().includes("follow")
                                ? "status-followup"
                                : "status-active"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-open-chart"
                            onClick={() => handleOpenChart(p)}
                          >
                            View Chart
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. DOCTOR APPOINTMENTS SCHEDULE VIEW                           */}
        {/* ============================================================== */}
        {activeTab === "appointments" && (
          <div className="card clinical-table-card">
            <div className="card-header">
              <h2 className="card-title">Scheduled Doctor Appointments</h2>
              <div className="clinical-card-actions">
                <span className="clinical-counter-pill">
                  {filteredAppointments.length} scheduled
                </span>
                <button
                  className="clinical-refresh-btn"
                  onClick={fetchClinicalData}
                  title="Reload appointments"
                >
                  <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="clinical-table">
                <thead>
                  <tr>
                    <th>Appt ID</th>
                    <th>Patient Name</th>
                    <th>Doctor</th>
                    <th>Date & Time</th>
                    <th>Clinical Concern / Notes</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="clinical-empty-cell">
                        <div className="empty-state-content">
                          <Loader2 size={32} className="animate-spin text-sky-600" />
                          <p className="empty-title">Loading appointments...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="clinical-empty-cell">
                        <div className="empty-state-content">
                          <CalendarCheck size={38} className="empty-icon" />
                          <p className="empty-title">
                            {search
                              ? `No appointments found matching "${search}"`
                              : "No scheduled appointments found"}
                          </p>
                          <span className="empty-desc">
                            Patient consultation appointments booked at the reception desk will show here.
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((a, idx) => (
                      <tr key={a._id || idx}>
                        <td>
                          <strong>
                            {a.appointmentId ||
                              (a._id
                                ? `APT-${String(a._id).slice(-4).toUpperCase()}`
                                : `APT-${idx + 101}`)}
                          </strong>
                        </td>
                        <td>
                          <div className="patient-name-cell">
                            <User size={14} /> {a.patientName}
                          </div>
                        </td>
                        <td>{a.doctorName}</td>
                        <td>
                          {a.date
                            ? new Date(a.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Today"}{" "}
                          • {a.time || "10:30 AM"}
                        </td>
                        <td>
                          <strong>{a.notes || "General Consultation"}</strong>
                        </td>
                        <td>
                          <span
                            className={`status-pill ${
                              a.status === "Completed"
                                ? "status-stable"
                                : "status-active"
                            }`}
                          >
                            {a.status || "Scheduled"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-open-chart"
                            onClick={() => {
                              const matchPat = patients.find(
                                (p) =>
                                  p.name?.trim().toLowerCase() ===
                                  (a.patientName || "").trim().toLowerCase()
                              );
                              if (matchPat) {
                                handleOpenChart(matchPat);
                              } else {
                                const patId =
                                  a.patientId ||
                                  (a._id
                                    ? `PAT-${String(a._id).slice(-4).toUpperCase()}`
                                    : `PAT-101`);
                                handleOpenChart({
                                  id: patId,
                                  name: a.patientName,
                                  age: a.patientAge || "—",
                                  gender: a.patientGender || "Adult",
                                  condition: a.notes || "Clinical Consultation",
                                  allergies: "None Reported",
                                  lastVisit: a.date
                                    ? new Date(a.date).toISOString().split("T")[0]
                                    : "Today",
                                  status: a.status || "Scheduled",
                                });
                              }
                            }}
                          >
                            Consult
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. DIGITAL PRESCRIPTIONS VIEW                                  */}
        {/* ============================================================== */}
        {activeTab === "prescriptions" && (
          <div className="card clinical-table-card">
            <div className="card-header">
              <h2 className="card-title">Active Patient Prescriptions</h2>
              <div className="clinical-card-actions">
                <button
                  className="btn-quick-action"
                  onClick={() => setShowRxModal(true)}
                >
                  <Plus size={15} /> Write Prescription
                </button>
                <button
                  className="clinical-refresh-btn"
                  onClick={fetchClinicalData}
                  title="Reload prescriptions"
                >
                  <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                </button>
              </div>
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
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="clinical-empty-cell">
                        <div className="empty-state-content">
                          <Loader2 size={32} className="animate-spin text-sky-600" />
                          <p className="empty-title">Loading prescriptions...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPrescriptions.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="clinical-empty-cell">
                        <div className="empty-state-content">
                          <FileText size={38} className="empty-icon" />
                          <p className="empty-title">
                            {search
                              ? `No prescriptions found matching "${search}"`
                              : "No active prescriptions recorded"}
                          </p>
                          <span className="empty-desc">
                            Click 'Write Prescription' above to issue a digital prescription for a patient.
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPrescriptions.map((rx) => (
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
                          <span
                            className={`status-pill ${
                              rx.status === "Dispensed"
                                ? "status-dispensed"
                                : rx.status === "Completed"
                                ? "status-completed"
                                : rx.status === "Cancelled"
                                ? "status-cancelled"
                                : rx.status === "Pending"
                                ? "status-pending"
                                : "status-active"
                            }`}
                          >
                            {rx.status}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions-cell">
                            <button
                              className="btn-action-icon btn-action-edit"
                              onClick={() => handleOpenEditRx(rx)}
                              title="Edit Prescription"
                              aria-label="Edit Prescription"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              className="btn-action-icon btn-action-print"
                              onClick={() => {
                                toast.info(`Printing Rx slip for ${rx.patient}...`);
                                window.print();
                              }}
                              title="Print Prescription"
                              aria-label="Print Prescription"
                            >
                              <Printer size={14} />
                            </button>
                            <button
                              className="btn-action-icon btn-action-delete"
                              onClick={() => handlePromptDeleteRx(rx)}
                              title="Delete Prescription"
                              aria-label="Delete Prescription"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. DIAGNOSIS VIEW                                              */}
        {/* ============================================================== */}
        {activeTab === "diagnosis" && (
          <div className="card clinical-table-card">
            <div className="card-header">
              <h2 className="card-title">ICD-10 Clinical Diagnoses Log</h2>
              <div className="clinical-card-actions">
                <span className="trend-badge trend-up">
                  Standard Medical Classification
                </span>
                <button
                  className="clinical-refresh-btn"
                  onClick={fetchClinicalData}
                  title="Reload diagnoses"
                >
                  <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                </button>
              </div>
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
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="clinical-empty-cell">
                        <div className="empty-state-content">
                          <Loader2 size={32} className="animate-spin text-sky-600" />
                          <p className="empty-title">Loading diagnostic logs...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredDiagnoses.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="clinical-empty-cell">
                        <div className="empty-state-content">
                          <Activity size={38} className="empty-icon" />
                          <p className="empty-title">
                            {search
                              ? `No diagnoses found matching "${search}"`
                              : "No clinical diagnoses recorded"}
                          </p>
                          <span className="empty-desc">
                            Diagnoses logged during patient consultations will appear here.
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDiagnoses.map((d, i) => (
                      <tr key={i}>
                        <td>
                          <span className="icd-badge">{d.code}</span>
                        </td>
                        <td>
                          <strong>{d.name}</strong>
                        </td>
                        <td>{d.patient}</td>
                        <td>
                          <span
                            className={`status-pill ${
                              d.severity === "Severe"
                                ? "status-pending"
                                : d.severity === "Moderate"
                                ? "status-followup"
                                : "status-recovering"
                            }`}
                          >
                            {d.severity}
                          </span>
                        </td>
                        <td>{d.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 5. AUTHENTIC CLINICAL PRESCRIPTION PAD / SOAP LETTERHEAD       */}
        {/* ============================================================== */}
        {activeTab === "consultation-notes" && (
          <div className="card rx-pad-card">
            {/* Top Control Bar (Hidden on Print) */}
            <div className="soap-patient-bar">
              <div className="soap-patient-select-wrapper">
                <label>Select Patient Chart:</label>
                <select
                  className="soap-patient-select"
                  value={prescriptionSheet.patient.name}
                  onChange={(e) => handlePatientSelectForSheet(e.target.value)}
                >
                  {patients.length === 0 ? (
                    <option value="">No patients available</option>
                  ) : (
                    patients.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} ({p.id}) — {p.condition}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="soap-actions-btns">
                

                <button
                  type="button"
                  className="btn-secondary-custom"
                  onClick={handleResetBaseline}
                  title="Reset to fresh dynamic baseline"
                >
                  <RefreshCw
                    size={14}
                    style={{ display: "inline", marginRight: 6 }}
                  />
                  Reset Baseline
                </button>

                

                <button
                  type="button"
                  className="btn-quick-action"
                  onClick={handleSavePrescriptionSheet}
                >
                  <CheckCircle2 size={16} /> Save Prescription
                </button>
              </div>
            </div>

            {/* ============================================================== */}
            {/* AUTHENTIC CLINICAL PRESCRIPTION LETTERHEAD SHEET               */}
            {/* ============================================================== */}
            <div className="rx-pad-paper" id="printable-prescription-pad">
              {/* 1 & 2. Hospital Information (Left) & Doctor Information (Right) */}
              <div className="rx-header">
                {/* 1. Hospital Information */}
                <div className="rx-hospital-brand">
                  <div className="rx-hospital-logo-row">
                    <div className="rx-hospital-icon">✚</div>
                    <div>
                      <h1 className="rx-hospital-title">
                        {prescriptionSheet.hospital.name}
                      </h1>
                      <p className="rx-hospital-subtitle">
                        {prescriptionSheet.hospital.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="rx-hospital-meta">
                    <div>
                      Tel: {prescriptionSheet.hospital.phone} &bull; Emergency:{" "}
                      {prescriptionSheet.hospital.emergency}
                    </div>
                    <div>
                      Email: {prescriptionSheet.hospital.email} &bull; Web:{" "}
                      {prescriptionSheet.hospital.web}
                    </div>
                  </div>
                </div>

                {/* 2. Doctor Information */}
                <div className="rx-doctor-brand">
                  <h2 className="rx-doctor-name">
                    {prescriptionSheet.doctor.name}
                  </h2>
                  <div className="rx-doctor-qual">
                    {prescriptionSheet.doctor.qualification}
                  </div>
                  <div className="rx-doctor-spec">
                    {prescriptionSheet.doctor.specialization}
                  </div>
                  <div className="rx-doctor-reg">
                    {prescriptionSheet.doctor.regNo}
                  </div>
                  <div className="rx-doctor-opd">
                    {prescriptionSheet.doctor.room} &bull;{" "}
                    {prescriptionSheet.doctor.timings}
                  </div>
                </div>
              </div>

              {/* Header Divider Line matching user mockup */}
              <div className="rx-header-divider" />

              {/* 3. Patient Information Bar (Exact match to image) */}
              <div className="rx-patient-bar">
                <div className="rx-patient-cell">
                  <span className="rx-patient-label">PATIENT NAME:</span>
                  <input
                    type="text"
                    className="rx-patient-input"
                    value={prescriptionSheet.patient.name}
                    onChange={(e) =>
                      handlePrescriptionFieldChange(
                        "patient",
                        "name",
                        e.target.value
                      )
                    }
                    placeholder="Patient Name"
                  />
                </div>
                <div className="rx-patient-cell">
                  <span className="rx-patient-label">PATIENT ID:</span>
                  <input
                    type="text"
                    className="rx-patient-input"
                    value={prescriptionSheet.patient.id}
                    onChange={(e) =>
                      handlePrescriptionFieldChange(
                        "patient",
                        "id",
                        e.target.value
                      )
                    }
                    placeholder="PAT-001"
                  />
                </div>
                <div className="rx-patient-cell">
                  <span className="rx-patient-label">AGE / GENDER:</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      type="text"
                      className="rx-patient-input"
                      style={{ width: "45px" }}
                      value={prescriptionSheet.patient.age}
                      onChange={(e) =>
                        handlePrescriptionFieldChange(
                          "patient",
                          "age",
                          e.target.value
                        )
                      }
                      placeholder="21"
                    />
                    <input
                      type="text"
                      className="rx-patient-input"
                      style={{ width: "65px" }}
                      value={prescriptionSheet.patient.gender}
                      onChange={(e) =>
                        handlePrescriptionFieldChange(
                          "patient",
                          "gender",
                          e.target.value
                        )
                      }
                      placeholder="Male"
                    />
                  </div>
                </div>
                <div className="rx-patient-cell">
                  <span className="rx-patient-label">PHONE:</span>
                  <input
                    type="text"
                    className="rx-patient-input"
                    style={{ width: "130px" }}
                    value={prescriptionSheet.patient.phone}
                    onChange={(e) =>
                      handlePrescriptionFieldChange(
                        "patient",
                        "phone",
                        e.target.value
                      )
                    }
                    placeholder="4564527828"
                  />
                </div>
                <div className="rx-patient-cell">
                  <span className="rx-patient-label">CONSULTATION DATE:</span>
                  <input
                    type="date"
                    className="rx-patient-input"
                    style={{ width: "140px" }}
                    value={prescriptionSheet.patient.consultDate}
                    onChange={(e) =>
                      handlePrescriptionFieldChange(
                        "patient",
                        "consultDate",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              {/* Main SOAP Clinical Body - Matching User Mockup Exactly */}
              <div className="rx-soap-body">
                {/* 4. Subjective */}
                <div className="rx-soap-section">
                  <h3 className="rx-soap-heading">Subjective :</h3>
                  <textarea
                    className="rx-soap-textarea"
                    rows={4}
                    value={prescriptionSheet.subjectiveText || ""}
                    onChange={(e) =>
                      handleSoapTextChange("subjectiveText", e.target.value)
                    }
                    placeholder=""
                  />
                </div>

                {/* 5. Objective */}
                <div className="rx-soap-section">
                  <h3 className="rx-soap-heading">Objective :</h3>
                  <textarea
                    className="rx-soap-textarea"
                    rows={4}
                    value={prescriptionSheet.objectiveText || ""}
                    onChange={(e) =>
                      handleSoapTextChange("objectiveText", e.target.value)
                    }
                    placeholder=""
                  />
                </div>

                {/* 6. Assessment */}
                <div className="rx-soap-section">
                  <h3 className="rx-soap-heading">Assessment :</h3>
                  <textarea
                    className="rx-soap-textarea"
                    rows={4}
                    value={prescriptionSheet.assessmentText || ""}
                    onChange={(e) =>
                      handleSoapTextChange("assessmentText", e.target.value)
                    }
                    placeholder=""
                  />
                </div>

                {/* 7. Plan */}
                <div className="rx-soap-section">
                  <h3 className="rx-soap-heading">Plan :</h3>
                  <textarea
                    className="rx-soap-textarea rx-soap-plan-textarea"
                    rows={7}
                    value={prescriptionSheet.planText || ""}
                    onChange={(e) =>
                      handleSoapTextChange("planText", e.target.value)
                    }
                    placeholder=""
                  />
                </div>
              </div>

              

              {/* 9. Hospital Footer */}
              <div className="rx-footer">
                <div className="rx-footer-hospital">
                  {prescriptionSheet.footer.hospitalName}
                </div>
                <div className="rx-footer-contacts">
                  {prescriptionSheet.footer.contacts}
                </div>
                <div className="rx-footer-emergency-pill">
                  {prescriptionSheet.footer.emergencyNotice}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PATIENT CHART MODAL                                            */}
        {/* ============================================================== */}
        {selectedPatientChart && (
          <div
            className="clinical-modal-backdrop"
            onClick={() => setSelectedPatientChart(null)}
          >
            <div
              className="clinical-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="clinical-modal-header">
                <h3 className="clinical-modal-title">
                  <Stethoscope size={18} className="text-sky-600" />
                  Clinical Chart • {selectedPatientChart.name}
                </h3>
                <button
                  className="clinical-modal-close"
                  onClick={() => setSelectedPatientChart(null)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="clinical-modal-body">
                <div className="chart-grid">
                  <div className="chart-field">
                    <div className="chart-field-label">Patient ID</div>
                    <div className="chart-field-val">
                      {selectedPatientChart.id}
                    </div>
                  </div>
                  <div className="chart-field">
                    <div className="chart-field-label">Age & Gender</div>
                    <div className="chart-field-val">
                      {selectedPatientChart.age}{" "}
                      {selectedPatientChart.age !== "—" ? "yrs" : ""} •{" "}
                      {selectedPatientChart.gender}
                    </div>
                  </div>
                  <div className="chart-field">
                    <div className="chart-field-label">Primary Diagnosis</div>
                    <div className="chart-field-val text-sky-700">
                      {selectedPatientChart.condition}
                    </div>
                  </div>
                  <div className="chart-field">
                    <div className="chart-field-label">Known Allergies</div>
                    <div className="chart-field-val">
                      <span
                        className={`allergy-pill ${
                          selectedPatientChart.allergies &&
                          selectedPatientChart.allergies !== "None" &&
                          selectedPatientChart.allergies !== "None Reported"
                            ? "has-allergy"
                            : ""
                        }`}
                      >
                        {selectedPatientChart.allergies}
                      </span>
                    </div>
                  </div>
                  <div className="chart-field">
                    <div className="chart-field-label">Contact Phone</div>
                    <div className="chart-field-val">
                      {selectedPatientChart.phone || "Not recorded"}
                    </div>
                  </div>
                  <div className="chart-field">
                    <div className="chart-field-label">Last Consultation</div>
                    <div className="chart-field-val">
                      {selectedPatientChart.lastVisit}
                    </div>
                  </div>
                </div>

                <div className="chart-field" style={{ marginTop: 4 }}>
                  <div className="chart-field-label">Address</div>
                  <div className="chart-field-val">
                    {selectedPatientChart.address || "Standard Residence"}
                  </div>
                </div>
              </div>

              <div className="clinical-modal-footer">
                <button
                  className="btn-secondary-custom"
                  onClick={() => setSelectedPatientChart(null)}
                >
                  Close Chart
                </button>
                <button
                  className="btn-quick-action"
                  onClick={() => {
                    handlePatientSelectForSOAP(selectedPatientChart.name);
                    setSelectedPatientChart(null);
                    navigate("/doctor/consultation-notes");
                    toast.info(
                      `Switched to SOAP Notes for ${selectedPatientChart.name}`
                    );
                  }}
                >
                  <FileSignature size={15} /> Open SOAP Notes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* WRITE PRESCRIPTION MODAL                                       */}
        {/* ============================================================== */}
        {showRxModal && (
          <div
            className="clinical-modal-backdrop"
            onClick={() => setShowRxModal(false)}
          >
            <div
              className="clinical-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="clinical-modal-header">
                <h3 className="clinical-modal-title">
                  <FileText size={18} className="text-sky-600" />
                  Write Digital Prescription
                </h3>
                <button
                  className="clinical-modal-close"
                  onClick={() => setShowRxModal(false)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleWritePrescriptionSubmit}>
                <div className="clinical-modal-body">
                  <div className="form-group-custom">
                    <label>Select Patient</label>
                    <select
                      className="form-select-custom"
                      value={newRx.patientName}
                      onChange={(e) =>
                        setNewRx({ ...newRx, patientName: e.target.value })
                      }
                      required
                    >
                      {patients.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name} ({p.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group-custom">
                    <label>Medication</label>
                    {medicines.length > 0 ? (
                      <select
                        className="form-select-custom"
                        value={newRx.medication}
                        onChange={(e) =>
                          setNewRx({ ...newRx, medication: e.target.value })
                        }
                        required
                      >
                        {medicines.map((m) => (
                          <option
                            key={m._id || m.medicineId}
                            value={`${m.name} ${m.dosage || ""}`.trim()}
                          >
                            {m.name} ({m.category || "General"}) — Stock: {m.stock}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        className="form-input-custom"
                        placeholder="e.g. Amoxicillin 500mg"
                        value={newRx.medication}
                        onChange={(e) =>
                          setNewRx({ ...newRx, medication: e.target.value })
                        }
                        required
                      />
                    )}
                  </div>

                  <div className="chart-grid">
                    <div className="form-group-custom">
                      <label>Dosage & Frequency</label>
                      <input
                        type="text"
                        className="form-input-custom"
                        placeholder="e.g. 1 tablet twice daily"
                        value={newRx.dosage}
                        onChange={(e) =>
                          setNewRx({ ...newRx, dosage: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="form-group-custom">
                      <label>Duration</label>
                      <select
                        className="form-select-custom"
                        value={newRx.duration}
                        onChange={(e) =>
                          setNewRx({ ...newRx, duration: e.target.value })
                        }
                      >
                        <option value="5 Days">5 Days</option>
                        <option value="7 Days">7 Days</option>
                        <option value="14 Days">14 Days</option>
                        <option value="30 Days">30 Days</option>
                        <option value="60 Days">60 Days</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group-custom">
                    <label>Special Instructions</label>
                    <input
                      type="text"
                      className="form-input-custom"
                      placeholder="e.g. Take after meals with plenty of water"
                      value={newRx.instructions}
                      onChange={(e) =>
                        setNewRx({ ...newRx, instructions: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="clinical-modal-footer">
                  <button
                    type="button"
                    className="btn-secondary-custom"
                    onClick={() => setShowRxModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-quick-action">
                    <CheckCircle2 size={16} /> Issue Prescription
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* EDIT PRESCRIPTION MODAL                                        */}
        {/* ============================================================== */}
        {editRx && (
          <div
            className="clinical-modal-backdrop"
            onClick={() => setEditRx(null)}
          >
            <div
              className="clinical-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="clinical-modal-header">
                <h3 className="clinical-modal-title">
                  <Pencil size={18} className="text-sky-600" />
                  Edit Prescription • {editRx.id}
                </h3>
                <button
                  className="clinical-modal-close"
                  onClick={() => setEditRx(null)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEditRx}>
                <div className="clinical-modal-body">
                  <div className="form-group-custom">
                    <label>Patient Name</label>
                    <input
                      type="text"
                      className="form-input-custom"
                      value={editRx.patient}
                      onChange={(e) =>
                        setEditRx({ ...editRx, patient: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group-custom">
                    <label>Medication</label>
                    <input
                      type="text"
                      className="form-input-custom"
                      value={editRx.medication}
                      onChange={(e) =>
                        setEditRx({ ...editRx, medication: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="chart-grid">
                    <div className="form-group-custom">
                      <label>Dosage & Instructions</label>
                      <input
                        type="text"
                        className="form-input-custom"
                        value={editRx.dosage}
                        onChange={(e) =>
                          setEditRx({ ...editRx, dosage: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="form-group-custom">
                      <label>Duration</label>
                      <select
                        className="form-select-custom"
                        value={editRx.duration}
                        onChange={(e) =>
                          setEditRx({ ...editRx, duration: e.target.value })
                        }
                      >
                        <option value="5 Days">5 Days</option>
                        <option value="7 Days">7 Days</option>
                        <option value="14 Days">14 Days</option>
                        <option value="30 Days">30 Days</option>
                        <option value="60 Days">60 Days</option>
                        <option value="90 Days">90 Days</option>
                      </select>
                    </div>
                  </div>

                  <div className="chart-grid">
                    <div className="form-group-custom">
                      <label>Date Issued</label>
                      <input
                        type="date"
                        className="form-input-custom"
                        value={editRx.date}
                        onChange={(e) =>
                          setEditRx({ ...editRx, date: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="form-group-custom">
                      <label>Status</label>
                      <select
                        className="form-select-custom"
                        value={editRx.status}
                        onChange={(e) =>
                          setEditRx({ ...editRx, status: e.target.value })
                        }
                      >
                        <option value="Active">Active</option>
                        <option value="Dispensed">Dispensed</option>
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="clinical-modal-footer">
                  <button
                    type="button"
                    className="btn-secondary-custom"
                    onClick={() => setEditRx(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-quick-action">
                    <CheckCircle2 size={16} /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* DELETE CONFIRMATION MODAL                                      */}
        {/* ============================================================== */}
        {rxToDelete && (
          <div
            className="clinical-modal-backdrop"
            onClick={() => setRxToDelete(null)}
          >
            <div
              className="clinical-modal"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 460 }}
            >
              <div className="clinical-modal-header">
                <h3 className="clinical-modal-title" style={{ color: "#ef4444" }}>
                  <AlertCircle size={20} />
                  Delete Prescription
                </h3>
                <button
                  className="clinical-modal-close"
                  onClick={() => setRxToDelete(null)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="clinical-modal-body">
                <div className="delete-modal-warning">
                  <Trash2 size={24} className="delete-modal-warning-icon" />
                  <div>
                    <h4 className="delete-modal-warning-title">
                      Delete prescription {rxToDelete.id}?
                    </h4>
                    <p className="delete-modal-warning-desc">
                      Are you sure you want to delete this prescription for{" "}
                      <strong>{rxToDelete.patient}</strong> (
                      <em>{rxToDelete.medication}</em>)? This action cannot be
                      undone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="clinical-modal-footer">
                <button
                  type="button"
                  className="btn-secondary-custom"
                  onClick={() => setRxToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-delete-confirm"
                  onClick={handleConfirmDeleteRx}
                >
                  <Trash2 size={16} /> Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
