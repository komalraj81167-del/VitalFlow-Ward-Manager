import { useEffect, useMemo, useState } from "react";
import "./HospitalFloorMap.css";

const API_URL = "http://localhost:8000";

function HospitalFloorMap() {
  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBed, setSelectedBed] = useState(null);

  const loadHospitalData = async () => {
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

      setBeds(Array.isArray(bedsData.beds) ? bedsData.beds : []);

      setPatients(
        Array.isArray(patientsData)
          ? patientsData
          : Array.isArray(patientsData.patients)
            ? patientsData.patients
            : []
      );
    } catch (err) {
      setError(err.message || "Failed to load hospital data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitalData();

    const interval = setInterval(loadHospitalData, 10000);

    return () => clearInterval(interval);
  }, []);

  const getPatientForBed = (bed) => {
    if (!bed.assigned_patient_id) {
      return null;
    }

    return patients.find(
      (patient) =>
        patient.patient_id === bed.assigned_patient_id
    );
  };

  const statistics = useMemo(() => {
    const occupied = beds.filter(
      (bed) => bed.status === "OCCUPIED"
    ).length;

    const available = beds.filter(
      (bed) => bed.status === "AVAILABLE"
    ).length;

    const maintenance = beds.filter(
      (bed) => bed.status === "MAINTENANCE"
    ).length;

    const icu = beds.filter(
      (bed) => bed.ward_type === "ICU"
    ).length;

    const general = beds.filter(
      (bed) => bed.ward_type === "GENERAL"
    ).length;

    return {
      total: beds.length,
      occupied,
      available,
      maintenance,
      icu,
      general,
    };
  }, [beds]);

  const getBedClass = (bed) => {
    if (bed.status === "OCCUPIED") {
      return "floor-bed occupied";
    }

    if (bed.status === "MAINTENANCE") {
      return "floor-bed maintenance";
    }

    return "floor-bed available";
  };

  const getStatusLabel = (status) => {
    if (status === "OCCUPIED") return "Occupied";
    if (status === "MAINTENANCE") return "Maintenance";
    return "Available";
  };

  const getPatientPriority = (patient) => {
    if (!patient) return "";

    return (
      patient.priority ||
      patient.priority_level ||
      "UNKNOWN"
    );
  };

  return (
    <div className="floor-map-page">
      <div className="floor-map-header">
        <div>
          <p className="floor-eyebrow">
            HOSPITAL COMMAND CENTER
          </p>

          <h1>Hospital Floor Map</h1>

          <p className="floor-subtitle">
            Real-time visual representation of hospital beds,
            wards, occupancy, and patient assignments.
          </p>
        </div>

        <div className="floor-header-actions">
          <div className="live-indicator">
            <span></span>
            LIVE DATA
          </div>

          <button
            className="refresh-floor-button"
            onClick={loadHospitalData}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="floor-error">
          <strong>Connection error:</strong> {error}
        </div>
      )}

      <div className="floor-stat-grid">
        <div className="floor-stat-card">
          <span className="floor-stat-label">
            Total Beds
          </span>
          <strong>{statistics.total}</strong>
          <small>Hospital capacity</small>
        </div>

        <div className="floor-stat-card available">
          <span className="floor-stat-label">
            Available
          </span>
          <strong>{statistics.available}</strong>
          <small>Ready for allocation</small>
        </div>

        <div className="floor-stat-card occupied">
          <span className="floor-stat-label">
            Occupied
          </span>
          <strong>{statistics.occupied}</strong>
          <small>Currently assigned</small>
        </div>

        <div className="floor-stat-card">
          <span className="floor-stat-label">
            ICU Beds
          </span>
          <strong>{statistics.icu}</strong>
          <small>Critical-care capacity</small>
        </div>

        <div className="floor-stat-card">
          <span className="floor-stat-label">
            General Beds
          </span>
          <strong>{statistics.general}</strong>
          <small>General ward capacity</small>
        </div>
      </div>

      <div className="floor-map-layout">
        <div className="hospital-map-panel">
          <div className="panel-heading">
            <div>
              <h2>Hospital Floor Layout</h2>
              <p>
                Select a bed to view its current details.
              </p>
            </div>

            <div className="map-legend">
              <span>
                <i className="legend-dot available-dot"></i>
                Available
              </span>

              <span>
                <i className="legend-dot occupied-dot"></i>
                Occupied
              </span>

              <span>
                <i className="legend-dot maintenance-dot"></i>
                Maintenance
              </span>
            </div>
          </div>

          {loading ? (
            <div className="floor-loading">
              Loading hospital floor data...
            </div>
          ) : (
            <div className="hospital-floor">
              <div className="ward-section">
                <div className="ward-title">
                  <div>
                    <span className="ward-tag critical">
                      CRITICAL CARE
                    </span>
                    <h3>ICU Ward</h3>
                  </div>

                  <span className="ward-capacity">
                    {beds.filter(
                      (bed) => bed.ward_type === "ICU"
                    ).length}{" "}
                    beds
                  </span>
                </div>

                <div className="bed-grid">
                  {beds
                    .filter(
                      (bed) => bed.ward_type === "ICU"
                    )
                    .map((bed) => {
                      const patient =
                        getPatientForBed(bed);

                      return (
                        <button
                          key={bed.bed_id}
                          className={getBedClass(bed)}
                          onClick={() =>
                            setSelectedBed(bed)
                          }
                        >
                          <div className="bed-top">
                            <span className="bed-number">
                              {bed.bed_id}
                            </span>

                            <span className="bed-status-dot"></span>
                          </div>

                          <div className="bed-middle">
                            <div className="bed-symbol">
                              🛏
                            </div>

                            <div>
                              <strong>
                                {getStatusLabel(
                                  bed.status
                                )}
                              </strong>

                              {patient && (
                                <span>
                                  {patient.patient_id}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="bed-resources">
                            {bed.ventilator_available && (
                              <span>Ventilator</span>
                            )}

                            {bed.oxygen_available && (
                              <span>O₂</span>
                            )}

                            {bed.isolation_available && (
                              <span>Isolation</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              <div className="hospital-corridor">
                <span>MAIN CORRIDOR</span>
              </div>

              <div className="ward-section">
                <div className="ward-title">
                  <div>
                    <span className="ward-tag general">
                      GENERAL CARE
                    </span>
                    <h3>General Ward</h3>
                  </div>

                  <span className="ward-capacity">
                    {beds.filter(
                      (bed) => bed.ward_type === "GENERAL"
                    ).length}{" "}
                    beds
                  </span>
                </div>

                <div className="bed-grid">
                  {beds
                    .filter(
                      (bed) => bed.ward_type === "GENERAL"
                    )
                    .map((bed) => {
                      const patient =
                        getPatientForBed(bed);

                      return (
                        <button
                          key={bed.bed_id}
                          className={getBedClass(bed)}
                          onClick={() =>
                            setSelectedBed(bed)
                          }
                        >
                          <div className="bed-top">
                            <span className="bed-number">
                              {bed.bed_id}
                            </span>

                            <span className="bed-status-dot"></span>
                          </div>

                          <div className="bed-middle">
                            <div className="bed-symbol">
                              🛏
                            </div>

                            <div>
                              <strong>
                                {getStatusLabel(
                                  bed.status
                                )}
                              </strong>

                              {patient && (
                                <span>
                                  {patient.patient_id}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="bed-resources">
                            {bed.ventilator_available && (
                              <span>Ventilator</span>
                            )}

                            {bed.oxygen_available && (
                              <span>O₂</span>
                            )}

                            {bed.isolation_available && (
                              <span>Isolation</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {beds.length === 0 && (
                <div className="empty-floor">
                  No beds are currently registered in the
                  hospital database.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bed-details-panel">
          {selectedBed ? (
            <>
              <div className="details-header">
                <div>
                  <span className="details-label">
                    BED DETAILS
                  </span>

                  <h2>{selectedBed.bed_id}</h2>
                </div>

                <span
                  className={`details-status ${
                    selectedBed.status.toLowerCase()
                  }`}
                >
                  {selectedBed.status}
                </span>
              </div>

              <div className="details-section">
                <h3>Location</h3>

                <div className="detail-row">
                  <span>Ward</span>
                  <strong>
                    {selectedBed.ward_type}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>Status</span>
                  <strong>
                    {selectedBed.status}
                  </strong>
                </div>
              </div>

              <div className="details-section">
                <h3>Resources</h3>

                <div className="resource-status-list">
                  <div>
                    <span>Ventilator</span>
                    <strong>
                      {selectedBed.ventilator_available
                        ? "Available"
                        : "Unavailable"}
                    </strong>
                  </div>

                  <div>
                    <span>Oxygen</span>
                    <strong>
                      {selectedBed.oxygen_available
                        ? "Available"
                        : "Unavailable"}
                    </strong>
                  </div>

                  <div>
                    <span>Isolation</span>
                    <strong>
                      {selectedBed.isolation_available
                        ? "Available"
                        : "Unavailable"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Patient Assignment</h3>

                {selectedBed.assigned_patient_id ? (
                  (() => {
                    const patient = getPatientForBed(
                      selectedBed
                    );

                    return (
                      <div className="assigned-patient">
                        <div className="patient-avatar">
                          {selectedBed.assigned_patient_id
                            .slice(-2)}
                        </div>

                        <div>
                          <strong>
                            {selectedBed.assigned_patient_id}
                          </strong>

                          {patient && (
                            <span>
                              Priority:{" "}
                              {getPatientPriority(
                                patient
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="no-patient">
                    <span>✓</span>
                    <div>
                      <strong>No patient assigned</strong>
                      <small>
                        Bed is currently available for
                        allocation.
                      </small>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="select-bed-state">
              <div className="map-placeholder-icon">
                🏥
              </div>

              <h3>Select a Bed</h3>

              <p>
                Click any bed on the floor map to view its
                current status, resources, and patient
                assignment.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="floor-map-note">
        <strong>Live prototype:</strong> Bed status is loaded
        from the VitalFlow PostgreSQL database through the
        FastAPI backend. Automatic refresh occurs every 10
        seconds. Clinical decisions should not be made from
        this prototype interface.
      </div>
    </div>
  );
}

export default HospitalFloorMap;