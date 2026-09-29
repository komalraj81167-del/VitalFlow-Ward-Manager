import { useMemo, useState } from "react";
import "./AuditLogs.css";

const initialLogs = [
  {
    id: 1,
    time: "10:42:18",
    date: "Today",
    user: "Admin",
    role: "Administrator",
    action: "User login",
    module: "Security",
    description: "Administrator signed into VitalFlow",
    severity: "INFO",
    status: "SUCCESS",
  },
  {
    id: 2,
    time: "10:38:51",
    date: "Today",
    user: "Dr. Sharma",
    role: "Doctor",
    action: "Patient triage",
    module: "Triage",
    description: "Emergency patient PAT-DB-001 evaluated",
    severity: "CRITICAL",
    status: "COMPLETED",
  },
  {
    id: 3,
    time: "10:35:26",
    date: "Today",
    user: "Nurse Patel",
    role: "Nurse",
    action: "Bed allocation",
    module: "Bed Management",
    description: "ICU-01 assigned to PAT-001",
    severity: "WARNING",
    status: "COMPLETED",
  },
  {
    id: 4,
    time: "10:31:07",
    date: "Today",
    user: "Admin",
    role: "Administrator",
    action: "Resource check",
    module: "Resources",
    description: "Hospital resource availability reviewed",
    severity: "INFO",
    status: "COMPLETED",
  },
  {
    id: 5,
    time: "10:24:43",
    date: "Today",
    user: "Reception",
    role: "Reception",
    action: "Patient registration",
    module: "Patients",
    description: "New patient PAT-003 registered",
    severity: "INFO",
    status: "SUCCESS",
  },
  {
    id: 6,
    time: "10:18:32",
    date: "Today",
    user: "System",
    role: "System",
    action: "Prediction refresh",
    module: "Predictions",
    description: "Operational forecast recalculated",
    severity: "INFO",
    status: "COMPLETED",
  },
  {
    id: 7,
    time: "10:12:09",
    date: "Today",
    user: "Admin",
    role: "Administrator",
    action: "Simulation started",
    module: "Simulation",
    description: "Emergency surge scenario started",
    severity: "WARNING",
    status: "RUNNING",
  },
  {
    id: 8,
    time: "09:58:44",
    date: "Today",
    user: "Nurse Patel",
    role: "Nurse",
    action: "Bed release",
    module: "Bed Management",
    description: "GENERAL-01 marked available",
    severity: "INFO",
    status: "SUCCESS",
  },
  {
    id: 9,
    time: "09:46:21",
    date: "Today",
    user: "Dr. Sharma",
    role: "Doctor",
    action: "Critical alert",
    module: "Alerts",
    description: "Critical patient alert acknowledged",
    severity: "CRITICAL",
    status: "ACKNOWLEDGED",
  },
  {
    id: 10,
    time: "09:32:15",
    date: "Today",
    user: "System",
    role: "System",
    action: "Database health check",
    module: "System",
    description: "Database connectivity verified",
    severity: "INFO",
    status: "SUCCESS",
  },
  {
    id: 11,
    time: "09:15:48",
    date: "Today",
    user: "Admin",
    role: "Administrator",
    action: "Settings update",
    module: "Settings",
    description: "Operational configuration reviewed",
    severity: "WARNING",
    status: "COMPLETED",
  },
  {
    id: 12,
    time: "08:57:34",
    date: "Today",
    user: "System",
    role: "System",
    action: "System startup",
    module: "System",
    description: "VitalFlow services initialized",
    severity: "INFO",
    status: "SUCCESS",
  },
];

