import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import "./adminDashboard.css";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getPatientsAPI } from "../../../api/patientApi";
import { getDoctorsAPI } from "../../../api/doctorApi";
import { getAppointmentsAPI } from "../../../api/appointmentsApi";
import { setupAdminAPI } from "../../../api/authApi";
import { toast } from "react-toastify";

import {
  LayoutDashboard,
  Circle,
  HelpCircle,
  Stethoscope,
  UserRoundCog,
  Users,
  X
} from "lucide-react";

import {
  FaUserMd,
  FaUsers,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaChartLine,
  FaFilter,
  FaSearch,
} from "react-icons/fa";

const menuItems = [
  {
    title: "MENU",

    items: [
      {
        name: "Dashboard",
        icon: <LayoutDashboard size={18} />,
        path: "/admin/dashboard",
        active: true,
      },

      {
        name: "Doctors",
        icon: <Stethoscope size={18} />,
        path: "/admin/add-doctor",
      },

      {
        name: "Receptionist",
        icon: <UserRoundCog size={18} />,
        path: "/admin/add-receptionist",
      },

      // {
      //   name: "About-us",
      //   icon: <Circle size={18} />,
      // },
    ],
  },

  {
    title: "USER",

    items: [
      // {
      //   name: "Clients",
      //   icon: <Users size={18} />,
      // },

      {
        name: "Help & Support",
        icon: <HelpCircle size={18} />,
        path: "/admin/ListSupport",

      },
    ],
  },
];


function AdminDashboard() {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
    revenue: "0K"
  });

  const [showModal, setShowModal] = useState(false);
  const [adminData, setAdminData] = useState({ adminId: "", name: "", email: "" });
  const [loading, setLoading] = useState(false);

  const [userName, setUserName] = useState("Admin");
  const [userImage, setUserImage] = useState("");

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await setupAdminAPI(adminData);
      if (res.data.success) {
        toast.success("Admin created successfully!");
        setShowModal(false);
        setAdminData({ adminId: "", name: "", email: "" });
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred while creating admin.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "Admin");
    setUserImage(localStorage.getItem("userImage") || "./images/avathar.jpg");

    const fetchDashboardStats = async () => {
      try {
        const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
          getPatientsAPI(),
          getDoctorsAPI(),
          getAppointmentsAPI()
        ]);

        setStats({
          patients: patientsRes.data?.data?.length || patientsRes.data?.length ,
          doctors: doctorsRes.data?.data?.length || doctorsRes.data?.length ,
          appointments: appointmentsRes.data?.data?.length || appointmentsRes.data?.length ,
          revenue: ""
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };
    fetchDashboardStats();
  }, []);

  return (
    <div className="app">
      {/* REUSABLE SIDEBAR */}

      <Sidebar
        logo="Ucare."
        menuItems={menuItems}
      />

      {/* MAIN */}

      <main className="main">

        {/* ================= HEADER ================= */}

        <div
          className="Dashboard-header"

          initial={{
            y: -80,
            opacity: 0,
          }}

          animate={{
            y: 0,
            opacity: 1,
          }}

          transition={{
            duration: 0.7,
          }}
        >

          <div className="dashboard-header-content">

            {/* LEFT */}

            <div>
              <h1>Welcome to Dashboard</h1>

              <p className="dashboard-caption">
                Manage doctors, patients, appointments and
                hospital activities.
              </p>
            </div>

            {/* RIGHT PROFILE */}


            <div className="admin-profile">

              <div className="admin-profile-circle">
                <span>{userName?.charAt(0)}</span>
              </div>

              <div>
                <h3>{userName}</h3>
                <p>Hospital Manager</p>
              </div>

            </div>

          </div>

          <hr />

        </div>

        {/* ================= MAIN CONTENT ================= */}

        <div className="main-container">

          {/* TOPBAR */}

          <div className="dashboard-topbar">

            <div>
              <h2 className="dashboard-page-title">
                Hospital Analytics
              </h2>

              <p className="dashboard-page-subtitle">
                Monitor hospital performance and activities.
              </p>
            </div>

            {/* FILTERS */}

            <div className="dashboard-filters">

              <div className="filter-box">
                <FaFilter />

                <select>
                  <option>Today</option>
                  <option>This Week</option>
                  <option>This Month</option>
                </select>
              </div>

              <div className="filter-box">
                <FaChartLine />

                <select>
                  <option>All Departments</option>
                  <option>Cardiology</option>
                  <option>Neurology</option>
                  <option>Dental</option>
                </select>
              </div>

              <div className="search-filter">
                <FaSearch />

                <input
                  type="text"
                  placeholder="Search..."
                />
              </div>

              <button className="exportt-btn" onClick={() => setShowModal(true)}>
                <span>+</span>
              </button>

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
                <p>Total Doctors</p>
                <h2>{stats.doctors}</h2>
              </div>

              <div className="stats-icon">
                <FaUserMd />
              </div>
            </div>

            <div className="stats-card">
              <div>
                <p>Appointments</p>
                <h2>{stats.appointments}</h2>
              </div>

              <div className="stats-icon">
                <FaCalendarCheck />
              </div>
            </div>

            <div className="stats-card">
              <div>
                <p>Revenue</p>
                <h2>{stats.revenue}</h2>
              </div>

              <div className="stats-icon">
                <FaMoneyBillWave />
              </div>
            </div>

          </div>


          
        </div>

        {/* ADD ADMIN MODAL */}
        <AnimatePresence>
          {showModal && (
            <div className="admin-modal-backdrop">
              <motion.div
                className="admin-modal-content"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="admin-modal-header">
                  <h2>Add New Admin</h2>
                  <button className="close-modal-btn" onClick={() => setShowModal(false)}>
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleAddAdmin} className="admin-modal-form">
                  <div className="form-group">
                    <label>Admin ID</label>
                    <input
                      type="text"
                      placeholder="e.g. ADM01"
                      value={adminData.adminId}
                      onChange={(e) => setAdminData({ ...adminData, adminId: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={adminData.name}
                      onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="admin@ucare.com"
                      value={adminData.email}
                      onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>

                  <button type="submit" className="submit-admin-btn" disabled={loading}>
                    {loading ? "Creating..." : "Create Admin"}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}

export default AdminDashboard;