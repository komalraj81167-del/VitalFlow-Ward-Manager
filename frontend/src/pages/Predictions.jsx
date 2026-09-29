import { useEffect, useMemo, useState } from "react";
import "./Predictions.css";

const API_URL = "http://localhost:8000";

function Predictions() {
  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
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
        throw new Error("Unable to load prediction data");
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
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 15000);

    return () => clearInterval(interval);
  }, []);

  const metrics = useMemo(() => {
    const totalBeds = beds.length;

    const occupiedBeds = beds.filter(
      (bed) => bed.status === "OCCUPIED"
    ).length;

    const availableBeds = beds.filter(
      (bed) => bed.status === "AVAILABLE"
    ).length;

    const occupancyRate =
      totalBeds > 0
        ? Math.round((occupiedBeds / totalBeds) * 100)
        : 0;

    const criticalPatients = patients.filter(
      (patient) =>
        String(patient.priority).toUpperCase() === "CRITICAL"
    ).length;

    const highPriorityPatients = patients.filter(
      (patient) =>
        String(patient.priority).toUpperCase() === "HIGH"
    ).length;

    const icuBeds = beds.filter(
      (bed) => bed.ward_type === "ICU"
    );

    const occupiedIcuBeds = icuBeds.filter(
      (bed) => bed.status === "OCCUPIED"
    ).length;

    const icuOccupancy =
      icuBeds.length > 0
        ? Math.round(
            (occupiedIcuBeds / icuBeds.length) * 100
          )
        : 0;

    return {
      totalBeds,
      occupiedBeds,
      availableBeds,
      occupancyRate,
      criticalPatients,
      highPriorityPatients,
      icuBeds: icuBeds.length,
      icuOccupancy,
    };
  }, [beds, patients]);

  const occupancyForecast = useMemo(() => {
    const current = metrics.occupancyRate;

    return [
      {
        period: "Now",
        value: current,
        label: `${current}%`,
      },
      {
        period: "+6h",
        value: Math.min(100, current + 8),
        label: `${Math.min(100, current + 8)}%`,
      },
      {
        period: "+12h",
        value: Math.min(100, current + 13),
        label: `${Math.min(100, current + 13)}%`,
      },
      {
        period: "+24h",
        value: Math.min(100, current + 18),
        label: `${Math.min(100, current + 18)}%`,
      },
      {
        period: "+48h",
        value: Math.min(100, current + 12),
        label: `${Math.min(100, current + 12)}%`,
      },
    ];
  }, [metrics.occupancyRate]);

  const dischargeForecast = useMemo(() => {
    const occupied = metrics.occupiedBeds;

    return [
      {
        period: "Today",
        value: Math.max(1, Math.round(occupied * 0.15)),
      },
      {
        period: "Tomorrow",
        value: Math.max(1, Math.round(occupied * 0.2)),
      },
      {
        period: "48 Hours",
        value: Math.max(1, Math.round(occupied * 0.3)),
      },
    ];
  }, [metrics.occupiedBeds]);

  const riskLevel = useMemo(() => {
    if (
      metrics.occupancyRate >= 90 ||
      metrics.icuOccupancy >= 90
    ) {
      return {
        label: "HIGH PRESSURE",
        description:
          "Hospital capacity may become constrained.",
        className: "high-risk",
      };
    }

    if (
      metrics.occupancyRate >= 70 ||
      metrics.icuOccupancy >= 70
    ) {
      return {
        label: "MODERATE PRESSURE",
        description:
          "Capacity should be monitored closely.",
        className: "moderate-risk",
      };
    }

    return {
      label: "LOW PRESSURE",
      description:
        "Current capacity provides operational buffer.",
      className: "low-risk",
    };
  }, [metrics]);

  const resourceSignals = useMemo(() => {
    const ventilatorBeds = beds.filter(
      (bed) => bed.ventilator_available
    ).length;

    const oxygenBeds = beds.filter(
      (bed) => bed.oxygen_available
    ).length;

    const isolationBeds = beds.filter(
      (bed) => bed.isolation_available
    ).length;

    return [
      {
        name: "Ventilator Capacity",
        available: ventilatorBeds,
        total: beds.length,
      },
      {
        name: "Oxygen Capacity",
        available: oxygenBeds,
        total: beds.length,
      },
      {
        name: "Isolation Capacity",
        available: isolationBeds,
        total: beds.length,
      },
    ];
  }, [beds]);

  return (
    <div className="predictions-page">
      <div className="predictions-header">
        <div>
          <p className="prediction-eyebrow">
            INTELLIGENCE LAYER
          </p>

          <h1>Predictions & Forecasting</h1>

          <p className="prediction-subtitle">
            Operational forecasting to help hospital teams
            anticipate capacity and resource pressure.
          </p>
        </div>

        <div className="prediction-header-actions">
          <div className="prediction-status">
            <span></span>
            MODEL ACTIVE
          </div>

          <button
            className="prediction-refresh"
            onClick={loadData}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      <div className="prediction-notice">
        <strong>Prototype forecasting:</strong> Current forecasts
        use transparent simulation rules based on available
        hospital data. They are intended for operational
        demonstration and are not clinically validated
        predictions.
      </div>

      {error && (
        <div className="prediction-error">
          <strong>Data error:</strong> {error}
        </div>
      )}

      {loading ? (
        <div className="prediction-loading">
          Loading prediction data...
        </div>
      ) : (
        <>
          <div className="prediction-kpi-grid">
            <div className="prediction-kpi">
              <span>Current Occupancy</span>
              <strong>{metrics.occupancyRate}%</strong>
              <small>
                {metrics.occupiedBeds} of {metrics.totalBeds} beds
              </small>
            </div>

            <div className="prediction-kpi">
              <span>Available Capacity</span>
              <strong>{metrics.availableBeds}</strong>
              <small>Beds currently available</small>
            </div>

            <div className="prediction-kpi">
              <span>Critical Patients</span>
              <strong>{metrics.criticalPatients}</strong>
              <small>Priority requiring attention</small>
            </div>

            <div className="prediction-kpi">
              <span>ICU Occupancy</span>
              <strong>{metrics.icuOccupancy}%</strong>
              <small>
                {metrics.icuBeds} ICU beds tracked
              </small>
            </div>
          </div>

          <div className="prediction-main-grid">
            <section className="forecast-card occupancy-card">
              <div className="forecast-card-header">
                <div>
                  <h2>Occupancy Forecast</h2>
                  <p>
                    Simulated capacity trajectory based on
                    current operational pressure.
                  </p>
                </div>

                <span className={`risk-badge ${riskLevel.className}`}>
                  {riskLevel.label}
                </span>
              </div>

              <div className="forecast-chart">
                {occupancyForecast.map((point) => (
                  <div
                    className="forecast-column"
                    key={point.period}
                  >
                    <div className="forecast-value">
                      {point.label}
                    </div>

                    <div className="forecast-bar-area">
                      <div
                        className="forecast-bar"
                        style={{
                          height: `${Math.max(
                            8,
                            point.value
                          )}%`,
                        }}
                      ></div>
                    </div>

                    <span>{point.period}</span>
                  </div>
                ))}
              </div>

              <div className="forecast-insight">
                <strong>Operational signal:</strong>{" "}
                {riskLevel.description}
              </div>
            </section>

            <section className="forecast-card">
              <div className="forecast-card-header">
                <div>
                  <h2>Discharge Forecast</h2>
                  <p>
                    Estimated operational discharge capacity.
                  </p>
                </div>
              </div>

              <div className="discharge-list">
                {dischargeForecast.map((item) => (
                  <div
                    className="discharge-row"
                    key={item.period}
                  >
                    <div>
                      <strong>{item.period}</strong>
                      <span>Potential discharges</span>
                    </div>

                    <div className="discharge-number">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="forecast-insight">
                These estimates are generated from current
                occupancy and prototype assumptions.
              </div>
            </section>
          </div>

          <div className="prediction-bottom-grid">
            <section className="forecast-card">
              <div className="forecast-card-header">
                <div>
                  <h2>Resource Pressure Signals</h2>
                  <p>
                    Current availability of resource-linked
                    bed capabilities.
                  </p>
                </div>
              </div>

              <div className="resource-signal-list">
                {resourceSignals.map((resource) => {
                  const percentage =
                    resource.total > 0
                      ? Math.round(
                          (resource.available /
                            resource.total) *
                            100
                        )
                      : 0;

                  return (
                    <div
                      className="resource-signal"
                      key={resource.name}
                    >
                      <div className="resource-signal-top">
                        <span>{resource.name}</span>

                        <strong>
                          {resource.available} /{" "}
                          {resource.total}
                        </strong>
                      </div>

                      <div className="signal-track">
                        <div
                          className="signal-fill"
                          style={{
                            width: `${percentage}%`,
                          }}
                        ></div>
                      </div>

                      <small>
                        {percentage}% capacity currently
                        represented
                      </small>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="forecast-card">
              <div className="forecast-card-header">
                <div>
                  <h2>Priority Pressure</h2>
                  <p>
                    Current patient-priority distribution.
                  </p>
                </div>
              </div>

              <div className="priority-pressure">
                <div className="priority-row">
                  <span>Critical</span>
                  <strong>
                    {metrics.criticalPatients}
                  </strong>
                </div>

                <div className="priority-row">
                  <span>High</span>
                  <strong>
                    {metrics.highPriorityPatients}
                  </strong>
                </div>

                <div className="priority-row">
                  <span>Other</span>
                  <strong>
                    {Math.max(
                      0,
                      patients.length -
                        metrics.criticalPatients -
                        metrics.highPriorityPatients
                    )}
                  </strong>
                </div>
              </div>

              <div className="prediction-recommendation">
                <span>Operational focus</span>

                <strong>
                  {metrics.criticalPatients > 0
                    ? "Review critical patients and compatible bed availability."
                    : "Continue monitoring patient flow and capacity."}
                </strong>
              </div>
            </section>
          </div>
        </>
      )}

      <div className="prediction-footer">
        <strong>VitalFlow Intelligence Layer:</strong>{" "}
        The current implementation demonstrates the forecasting
        architecture. A production version would require
        validated historical datasets, model evaluation,
        monitoring, governance, and clinical/operational
        validation before deployment.
      </div>
    </div>
  );
}

export default Predictions;