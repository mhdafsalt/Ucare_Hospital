import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home/Home";
import AdminDashboard from "./pages/Admin/Dashboard/adminDashboard";
import AddDoctors from "./pages/Admin/AdminDoctors/addDoctors";
import AddReceptionist from "./pages/Admin/AddReceptionist/AddReceptionist";
import AddPharmacist from "./pages/Admin/AdminPharmacist/AddPharmacist";
import AddBillingStaff from "./pages/Admin/AdminBillingStaff/AddBillingStaff";
import AdminOperationsHub from "./pages/Admin/AdminOperationsHub";
import AddPatients from "./pages/Receptionist/addPatients/addPatients";
import Appointments from "./pages/Receptionist/appointments/Appointments";
import ReceptionistHub from "./pages/Receptionist/ReceptionistHub";
import DoctorDashboard from "./pages/Doctor/Dashboard/doctorDashboard";
import DoctorClinicalHub from "./pages/Doctor/DoctorClinicalHub";
import PharmacyPanel from "./pages/Pharmacy/PharmacyPanel";
import BillingPanel from "./pages/Billing/BillingPanel";
import AddSupport from "./pages/Support/AddSupport/AddSupport";
import ListSupport from "./pages/Support/ListSupport/ListSupport";

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const rawRole = localStorage.getItem("userRole") || "";
  const userRole = rawRole.toLowerCase().trim();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Admin has overarching access to all hospital panels
  if (userRole === "admin") {
    return children;
  }

  if (role) {
    const allowed = (Array.isArray(role) ? role : [role]).map((r) =>
      r.toLowerCase().trim()
    );

    // Normalize pharmacy <=> pharmacist
    if (
      (userRole === "pharmacist" || userRole === "pharmacy") &&
      (allowed.includes("pharmacist") || allowed.includes("pharmacy"))
    ) {
      return children;
    }

    // Normalize billing <=> billingstaff
    if (
      (userRole === "billing" || userRole === "billingstaff") &&
      (allowed.includes("billing") || allowed.includes("billingstaff"))
    ) {
      return children;
    }

    if (!allowed.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Navigate to="/?auth=true" replace />} />

      {/* ===================================================================
          1. ADMIN PANEL ROUTES (10 ITEMS)
          =================================================================== */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/add-doctor"
        element={
          <ProtectedRoute role="admin">
            <AddDoctors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/add-receptionist"
        element={
          <ProtectedRoute role="admin">
            <AddReceptionist />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/add-pharmacist"
        element={
          <ProtectedRoute role="admin">
            <AddPharmacist />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/add-billing-staff"
        element={
          <ProtectedRoute role="admin">
            <AddBillingStaff />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/patients"
        element={
          <ProtectedRoute role="admin">
            <AdminOperationsHub />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <ProtectedRoute role="admin">
            <AdminOperationsHub />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pharmacy"
        element={
          <ProtectedRoute role="admin">
            <PharmacyPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/billing"
        element={
          <ProtectedRoute role="admin">
            <BillingPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute role="admin">
            <BillingPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute role="admin">
            <BillingPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute role="admin">
            <AdminOperationsHub />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/ListSupport"
        element={
          <ProtectedRoute role="admin">
            <ListSupport />
          </ProtectedRoute>
        }
      />

      {/* ===================================================================
          2. DOCTOR PANEL ROUTES (7 ITEMS)
          =================================================================== */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute role="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients"
        element={
          <ProtectedRoute role="doctor">
            <DoctorClinicalHub />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/appointments"
        element={
          <ProtectedRoute role="doctor">
            <DoctorClinicalHub />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/medical-history"
        element={
          <ProtectedRoute role="doctor">
            <DoctorClinicalHub />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/prescriptions"
        element={
          <ProtectedRoute role="doctor">
            <DoctorClinicalHub />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/diagnosis"
        element={
          <ProtectedRoute role="doctor">
            <DoctorClinicalHub />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/consultation-notes"
        element={
          <ProtectedRoute role="doctor">
            <DoctorClinicalHub />
          </ProtectedRoute>
        }
      />

      {/* ===================================================================
          3. RECEPTIONIST PANEL ROUTES (8 ITEMS)
          =================================================================== */}
      <Route
        path="/receptionist/dashboard"
        element={
          <ProtectedRoute role="receptionist">
            <ReceptionistHub />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/add-patient"
        element={
          <ProtectedRoute role="receptionist">
            <AddPatients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/patients-list"
        element={
          <ProtectedRoute role="receptionist">
            <ReceptionistHub />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/add-appointment"
        element={
          <ProtectedRoute role="receptionist">
            <Appointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/check-in"
        element={
          <ProtectedRoute role="receptionist">
            <ReceptionistHub />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/doctor-availability"
        element={
          <ProtectedRoute role="receptionist">
            <ReceptionistHub />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/billing"
        element={<Navigate to="/receptionist/dashboard" replace />}
      />
      <Route
        path="/receptionist/payments"
        element={<Navigate to="/receptionist/dashboard" replace />}
      />

      {/* ===================================================================
          4. PHARMACY PANEL ROUTES (7 ITEMS)
          =================================================================== */}
      <Route
        path="/pharmacy/dashboard"
        element={
          <ProtectedRoute role={["pharmacy", "pharmacist", "admin"]}>
            <PharmacyPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacy/inventory"
        element={
          <ProtectedRoute role={["pharmacy", "pharmacist", "admin"]}>
            <PharmacyPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacy/add-medicine"
        element={
          <ProtectedRoute role={["pharmacy", "pharmacist", "admin"]}>
            <PharmacyPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacy/stock"
        element={
          <ProtectedRoute role={["pharmacy", "pharmacist", "admin"]}>
            <PharmacyPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacy/expiry"
        element={
          <ProtectedRoute role={["pharmacy", "pharmacist", "admin"]}>
            <PharmacyPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacy/sales"
        element={
          <ProtectedRoute role={["pharmacy", "pharmacist", "admin"]}>
            <PharmacyPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pharmacy/sales-history"
        element={
          <ProtectedRoute role={["pharmacy", "pharmacist", "admin"]}>
            <PharmacyPanel />
          </ProtectedRoute>
        }
      />

      {/* ===================================================================
          5. BILLING PANEL ROUTES (6 ITEMS)
          =================================================================== */}
      <Route
        path="/billing/dashboard"
        element={
          <ProtectedRoute role={["billing", "billingstaff", "admin"]}>
            <BillingPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/invoices"
        element={
          <ProtectedRoute role={["billing", "billingstaff", "admin"]}>
            <BillingPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/payments"
        element={
          <ProtectedRoute role={["billing", "billingstaff", "admin"]}>
            <BillingPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/pending"
        element={
          <ProtectedRoute role={["billing", "billingstaff", "admin"]}>
            <BillingPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/history"
        element={
          <ProtectedRoute role={["billing", "billingstaff", "admin"]}>
            <BillingPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing/reports"
        element={
          <ProtectedRoute role={["billing", "billingstaff", "admin"]}>
            <BillingPanel />
          </ProtectedRoute>
        }
      />

      {/* ===================================================================
          6. SEAMLESS ALIAS & SHORTCUT ROUTES
          =================================================================== */}
      <Route path="/pharmacy" element={<Navigate to="/pharmacy/dashboard" replace />} />
      <Route path="/pharmacist" element={<Navigate to="/pharmacy/dashboard" replace />} />
      <Route path="/pharmacist/dashboard" element={<Navigate to="/pharmacy/dashboard" replace />} />
      <Route path="/pharmacist/*" element={<Navigate to="/pharmacy/dashboard" replace />} />
      <Route path="/billing" element={<Navigate to="/billing/dashboard" replace />} />
      <Route path="/billingstaff" element={<Navigate to="/billing/dashboard" replace />} />
      <Route path="/billingstaff/dashboard" element={<Navigate to="/billing/dashboard" replace />} />
      <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />
      <Route path="/receptionist" element={<Navigate to="/receptionist/dashboard" replace />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      {/* SUPPORT & FALLBACK ROUTES */}
      <Route path="/support" element={<AddSupport />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
