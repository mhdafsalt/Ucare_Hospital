import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { getSupports } from "../../../api/supportApi";
import "./listSupport.css";
import {
    LayoutDashboard,
    HelpCircle,
    Stethoscope,
    UserRoundCog,
    Users,
} from "lucide-react";
import "./listSupport.css"; // Optional, can define styles here if needed

const menuItems = [
    {
        title: "MENU",
        items: [
            {
                name: "Dashboard",
                icon: <LayoutDashboard size={18} />,
                path: "/admin/dashboard",
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
        ],
    },
    {
        title: "USER",
        items: [
            // {
            //     name: "Clients",
            //     icon: <Users size={18} />,
            // },
            {
                name: "Help & Support",
                icon: <HelpCircle size={18} />,
                path: "/admin/ListSupport",
                active: true,
            },
        ],
    },
];

function ListSupport() {
    const [supports, setSupports] = useState([]);
    const [userName, setUserName] = useState("Admin");
    const [userImage, setUserImage] = useState("");

    useEffect(() => {
        setUserName(localStorage.getItem("userName") || "Admin");
        setUserImage(localStorage.getItem("userImage") || "");
        const fetchSupports = async () => {
            try {
                const data = await getSupports();
                if (data.success) {
                    setSupports(data.supports);
                }
            } catch (error) {
                console.error("Failed to fetch supports", error);
            }
        };
        fetchSupports();
    }, []);

    return (
        <div className="app">
            {/* REUSABLE SIDEBAR */}
            <Sidebar logo="Ucare." menuItems={menuItems} />

            {/* MAIN */}
            <main className="main">
                {/* ================= HEADER ================= */}
                <div className="Dashboard-header">
                    <div className="dashboard-header-content">
                        {/* LEFT */}
                        <div>
                            <h1>Support messages</h1>
                            <p className="dashboard-caption">
                                View and manage support requests from users.
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
                    <div className="support-list">
                        {supports.length === 0 ? (
                            <p className="empty-support">
                                No support tickets available.
                            </p>
                        ) : (
                            <div className="support-card-grid">
                                {supports.map((ticket) => (
                                    <div className="support-card" key={ticket._id}>

                                        <div className="support-card-top">
                                            <div className="support-icon">
                                                <HelpCircle size={22} />
                                            </div>

                                            <span className="support-category">
                                                {ticket.supportZone}
                                            </span>
                                        </div>

                                        <h2>{ticket.issueTitle}</h2>

                                        <p className="support-description">
                                            {ticket.supportNote}
                                        </p>

                                        <div className="support-footer">
                                            <span>
                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ListSupport;
