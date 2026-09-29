import { useEffect, useMemo, useState } from "react";
import "./Analytics.css";

const API = "http://127.0.0.1:8000";

function Analytics() {
  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);

      const [bedsRes, patientsRes] = await Promise.all([
        fetch(`${API}/beds`),
        fetch(`${API}/patients`),
      ]);

      const bedsData = await bedsRes.json();
      const patientsData = await patientsRes.json();

      setBeds(Array.isArray(bedsData) ? bedsData : bedsData.beds || []);

      setPatients(
        Array.isArray(patientsData)
          ? patientsData
          : patientsData.patients || []
      );

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Analytics data loading failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 15000);

    return () => clearInterval(interval);
  }, []);

  const analytics = useMemo(() => {
    const totalBeds = beds.length;

    const occupiedBeds = beds.filter(
      (bed) => bed.status === "OCCUPIED"
    ).length;

    const availableBeds = beds.filter(
      (bed) => bed.status === "AVAILABLE"
    ).length;

    const occupancy =
      totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    const icuBeds = beds.filter(
      (bed) => bed.ward_type === "ICU"
    );

    const generalBeds = beds.filter(
      (bed) => bed.ward_type === "GENERAL"
    );

    const icuOccupied = icuBeds.filter(
      (bed) => bed.status === "OCCUPIED"
    ).length;

    const generalOccupied = generalBeds.filter(
      (bed) => bed.status === "OCCUPIED"
    ).length;

    const icuOccupancy =
      icuBeds.length > 0
        ? Math.round((icuOccupied / icuBeds.length) * 100)
        : 0;

    const generalOccupancy =
      generalBeds.length > 0
        ? Math.round((generalOccupied / generalBeds.length) * 100)
        : 0;

    const critical = patients.filter(
      (p) => p.priority === "CRITICAL"
    ).length;

    const high = patients.filter(
      (p) => p.priority === "HIGH"
    ).length;

    const moderate = patients.filter(
      (p) => p.priority === "MODERATE"
    ).length;

    const low = patients.filter(
      (p) => p.priority === "LOW"
    ).length;

    const waitingPatients = patients.filter(
      (p) => !p.assigned_bed_id
    ).length;

    const assignedPatients = patients.filter(
      (p) => p.assigned_bed_id
    ).length;

    const ventilators = beds.filter(
      (bed) => bed.ventilator_available
    ).length;

    const oxygenBeds = beds.filter(
      (bed) => bed.oxygen_available
    ).length;

    const isolationBeds = beds.filter(
      (bed) => bed.isolation_available
    ).length;

    return {
      totalBeds,
      occupiedBeds,
      availableBeds,
      occupancy,
      icuBeds: icuBeds.length,
      generalBeds: generalBeds.length,
      icuOccupied,
      generalOccupied,
      icuOccupancy,
      generalOccupancy,
      critical,
      high,
      moderate,
      low,
      waitingPatients,
      assignedPatients,
      ventilators,
      oxygenBeds,
      isolationBeds,
    };
  }, [beds, patients]);

  const priorityTotal =
    analytics.critical +
    analytics.high +
    analytics.moderate +
    analytics.low;

  const priorityPercent = (value) =>
    priorityTotal > 0
      ? Math.round((value / priorityTotal) * 100)
      : 0;

  if (loading && beds.length === 0) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          Loading hospital analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* HEADER */}
      <div className="analytics-header">
        <div>
          <div className="analytics-eyebrow">
            VITALFLOW INTELLIGENCE
          </div>

          <h1>Hospital Analytics</h1>

          <p>
            Operational insights from live bed and patient data
          </p>
        </div>

        <div className="analytics-header-actions">
          <div className="analytics-live">
            <span></span>
            LIVE DATA
          </div>

          <button
            className="analytics-refresh"
            onClick={loadData}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="analytics-kpis">
        <div className="analytics-kpi">
          <div className="kpi-icon">🛏</div>
          <div>
            <span>Total Beds</span>
            <strong>{analytics.totalBeds}</strong>
          </div>
          <small>Hospital capacity</small>
        </div>

        <div className="analytics-kpi">
          <div className="kpi-icon">📊</div>
          <div>
            <span>Occupancy</span>
            <strong>{analytics.occupancy}%</strong>
          </div>
          <small>
            {analytics.occupiedBeds} occupied
          </small>
        </div>

        <div className="analytics-kpi">
          <div className="kpi-icon">🚨</div>
          <div>
            <span>Critical Patients</span>
            <strong>{analytics.critical}</strong>
          </div>
          <small>Highest priority</small>
        </div>

        <div className="analytics-kpi">
          <div className="kpi-icon">⏳</div>
          <div>
            <span>Waiting Patients</span>
            <strong>{analytics.waitingPatients}</strong>
          </div>
          <small>Awaiting allocation</small>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="analytics-grid">
        {/* OCCUPANCY */}
        <section className="analytics-card occupancy-card">
          <div className="card-heading">
            <div>
              <h2>Bed Occupancy</h2>
              <p>Current hospital capacity utilization</p>
            </div>
          </div>

          <div className="occupancy-main">
            <div
              className="occupancy-ring"
              style={{
                background: `conic-gradient(
                  #2563eb ${analytics.occupancy * 3.6}deg,
                  #e5e7eb 0deg
                )`,
              }}
            >
              <div>
                <strong>{analytics.occupancy}%</strong>
                <span>occupied</span>
              </div>
            </div>

            <div className="occupancy-details">
              <div>
                <span className="dot occupied"></span>
                Occupied
                <strong>{analytics.occupiedBeds}</strong>
              </div>

              <div>
                <span className="dot available"></span>
                Available
                <strong>{analytics.availableBeds}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* WARD UTILIZATION */}
        <section className="analytics-card">
          <div className="card-heading">
            <div>
              <h2>Ward Utilization</h2>
              <p>Capacity by ward type</p>
            </div>
          </div>

          <div className="ward-stat">
            <div className="ward-stat-top">
              <span>ICU</span>
              <strong>{analytics.icuOccupancy}%</strong>
            </div>

            <div className="analytics-progress">
              <div
                style={{
                  width: `${analytics.icuOccupancy}%`,
                }}
              ></div>
            </div>

            <small>
              {analytics.icuOccupied} / {analytics.icuBeds} beds occupied
            </small>
          </div>

          <div className="ward-stat">
            <div className="ward-stat-top">
              <span>General Ward</span>
              <strong>{analytics.generalOccupancy}%</strong>
            </div>

            <div className="analytics-progress">
              <div
                style={{
                  width: `${analytics.generalOccupancy}%`,
                }}
              ></div>
            </div>

            <small>
              {analytics.generalOccupied} /{" "}
              {analytics.generalBeds} beds occupied
            </small>
          </div>
        </section>

        {/* PRIORITY DISTRIBUTION */}
        <section className="analytics-card priority-card">
          <div className="card-heading">
            <div>
              <h2>Patient Priority Distribution</h2>
              <p>Current triage workload</p>
            </div>
          </div>

          <div className="priority-list">
            <PriorityRow
              label="Critical"
              value={analytics.critical}
              percentage={priorityPercent(analytics.critical)}
              className="critical"
            />

            <PriorityRow
              label="High"
              value={analytics.high}
              percentage={priorityPercent(analytics.high)}
              className="high"
            />

            <PriorityRow
              label="Moderate"
              value={analytics.moderate}
              percentage={priorityPercent(analytics.moderate)}
              className="moderate"
            />

            <PriorityRow
              label="Low"
              value={analytics.low}
              percentage={priorityPercent(analytics.low)}
              className="low"
            />
          </div>
        </section>

        {/* PATIENT FLOW */}
        <section className="analytics-card">
          <div className="card-heading">
            <div>
              <h2>Patient Flow</h2>
              <p>Current allocation status</p>
            </div>
          </div>

          <div className="flow-grid">
            <div className="flow-item">
              <span>Registered</span>
              <strong>{patients.length}</strong>
            </div>

            <div className="flow-item">
              <span>Allocated</span>
              <strong>{analytics.assignedPatients}</strong>
            </div>

            <div className="flow-item">
              <span>Waiting</span>
              <strong>{analytics.waitingPatients}</strong>
            </div>
          </div>

          <div className="flow-bar">
            <div
              style={{
                width:
                  patients.length > 0
                    ? `${Math.round(
                        (analytics.assignedPatients /
                          patients.length) *
                          100
                      )}%`
                    : "0%",
              }}
            ></div>
          </div>
        </section>

        {/* RESOURCES */}
        <section className="analytics-card">
          <div className="card-heading">
            <div>
              <h2>Resource Availability</h2>
              <p>Equipment-linked bed capacity</p>
            </div>
          </div>

          <div className="resource-stat">
            <span>🫁 Ventilator Capacity</span>
            <strong>{analytics.ventilators}</strong>
          </div>

          <div className="resource-stat">
            <span>💨 Oxygen Supported</span>
            <strong>{analytics.oxygenBeds}</strong>
          </div>

          <div className="resource-stat">
            <span>🛡 Isolation Supported</span>
            <strong>{analytics.isolationBeds}</strong>
          </div>
        </section>

        {/* OPERATIONAL SIGNALS */}
        <section className="analytics-card signals-card">
          <div className="card-heading">
            <div>
              <h2>Operational Signals</h2>
              <p>Rule-based system indicators</p>
            </div>
          </div>

          <Signal
            label="Bed Capacity"
            value={
              analytics.occupancy >= 85
                ? "High pressure"
                : analytics.occupancy >= 60
                ? "Moderate"
                : "Available"
            }
            active={analytics.occupancy >= 85}
          />

          <Signal
            label="Critical Patient Load"
            value={
              analytics.critical >= 3
                ? "Attention required"
                : analytics.critical > 0
                ? "Monitor"
                : "Normal"
            }
            active={analytics.critical >= 3}
          />

          <Signal
            label="Allocation Queue"
            value={
              analytics.waitingPatients >= 3
                ? "High demand"
                : analytics.waitingPatients > 0
                ? "Pending"
                : "Clear"
            }
            active={analytics.waitingPatients >= 3}
          />
        </section>
      </div>

      {/* FOOTER */}
      <div className="analytics-footer">
        <div>
          <strong>Analytics status:</strong>{" "}
          {lastUpdated
            ? `Updated ${lastUpdated.toLocaleTimeString()}`
            : "Waiting for data"}
        </div>

        <div className="analytics-notice">
          ⚠ Prototype analytics — operational calculations are
          rule-based and not clinically validated.
        </div>
      </div>
    </div>
  );
}

function PriorityRow({
  label,
  value,
  percentage,
  className,
}) {
  return (
    <div className="priority-row">
      <div className="priority-row-top">
        <div>
          <span className={`priority-dot ${className}`}></span>
          {label}
        </div>

        <strong>{value}</strong>
      </div>

      <div className="priority-progress">
        <div
          className={className}
          style={{
            width: `${percentage}%`,
          }}
        ></div>
      </div>

      <small>{percentage}% of patients</small>
    </div>
  );
}

function Signal({ label, value, active }) {
  return (
    <div className="signal-row">
      <div>
        <span className={active ? "signal-dot active" : "signal-dot"}></span>
        {label}
      </div>

      <strong>{value}</strong>
    </div>
  );
}

export default Analytics;