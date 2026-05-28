import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home/Home";
import AdminDashboard from "./pages/Admin/Dashboard/adminDashboard";
import AddDoctors from "./pages/Admin/AdminDoctors/addDoctors";
import AddReceptionist from "./pages/Admin/AddReceptionist/AddReceptionist";
import AddPatients from "./pages/Receptionist/addPatients/addPatients";
import Appointments from "./pages/Receptionist/appointments/Appointments";
import DoctorDashboard from "./pages/Doctor/Dashboard/doctorDashboard";
import AddSupport from "./pages/Support/AddSupport/AddSupport";
import ListSupport from "./pages/Support/ListSupport/ListSupport";
import Login from "./pages/Login/Login";



function ProtectedRoute({ children, role }) {

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>

      {/* PUBLIC ROUTES*/}

      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/*  ADMIN ROUTES */}

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
        path="/admin/ListSupport"
        element={
          <ProtectedRoute role="admin">
            <ListSupport />
          </ProtectedRoute>
        }
      />


      {/* RECEPTIONIST ROUTES */}
      <Route
        path="/receptionist/add-patient"
        element={
          <ProtectedRoute role="receptionist">
            <AddPatients />
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

      {/*  DOCTOR ROUTES */}

      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute role="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />

      {/*  SUPPORT ROUTES */}

      {/* <Route
        path="/supportmessage"
        element={
          <ProtectedRoute role="support">
            <AddSupport />
          </ProtectedRoute>
        }
      /> */}

      <Route
        path="/support"
        element={<AddSupport />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default AppRoutes;