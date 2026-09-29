import { NavLink, Outlet } from "react-router-dom";
import "./MainLayout.css";

const navigation = [
  { path: "/", label: "Dashboard" },
  { path: "/triage", label: "Emergency Triage" },
  { path: "/beds", label: "Bed Management" },
  { path: "/floor-map", label: "Hospital Floor Map" },
  { path: "/allocation", label: "Smart Bed Allocation" },
  { path: "/patients", label: "Patients" },
  { path: "/resources", label: "Resources" },
  {
  label: "Alerts",
  path: "/alerts",
},
  { path: "/predictions", label: "Predictions" },
  { path: "/analytics", label: "Analytics" },
  { path: "/simulation", label: "Simulation" },
  { path: "/alerts", label: "Alerts" },
  { path: "/audit-logs", label: "Audit Logs" },
  { path: "/integration", label: "FHIR / HL7" },
  { path: "/settings", label: "Settings" },
];

function MainLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">V</div>

          <div>
            <h1>VitalFlow</h1>
            <span>Ward Manager</span>
          </div>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-title">HOSPITAL OPERATIONS</p>

          <nav>
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}

 
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="system-status">
            <span className="online-dot"></span>
            <span>System Online</span>
          </div>

          <div className="user-mini">
            <div className="avatar">DR</div>

            <div>
              <strong>Demo User</strong>
              <span>Doctor</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="breadcrumb">
              Hospital Operations
            </span>
          </div>

          <div className="topbar-actions">
            <span className="demo-badge">
              DEMO MODE
            </span>

            <button className="notification-button">
              🔔
            </button>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;