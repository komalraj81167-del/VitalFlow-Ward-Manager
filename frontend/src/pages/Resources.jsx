import { useMemo, useState } from "react";
import "./Resources.css";

const initialResources = [
  {
    id: "RES-001",
    name: "Ventilators",
    category: "Critical Equipment",
    total: 12,
    available: 4,
    unit: "units",
    icon: "🫁",
  },
  {
    id: "RES-002",
    name: "Oxygen Supply",
    category: "Medical Supply",
    total: 100,
    available: 28,
    unit: "cylinders",
    icon: "🫧",
  },
  {
    id: "RES-003",
    name: "ICU Beds",
    category: "Bed Capacity",
    total: 20,
    available: 5,
    unit: "beds",
    icon: "🛏️",
  },
  {
    id: "RES-004",
    name: "General Beds",
    category: "Bed Capacity",
    total: 80,
    available: 24,
    unit: "beds",
    icon: "🛏️",
  },
  {
    id: "RES-005",
    name: "Infusion Pumps",
    category: "Critical Equipment",
    total: 30,
    available: 9,
    unit: "units",
    icon: "💉",
  },
  {
    id: "RES-006",
    name: "Patient Monitors",
    category: "Monitoring",
    total: 40,
    available: 15,
    unit: "units",
    icon: "🖥️",
  },
  {
    id: "RES-007",
    name: "Emergency Kits",
    category: "Emergency",
    total: 25,
    available: 7,
    unit: "kits",
    icon: "🚑",
  },
  {
    id: "RES-008",
    name: "Isolation Rooms",
    category: "Special Care",
    total: 15,
    available: 3,
    unit: "rooms",
    icon: "🔒",
  },
];

const initialNurses = [
  {
    id: "N-001",
    name: "Nurse Aisha",
    ward: "ICU",
    patients: 7,
    shift: "Day",
  },
  {
    id: "N-002",
    name: "Nurse Priya",
    ward: "ICU",
    patients: 5,
    shift: "Day",
  },
  {
    id: "N-003",
    name: "Nurse Rahul",
    ward: "Emergency",
    patients: 9,
    shift: "Day",
  },
  {
    id: "N-004",
    name: "Nurse Sneha",
    ward: "General",
    patients: 6,
    shift: "Day",
  },
  {
    id: "N-005",
    name: "Nurse Arjun",
    ward: "Emergency",
    patients: 11,
    shift: "Night",
  },
  {
    id: "N-006",
    name: "Nurse Meera",
    ward: "General",
    patients: 4,
    shift: "Night",
  },
  {
    id: "N-007",
    name: "Nurse Kavya",
    ward: "Isolation",
    patients: 6,
    shift: "Day",
  },
  {
    id: "N-008",
    name: "Nurse Rohan",
    ward: "ICU",
    patients: 8,
    shift: "Night",
  },
  {
    id: "N-009",
    name: "Nurse Anjali",
    ward: "General",
    patients: 5,
    shift: "Day",
  },
  {
    id: "N-010",
    name: "Nurse Vikram",
    ward: "Emergency",
    patients: 10,
    shift: "Night",
  },
  {
    id: "N-011",
    name: "Nurse Neha",
    ward: "ICU",
    patients: 4,
    shift: "Night",
  },
  {
    id: "N-012",
    name: "Nurse Sameer",
    ward: "General",
    patients: 7,
    shift: "Day",
  },
];

