const mongoose = require("mongoose");
const UserModel = require("../models/User");

const syncCollectionsToSingleUsers = async () => {
  try {
    const db = mongoose.connection.db;
    if (!db) return;

    const collections = await db.listCollections().toArray();
    const colNames = collections.map((c) => c.name);

    // 1. Check & migrate old 'admins'
    if (colNames.includes("admins")) {
      const oldAdmins = await db.collection("admins").find({}).toArray();
      for (const a of oldAdmins) {
        if (!a.email) continue;
        const exists = await UserModel.findOne({ email: a.email.toLowerCase() });
        if (!exists) {
          await UserModel.create({
            userId: a.adminId || `ADM${Date.now()}`,
            adminId: a.adminId || `ADM${Date.now()}`,
            name: a.name || "Hospital Admin",
            email: a.email.toLowerCase(),
            role: "admin",
            status: "Active",
            isDeleted: a.isDeleted || false,
          });
        }
      }
    }

    // 2. Check & migrate old 'doctors'
    if (colNames.includes("doctors")) {
      const oldDoctors = await db.collection("doctors").find({}).toArray();
      for (const d of oldDoctors) {
        if (!d.email) continue;
        const exists = await UserModel.findOne({ email: d.email.toLowerCase() });
        if (!exists) {
          await UserModel.create({
            userId: d.doctorId || `DOC${Date.now()}`,
            doctorId: d.doctorId || `DOC${Date.now()}`,
            name: d.name || "Doctor",
            email: d.email.toLowerCase(),
            phone: d.phone || "",
            specialization: d.specialization || "General Medicine",
            experience: d.experience || "5+ Years",
            image: d.image || "",
            role: "doctor",
            status: d.status || "Available",
            isDeleted: d.isDeleted || false,
          });
        }
      }
    }

    // 3. Check & migrate old 'receptionists'
    if (colNames.includes("receptionists")) {
      const oldRecs = await db.collection("receptionists").find({}).toArray();
      for (const r of oldRecs) {
        if (!r.email) continue;
        const exists = await UserModel.findOne({ email: r.email.toLowerCase() });
        if (!exists) {
          await UserModel.create({
            userId: r.receptionistId || `REC${Date.now()}`,
            receptionistId: r.receptionistId || `REC${Date.now()}`,
            name: r.name || "Receptionist",
            email: r.email.toLowerCase(),
            phone: r.phone || "",
            shift: r.shift || "Morning",
            image: r.receptionistimage || r.image || "",
            receptionistimage: r.receptionistimage || r.image || "",
            role: "receptionist",
            status: r.status || "Active",
            isDeleted: r.isDeleted || false,
          });
        }
      }
    }

    // 4. Check & migrate old 'pharmacists'
    if (colNames.includes("pharmacists")) {
      const oldPharm = await db.collection("pharmacists").find({}).toArray();
      for (const p of oldPharm) {
        if (!p.email) continue;
        const exists = await UserModel.findOne({ email: p.email.toLowerCase() });
        if (!exists) {
          await UserModel.create({
            userId: p.pharmacistId || `PH${Date.now()}`,
            pharmacistId: p.pharmacistId || `PH${Date.now()}`,
            name: p.name || "Pharmacist",
            email: p.email.toLowerCase(),
            phone: p.phone || "",
            qualification: p.qualification || "B.Pharm",
            licenseNumber: p.licenseNumber || "",
            shift: p.shift || "Morning",
            image: p.image || "",
            role: "pharmacist",
            status: p.status || "Active",
            isDeleted: p.isDeleted || false,
          });
        }
      }
    }

    // 5. Check & migrate old 'billingstaffs'
    if (colNames.includes("billingstaffs")) {
      const oldBilling = await db.collection("billingstaffs").find({}).toArray();
      for (const b of oldBilling) {
        if (!b.email) continue;
        const exists = await UserModel.findOne({ email: b.email.toLowerCase() });
        if (!exists) {
          await UserModel.create({
            userId: b.staffId || `BILL${Date.now()}`,
            staffId: b.staffId || `BILL${Date.now()}`,
            name: b.name || "Billing Staff",
            email: b.email.toLowerCase(),
            phone: b.phone || "",
            department: b.department || "Inpatient & Outpatient Billing",
            shift: b.shift || "Morning",
            image: b.image || "",
            role: "billing",
            status: b.status || "Active",
            isDeleted: b.isDeleted || false,
          });
        }
      }
    }

    // 6. Ensure default Admin account exists in single "users" collection
    const adminUser = await UserModel.findOne({ email: "admin@ucare.com" });
    if (!adminUser) {
      await UserModel.create({
        userId: "ADM001",
        adminId: "ADM001",
        name: "Hospital Administrator",
        email: "admin@ucare.com",
        phone: "+1 (555) 000-0001",
        role: "admin",
        status: "Active",
        isDeleted: false,
      });
      console.log(" [Single Collection] Initialized default Admin account in 'users' collection (ADM001 / admin@ucare.com).");
    }

    console.log(" [Single Collection] Verified unified 'users' collection for all hospital staff.");
  } catch (err) {
    console.warn(" [Single Collection] Migration check note:", err.message);
  }
};

module.exports = syncCollectionsToSingleUsers;

