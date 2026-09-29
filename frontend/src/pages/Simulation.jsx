import { useEffect, useMemo, useState } from "react";
import "./Simulation.css";

const scenarios = {
  normal: {
    name: "Normal Operations",
    description: "Routine patient arrival pattern",
    arrivalRate: 2,
    criticalRate: 20,
    resourcePressure: 25,
  },
  emergency: {
    name: "Emergency Surge",
    description: "Sudden increase in emergency admissions",
    arrivalRate: 6,
    criticalRate: 55,
    resourcePressure: 70,
  },
  massCasualty: {
    name: "Mass Casualty Event",
    description: "Large-scale emergency admission scenario",
    arrivalRate: 10,
    criticalRate: 75,
    resourcePressure: 90,
  },
};

function Simulation() {
  const [scenario, setScenario] = useState("emergency");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [arrivals, setArrivals] = useState(0);
  const [criticalPatients, setCriticalPatients] = useState(0);
  const [occupiedBeds, setOccupiedBeds] = useState(0);
  const [availableBeds, setAvailableBeds] = useState(3);
  const [events, setEvents] = useState([]);

  const config = scenarios[scenario];

  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setElapsed((previous) => previous + 1);

      const newPatients =
        Math.random() < 0.7
          ? Math.max(1, Math.round(config.arrivalRate / 3))
          : 0;

      if (newPatients > 0) {
        setArrivals((previous) => previous + newPatients);

        const critical = Math.round(
          newPatients * (config.criticalRate / 100)
        );

        setCriticalPatients((previous) => previous + critical);

        setOccupiedBeds((previous) => {
          const next = Math.min(3, previous + newPatients);
          return next;
        });

        setAvailableBeds((previous) => {
          const next = Math.max(0, previous - newPatients);
          return next;
        });

        setEvents((previous) => [
          {
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            text: `${newPatients} simulated patient${
              newPatients > 1 ? "s" : ""
            } arrived`,
            type: critical > 0 ? "critical" : "normal",
          },
          ...previous,
        ].slice(0, 8));
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [running, config]);

  const occupancy = Math.round((occupiedBeds / 3) * 100);

  const pressure = useMemo(() => {
    if (availableBeds === 0) return "CRITICAL";
    if (availableBeds === 1) return "HIGH";
    if (availableBeds === 2) return "MODERATE";
    return "LOW";
  }, [availableBeds]);

  const resetSimulation = () => {
    setRunning(false);
    setElapsed(0);
    setArrivals(0);
    setCriticalPatients(0);
    setOccupiedBeds(0);
    setAvailableBeds(3);
    setEvents([]);
  };

  return (
    <div className="simulation-page">
      {/* HEADER */}
      <div className="simulation-header">
        <div>
          <div className="simulation-eyebrow">
            VITALFLOW SIMULATION LAB
          </div>

          <h1>Hospital Simulation Engine</h1>

          <p>
            Test hospital response under different emergency scenarios
          </p>
        </div>

        <div className="simulation-status">
          <span className={running ? "status-dot running" : "status-dot"}></span>
          {running ? "SIMULATION RUNNING" : "SIMULATION READY"}
        </div>
      </div>

      {/* SCENARIO SELECTOR */}
      <section className="simulation-card scenario-section">
        <div className="section-title">
          <div>
            <h2>Choose Simulation Scenario</h2>
            <p>Run an isolated operational stress test</p>
          </div>
        </div>

        <div className="scenario-grid">
          {Object.entries(scenarios).map(([key, item]) => (
            <button
              key={key}
              className={`scenario-button ${
                scenario === key ? "selected" : ""
              }`}
              onClick={() => {
                if (!running) {
                  setScenario(key);
                  resetSimulation();
                }
              }}
            >
              <strong>{item.name}</strong>
              <span>{item.description}</span>

              <small>
                Arrival rate: {item.arrivalRate}/cycle
              </small>
            </button>
          ))}
        </div>

        <div className="simulation-controls">
          {!running ? (
            <button
              className="start-button"
              onClick={() => setRunning(true)}
            >
              ▶ Start Simulation
            </button>
          ) : (
            <button
              className="pause-button"
              onClick={() => setRunning(false)}
            >
              ⏸ Pause Simulation
            </button>
          )}

          <button
            className="reset-button"
            onClick={resetSimulation}
          >
            ↻ Reset
          </button>

          <div className="elapsed-time">
            Simulation Time:
            <strong>
              {" "}
              {String(Math.floor(elapsed / 60)).padStart(2, "0")}:
              {String(elapsed % 60).padStart(2, "0")}
            </strong>
          </div>
        </div>
      </section>

      {/* KPI */}
      <div className="simulation-kpis">
        <div className="simulation-kpi">
          <span>Simulated Arrivals</span>
          <strong>{arrivals}</strong>
          <small>Patients introduced</small>
        </div>

        <div className="simulation-kpi">
          <span>Critical Patients</span>
          <strong>{criticalPatients}</strong>
          <small>Priority workload</small>
        </div>

        <div className="simulation-kpi">
          <span>Occupied Beds</span>
          <strong>{occupiedBeds}</strong>
          <small>Simulated occupancy</small>
        </div>

        <div className="simulation-kpi">
          <span>Available Beds</span>
          <strong>{availableBeds}</strong>
          <small>Remaining capacity</small>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="simulation-main-grid">
        {/* HOSPITAL PRESSURE */}
        <section className="simulation-card">
          <div className="section-title">
            <div>
              <h2>Hospital Capacity</h2>
              <p>Simulated bed pressure</p>
            </div>
          </div>

          <div className="capacity-display">
            <div
              className="capacity-ring"
              style={{
                background: `conic-gradient(
                  #2563eb ${occupancy * 3.6}deg,
                  #e5e7eb 0deg
                )`,
              }}
            >
              <div>
                <strong>{occupancy}%</strong>
                <span>occupancy</span>
              </div>
            </div>

            <div className="capacity-info">
              <div>
                <span>Pressure Level</span>
                <strong className={`pressure-${pressure.toLowerCase()}`}>
                  {pressure}
                </strong>
              </div>

              <div>
                <span>Resource Pressure</span>
                <strong>{config.resourcePressure}%</strong>
              </div>
            </div>
          </div>
        </section>

        {/* SCENARIO IMPACT */}
        <section className="simulation-card">
          <div className="section-title">
            <div>
              <h2>Scenario Impact</h2>
              <p>Expected operational pressure</p>
            </div>
          </div>

          <div className="impact-list">
            <ImpactRow
              label="Patient Arrival"
              value={`${config.arrivalRate}/cycle`}
              percentage={Math.min(config.arrivalRate * 10, 100)}
            />

            <ImpactRow
              label="Critical Load"
              value={`${config.criticalRate}%`}
              percentage={config.criticalRate}
            />

            <ImpactRow
              label="Resource Demand"
              value={`${config.resourcePressure}%`}
              percentage={config.resourcePressure}
            />
          </div>
        </section>

        {/* EVENT STREAM */}
        <section className="simulation-card event-card">
          <div className="section-title">
            <div>
              <h2>Simulation Event Stream</h2>
              <p>Latest simulated events</p>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="empty-events">
              Start the simulation to generate events.
            </div>
          ) : (
            <div className="event-list">
              {events.map((event) => (
                <div className="event-row" key={event.id}>
                  <span
                    className={`event-dot ${event.type}`}
                  ></span>

                  <div>
                    <strong>{event.text}</strong>
                    <small>{event.time}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* RESPONSE SUMMARY */}
        <section className="simulation-card">
          <div className="section-title">
            <div>
              <h2>Operational Response</h2>
              <p>System-generated simulation signals</p>
            </div>
          </div>

          <div className="response-list">
            <ResponseRow
              label="Bed Availability"
              value={
                availableBeds === 0
                  ? "Immediate pressure"
                  : `${availableBeds} beds available`
              }
            />

            <ResponseRow
              label="Triage Load"
              value={
                criticalPatients >= 3
                  ? "High priority demand"
                  : "Manageable"
              }
            />

            <ResponseRow
              label="Resource Demand"
              value={
                config.resourcePressure >= 80
                  ? "Severe"
                  : config.resourcePressure >= 50
                  ? "Elevated"
                  : "Normal"
              }
            />

            <ResponseRow
              label="Simulation State"
              value={running ? "Active" : "Paused"}
            />
          </div>
        </section>
      </div>

      {/* NOTICE */}
      <div className="simulation-notice">
        <strong>Simulation / Prototype Mode:</strong> This environment
        generates synthetic patient-arrival and resource-pressure events.
        It does not modify real patient records or make clinical decisions.
      </div>
    </div>
  );
}

function ImpactRow({ label, value, percentage }) {
  return (
    <div className="impact-row">
      <div className="impact-top">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      <div className="impact-bar">
        <div style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

function ResponseRow({ label, value }) {
  return (
    <div className="response-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default Simulation;