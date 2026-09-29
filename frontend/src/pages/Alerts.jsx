import { useMemo, useState } from "react";
import "./Alerts.css";

const initialAlerts = [
  {
    id: 1,
    type: "CRITICAL",
    title: "ICU Capacity Alert",
    message:
      "ICU occupancy has reached a critical level. Immediate resource review is recommended.",
    time: "2 min ago",
    source: "Bed Management",
    read: false,
    resolved: false,
  },
  {
    id: 2,
    type: "CRITICAL",
    title: "High Priority Patient Waiting",
    message:
      "A critical-priority patient is currently waiting for a compatible ICU bed.",
    time: "5 min ago",
    source: "Emergency Triage",
    read: false,
    resolved: false,
  },
  {
    id: 3,
    type: "WARNING",
    title: "Oxygen Supply Warning",
    message:
      "Oxygen availability is below the configured monitoring threshold.",
    time: "12 min ago",
    source: "Resource Management",
    read: false,
    resolved: false,
  },
  {
    id: 4,
    type: "WARNING",
    title: "Nurse Workload Elevated",
    message:
      "Current nurse workload is above the recommended operational threshold.",
    time: "18 min ago",
    source: "Staff Management",
    read: true,
    resolved: false,
  },
  {
    id: 5,
    type: "INFO",
    title: "Patient Successfully Allocated",
    message:
      "Patient PAT-003 has been assigned to an available compatible bed.",
    time: "25 min ago",
    source: "Smart Allocation",
    read: true,
    resolved: false,
  },
  {
    id: 6,
    type: "INFO",
    title: "Daily System Check Completed",
    message:
      "VitalFlow completed the scheduled hospital resource availability check.",
    time: "42 min ago",
    source: "System",
    read: true,
    resolved: false,
  },
  {
    id: 7,
    type: "RESOLVED",
    title: "Bed Availability Restored",
    message:
      "A previously occupied ICU bed has been released and is now available.",
    time: "1 hour ago",
    source: "Bed Management",
    read: true,
    resolved: true,
  },
];

function Alerts() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesFilter =
        filter === "ALL" ||
        (filter === "UNREAD" && !alert.read) ||
        (filter === "RESOLVED" && alert.resolved) ||
        alert.type === filter;

      const searchText =
        `${alert.title} ${alert.message} ${alert.source}`.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [alerts, filter, search]);

  const statistics = useMemo(() => {
    return {
      total: alerts.length,
      critical: alerts.filter(
        (alert) => alert.type === "CRITICAL" && !alert.resolved
      ).length,
      warning: alerts.filter(
        (alert) => alert.type === "WARNING" && !alert.resolved
      ).length,
      unread: alerts.filter((alert) => !alert.read).length,
      resolved: alerts.filter((alert) => alert.resolved).length,
    };
  }, [alerts]);

  const markAsRead = (id) => {
    setAlerts((current) =>
      current.map((alert) =>
        alert.id === id
          ? {
              ...alert,
              read: true,
            }
          : alert
      )
    );
  };

  const resolveAlert = (id) => {
    setAlerts((current) =>
      current.map((alert) =>
        alert.id === id
          ? {
              ...alert,
              resolved: true,
              read: true,
              type: "RESOLVED",
            }
          : alert
      )
    );
  };

  const dismissAlert = (id) => {
    setAlerts((current) =>
      current.filter((alert) => alert.id !== id)
    );
  };

  const markAllAsRead = () => {
    setAlerts((current) =>
      current.map((alert) => ({
        ...alert,
        read: true,
      }))
    );
  };

  const getIcon = (type) => {
    if (type === "CRITICAL") return "!";
    if (type === "WARNING") return "⚠";
    if (type === "RESOLVED") return "✓";
    return "i";
  };

  return (
    <div className="alerts-page">
      <div className="alerts-header">
        <div>
          <p className="page-eyebrow">HOSPITAL MONITORING</p>
          <h1>Alerts & Notifications</h1>
          <p className="alerts-subtitle">
            Monitor critical events, resource warnings, and operational
            notifications across the hospital.
          </p>
        </div>

        <div className="simulation-badge">
          <span className="simulation-dot"></span>
          SIMULATION MODE
        </div>
      </div>

      <div className="alert-stat-grid">
        <div className="alert-stat-card">
          <div className="stat-label">Total Alerts</div>
          <div className="stat-value">{statistics.total}</div>
          <div className="stat-description">System notifications</div>
        </div>

        <div className="alert-stat-card critical-stat">
          <div className="stat-label">Critical</div>
          <div className="stat-value">{statistics.critical}</div>
          <div className="stat-description">Require attention</div>
        </div>

        <div className="alert-stat-card warning-stat">
          <div className="stat-label">Warnings</div>
          <div className="stat-value">{statistics.warning}</div>
          <div className="stat-description">Operational concerns</div>
        </div>

        <div className="alert-stat-card unread-stat">
          <div className="stat-label">Unread</div>
          <div className="stat-value">{statistics.unread}</div>
          <div className="stat-description">Awaiting review</div>
        </div>

        <div className="alert-stat-card resolved-stat">
          <div className="stat-label">Resolved</div>
          <div className="stat-value">{statistics.resolved}</div>
          <div className="stat-description">Completed events</div>
        </div>
      </div>

      <div className="alerts-toolbar">
        <div className="alert-search">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search alerts..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="alert-actions">
          <button
            className="secondary-action"
            onClick={markAllAsRead}
          >
            Mark All Read
          </button>
        </div>
      </div>

      <div className="alert-filter-bar">
        {[
          ["ALL", "All"],
          ["CRITICAL", "Critical"],
          ["WARNING", "Warnings"],
          ["INFO", "Information"],
          ["UNREAD", "Unread"],
          ["RESOLVED", "Resolved"],
        ].map(([value, label]) => (
          <button
            key={value}
            className={`filter-button ${
              filter === value ? "active" : ""
            }`}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="alerts-list">
        {filteredAlerts.length === 0 ? (
          <div className="empty-alerts">
            <div className="empty-icon">✓</div>
            <h3>No alerts found</h3>
            <p>
              There are no alerts matching your current search or filter.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`alert-card ${
                !alert.read ? "unread-alert" : ""
              } ${alert.resolved ? "resolved-alert" : ""}`}
            >
              <div className={`alert-icon ${alert.type.toLowerCase()}`}>
                {getIcon(alert.type)}
              </div>

              <div className="alert-content">
                <div className="alert-top-row">
                  <div>
                    <div className="alert-title-row">
                      <h3>{alert.title}</h3>

                      {!alert.read && (
                        <span className="new-badge">NEW</span>
                      )}
                    </div>

                    <p className="alert-message">
                      {alert.message}
                    </p>
                  </div>

                  <span
                    className={`alert-type ${alert.type.toLowerCase()}`}
                  >
                    {alert.type}
                  </span>
                </div>

                <div className="alert-meta">
                  <span>{alert.source}</span>
                  <span>•</span>
                  <span>{alert.time}</span>
                </div>

                <div className="alert-card-actions">
                  {!alert.read && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                    >
                      Mark as Read
                    </button>
                  )}

                  {!alert.resolved && (
                    <button
                      className="resolve-button"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolve
                    </button>
                  )}

                  <button
                    className="dismiss-button"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="alerts-footer-note">
        <strong>Prototype notice:</strong> Alert events are currently
        simulated for development and demonstration. Production deployment
        would connect these alerts to validated hospital data sources,
        monitoring services, and clinical workflows.
      </div>
    </div>
  );
}

export default Alerts;