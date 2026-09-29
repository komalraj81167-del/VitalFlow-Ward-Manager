import { useEffect, useMemo, useState } from "react";
import "./Patients.css";

const API_URL = "http://localhost:8000";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [wardFilter, setWardFilter] = useState("ALL");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    patient_id: "",
    age: 30,
    heart_rate: 80,
    systolic_bp: 120,
    spo2: 98,
    clinical_severity: 5,
    required_ward: "GENERAL",
    needs_ventilator: false,
    needs_oxygen: false,
    needs_isolation: false,
  });

  const loadPatients = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/patients`);

      if (!response.ok) {
        throw new Error("Failed to load patients");
      }

      const data = await response.json();

setPatients(
  Array.isArray(data)
    ? data
    : Array.isArray(data.patients)
      ? data.patients
      : []
);
    } catch (error) {
      setMessage("Unable to connect to the backend.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const wards = useMemo(() => {
    const unique = [...new Set(patients.map((p) => p.required_ward))];
    return unique;
  }, [patients]);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesSearch =
        patient.patient_id
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        patient.required_ward
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesPriority =
        priorityFilter === "ALL" ||
        patient.priority === priorityFilter;

      const matchesWard =
        wardFilter === "ALL" ||
        patient.required_ward === wardFilter;

      return matchesSearch && matchesPriority && matchesWard;
    });
  }, [patients, search, priorityFilter, wardFilter]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? Number(value)
            : value,
    }));
  };

  const addPatient = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to add patient");
      }

      setMessage(
        `Patient ${form.patient_id} added successfully.`
      );

      setShowAddPatient(false);

      setForm({
        patient_id: "",
        age: 30,
        heart_rate: 80,
        systolic_bp: 120,
        spo2: 98,
        clinical_severity: 5,
        required_ward: "GENERAL",
        needs_ventilator: false,
        needs_oxygen: false,
        needs_isolation: false,
      });

      await loadPatients();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "CRITICAL":
        return "priority-critical";

      case "HIGH":
        return "priority-high";

      case "MODERATE":
        return "priority-moderate";

      default:
        return "priority-low";
    }
  };

  const getPatientStatus = (patient) => {
    if (patient.assigned_bed_id) {
      return "Admitted";
    }

    return "Waiting";
  };

  return (
    <div className="patients-page">
      <div className="patients-header">
        <div>
          <h1>Patients</h1>
          <p>
            Patient registry, clinical status and bed assignment
            overview.
          </p>
        </div>

        <button
          className="add-patient-button"
          onClick={() => setShowAddPatient(true)}
        >
          + Add Patient
        </button>
      </div>

      {message && (
        <div className="patients-message">
          {message}
        </div>
      )}

      <div className="patient-summary">
        <div className="patient-summary-card">
          <span>Total Patients</span>
          <strong>{patients.length}</strong>
        </div>

        <div className="patient-summary-card critical">
          <span>Critical</span>
          <strong>
            {
              patients.filter(
                (patient) => patient.priority === "CRITICAL"
              ).length
            }
          </strong>
        </div>

        <div className="patient-summary-card high">
          <span>High Priority</span>
          <strong>
            {
              patients.filter(
                (patient) => patient.priority === "HIGH"
              ).length
            }
          </strong>
        </div>

        <div className="patient-summary-card admitted">
          <span>Admitted</span>
          <strong>
            {
              patients.filter(
                (patient) => patient.assigned_bed_id
              ).length
            }
          </strong>
        </div>

        <div className="patient-summary-card waiting">
          <span>Waiting</span>
          <strong>
            {
              patients.filter(
                (patient) => !patient.assigned_bed_id
              ).length
            }
          </strong>
        </div>
      </div>

      <div className="patient-toolbar">
        <input
          type="text"
          placeholder="Search patient ID or ward..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={priorityFilter}
          onChange={(event) =>
            setPriorityFilter(event.target.value)
          }
        >
          <option value="ALL">All Priorities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MODERATE">Moderate</option>
          <option value="LOW">Low</option>
        </select>

        <select
          value={wardFilter}
          onChange={(event) =>
            setWardFilter(event.target.value)
          }
        >
          <option value="ALL">All Wards</option>

          {wards.map((ward) => (
            <option key={ward} value={ward}>
              {ward}
            </option>
          ))}
        </select>

        <button
          className="refresh-button"
          onClick={loadPatients}
        >
          Refresh
        </button>
      </div>

      <div className="patients-table-card">
        <div className="table-heading">
          <h2>Patient Registry</h2>

          <span>
            Showing {filteredPatients.length} of{" "}
            {patients.length}
          </span>
        </div>

        {loading ? (
          <div className="patients-empty">
            Loading patients...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="patients-empty">
            <div className="empty-icon">👤</div>
            <h3>No patients found</h3>
            <p>
              Add a patient or change your search/filter criteria.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Age</th>
                  <th>Heart Rate</th>
                  <th>BP</th>
                  <th>SpO₂</th>
                  <th>Severity Score</th>
                  <th>Priority</th>
                  <th>Ward</th>
                  <th>Bed</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.patient_id}>
                    <td className="patient-id">
                      {patient.patient_id}
                    </td>

                    <td>{patient.age}</td>

                    <td>
                      <span
                        className={
                          patient.heart_rate > 110
                            ? "vital-warning"
                            : ""
                        }
                      >
                        {patient.heart_rate} bpm
                      </span>
                    </td>

                    <td>
                      {patient.systolic_bp} mmHg
                    </td>

                    <td>
                      <span
                        className={
                          patient.spo2 < 94
                            ? "vital-danger"
                            : ""
                        }
                      >
                        {patient.spo2}%
                      </span>
                    </td>

                    <td>
                      <strong>
                        {patient.severity_score ?? "—"}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`priority-badge ${getPriorityClass(
                          patient.priority
                        )}`}
                      >
                        {patient.priority}
                      </span>
                    </td>

                    <td>{patient.required_ward}</td>

                    <td>
                      {patient.assigned_bed_id || "—"}
                    </td>

                    <td>
                      <span
                        className={
                          patient.assigned_bed_id
                            ? "status-admitted"
                            : "status-waiting"
                        }
                      >
                        {getPatientStatus(patient)}
                      </span>
                    </td>

                    <td>
                      <button
                        className="view-button"
                        onClick={() =>
                          setSelectedPatient(patient)
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient Details Modal */}

      {selectedPatient && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedPatient(null)}
        >
          <div
            className="patient-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="modal-label">
                  PATIENT RECORD
                </span>

                <h2>{selectedPatient.patient_id}</h2>
              </div>

              <button
                className="close-button"
                onClick={() => setSelectedPatient(null)}
              >
                ×
              </button>
            </div>

            <div className="patient-modal-grid">
              <div className="detail-section">
                <h3>Patient Information</h3>

                <div className="detail-row">
                  <span>Age</span>
                  <strong>
                    {selectedPatient.age} years
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Required Ward</span>
                  <strong>
                    {selectedPatient.required_ward}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Priority</span>
                  <strong
                    className={getPriorityClass(
                      selectedPatient.priority
                    )}
                  >
                    {selectedPatient.priority}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Severity Score</span>
                  <strong>
                    {selectedPatient.severity_score}
                  </strong>
                </div>
              </div>

              <div className="detail-section">
                <h3>Vital Signs</h3>

                <div className="vital-grid">
                  <div>
                    <span>Heart Rate</span>
                    <strong>
                      {selectedPatient.heart_rate} bpm
                    </strong>
                  </div>

                  <div>
                    <span>Systolic BP</span>
                    <strong>
                      {selectedPatient.systolic_bp} mmHg
                    </strong>
                  </div>

                  <div>
                    <span>SpO₂</span>
                    <strong>
                      {selectedPatient.spo2}%
                    </strong>
                  </div>

                  <div>
                    <span>Clinical Severity</span>
                    <strong>
                      {selectedPatient.clinical_severity}/10
                    </strong>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Required Resources</h3>

                <div className="resource-tags">
                  {selectedPatient.needs_ventilator && (
                    <span>Ventilator</span>
                  )}

                  {selectedPatient.needs_oxygen && (
                    <span>Oxygen</span>
                  )}

                  {selectedPatient.needs_isolation && (
                    <span>Isolation</span>
                  )}

                  {!selectedPatient.needs_ventilator &&
                    !selectedPatient.needs_oxygen &&
                    !selectedPatient.needs_isolation && (
                      <span>Standard Care</span>
                    )}
                </div>
              </div>

              <div className="detail-section">
                <h3>Bed Assignment</h3>

                <div className="assignment-box">
                  {selectedPatient.assigned_bed_id ? (
                    <>
                      <span>Assigned Bed</span>
                      <strong>
                        {selectedPatient.assigned_bed_id}
                      </strong>
                    </>
                  ) : (
                    <>
                      <span>Status</span>
                      <strong>Waiting for compatible bed</strong>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <span>
                Simulation data — not for clinical decision-making.
              </span>

              <button
                onClick={() => setSelectedPatient(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}

      {showAddPatient && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddPatient(false)}
        >
          <div
            className="add-patient-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="modal-label">
                  PATIENT REGISTRATION
                </span>

                <h2>Add New Patient</h2>
              </div>

              <button
                className="close-button"
                onClick={() => setShowAddPatient(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={addPatient}>
              <div className="form-grid">
                <label>
                  Patient ID
                  <input
                    name="patient_id"
                    value={form.patient_id}
                    onChange={handleChange}
                    placeholder="PAT-004"
                    required
                  />
                </label>

                <label>
                  Age
                  <input
                    name="age"
                    type="number"
                    min="0"
                    max="120"
                    value={form.age}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Heart Rate
                  <input
                    name="heart_rate"
                    type="number"
                    min="1"
                    value={form.heart_rate}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Systolic BP
                  <input
                    name="systolic_bp"
                    type="number"
                    min="1"
                    value={form.systolic_bp}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  SpO₂
                  <input
                    name="spo2"
                    type="number"
                    min="1"
                    max="100"
                    value={form.spo2}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Clinical Severity
                  <input
                    name="clinical_severity"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={form.clinical_severity}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Required Ward
                  <select
                    name="required_ward"
                    value={form.required_ward}
                    onChange={handleChange}
                  >
                    <option value="GENERAL">
                      GENERAL
                    </option>
                    <option value="ICU">ICU</option>
                    <option value="EMERGENCY">
                      EMERGENCY
                    </option>
                    <option value="ISOLATION">
                      ISOLATION
                    </option>
                  </select>
                </label>
              </div>

              <div className="checkbox-section">
                <h3>Resource Requirements</h3>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="needs_ventilator"
                    checked={form.needs_ventilator}
                    onChange={handleChange}
                  />
                  Requires Ventilator
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="needs_oxygen"
                    checked={form.needs_oxygen}
                    onChange={handleChange}
                  />
                  Requires Oxygen
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="needs_isolation"
                    checked={form.needs_isolation}
                    onChange={handleChange}
                  />
                  Requires Isolation
                </label>
              </div>

              <div className="form-warning">
                ⚠ This is a simulated educational system. The
                generated priority score is not clinically
                validated.
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowAddPatient(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-button"
                >
                  Register Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Patients;