function AuditLogs() {
  const [logs, setLogs] = useState(initialLogs);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("ALL");
  const [module, setModule] = useState("ALL");
  const [showDetails, setShowDetails] = useState(null);

  const filteredLogs = useMemo(() => {
    const query = search.toLowerCase().trim();

    return logs.filter((log) => {
      const matchesSearch =
        !query ||
        log.user.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.module.toLowerCase().includes(query) ||
        log.description.toLowerCase().includes(query);

      const matchesSeverity =
        severity === "ALL" || log.severity === severity;

      const matchesModule =
        module === "ALL" || log.module === module;

      return matchesSearch && matchesSeverity && matchesModule;
    });
  }, [logs, search, severity, module]);

  const stats = useMemo(() => {
    return {
      total: logs.length,
      today: logs.filter((log) => log.date === "Today").length,
      critical: logs.filter((log) => log.severity === "CRITICAL").length,
      system: logs.filter((log) => log.user === "System").length,
    };
  }, [logs]);

  const clearFilters = () => {
    setSearch("");
    setSeverity("ALL");
    setModule("ALL");
  };

  const addDemoEvent = () => {
    const newLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      date: "Today",
      user: "Current User",
      role: "Administrator",
      action: "Audit event",
      module: "System",
      description: "Manual audit event generated for demonstration",
      severity: "INFO",
      status: "RECORDED",
    };

    setLogs((previous) => [newLog, ...previous]);
  };

  return (
    <div className="audit-page">
      {/* HEADER */}
      <div className="audit-header">
        <div>
          <div className="audit-eyebrow">
            VITALFLOW GOVERNANCE
          </div>

          <h1>Audit Logs</h1>

          <p>
            Track system activity, operational actions and security events
          </p>
        </div>

        <div className="audit-header-right">
          <div className="audit-live">
            <span></span>
            AUDIT MONITOR
          </div>

          <button
            className="audit-demo-button"
            onClick={addDemoEvent}
          >
            + Demo Event
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="audit-stats">
        <div className="audit-stat">
          <div className="audit-stat-icon">📋</div>
          <span>Total Events</span>
          <strong>{stats.total}</strong>
          <small>Recorded activities</small>
        </div>

        <div className="audit-stat">
          <div className="audit-stat-icon">🕒</div>
          <span>Today's Events</span>
          <strong>{stats.today}</strong>
          <small>Current operational day</small>
        </div>

        <div className="audit-stat critical-stat">
          <div className="audit-stat-icon">🚨</div>
          <span>Critical Events</span>
          <strong>{stats.critical}</strong>
          <small>Require attention</small>
        </div>

        <div className="audit-stat">
          <div className="audit-stat-icon">⚙️</div>
          <span>System Actions</span>
          <strong>{stats.system}</strong>
          <small>Automated activities</small>
        </div>
      </div>

      {/* FILTERS */}
      <section className="audit-card">
        <div className="audit-filters">
          <div className="audit-search">
            <span>⌕</span>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search audit events..."
            />
          </div>

          <select
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
          >
            <option value="ALL">All Severity</option>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <select
            value={module}
            onChange={(event) => setModule(event.target.value)}
          >
            <option value="ALL">All Modules</option>
            <option value="Security">Security</option>
            <option value="Triage">Triage</option>
            <option value="Bed Management">
              Bed Management
            </option>
            <option value="Resources">Resources</option>
            <option value="Patients">Patients</option>
            <option value="Predictions">Predictions</option>
            <option value="Simulation">Simulation</option>
            <option value="Alerts">Alerts</option>
            <option value="System">System</option>
            <option value="Settings">Settings</option>
          </select>

          <button
            className="clear-filter-button"
            onClick={clearFilters}
          >
            Clear
          </button>
        </div>

        {/* TABLE */}
        <div className="audit-table-wrapper">
          <table className="audit-table">
            <thead>
              <tr>
                <th>TIME</th>
                <th>USER</th>
                <th>ACTION</th>
                <th>MODULE</th>
                <th>DESCRIPTION</th>
                <th>SEVERITY</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span className="audit-time">
                      {log.time}
                    </span>
                  </td>

                  <td>
                    <div className="audit-user">
                      <div className="audit-avatar">
                        {log.user.charAt(0)}
                      </div>

                      <div>
                        <strong>{log.user}</strong>
                        <small>{log.role}</small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <strong className="audit-action">
                      {log.action}
                    </strong>
                  </td>

                  <td>
                    <span className="module-badge">
                      {log.module}
                    </span>
                  </td>

                  <td>
                    <span className="audit-description">
                      {log.description}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`severity-badge ${log.severity.toLowerCase()}`}
                    >
                      {log.severity}
                    </span>
                  </td>

                  <td>
                    <span className="status-badge">
                      {log.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="details-button"
                      onClick={() => setShowDetails(log)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className="audit-empty">
              <div>🔎</div>
              <strong>No audit events found</strong>
              <span>
                Try changing your search or filters.
              </span>
            </div>
          )}
        </div>

        <div className="audit-result-count">
          Showing <strong>{filteredLogs.length}</strong> of{" "}
          <strong>{logs.length}</strong> events
        </div>
      </section>

      {/* SECURITY INFORMATION */}
      <div className="audit-security-grid">
        <div className="security-card">
          <div className="security-icon">🔐</div>

          <div>
            <strong>Activity Traceability</strong>
            <p>
              Operational actions can be associated with users,
              modules and timestamps.
            </p>
          </div>
        </div>

        <div className="security-card">
          <div className="security-icon">🛡️</div>

          <div>
            <strong>Governance Ready</strong>
            <p>
              The audit layer is designed to support future
              persistent and immutable event storage.
            </p>
          </div>
        </div>

        <div className="security-card">
          <div className="security-icon">📑</div>

          <div>
            <strong>Compliance Foundation</strong>
            <p>
              Structured event metadata can support future
              healthcare governance requirements.
            </p>
          </div>
        </div>
      </div>

      {/* NOTICE */}
      <div className="audit-notice">
        <strong>Prototype Audit Layer:</strong> These events are
        currently simulated in the frontend. A production deployment
        should persist audit events server-side with appropriate access
        controls, retention policies and tamper protection.
      </div>

      {/* DETAILS MODAL */}
      {showDetails && (
        <div
          className="audit-modal-overlay"
          onClick={() => setShowDetails(null)}
        >
          <div
            className="audit-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="audit-modal-header">
              <div>
                <span>Audit Event</span>
                <h2>{showDetails.action}</h2>
              </div>

              <button
                onClick={() => setShowDetails(null)}
              >
                ×
              </button>
            </div>

            <div className="audit-detail-grid">
              <div>
                <span>User</span>
                <strong>{showDetails.user}</strong>
              </div>

              <div>
                <span>Role</span>
                <strong>{showDetails.role}</strong>
              </div>

              <div>
                <span>Module</span>
                <strong>{showDetails.module}</strong>
              </div>

              <div>
                <span>Time</span>
                <strong>{showDetails.time}</strong>
              </div>

              <div>
                <span>Severity</span>
                <strong>{showDetails.severity}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{showDetails.status}</strong>
              </div>
            </div>

            <div className="audit-full-description">
              <span>Description</span>
              <p>{showDetails.description}</p>
            </div>

            <button
              className="modal-close-button"
              onClick={() => setShowDetails(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditLogs;