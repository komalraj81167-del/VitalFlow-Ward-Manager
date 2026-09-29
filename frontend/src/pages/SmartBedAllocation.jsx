import { useEffect, useMemo, useState } from "react";
import "./SmartBedAllocation.css";

const API_URL = "http://localhost:8000";

function SmartBedAllocation() {
  const [patients, setPatients] = useState([]);
  const [beds, setBeds] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedBedId, setSelectedBedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [patientsResponse, bedsResponse] =
        await Promise.all([
          fetch(`${API_URL}/patients`),
          fetch(`${API_URL}/beds`),
        ]);

      if (!patientsResponse.ok || !bedsResponse.ok) {
        throw new Error("Unable to load hospital data");
      }

      const patientsData = await patientsResponse.json();
      const bedsData = await bedsResponse.json();

      setPatients(patientsData.patients || []);
      setBeds(bedsData.beds || []);

      if (
        !selectedPatientId &&
        patientsData.patients?.length
      ) {
        const firstWaitingPatient =
          patientsData.patients.find(
            (patient) => !patient.assigned_bed_id
          );

        if (firstWaitingPatient) {
          setSelectedPatientId(
            firstWaitingPatient.patient_id
          );
        }
      }
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedPatient = useMemo(() => {
    return patients.find(
      (patient) =>
        patient.patient_id === selectedPatientId
    );
  }, [patients, selectedPatientId]);

  /*
   * Compatibility analysis.
   *
   * This is an educational/demo scoring mechanism.
   * It is NOT a clinical recommendation.
   */
  const analyzedBeds = useMemo(() => {
    if (!selectedPatient) {
      return [];
    }

    return beds
      .map((bed) => {
        const reasons = [];
        const problems = [];

        let score = 0;

        const wardMatch =
          bed.ward_type?.toUpperCase() ===
          selectedPatient.required_ward?.toUpperCase();

        const ventilatorMatch =
          !selectedPatient.needs_ventilator ||
          bed.ventilator_available;

        const oxygenMatch =
          !selectedPatient.needs_oxygen ||
          bed.oxygen_available;

        const isolationMatch =
          !selectedPatient.needs_isolation ||
          bed.isolation_available;

        const availabilityMatch =
          bed.status === "AVAILABLE";

        if (wardMatch) {
          score += 30;
          reasons.push(
            "Ward type matches patient requirement"
          );
        } else {
          problems.push(
            `Required ward: ${selectedPatient.required_ward}`
          );
        }

        if (selectedPatient.needs_ventilator) {
          if (bed.ventilator_available) {
            score += 25;
            reasons.push("Ventilator available");
          } else {
            problems.push("Ventilator unavailable");
          }
        } else {
          score += 10;
          reasons.push("No ventilator required");
        }

        if (selectedPatient.needs_oxygen) {
          if (bed.oxygen_available) {
            score += 20;
            reasons.push("Oxygen available");
          } else {
            problems.push("Oxygen unavailable");
          }
        } else {
          score += 10;
          reasons.push("No oxygen requirement");
        }

        if (selectedPatient.needs_isolation) {
          if (bed.isolation_available) {
            score += 15;
            reasons.push("Isolation capability available");
          } else {
            problems.push("Isolation unavailable");
          }
        } else {
          score += 10;
          reasons.push("No isolation requirement");
        }

        if (availabilityMatch) {
          reasons.push("Bed is currently available");
        } else {
          problems.push(
            `Bed status: ${bed.status}`
          );
        }

        /*
         * Only fully compatible beds are eligible
         * for actual allocation.
         */
        const compatible =
          wardMatch &&
          ventilatorMatch &&
          oxygenMatch &&
          isolationMatch &&
          availabilityMatch;

        return {
          ...bed,
          score: Math.min(score, 100),
          reasons,
          problems,
          compatible,
        };
      })
      .sort((a, b) => {
        if (a.compatible !== b.compatible) {
          return a.compatible ? -1 : 1;
        }

        return b.score - a.score;
      });
  }, [beds, selectedPatient]);

  const compatibleBeds = analyzedBeds.filter(
    (bed) => bed.compatible
  );

  const recommendedBed = compatibleBeds[0];

  useEffect(() => {
    if (recommendedBed) {
      setSelectedBedId(recommendedBed.bed_id);
    } else {
      setSelectedBedId("");
    }
  }, [recommendedBed?.bed_id]);

  const handleAllocate = async () => {
    if (!selectedPatient || !selectedBedId) {
      setError("Select a patient and compatible bed first.");
      return;
    }

    const selectedAnalysis = analyzedBeds.find(
      (bed) => bed.bed_id === selectedBedId
    );

    if (!selectedAnalysis?.compatible) {
      setError(
        "The selected bed does not satisfy all patient requirements."
      );
      return;
    }

    try {
      setAllocating(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/beds/allocate/${selectedPatient.patient_id}`,
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
        `BED_ASSIGNMENT_OPTIMIZED: ${selectedPatient.patient_id} → ${data.allocated_bed}`
      );

      setSelectedPatientId("");
      setSelectedBedId("");

      await loadData();
    } catch (err) {
      setError(
        err.message || "Unable to allocate bed"
      );
    } finally {
      setAllocating(false);
    }
  };

  const waitingPatients = patients.filter(
    (patient) => !patient.assigned_bed_id
  );

  if (loading && patients.length === 0) {
    return (
      <div className="smart-allocation">
        <div className="allocation-loading">
          Loading allocation engine...
        </div>
      </div>
    );
  }

  return (
    <div className="smart-allocation">

      {/* Header */}
      <div className="allocation-header">

        <div>
          <div className="allocation-eyebrow">
            INTELLIGENT RESOURCE OPTIMIZATION
          </div>

          <h1>Smart Bed Allocation</h1>

          <p>
            Match patients with compatible available beds
            using transparent resource-compatibility rules.
          </p>
        </div>

        <button
          className="allocation-refresh"
          onClick={loadData}
        >
          ↻ Refresh
        </button>

      </div>

      {/* Demo warning */}
      <div className="simulation-banner">
        <div className="simulation-icon">⚕</div>

        <div>
          <strong>Simulation / Demonstration Mode</strong>

          <p>
            Allocation compatibility scores are generated
            from project rules for demonstration purposes.
            They are not clinically validated recommendations.
          </p>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="allocation-success">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="allocation-error">
          ⚠ {error}
        </div>
      )}

      {/* Main selection area */}
      <div className="allocation-selection">

        <div className="selection-panel">

          <div className="panel-heading">
            <span>01</span>

            <div>
              <h2>Select Patient</h2>
              <p>
                Choose a patient currently waiting for
                a compatible bed.
              </p>
            </div>
          </div>

          <select
            className="patient-selector"
            value={selectedPatientId}
            onChange={(event) => {
              setSelectedPatientId(event.target.value);
              setSelectedBedId("");
              setMessage("");
              setError("");
            }}
          >
            <option value="">
              Select a patient...
            </option>

            {waitingPatients.map((patient) => (
              <option
                key={patient.patient_id}
                value={patient.patient_id}
              >
                {patient.patient_id} —{" "}
                {patient.priority || "N/A"} —{" "}
                {patient.required_ward}
              </option>
            ))}
          </select>

          {selectedPatient && (
            <div className="patient-summary">

              <div className="patient-summary-header">
                <div>
                  <span>PATIENT</span>
                  <strong>
                    {selectedPatient.patient_id}
                  </strong>
                </div>

                <span
                  className={`allocation-priority ${
                    selectedPatient.priority?.toLowerCase() ||
                    ""
                  }`}
                >
                  {selectedPatient.priority}
                </span>
              </div>

              <div className="patient-vitals">

                <div>
                  <span>SpO₂</span>
                  <strong>
                    {selectedPatient.spo2}%
                  </strong>
                </div>

                <div>
                  <span>Heart Rate</span>
                  <strong>
                    {selectedPatient.heart_rate}
                  </strong>
                </div>

                <div>
                  <span>BP</span>
                  <strong>
                    {selectedPatient.systolic_bp}
                  </strong>
                </div>

                <div>
                  <span>Risk Score</span>
                  <strong>
                    {selectedPatient.severity_score}
                  </strong>
                </div>

              </div>

              <div className="requirements">

                <span className="requirements-label">
                  REQUIREMENTS
                </span>

                <div className="requirement-tags">

                  <span>
                    Ward:{" "}
                    {selectedPatient.required_ward}
                  </span>

                  {selectedPatient.needs_ventilator && (
                    <span>Ventilator</span>
                  )}

                  {selectedPatient.needs_oxygen && (
                    <span>Oxygen</span>
                  )}

                  {selectedPatient.needs_isolation && (
                    <span>Isolation</span>
                  )}

                </div>

              </div>

            </div>
          )}

        </div>

        {/* Recommendation */}
        <div className="recommendation-panel">

          <div className="panel-heading">
            <span>02</span>

            <div>
              <h2>AI-Assisted Recommendation</h2>

              <p>
                Explainable compatibility analysis.
              </p>
            </div>
          </div>

          {!selectedPatient ? (
            <div className="recommendation-empty">
              <div>🛏</div>
              <h3>Select a patient</h3>
              <p>
                A compatible bed recommendation will
                appear here.
              </p>
            </div>
          ) : recommendedBed ? (
            <div className="recommended-card">

              <div className="recommended-top">

                <div>
                  <span>RECOMMENDED BED</span>
                  <h3>
                    {recommendedBed.bed_id}
                  </h3>

                  <p>
                    {recommendedBed.ward_type} Ward
                  </p>
                </div>

                <div className="compatibility-score">
                  <strong>
                    {recommendedBed.score}%
                  </strong>

                  <span>
                    compatibility
                  </span>
                </div>

              </div>

              <div className="recommendation-reasons">

                <h4>
                  Why this bed matches
                </h4>

                {recommendedBed.reasons.map(
                  (reason, index) => (
                    <div
                      className="reason positive"
                      key={index}
                    >
                      <span>✓</span>
                      {reason}
                    </div>
                  )
                )}

              </div>

              <button
                className="optimized-allocate-button"
                onClick={() => {
                  setSelectedBedId(
                    recommendedBed.bed_id
                  );
                }}
              >
                Select Recommended Bed
              </button>

            </div>
          ) : (
            <div className="recommendation-empty no-bed">

              <div>!</div>

              <h3>
                No compatible bed available
              </h3>

              <p>
                No currently available bed satisfies
                all required resource constraints.
              </p>

            </div>
          )}

        </div>

      </div>

      {/* Bed Analysis */}
      {selectedPatient && (
        <div className="analysis-section">

          <div className="analysis-header">

            <div>
              <div className="allocation-eyebrow">
                RESOURCE MATCHING ENGINE
              </div>

              <h2>Bed Compatibility Analysis</h2>

              <p>
                Every available and unavailable bed is
                evaluated against the selected patient's
                requirements.
              </p>
            </div>

            <div className="analysis-count">
              <strong>
                {compatibleBeds.length}
              </strong>

              <span>
                compatible beds
              </span>
            </div>

          </div>

          <div className="bed-analysis-grid">

            {analyzedBeds.map((bed) => (

              <button
                key={bed.bed_id}
                className={`analysis-card ${
                  bed.compatible
                    ? "compatible"
                    : "incompatible"
                } ${
                  selectedBedId === bed.bed_id
                    ? "selected"
                    : ""
                }`}
                onClick={() => {
                  if (bed.compatible) {
                    setSelectedBedId(
                      bed.bed_id
                    );
                  }
                }}
              >

                <div className="analysis-card-header">

                  <div>
                    <span>BED</span>
                    <h3>{bed.bed_id}</h3>
                  </div>

                  <div className="analysis-score">
                    {bed.score}%
                  </div>

                </div>

                <div className="analysis-status">
                  {bed.compatible ? (
                    <>
                      <span>✓</span>
                      Compatible
                    </>
                  ) : (
                    <>
                      <span>×</span>
                      Not Compatible
                    </>
                  )}
                </div>

                <div className="analysis-details">

                  {bed.reasons.slice(0, 4).map(
                    (reason, index) => (
                      <div
                        key={`reason-${index}`}
                        className="analysis-reason"
                      >
                        <span>✓</span>
                        {reason}
                      </div>
                    )
                  )}

                  {bed.problems.slice(0, 4).map(
                    (problem, index) => (
                      <div
                        key={`problem-${index}`}
                        className="analysis-problem"
                      >
                        <span>×</span>
                        {problem}
                      </div>
                    )
                  )}

                </div>

              </button>

            ))}

          </div>

        </div>
      )}

      {/* Final allocation */}
      {selectedPatient && selectedBedId && (
        <div className="final-allocation">

          <div>
            <span>READY FOR ALLOCATION</span>

            <strong>
              {selectedPatient.patient_id}
              {" → "}
              {selectedBedId}
            </strong>

            <p>
              This action will update the bed and
              patient assignment in PostgreSQL.
            </p>
          </div>

          <button
            className="final-allocate-button"
            onClick={handleAllocate}
            disabled={allocating}
          >
            {allocating
              ? "Allocating..."
              : "Confirm Bed Allocation"}
          </button>

        </div>
      )}

    </div>
  );
}

export default SmartBedAllocation;