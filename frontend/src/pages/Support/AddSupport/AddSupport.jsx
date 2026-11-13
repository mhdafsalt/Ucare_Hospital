import React, { useState } from "react";
import "./AddSupport.css";
import { IoArrowBack } from "react-icons/io5";
import { addSupport } from "../../../api/supportApi";
import { toast } from "react-toastify";

function AddSupport() {

  const [supportVault, setSupportVault] = useState({
    issueTitle: "",
    supportZone: "",
    urgencyLevel: "",
    supportNote: "",
  });

  const handleVaultChange = (e) => {
    setSupportVault({
      ...supportVault,
      [e.target.name]: e.target.value,
    });
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();

    // VALIDATION

    if (!supportVault.issueTitle.trim()) {
      toast.warning("Please enter support title");
      return;
    }

    if (!supportVault.supportZone) {
      toast.warning("Please select category");
      return;
    }

    if (!supportVault.supportNote.trim()) {
      toast.warning("Please enter description");
      return;
    }

    try {

      const response = await addSupport(supportVault);

      if (response.success) {

        toast.success("Support ticket added successfully!");

        setSupportVault({
          issueTitle: "",
          supportZone: "",
          urgencyLevel: "",
          supportNote: "",
        });

      }

    } catch (error) {

      console.error("Error adding support:", error);

      toast.error("Failed to add support ticket.");

    }
  };

  return (
    <div className="novaSupportShell">

      {/* BACK BUTTON */}
      <button
        className="supportBackButton"
        onClick={() => window.history.back()}
      >
        <IoArrowBack />
        Back
      </button>

      {/* LEFT SIDE */}
      <div className="echoPanelZone"></div>

      {/* RIGHT SIDE */}
      <div className="zenithFormSpace">

        <h1>Support & Help</h1>

        <p className="lumenSupportText">
          Create and manage support requests easily.
          Fill in the details below to add a new
          support ticket for patients or users.
        </p>

        <div className="aeroDividerLine"></div>

        {/* FORM */}
        <form
          onSubmit={handleSupportSubmit}
          className="quantumSupportForm"
        >

          <div className="stellarInputCluster">

            <label>Support Title</label>

            <input
              type="text"
              name="issueTitle"
              placeholder="Enter support title"
              value={supportVault.issueTitle}
              onChange={handleVaultChange}
            />

          </div>

          <div className="stellarInputCluster">

            <label>Category</label>

            <select
              name="supportZone"
              value={supportVault.supportZone}
              onChange={handleVaultChange}
            >
              <option value="">Select Category</option>
              <option value="Technical">Technical</option>
              <option value="Appointment">Appointment</option>
              <option value="General">General</option>
            </select>

          </div>

          <div className="stellarInputCluster">

            <label>Description</label>

            <textarea
              name="supportNote"
              rows="5"
              placeholder="Write support details..."
              value={supportVault.supportNote}
              onChange={handleVaultChange}
            ></textarea>

          </div>

          <button
            type="submit"
            className="nebulaActionTrigger"
          >
            Add Support
          </button>

        </form>

      </div>

    </div>
  );
}

export default AddSupport;