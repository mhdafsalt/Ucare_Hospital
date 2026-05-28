import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { motion } from "framer-motion";
import "./addReceptionist.css";
import {
  LayoutDashboard,
  Circle,
  HelpCircle,
  Stethoscope,
  UserRoundCog,
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  addReceptionistAPI,
  getReceptionistsAPI,
  updateReceptionistAPI,
  deleteReceptionistAPI,
  restoreReceptionistAPI,
} from "../../../api/receptionistApi";

const menuItems = [
  {
    title: "MENU",
    items: [
      { name: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/admin/dashboard" },
      { name: "Doctors", icon: <Stethoscope size={18} />, path: "/admin/add-doctor" },
      { name: "Receptionist", icon: <UserRoundCog size={18} />, path: "/admin/add-receptionist", active: true },
      // { name: "About-us", icon: <Circle size={18} /> },
    ],
  },
  {
    title: "USER",
    items: [
      // { name: "Clients", icon: <Users size={18} /> },
      { name: "Help & Support", icon: <HelpCircle size={18} />, path: "/admin/ListSupport" },
    ],
  },
];

function AddReceptionist() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  const [userName, setUserName] = useState("Admin");
  const [userImage, setUserImage] = useState("");

  const [formData, setFormData] = useState({
    receptionistId: "",
    name: "",
    email: "",
    phone: "",
    shift: "",
    receptionistimage: "",
  });

  // ================= FETCH =================
  const fetchReceptionists = async () => {
    try {
      setLoading(true);
      const res = await getReceptionistsAPI(showDeleted);
      setReceptionists(res.data.receptionists);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "Admin");
    setUserImage(localStorage.getItem("userImage") || "");
    fetchReceptionists();
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
      receptionistId: "",
      name: "",
      email: "",
      phone: "",
      shift: "",
      receptionistimage: "",
    });
  };

  // ================= VALIDATE =================
  const validateForm = () => {
    const { receptionistId, name, email, phone, shift, receptionistimage } = formData;

    if (!receptionistId.trim()) return toast.warn("Receptionist ID required") || false;
    if (!name.trim()) return toast.warn("Name required") || false;
    if (!email.includes("@")) return toast.warn("Valid email required") || false;
    if (!phone || phone.length < 10) return toast.warn("Valid phone required") || false;
    if (!shift.trim()) return toast.warn("Shift required") || false;
    if (!receptionistimage || !receptionistimage.trim()) return toast.warn("Image URL required") || false;

    return true;
  };

  // ================= ADD =================
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await addReceptionistAPI(formData);
      toast.success("Receptionist added");

      setShowForm(false);
      fetchReceptionists();
    } catch {
      toast.error("Add failed");
    }
  };

  // ================= EDIT =================
  const handleEdit = (rec) => {
    setShowForm(true);
    setEditingId(rec._id);
    setFormData(rec);
  };

  // ================= UPDATE =================
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await updateReceptionistAPI(editingId, formData);
      toast.success("Updated successfully");

      setShowForm(false);
      setEditingId(null);
      fetchReceptionists();
    } catch {
      toast.error("Update failed");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await deleteReceptionistAPI(id);
      toast.success("Moved to trash");
      fetchReceptionists();
    } catch {
      toast.error("Delete failed");
    }
  };

  // ================= RESTORE =================
  const handleRestore = async (id) => {
    try {
      await restoreReceptionistAPI(id);
      toast.success("Restored");
      fetchReceptionists();
    } catch {
      toast.error("Restore failed");
    }
  };

  const filtered = receptionists.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app">

      <Sidebar logo="Ucare." menuItems={menuItems} />

      <main className="main">

        {/* HEADER */}
        <div className="Dashboard-header"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <div className="dashboard-header-content">
            <div>
              <h1>Receptionist Management</h1>
              <p className="dashboard-caption">
                Manage hospital front desk staff.
              </p>
            </div>

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

        <div className="main-container">


          {/* TOPBAR */}
          <div className="doctors-topbar">

            <div>
              <h2 className="dashboard-page-title">Receptionist List</h2>
              <p className="dashboard-page-subtitle">
                Add, edit, and manage hospital receptionists.
              </p>
            </div>

            <div className="doctors-actions-top">

              <input
                className="doctors-search"
                placeholder="Search receptionist..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />


              <button onClick={openAddForm} className="doctors-addBtn">
                <Plus size={18} /> Add Receptionist
              </button>

              <button
                type="button"
                className="doctors-restoreBtn"
                onClick={() => setShowDeleted(!showDeleted)}
                style={{ marginLeft: '10px' }}
              >
                {showDeleted ? "View Active" : "View Trash"}
              </button>

            </div>

          </div>






          {/* FORM */}
          {showForm && (
            <div className="doctors-sideForm">

              <div className="doctors-modalHeader">
                <h2>{editingId ? "Update Receptionist" : "Add Receptionist"}</h2>
                <button onClick={() => setShowForm(false)} className="doctors-closeBtn">
                  <X />
                </button>
              </div>

              <form onSubmit={editingId ? handleUpdate : handleAdd} className="doctors-form">

                <input
                  name="receptionistId"
                  placeholder="Receptionist ID"
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: "receptionistId",
                        value: `REC${e.target.value.replace("REC", "")}`,
                      },
                    })
                  }
                  value={formData.receptionistId}
                />
                <input name="name" placeholder="Name" onChange={handleChange} value={formData.name} />
                <input name="email" placeholder="Email" onChange={handleChange} value={formData.email} />
                <input name="phone" placeholder="Phone" onChange={handleChange} value={formData.phone} />
                <input name="receptionistimage" placeholder="Image URL" onChange={handleChange} value={formData.receptionistimage} />

                <select
                  name="shift"
                  onChange={handleChange}
                  value={formData.shift}
                  className="doctors-select"
                >
                  <option value="">Select Shift</option>
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>

                <button className="doctors-submitBtn">
                  {editingId ? "Update" : "Save"}
                </button>

              </form>

            </div>
          )}

          {/* LIST */}
          <div className="doctors-grid">

            {loading && <div>Loading...</div>}
            {!loading && filtered.length === 0 && <div>No data found</div>}

            {filtered.map((r) => (
              <div key={r._id} className="doctors-card">

                <div className="doctor-avatar">
                  {r.receptionistimage ? (
                    <img
                      key={r.receptionistimage}
                      src={r.receptionistimage}
                      alt={r.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://cdn-icons-png.flaticon.com/512/3774/3774299.png";
                      }}
                    />
                  ) : (
                    <div className="avatar-fallback">
                      {r.name?.charAt(0)}
                    </div>
                  )}
                </div>


                <div className="doctor-info">
                  <h2>{r.name}</h2>
                  <p>{r.email}</p>
                  <span className="doctor-badge">{r.shift}</span>
                </div>


                <div className="doctors-actions">

                  {showDeleted ? (
                    <button
                      onClick={() => handleRestore(r._id)}
                      className="doctors-submitBtn"
                    >
                      Restore
                    </button>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(r)} className="doctors-editBtn">
                        <Pencil size={16} />
                      </button>

                      <button onClick={() => handleDelete(r._id)} className="doctors-deleteBtn">
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}

                </div>

              </div>
            ))}

          </div>

        </div>
      </main>
    </div>
  );
}

export default AddReceptionist;