import { useEffect, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import EmergencyTriage from "./pages/EmergencyTriage";

import BedManagement from "./pages/BedManagement";

import "./App.css";

const API_URL = "http://localhost:8000";

function Dashboard() {
  const [bedData, setBedData] = useState(null);
  const [patientData, setPatientData] = useState(null);

  

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    patient_id: "",
    age: "",
    heart_rate: "",
    systolic_bp: "",
    spo2: "",
    clinical_severity: "",
    required_ward: "GENERAL",
    needs_ventilator: false,
    needs_oxygen: false,
    needs_isolation: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchDashboardData = async () => {
    try {
      const [bedsResponse, patientsResponse] = await Promise.all([
        fetch(`${API_URL}/beds`),
        fetch(`${API_URL}/patients`),
      ]);

      if (!bedsResponse.ok || !patientsResponse.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const beds = await bedsResponse.json();
      const patients = await patientsResponse.json();

      setBedData(beds);
      setPatientData(patients);
      setError("");
    } catch (error) {
      console.error(error);
      setError("Unable to connect to VitalFlow backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

const handleAllocateBed = async (patientId) => {
  setError("");
  setSuccessMessage("");

  const handleReleaseBed = async (bedId) => {
  setError("");
  setSuccessMessage("");

  try {
    const response = await fetch(
      `${API_URL}/beds/release/${bedId}`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to release bed"
      );
    }

    setSuccessMessage(
      `Bed ${bedId} released successfully.`
    );

    await fetchDashboardData();

  } catch (error) {
    console.error(error);
    setError(error.message);
  }
};

  try {
    const response = await fetch(
      `${API_URL}/beds/allocate/${patientId}`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to allocate bed"
      );
    }

    
    setSuccessMessage(
      `Bed ${data.bed.bed_id} allocated to ${patientId}.`
    );

    await fetchDashboardData();

  } catch (error) {
    console.error(error);
    setError(error.message);
  }
};

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setSuccessMessage("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_id: form.patient_id,
          age: Number(form.age),
          heart_rate: Number(form.heart_rate),
          systolic_bp: Number(form.systolic_bp),
          spo2: Number(form.spo2),
          clinical_severity: Number(form.clinical_severity),
          required_ward: form.required_ward,
          needs_ventilator: form.needs_ventilator,
          needs_oxygen: form.needs_oxygen,
          needs_isolation: form.needs_isolation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to register patient"
        );
      }

      setSuccessMessage(
        `Patient ${form.patient_id} registered successfully.`
      );

      setForm({
        patient_id: "",
        age: "",
        heart_rate: "",
        systolic_bp: "",
        spo2: "",
        clinical_severity: "",
        required_ward: "GENERAL",
        needs_ventilator: false,
        needs_oxygen: false,
        needs_isolation: false,
      });

      await fetchDashboardData();
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        Loading VitalFlow dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard">

      {/* Header */}
      <header className="header">
        <div>
          <h1>VitalFlow Ward Manager</h1>
          <p>Hospital Operations Dashboard</p>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          System Online
        </div>
      </header>


      {/* Error */}
      {error && (
        <div className="message error-message">
          {error}
        </div>
      )}


      {/* Success */}
      {successMessage && (
        <div className="message success-message">
          {successMessage}
        </div>
      )}


      {/* Statistics */}
      <section className="stats">

        <div className="card">
          <p>Total Beds</p>
          <h2>{bedData.total_beds}</h2>
          <span>Hospital Capacity</span>
        </div>

        <div className="card">
          <p>Available Beds</p>
          <h2>{bedData.available_beds}</h2>
          <span>Ready for allocation</span>
        </div>

        <div className="card critical-card">
          <p>Critical Patients</p>
          <h2>{patientData.critical_patients}</h2>
          <span>Requires immediate attention</span>
        </div>

      </section>


      {/* Register Patient */}
      <section className="panel register-panel">

        <div className="panel-header">
          <div>
            <h2>Register Patient</h2>
            <p className="panel-subtitle">
              Add a patient to the simulated priority system
            </p>
          </div>
        </div>


        <form onSubmit={handleSubmit}>

          <div className="form-grid">

            <div className="form-group">
              <label>Patient ID</label>

              <input
                type="text"
                name="patient_id"
                value={form.patient_id}
                onChange={handleChange}
                placeholder="PAT-003"
                required
              />
            </div>


            <div className="form-group">
              <label>Age</label>

              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                min="0"
                max="120"
                placeholder="65"
                required
              />
            </div>


            <div className="form-group">
              <label>Heart Rate</label>

              <input
                type="number"
                name="heart_rate"
                value={form.heart_rate}
                onChange={handleChange}
                min="1"
                placeholder="120"
                required
              />
            </div>


            <div className="form-group">
              <label>Systolic BP</label>

              <input
                type="number"
                name="systolic_bp"
                value={form.systolic_bp}
                onChange={handleChange}
                min="1"
                placeholder="90"
                required
              />
            </div>


            <div className="form-group">
              <label>SpO₂ (%)</label>

              <input
                type="number"
                name="spo2"
                value={form.spo2}
                onChange={handleChange}
                min="1"
                max="100"
                step="0.1"
                placeholder="92"
                required
              />
            </div>


            <div className="form-group">
              <label>Clinical Severity (0–10)</label>

              <input
                type="number"
                name="clinical_severity"
                value={form.clinical_severity}
                onChange={handleChange}
                min="0"
                max="10"
                step="0.1"
                placeholder="8"
                required
              />
            </div>


            <div className="form-group">
              <label>Required Ward</label>

              <select
                name="required_ward"
                value={form.required_ward}
                onChange={handleChange}
              >
                <option value="GENERAL">GENERAL</option>
                <option value="ICU">ICU</option>
              </select>
            </div>

          </div>


          <div className="resources">

            <label className="checkbox">
              <input
                type="checkbox"
                name="needs_ventilator"
                checked={form.needs_ventilator}
                onChange={handleChange}
              />
              Needs Ventilator
            </label>


            <label className="checkbox">
              <input
                type="checkbox"
                name="needs_oxygen"
                checked={form.needs_oxygen}
                onChange={handleChange}
              />
              Needs Oxygen
            </label>


            <label className="checkbox">
              <input
                type="checkbox"
                name="needs_isolation"
                checked={form.needs_isolation}
                onChange={handleChange}
              />
              Needs Isolation
            </label>

          </div>


          <button
            type="submit"
            disabled={submitting}
            className="register-button"
          >
            {submitting
              ? "Registering..."
              : "Register Patient"}
          </button>

        </form>

      </section>


      {/* Dashboard Content */}
      <section className="main-grid">

        {/* Priority Queue */}
        <div className="panel">

          <div className="panel-header">

            <h2>Priority Queue</h2>

            <span className="badge">
              {patientData.total_patients} Patients
            </span>

          </div>


          {patientData.patients.length === 0 ? (

            <p>No patients in the priority queue.</p>

          ) : (

            patientData.patients.map((patient) => (

              <div
                className="patient"
                key={patient.patient_id}
              >

                <div className="patient-info">

                  <strong>
                    {patient.patient_id}
                  </strong>

                  <span>
                    {patient.priority} Patient
                  </span>

                </div>


                <div className="priority">

                  <span
                    className={
                      patient.priority === "CRITICAL"
                        ? "critical"
                        : "badge"
                    }
                  >
                    {patient.priority}
                  </span>

                  <strong>
                    Score: {patient.severity_score}
                  </strong>

                  {patient.assigned_bed_id ? (
  <span className="allocated-bed">
    Bed: {patient.assigned_bed_id}
  </span>
) : (
  <button
    className="allocate-button"
    onClick={() =>
      handleAllocateBed(patient.patient_id)
    }
  >
    Allocate Bed
  </button>
)}

                </div>

              </div>

            ))

          )}

        </div>


        {/* Bed Management */}
        <div className="panel">

          <div className="panel-header">

            <h2>Bed Management</h2>

            <span className="badge">
              {bedData.total_beds} Beds
            </span>

          </div>


          {bedData.beds.map((bed) => (
  <div
    className="bed"
    key={bed.bed_id}
  >
    <div>
      <strong>{bed.bed_id}</strong>

      <div className="bed-details">
        <span>{bed.ward_type}</span>

        {bed.assigned_patient_id && (
          <span>
            Patient: {bed.assigned_patient_id}
          </span>
        )}
      </div>
    </div>

    <div className="bed-actions">
      <span
        className={
          bed.status === "OCCUPIED"
            ? "occupied"
            : "available"
        }
      >
        {bed.status}
      </span>

      {bed.status === "OCCUPIED" && (
        <button
          className="release-button"
          onClick={() =>
            handleReleaseBed(bed.bed_id)
          }
        >
          Release Bed
        </button>
      )}
    </div>
  </div>
))}
          

        </div>

      </section>


      {/* Disclaimer */}
      <footer className="footer">
        Simulation only — not for clinical decision-making.
      </footer>

    </div>
  );
}

function App() {
  const user = localStorage.getItem("vitalflow_user");

  return (
    <BrowserRouter>
      <Routes>
        {/* Login Page */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Protected Application */}
        <Route
          path="/"
          element={
            user ? (
              <MainLayout />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        >
          {/* Dashboard */}
          <Route
            index
            element={<Dashboard />}
          />

          {/* Emergency Triage */}
          <Route
            path="triage"
            element={<EmergencyTriage />}
          />

          <Route
            path="beds"
            element={<BedManagement />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;