function Resources() {
  const [resources] = useState(initialResources);
  const [nurses] = useState(initialNurses);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    return [...new Set(resources.map((resource) => resource.category))];
  }, [resources]);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        resource.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        resource.category
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "ALL" ||
        resource.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [resources, search, categoryFilter]);

  const getUtilization = (resource) => {
    return Math.round(
      ((resource.total - resource.available) / resource.total) * 100
    );
  };

  const getUtilizationClass = (percentage) => {
    if (percentage >= 85) {
      return "resource-critical";
    }

    if (percentage >= 70) {
      return "resource-warning";
    }

    return "resource-normal";
  };

  const getStockStatus = (resource) => {
    const percentage = (resource.available / resource.total) * 100;

    if (percentage <= 20) {
      return {
        label: "Critical",
        className: "stock-critical",
      };
    }

    if (percentage <= 40) {
      return {
        label: "Low",
        className: "stock-low",
      };
    }

    return {
      label: "Available",
      className: "stock-good",
    };
  };

  const totalResources = resources.reduce(
    (sum, resource) => sum + resource.total,
    0
  );

  const availableResources = resources.reduce(
    (sum, resource) => sum + resource.available,
    0
  );

  const criticalResources = resources.filter(
    (resource) => getStockStatus(resource).label === "Critical"
  ).length;

  const averageUtilization = Math.round(
    resources.reduce(
      (sum, resource) => sum + getUtilization(resource),
      0
    ) / resources.length
  );

  const workloadClass = (patients) => {
    if (patients >= 10) {
      return "workload-high";
    }

    if (patients >= 7) {
      return "workload-medium";
    }

    return "workload-normal";
  };

  return (
    <div className="resources-page">
      <div className="resources-header">
        <div>
          <span className="page-kicker">RESOURCE COMMAND CENTER</span>
          <h1>Resources</h1>
          <p>
            Monitor medical equipment, supplies and staff workload
            across the hospital.
          </p>
        </div>

        <div className="resource-live">
          <span className="live-dot"></span>
          RESOURCE MONITORING ACTIVE
        </div>
      </div>

      {/* Summary Cards */}

      <div className="resource-summary">
        <div className="resource-summary-card">
          <div className="summary-icon">📦</div>
          <div>
            <span>Total Resources</span>
            <strong>{totalResources}</strong>
          </div>
        </div>

        <div className="resource-summary-card">
          <div className="summary-icon">✅</div>
          <div>
            <span>Available</span>
            <strong>{availableResources}</strong>
          </div>
        </div>

        <div className="resource-summary-card warning-card">
          <div className="summary-icon">⚠️</div>
          <div>
            <span>Critical Stock</span>
            <strong>{criticalResources}</strong>
          </div>
        </div>

        <div className="resource-summary-card">
          <div className="summary-icon">📊</div>
          <div>
            <span>Avg. Utilization</span>
            <strong>{averageUtilization}%</strong>
          </div>
        </div>
      </div>

      {/* Filters */}

      <div className="resource-toolbar">
        <div>
          <h2>Medical Resources</h2>
          <p>
            Current availability and utilization levels
          </p>
        </div>

        <div className="resource-filters">
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
          >
            <option value="ALL">All Categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resource Cards */}

      <div className="resource-grid">
        {filteredResources.map((resource) => {
          const utilization = getUtilization(resource);
          const stock = getStockStatus(resource);

          return (
            <div
              className="resource-card"
              key={resource.id}
            >
              <div className="resource-card-top">
                <div className="resource-icon">
                  {resource.icon}
                </div>

                <span className={`stock-badge ${stock.className}`}>
                  {stock.label}
                </span>
              </div>

              <div className="resource-name">
                <h3>{resource.name}</h3>
                <span>{resource.category}</span>
              </div>

              <div className="resource-numbers">
                <div>
                  <span>Available</span>
                  <strong>{resource.available}</strong>
                </div>

                <div>
                  <span>Total</span>
                  <strong>{resource.total}</strong>
                </div>

                <div>
                  <span>Unit</span>
                  <strong>{resource.unit}</strong>
                </div>
              </div>

              <div className="utilization-section">
                <div className="utilization-header">
                  <span>Utilization</span>
                  <strong>{utilization}%</strong>
                </div>

                <div className="utilization-track">
                  <div
                    className={`utilization-fill ${getUtilizationClass(
                      utilization
                    )}`}
                    style={{
                      width: `${utilization}%`,
                    }}
                  ></div>
                </div>
              </div>

              {stock.label !== "Available" && (
                <div className="low-stock-alert">
                  ⚠ Only {resource.available} {resource.unit}{" "}
                  remaining
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Staff Workload */}

      <div className="staff-section">
        <div className="section-heading">
          <div>
            <span className="page-kicker">STAFF OPERATIONS</span>
            <h2>Staff Workload Monitor</h2>
            <p>
              Current nurse-to-patient workload distribution.
            </p>
          </div>

          <div className="staff-count">
            {nurses.length} nurses monitored
          </div>
        </div>

        <div className="staff-table-wrapper">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Nurse</th>
                <th>Ward</th>
                <th>Shift</th>
                <th>Patients</th>
                <th>Workload</th>
              </tr>
            </thead>

            <tbody>
              {nurses.map((nurse) => {
                const workload = Math.min(
                  100,
                  Math.round((nurse.patients / 12) * 100)
                );

                return (
                  <tr key={nurse.id}>
                    <td>
                      <div className="staff-name">
                        <div className="staff-avatar">
                          {nurse.name
                            .replace("Nurse ", "")
                            .charAt(0)}
                        </div>

                        <div>
                          <strong>{nurse.name}</strong>
                          <span>{nurse.id}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="ward-tag">
                        {nurse.ward}
                      </span>
                    </td>

                    <td>{nurse.shift}</td>

                    <td>
                      <strong>{nurse.patients}</strong>
                    </td>

                    <td>
                      <div className="staff-workload">
                        <div className="staff-workload-bar">
                          <div
                            className={`staff-workload-fill ${workloadClass(
                              nurse.patients
                            )}`}
                            style={{
                              width: `${workload}%`,
                            }}
                          ></div>
                        </div>

                        <span
                          className={workloadClass(
                            nurse.patients
                          )}
                        >
                          {nurse.patients >= 10
                            ? "High"
                            : nurse.patients >= 7
                              ? "Moderate"
                              : "Normal"}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alerts */}

      <div className="alerts-section">
        <div className="section-heading">
          <div>
            <span className="page-kicker">RESOURCE ALERTS</span>
            <h2>Low Stock Alerts</h2>
          </div>
        </div>

        <div className="resource-alert-list">
          {resources
            .filter(
              (resource) =>
                getStockStatus(resource).label !== "Available"
            )
            .map((resource) => {
              const stock = getStockStatus(resource);

              return (
                <div
                  className="resource-alert"
                  key={resource.id}
                >
                  <div className="alert-symbol">⚠</div>

                  <div>
                    <strong>{resource.name}</strong>
                    <p>
                      {resource.available} of{" "}
                      {resource.total} {resource.unit} available.
                    </p>
                  </div>

                  <span className={`stock-badge ${stock.className}`}>
                    {stock.label}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      <div className="simulation-note">
        <strong>Demo / Simulation Mode</strong>
        <span>
          Resource values shown on this page are simulated
          demonstration data and are not connected to live
          hospital equipment.
        </span>
      </div>
    </div>
  );
}

export default Resources;