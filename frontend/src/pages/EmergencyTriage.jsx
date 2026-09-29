import { useEffect, useMemo, useState } from "react";
import "./EmergencyTriage.css";

const API_URL = "http://localhost:8000";

const initialForm = {
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
};

function EmergencyTriage() {
  const [form, setForm] = useState(initialForm);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${API_URL}/patients`);

      if (!response.ok) {
        throw new Error("Unable to load patients.");
      }

      const data = await response.json();
      setPatients(data.patients || []);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to connect to the VitalFlow backend."
      );
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");
    setSelectedPatient(null);

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
          clinical_severity: Number(
            form.clinical_severity
          ),
          required_ward: form.required_ward,
          needs_ventilator: form.needs_ventilator,
          needs_oxygen: form.needs_oxygen,
          needs_isolation: form.needs_isolation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to register patient."
        );
      }

      setSelectedPatient(data.patient);

      setMessage(
        `${form.patient_id} entered the priority queue successfully.`
      );

      setForm(initialForm);

      await fetchPatients();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExtractMax = async () => {
    setExtracting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/queue/pop`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to extract highest priority patient."
        );
      }

      setMessage(
        `${data.patient.patient_id} extracted from the priority queue.`
      );

      await fetchPatients();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setExtracting(false);
    }
  };

  const heapNodes = useMemo(() => {
    if (!patients.length) {
      return [];
    }

    return patients
      .slice()
      .sort(
        (a, b) =>
          b.severity_score - a.severity_score
      )
      .slice(0, 7);
  }, [patients]);

  const priorityClass = (priority) => {
    if (priority === "CRITICAL") return "critical";
    if (priority === "HIGH") return "high";
    if (priority === "MODERATE") return "moderate";
    return "low";
  };

  return (
    <div className="triage-page">
      <div className="page-heading">
        <div>
          <span className="page-eyebrow">
            PRIORITY INTELLIGENCE
          </span>

          <h1>Emergency Triage</h1>

          <p>
            Register patients, calculate simulated
            priority, and manage the emergency queue.
          </p>
        </div>

        <div className="simulation-badge">
          SIMULATION MODE
        </div>
      </div>

      {error && (
        <div className="triage-message error">
          {error}
        </div>
      )}

      {message && (
        <div className="triage-message success">
          {message}
        </div>
      )}

      <div className="triage-layout">
        <section className="triage-panel">
          <div className="panel-heading">
            <div>
              <h2>Patient Assessment</h2>
              <p>
                Enter the patient's current simulated
                clinical parameters.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="triage-form-grid">
              <div className="triage-field">
                <label>Patient ID</label>

                <input
                  name="patient_id"
                  value={form.patient_id}
                  onChange={handleChange}
                  placeholder="PAT-004"
                  required
                />
              </div>

              <div className="triage-field">
                <label>Age</label>

                <input
                  type="number"
                  name="age"
                  min="0"
                  max="120"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="65"
                  required
                />
              </div>

              <div className="triage-field">
                <label>Heart Rate</label>

                <input
                  type="number"
                  name="heart_rate"
                  min="1"
                  value={form.heart_rate}
                  onChange={handleChange}
                  placeholder="120"
                  required
                />
              </div>

              <div className="triage-field">
                <label>Systolic BP</label>

                <input
                  type="number"
                  name="systolic_bp"
                  min="1"
                  value={form.systolic_bp}
                  onChange={handleChange}
                  placeholder="90"
                  required
                />
              </div>

              <div className="triage-field">
                <label>SpO₂ (%)</label>

                <input
                  type="number"
                  name="spo2"
                  min="1"
                  max="100"
                  step="0.1"
                  value={form.spo2}
                  onChange={handleChange}
                  placeholder="92"
                  required
                />
              </div>

              <div className="triage-field">
                <label>Clinical Severity</label>

                <input
                  type="number"
                  name="clinical_severity"
                  min="0"
                  max="10"
                  step="0.1"
                  value={form.clinical_severity}
                  onChange={handleChange}
                  placeholder="8"
                  required
                />
              </div>

              <div className="triage-field">
                <label>Required Ward</label>

                <select
                  name="required_ward"
                  value={form.required_ward}
                  onChange={handleChange}
                >
                  <option value="GENERAL">
                    GENERAL
                  </option>

                  <option value="ICU">
                    ICU
                  </option>
                </select>
              </div>
            </div>

            <div className="resource-options">
              <label>
                <input
                  type="checkbox"
                  name="needs_ventilator"
                  checked={form.needs_ventilator}
                  onChange={handleChange}
                />
                Needs Ventilator
              </label>

              <label>
                <input
                  type="checkbox"
                  name="needs_oxygen"
                  checked={form.needs_oxygen}
                  onChange={handleChange}
                />
                Needs Oxygen
              </label>

              <label>
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
              className="calculate-button"
              disabled={loading}
            >
              {loading
                ? "Calculating Priority..."
                : "Calculate Priority & Add to Queue"}
            </button>
          </form>
        </section>

        <section className="result-panel">
          <div className="panel-heading">
            <div>
              <h2>Triage Result</h2>
              <p>
                Simulated priority intelligence output.
              </p>
            </div>
          </div>

          {selectedPatient ? (
            <div className="triage-result">
              <div
                className={`priority-circle ${priorityClass(
                  selectedPatient.priority
                )}`}
              >
                {selectedPatient.severity_score}
              </div>

              <span
                className={`priority-label ${priorityClass(
                  selectedPatient.priority
                )}`}
              >
                {selectedPatient.priority}
              </span>

              <strong>
                {selectedPatient.patient_id}
              </strong>

              <p>
                Patient successfully added to the
                simulated priority queue.
              </p>
            </div>
          ) : (
            <div className="empty-result">
              <div className="empty-icon">+</div>

              <strong>
                No new assessment
              </strong>

              <p>
                Complete the patient assessment to
                calculate a priority score.
              </p>
            </div>
          )}

          <div className="scoring-info">
            <strong>Score Components</strong>

            <div>
              <span>Oxygen Risk</span>
              <span>SpO₂</span>
            </div>

            <div>
              <span>BP Risk</span>
              <span>Systolic BP</span>
            </div>

            <div>
              <span>Heart Rate Risk</span>
              <span>Heart Rate</span>
            </div>

            <div>
              <span>Age Factor</span>
              <span>Age</span>
            </div>

            <div>
              <span>Clinical Severity</span>
              <span>0–10</span>
            </div>
          </div>
        </section>
      </div>

      <section className="heap-panel">
        <div className="panel-heading heap-heading">
          <div>
            <span className="page-eyebrow">
              PRIORITY DATA STRUCTURE
            </span>

            <h2>Max-Heap Priority Queue</h2>

            <p>
              Highest simulated severity remains at
              the root of the queue.
            </p>
          </div>

          <button
            className="extract-button"
            onClick={handleExtractMax}
            disabled={
              extracting || heapNodes.length === 0
            }
          >
            {extracting
              ? "Extracting..."
              : "Extract Max"}
          </button>
        </div>

        {heapNodes.length > 0 ? (
          <div className="heap-tree">
            {heapNodes.map((patient, index) => (
              <div
                key={patient.patient_id}
                className={`heap-node level-${Math.min(
                  Math.floor(Math.log2(index + 1)),
                  2
                )}`}
              >
                <strong>{patient.patient_id}</strong>

                <span>
                  {patient.severity_score}
                </span>

                <small>{patient.priority}</small>
              </div>
            ))}
          </div>
        ) : (
          <div className="heap-empty">
            Priority queue is currently empty.
          </div>
        )}

        <div className="heap-complexity">
          <span>
            Insert: <strong>O(log n)</strong>
          </span>

          <span>
            Extract Max: <strong>O(log n)</strong>
          </span>

          <span>
            Peek: <strong>O(1)</strong>
          </span>

          <span>
            Queue Size: <strong>{patients.length}</strong>
          </span>
        </div>
      </section>

      <section className="queue-panel">
        <div className="panel-heading">
          <div>
            <h2>Patient Priority Queue</h2>

            <p>
              Patients ordered by simulated severity
              score.
            </p>
          </div>

          <span className="queue-count">
            {patients.length} Patients
          </span>
        </div>

        {patients.length === 0 ? (
          <div className="table-empty">
            No patients registered.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Priority</th>
                  <th>Score</th>
                  <th>Ward</th>
                  <th>SpO₂</th>
                  <th>Heart Rate</th>
                  <th>Bed</th>
                </tr>
              </thead>

              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.patient_id}>
                    <td>
                      <strong>
                        {patient.patient_id}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`table-priority ${priorityClass(
                          patient.priority
                        )}`}
                      >
                        {patient.priority}
                      </span>
                    </td>

                    <td>
                      <strong>
                        {patient.severity_score}
                      </strong>
                    </td>

                    <td>
                      {patient.required_ward}
                    </td>

                    <td>{patient.spo2}%</td>

                    <td>
                      {patient.heart_rate} bpm
                    </td>

                    <td>
                      {patient.assigned_bed_id ? (
                        <span className="assigned">
                          {patient.assigned_bed_id}
                        </span>
                      ) : (
                        <span className="waiting">
                          Waiting
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="triage-disclaimer">
        Simulation only — the triage scoring system is
        an educational demonstration and is not
        clinically validated or intended for patient
        care.
      </div>
    </div>
  );
}

export default EmergencyTriage;