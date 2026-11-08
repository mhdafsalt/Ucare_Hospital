import React from "react";
import {
  LayoutDashboard,
  Stethoscope,
  UserRoundCog,
  Users,
  CalendarCheck,
  Pill,
  Receipt,
  CreditCard,
  TrendingUp,
  Settings,
  ClipboardList,
  FileText,
  Activity,
  UserPlus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  ShoppingCart,
  DollarSign,
  PackageCheck,
  FileCheck2,
  FolderClock,
  Sparkles,
} from "lucide-react";

// ============================================================================
// 1. ADMIN PANEL MENU CONFIGURATION (10 ITEMS)
// ============================================================================
export const adminMenu = [
  {
    title: "MAIN",
    items: [
      {
        name: "Dashboard",
        icon: <LayoutDashboard size={18} />,
        path: "/admin/dashboard",
      },
    ],
  },
  {
    title: "STAFF & CLINICAL",
    items: [
      {
        name: "Doctors",
        icon: <Stethoscope size={18} />,
        path: "/admin/add-doctor",
      },
      {
        name: "Receptionists",
        icon: <UserRoundCog size={18} />,
        path: "/admin/add-receptionist",
      },
      {
        name: "Pharmacists",
        icon: <Pill size={18} />,
        path: "/admin/add-pharmacist",
      },
      {
        name: "Billing Staff",
        icon: <Receipt size={18} />,
        path: "/admin/add-billing-staff",
      },
      {
        name: "Patients",
        icon: <Users size={18} />,
        path: "/admin/patients",
      },
      {
        name: "Appointments",
        icon: <CalendarCheck size={18} />,
        path: "/admin/appointments",
      },
    ],
  },
  {
    title: "OPERATIONS & FINANCE",
    items: [
      {
        name: "Pharmacy",
        icon: <Pill size={18} />,
        path: "/pharmacy/dashboard",
      },
      {
        name: "Billing",
        icon: <Receipt size={18} />,
        path: "/admin/billing",
      },
      {
        name: "Payments",
        icon: <CreditCard size={18} />,
        path: "/admin/payments",
      },
      {
        name: "Revenue & Reports",
        icon: <TrendingUp size={18} />,
        path: "/admin/reports",
      },
      {
        name: "Settings",
        icon: <Settings size={18} />,
        path: "/admin/settings",
      },
    ],
  },
];

// ============================================================================
// 2. DOCTOR PANEL MENU CONFIGURATION (7 ITEMS)
// ============================================================================
export const doctorMenu = [
  {
    title: "OVERVIEW",
    items: [
      {
        name: "Dashboard",
        icon: <LayoutDashboard size={18} />,
        path: "/doctor/dashboard",
      },
    ],
  },
  {
    title: "PATIENT CARE",
    items: [
      {
        name: "My Patients",
        icon: <Users size={18} />,
        path: "/doctor/patients",
      },
      {
        name: "Appointments",
        icon: <CalendarCheck size={18} />,
        path: "/doctor/appointments",
      },
      {
        name: "Medical History",
        icon: <ClipboardList size={18} />,
        path: "/doctor/medical-history",
      },
      {
        name: "Prescriptions",
        icon: <FileText size={18} />,
        path: "/doctor/prescriptions",
      },
      {
        name: "Diagnosis",
        icon: <Activity size={18} />,
        path: "/doctor/diagnosis",
      },
      {
        name: "Consultation Notes",
        icon: <FileCheck2 size={18} />,
        path: "/doctor/consultation-notes",
      },
    ],
  },
];

// ============================================================================
// 3. RECEPTIONIST PANEL MENU CONFIGURATION (6 ITEMS)
// ============================================================================
export const receptionistMenu = [
  {
    title: "FRONT DESK",
    items: [
      {
        name: "Dashboard",
        icon: <LayoutDashboard size={18} />,
        path: "/receptionist/dashboard",
      },
      {
        name: "Patient Registration",
        icon: <UserPlus size={18} />,
        path: "/receptionist/add-patient",
      },
      {
        name: "Patients",
        icon: <Users size={18} />,
        path: "/receptionist/patients-list",
      },
    ],
  },
  {
    title: "COORDINATION",
    items: [
      {
        name: "Appointment Booking",
        icon: <CalendarCheck size={18} />,
        path: "/receptionist/add-appointment",
      },
      {
        name: "Patient Check-in",
        icon: <CheckCircle2 size={18} />,
        path: "/receptionist/check-in",
      },
      {
        name: "Doctor Availability",
        icon: <Clock size={18} />,
        path: "/receptionist/doctor-availability",
      },
    ],
  },
];

// ============================================================================
// 4. PHARMACY PANEL MENU CONFIGURATION (7 ITEMS)
// ============================================================================
export const pharmacyMenu = [
  {
    title: "PHARMACY",
    items: [
      {
        name: "Dashboard",
        icon: <LayoutDashboard size={18} />,
        path: "/pharmacy/dashboard",
      },
      {
        name: "Medicine Inventory",
        icon: <Pill size={18} />,
        path: "/pharmacy/inventory",
      },
      {
        name: "Add Medicine",
        icon: <PackageCheck size={18} />,
        path: "/pharmacy/add-medicine",
      },
      {
        name: "Stock Management",
        icon: <ClipboardList size={18} />,
        path: "/pharmacy/stock",
      },
      {
        name: "Expiry Tracking",
        icon: <AlertTriangle size={18} />,
        path: "/pharmacy/expiry",
      },
      {
        name: "Medicine Sales",
        icon: <ShoppingCart size={18} />,
        path: "/pharmacy/sales",
      },
      {
        name: "Sales History",
        icon: <History size={18} />,
        path: "/pharmacy/sales-history",
      },
    ],
  },
];

// ============================================================================
// 5. BILLING PANEL MENU CONFIGURATION (6 ITEMS)
// ============================================================================
export const billingMenu = [
  {
    title: "ACCOUNTS & BILLING",
    items: [
      {
        name: "Dashboard",
        icon: <LayoutDashboard size={18} />,
        path: "/billing/dashboard",
      },
      {
        name: "Invoices",
        icon: <Receipt size={18} />,
        path: "/billing/invoices",
      },
      {
        name: "Payments",
        icon: <DollarSign size={18} />,
        path: "/billing/payments",
      },
      {
        name: "Pending Payments",
        icon: <Clock size={18} />,
        path: "/billing/pending",
      },
      {
        name: "Payment History",
        icon: <FolderClock size={18} />,
        path: "/billing/history",
      },
      {
        name: "Revenue Reports (Admin)",
        icon: <TrendingUp size={18} />,
        path: "/billing/reports",
      },
    ],
  },
];

