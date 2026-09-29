import { useEffect, useMemo, useState } from "react";
import "./BedManagement.css";

const API_URL = "http://localhost:8000";

function BedManagement() {
  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [wardFilter, setWardFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [bedsResponse, patientsResponse] = await Promise.all([
        fetch(`${API_URL}/beds`),
        fetch(`${API_URL}/patients`),
      ]);

      if (!bedsResponse.ok || !patientsResponse.ok) {
        throw new Error("Unable to load hospital data");
      }

      const bedsData = await bedsResponse.json();
      const patientsData = await patientsResponse.json();

      setBeds(bedsData.beds || []);
      setPatients(patientsData.patients || []);
    } catch (err) {
      setError(err.message || "Failed to load bed data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredBeds = useMemo(() => {
    return beds.filter((bed) => {
      const wardMatches =
        wardFilter === "ALL" ||
        bed.ward_type?.toUpperCase() === wardFilter;

      const statusMatches =
        statusFilter === "ALL" ||
        bed.status?.toUpperCase() === statusFilter;

      return wardMatches && statusMatches;
    });
  }, [beds, wardFilter, statusFilter]);

  const getPatient = (patientId) => {
    return patients.find(
      (patient) => patient.patient_id === patientId
    );
  };

  const handleRelease = async (bedId) => {
    try {
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/beds/release/${bedId}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to release bed"
        );
      }

      setMessage(
        `Bed ${bedId} has been released successfully.`
      );

      await loadData();
    } catch (err) {
      setError(err.message || "Unable to release bed");
    }
  };

  const handleAllocate = async (patientId) => {
    try {
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/beds/allocate/${patientId}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to allocate bed"
        );
      }

      setMessage(
        `Patient ${patientId} allocated to ${data.allocated_bed}.`
      );

      await loadData();
    } catch (err) {
      setError(err.message || "Unable to allocate bed");
    }
  };

  const stats = {
    total: beds.length,
    available: beds.filter(
      (bed) => bed.status === "AVAILABLE"
    ).length,
    occupied: beds.filter(
      (bed) => bed.status === "OCCUPIED"
    ).length,
    other: beds.filter(
      (bed) =>
        !["AVAILABLE", "OCCUPIED"].includes(bed.status)
    ).length,
  };

  const waitingPatients = patients.filter(
    (patient) => !patient.assigned_bed_id
  );

  if (loading && beds.length === 0) {
    return (
      <div className="bed-management">
        <div className="bed-loading">
          Loading hospital beds...
        </div>
      </div>
    );
  }

  return (
    <div className="bed-management">

      {/* Header */}
      <div className="bed-page-header">
        <div>
          <div className="page-eyebrow">
            HOSPITAL OPERATIONS
          </div>

          <h1>Bed Management</h1>

          <p>
            Monitor bed availability, occupancy and
            patient assignments in real time.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={loadData}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="success-message">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          ⚠ {error}
        </div>
      )}

      {/* Statistics */}
      <div className="bed-stat-grid">

        <div className="bed-stat-card">
          <div className="stat-icon">▦</div>
          <div>
            <span>Total Beds</span>
            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className="bed-stat-card available">
          <div className="stat-icon">✓</div>
          <div>
            <span>Available</span>
            <strong>{stats.available}</strong>
          </div>
        </div>

        <div className="bed-stat-card occupied">
          <div className="stat-icon">●</div>
          <div>
            <span>Occupied</span>
            <strong>{stats.occupied}</strong>
          </div>
        </div>

        <div className="bed-stat-card waiting">
          <div className="stat-icon">!</div>
          <div>
            <span>Patients Waiting</span>
            <strong>{waitingPatients.length}</strong>
          </div>
        </div>

      </div>

      {/* Filters */}
      <div className="bed-control-panel">

        <div>
          <h2>Hospital Beds</h2>
          <p>
            {filteredBeds.length} beds displayed
          </p>
        </div>

        <div className="bed-filters">

          <select
            value={wardFilter}
            onChange={(event) =>
              setWardFilter(event.target.value)
            }
          >
            <option value="ALL">All Wards</option>
            <option value="ICU">ICU</option>
            <option value="GENERAL">General</option>
            <option value="EMERGENCY">Emergency</option>
            <option value="ISOLATION">Isolation</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="ALL">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="RESERVED">Reserved</option>
            <option value="CLEANING">Cleaning</option>
          </select>

        </div>

      </div>

      {/* Bed Grid */}
      <div className="bed-grid">

        {filteredBeds.map((bed) => {
          const patient = getPatient(
            bed.assigned_patient_id
          );

          const status =
            bed.status?.toUpperCase() || "UNKNOWN";

          return (
            <div
              className={`bed-card ${status.toLowerCase()}`}
              key={bed.bed_id}
            >

              <div className="bed-card-header">

                <div>
                  <span className="bed-label">
                    BED
                  </span>

                  <h3>{bed.bed_id}</h3>
                </div>

                <span
                  className={`bed-status ${status.toLowerCase()}`}
                >
                  {status.replace("_", " ")}
                </span>

              </div>

              <div className="bed-visual">
                <div className="bed-symbol">
                  🛏
                </div>

                <div>
                  <strong>
                    {bed.ward_type}
                  </strong>

                  <span>
                    {status === "AVAILABLE"
                      ? "Ready for assignment"
                      : status === "OCCUPIED"
                        ? "Patient admitted"
                        : "Under processing"}
                  </span>
                </div>
              </div>

              {/* Patient */}
              <div className="bed-section">

                <span className="section-title">
                  PATIENT
                </span>

                {bed.assigned_patient_id ? (
                  <div className="patient-assignment">
                    <strong>
                      {bed.assigned_patient_id}
                    </strong>

                    {patient && (
                      <span>
                        Priority:{" "}
                        {patient.priority || "N/A"}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="empty-value">
                    No patient assigned
                  </span>
                )}

              </div>

              {/* Equipment */}
              <div className="equipment-grid">

                <div
                  className={
                    bed.ventilator_available
                      ? "equipment available"
                      : "equipment unavailable"
                  }
                >
                  <span>VENT</span>
                  <strong>
                    {bed.ventilator_available
                      ? "✓"
                      : "—"}
                  </strong>
                </div>

                <div
                  className={
                    bed.oxygen_available
                      ? "equipment available"
                      : "equipment unavailable"
                  }
                >
                  <span>O₂</span>
                  <strong>
                    {bed.oxygen_available
                      ? "✓"
                      : "—"}
                  </strong>
                </div>

                <div
                  className={
                    bed.isolation_available
                      ? "equipment available"
                      : "equipment unavailable"
                  }
                >
                  <span>ISO</span>
                  <strong>
                    {bed.isolation_available
                      ? "✓"
                      : "—"}
                  </strong>
                </div>

              </div>

              {/* Actions */}
              <div className="bed-actions">

                {status === "OCCUPIED" && (
                  <button
                    className="release-bed-button"
                    onClick={() =>
                      handleRelease(bed.bed_id)
                    }
                  >
                    Release Bed
                  </button>
                )}

                {status === "AVAILABLE" && (
                  <span className="available-label">
                    Available for allocation
                  </span>
                )}

              </div>

            </div>
          );
        })}

      </div>

      {/* Empty state */}
      {filteredBeds.length === 0 && (
        <div className="bed-empty">
          <div>🛏️</div>
          <h3>No beds found</h3>
          <p>
            Try changing the ward or status filter.
          </p>
        </div>
      )}

      {/* Waiting Patients */}
      <div className="waiting-section">

        <div className="waiting-header">
          <div>
            <div className="page-eyebrow">
              BED ALLOCATION
            </div>

            <h2>Patients Waiting for a Bed</h2>

            <p>
              Allocate compatible available beds
              directly from the patient queue.
            </p>
          </div>
        </div>

        {waitingPatients.length === 0 ? (
          <div className="no-waiting">
            ✓ No patients are currently waiting
            for bed allocation.
          </div>
        ) : (
          <div className="waiting-table-wrapper">

            <table className="waiting-table">

              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Priority</th>
                  <th>Score</th>
                  <th>Required Ward</th>
                  <th>Resources</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {waitingPatients.map((patient) => (
                  <tr key={patient.patient_id}>

                    <td>
                      <strong>
                        {patient.patient_id}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`priority-badge ${
                          patient.priority?.toLowerCase() ||
                          ""
                        }`}
                      >
                        {patient.priority || "N/A"}
                      </span>
                    </td>

                    <td>
                      {patient.severity_score ?? "—"}
                    </td>

                    <td>
                      {patient.required_ward}
                    </td>

                    <td>
                      <div className="resource-tags">

                        {patient.needs_ventilator && (
                          <span>VENT</span>
                        )}

                        {patient.needs_oxygen && (
                          <span>O₂</span>
                        )}

                        {patient.needs_isolation && (
                          <span>ISO</span>
                        )}

                        {!patient.needs_ventilator &&
                          !patient.needs_oxygen &&
                          !patient.needs_isolation && (
                            <span>Standard</span>
                          )}

                      </div>
                    </td>

                    <td>
                      <button
                        className="allocate-button"
                        onClick={() =>
                          handleAllocate(
                            patient.patient_id
                          )
                        }
                      >
                        Allocate Bed
                      </button>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default BedManagement;