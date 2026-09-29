import { useEffect, useState } from "react";
import "./Settings.css";

const defaultSettings = {
  hospitalName: "VitalFlow Medical Center",
  hospitalCode: "VMC-001",
  timezone: "Asia/Kolkata",
  triageCritical: 8,
  triageHigh: 6,
  triageModerate: 4,
  autoRefresh: true,
  refreshInterval: 15,
  enableAlerts: true,
  enableNotifications: true,
  fhirEnabled: true,
  hl7Enabled: true,
  auditLogging: true,
  prototypeMode: true,
};

function Settings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState("hospital");

  useEffect(() => {
    const stored = localStorage.getItem("vitalflow_settings");

    if (stored) {
      try {
        setSettings({
          ...defaultSettings,
          ...JSON.parse(stored),
        });
      } catch {
        setSettings(defaultSettings);
      }
    }
  }, []);

  const updateSetting = (key, value) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSaved(false);
  };

  const saveSettings = () => {
    localStorage.setItem(
      "vitalflow_settings",
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem("vitalflow_settings");
    setSaved(false);
  };

  const user = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("vitalflow_user") || "{}"
      );
    } catch {
      return {};
    }
  })();

  return (
    <div className="settings-page">
      {/* HEADER */}
      <div className="settings-header">
        <div>
          <div className="settings-eyebrow">
            SYSTEM ADMINISTRATION
          </div>

          <h1>Settings</h1>

          <p>
            Configure VitalFlow hospital operations and
            integration preferences
          </p>
        </div>

        <div className="settings-actions">
          {saved && (
            <div className="settings-saved">
              ✓ Settings saved
            </div>
          )}

          <button
            className="reset-settings"
            onClick={resetSettings}
          >
            Reset
          </button>

          <button
            className="save-settings"
            onClick={saveSettings}
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* ACCOUNT BANNER */}
      <div className="settings-account">
        <div className="account-avatar">
          {(user.role || "A").charAt(0).toUpperCase()}
        </div>

        <div>
          <strong>
            {user.email || "admin@vitalflow.com"}
          </strong>

          <span>
            {user.role || "Administrator"} · Current session
          </span>
        </div>

        <div className="account-status">
          <span></span>
          ACTIVE SESSION
        </div>
      </div>

      {/* CONTENT */}
      <div className="settings-layout">
        {/* SIDEBAR */}
        <aside className="settings-nav">
          <button
            className={
              activeSection === "hospital" ? "active" : ""
            }
            onClick={() => setActiveSection("hospital")}
          >
            <span>🏥</span>
            Hospital
          </button>

          <button
            className={
              activeSection === "triage" ? "active" : ""
            }
            onClick={() => setActiveSection("triage")}
          >
            <span>🚨</span>
            Triage Rules
          </button>

          <button
            className={
              activeSection === "beds" ? "active" : ""
            }
            onClick={() => setActiveSection("beds")}
          >
            <span>🛏️</span>
            Bed Management
          </button>

          <button
            className={
              activeSection === "integration"
                ? "active"
                : ""
            }
            onClick={() => setActiveSection("integration")}
          >
            <span>🔌</span>
            Integrations
          </button>

          <button
            className={
              activeSection === "security" ? "active" : ""
            }
            onClick={() => setActiveSection("security")}
          >
            <span>🔐</span>
            Security
          </button>

          <button
            className={
              activeSection === "governance"
                ? "active"
                : ""
            }
            onClick={() => setActiveSection("governance")}
          >
            <span>📋</span>
            Governance
          </button>

          <button
            className={
              activeSection === "system" ? "active" : ""
            }
            onClick={() => setActiveSection("system")}
          >
            <span>⚙️</span>
            System
          </button>
        </aside>

        {/* SETTINGS CONTENT */}
        <main className="settings-content">
          {activeSection === "hospital" && (
            <HospitalSettings
              settings={settings}
              updateSetting={updateSetting}
            />
          )}

          {activeSection === "triage" && (
            <TriageSettings
              settings={settings}
              updateSetting={updateSetting}
            />
          )}

          {activeSection === "beds" && (
            <BedSettings
              settings={settings}
              updateSetting={updateSetting}
            />
          )}

          {activeSection === "integration" && (
            <IntegrationSettings
              settings={settings}
              updateSetting={updateSetting}
            />
          )}

          {activeSection === "security" && (
            <SecuritySettings
              settings={settings}
              updateSetting={updateSetting}
            />
          )}

          {activeSection === "governance" && (
            <GovernanceSettings
              settings={settings}
              updateSetting={updateSetting}
            />
          )}

          {activeSection === "system" && (
            <SystemSettings
              settings={settings}
              updateSetting={updateSetting}
            />
          )}
        </main>
      </div>

      {/* FOOTER */}
      <div className="settings-footer">
        <strong>VitalFlow Ward Manager</strong>
        <span>System configuration is stored locally for this prototype.</span>
      </div>
    </div>
  );
}

/* ---------------- HOSPITAL ---------------- */

function HospitalSettings({ settings, updateSetting }) {
  return (
    <SettingsSection
      title="Hospital Configuration"
      description="Basic information used throughout the VitalFlow interface."
    >
      <div className="form-grid">
        <FormField label="Hospital Name">
          <input
            value={settings.hospitalName}
            onChange={(e) =>
              updateSetting("hospitalName", e.target.value)
            }
          />
        </FormField>

        <FormField label="Hospital Code">
          <input
            value={settings.hospitalCode}
            onChange={(e) =>
              updateSetting("hospitalCode", e.target.value)
            }
          />
        </FormField>

        <FormField label="Timezone">
          <select
            value={settings.timezone}
            onChange={(e) =>
              updateSetting("timezone", e.target.value)
            }
          >
            <option value="Asia/Kolkata">
              Asia/Kolkata
            </option>
            <option value="UTC">UTC</option>
            <option value="Asia/Singapore">
              Asia/Singapore
            </option>
            <option value="Europe/London">
              Europe/London
            </option>
          </select>
        </FormField>
      </div>

      <InfoBox>
        Hospital identity settings are currently used by the
        frontend prototype. Production deployments would
        normally load organization configuration from a
        secured backend.
      </InfoBox>
    </SettingsSection>
  );
}

/* ---------------- TRIAGE ---------------- */

function TriageSettings({ settings, updateSetting }) {
  return (
    <SettingsSection
      title="Triage Priority Rules"
      description="Configure the prototype priority thresholds used by VitalFlow."
    >
      <div className="threshold-grid">
        <Threshold
          label="Critical"
          value={settings.triageCritical}
          onChange={(value) =>
            updateSetting("triageCritical", value)
          }
        />

        <Threshold
          label="High"
          value={settings.triageHigh}
          onChange={(value) =>
            updateSetting("triageHigh", value)
          }
        />

        <Threshold
          label="Moderate"
          value={settings.triageModerate}
          onChange={(value) =>
            updateSetting("triageModerate", value)
          }
        />
      </div>

      <div className="priority-preview">
        <div className="priority-row critical">
          <span>CRITICAL</span>
          <strong>
            ≥ {settings.triageCritical}
          </strong>
        </div>

        <div className="priority-row high">
          <span>HIGH</span>
          <strong>
            ≥ {settings.triageHigh}
          </strong>
        </div>

        <div className="priority-row moderate">
          <span>MODERATE</span>
          <strong>
            ≥ {settings.triageModerate}
          </strong>
        </div>

        <div className="priority-row low">
          <span>LOW</span>
          <strong>
            &lt; {settings.triageModerate}
          </strong>
        </div>
      </div>

      <InfoBox warning>
        These thresholds belong to the educational prototype
        triage logic and are not clinically validated decision
        rules.
      </InfoBox>
    </SettingsSection>
  );
}

/* ---------------- BEDS ---------------- */

function BedSettings({ settings, updateSetting }) {
  return (
    <SettingsSection
      title="Bed Management"
      description="Configure operational behavior for the ward management interface."
    >
      <Toggle
        label="Automatic Refresh"
        description="Periodically refresh bed and patient data."
        enabled={settings.autoRefresh}
        onChange={(value) =>
          updateSetting("autoRefresh", value)
        }
      />

      <div className="form-grid compact">
        <FormField label="Refresh Interval (seconds)">
          <input
            type="number"
            min="5"
            max="120"
            value={settings.refreshInterval}
            onChange={(e) =>
              updateSetting(
                "refreshInterval",
                Number(e.target.value)
              )
            }
          />
        </FormField>
      </div>

      <Toggle
        label="Operational Alerts"
        description="Enable alerts related to beds, patients and resources."
        enabled={settings.enableAlerts}
        onChange={(value) =>
          updateSetting("enableAlerts", value)
        }
      />

      <Toggle
        label="Notifications"
        description="Display notification indicators inside the dashboard."
        enabled={settings.enableNotifications}
        onChange={(value) =>
          updateSetting(
            "enableNotifications",
            value
          )
        }
      />
    </SettingsSection>
  );
}

/* ---------------- INTEGRATION ---------------- */

function IntegrationSettings({ settings, updateSetting }) {
  return (
    <SettingsSection
      title="FHIR / HL7 Integrations"
      description="Manage interoperability features used by the prototype."
    >
      <Toggle
        label="FHIR Interface"
        description="Enable the FHIR interoperability interface."
        enabled={settings.fhirEnabled}
        onChange={(value) =>
          updateSetting("fhirEnabled", value)
        }
      />

      <Toggle
        label="HL7 Gateway"
        description="Enable the simulated HL7 messaging gateway."
        enabled={settings.hl7Enabled}
        onChange={(value) =>
          updateSetting("hl7Enabled", value)
        }
      />

      <div className="integration-endpoints">
        <div>
          <span>FHIR Endpoint</span>
          <strong>/fhir</strong>
        </div>

        <div>
          <span>FHIR Version</span>
          <strong>R4</strong>
        </div>

        <div>
          <span>HL7 Transport</span>
          <strong>MLLP</strong>
        </div>

        <div>
          <span>Message Types</span>
          <strong>ADT / ORU</strong>
        </div>
      </div>

      <InfoBox>
        Current integration endpoints are simulated. No
        external hospital EHR or production HL7 gateway is
        connected.
      </InfoBox>
    </SettingsSection>
  );
}

/* ---------------- SECURITY ---------------- */

function SecuritySettings({ settings, updateSetting }) {
  return (
    <SettingsSection
      title="Security"
      description="Prototype security controls and session configuration."
    >
      <div className="security-status">
        <div>
          <span>Authentication</span>
          <strong>Demo Authentication</strong>
        </div>

        <div>
          <span>Session</span>
          <strong>Local Browser Session</strong>
        </div>

        <div>
          <span>Transport</span>
          <strong>Local Development</strong>
        </div>
      </div>

      <Toggle
        label="Audit Logging"
        description="Record prototype activity in the Audit Logs module."
        enabled={settings.auditLogging}
        onChange={(value) =>
          updateSetting("auditLogging", value)
        }
      />

      <InfoBox warning>
        Production healthcare deployments require appropriate
        authentication, authorization, encryption, secrets
        management, access controls and security monitoring.
      </InfoBox>
    </SettingsSection>
  );
}

/* ---------------- GOVERNANCE ---------------- */

function GovernanceSettings({ settings, updateSetting }) {
  return (
    <SettingsSection
      title="Governance & Safety"
      description="Controls that make the prototype's operating boundaries explicit."
    >
      <div className="governance-box">
        <div className="governance-icon">!</div>

        <div>
          <strong>Prototype Safety Boundary</strong>

          <p>
            VitalFlow currently uses simulated triage,
            forecasting and operational data. It must not be
            used to make real patient-care decisions.
          </p>
        </div>
      </div>

      <div className="governance-list">
        <div>
          <span>Clinical validation</span>
          <strong>Required before deployment</strong>
        </div>

        <div>
          <span>Real hospital data</span>
          <strong>Not connected</strong>
        </div>

        <div>
          <span>External EHR</span>
          <strong>Not connected</strong>
        </div>

        <div>
          <span>Regulatory review</span>
          <strong>Required for production use</strong>
        </div>
      </div>
    </SettingsSection>
  );
}

/* ---------------- SYSTEM ---------------- */

function SystemSettings({ settings, updateSetting }) {
  return (
    <SettingsSection
      title="System"
      description="Application runtime and prototype configuration."
    >
      <Toggle
        label="Prototype Mode"
        description="Clearly identify simulated and educational functionality."
        enabled={settings.prototypeMode}
        onChange={(value) =>
          updateSetting("prototypeMode", value)
        }
      />

      <div className="system-information">
        <div>
          <span>Application</span>
          <strong>VitalFlow Ward Manager</strong>
        </div>

        <div>
          <span>Environment</span>
          <strong>Development / Prototype</strong>
        </div>

        <div>
          <span>Frontend</span>
          <strong>React + Vite</strong>
        </div>

        <div>
          <span>Backend</span>
          <strong>FastAPI</strong>
        </div>

        <div>
          <span>Database</span>
          <strong>PostgreSQL</strong>
        </div>

        <div>
          <span>Priority Engine</span>
          <strong>Max-Heap</strong>
        </div>
      </div>
    </SettingsSection>
  );
}

/* ---------------- SHARED COMPONENTS ---------------- */

function SettingsSection({
  title,
  description,
  children,
}) {
  return (
    <section className="settings-section">
      <div className="settings-section-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="settings-section-body">
        {children}
      </div>
    </section>
  );
}

function FormField({ label, children }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Threshold({
  label,
  value,
  onChange,
}) {
  return (
    <div className="threshold-card">
      <span>{label}</span>

      <input
        type="number"
        min="0"
        max="10"
        step="0.5"
        value={value}
        onChange={(e) =>
          onChange(Number(e.target.value))
        }
      />

      <small>Priority score</small>
    </div>
  );
}

function Toggle({
  label,
  description,
  enabled,
  onChange,
}) {
  return (
    <div className="toggle-row">
      <div>
        <strong>{label}</strong>
        <span>{description}</span>
      </div>

      <button
        className={`toggle ${enabled ? "enabled" : ""}`}
        onClick={() => onChange(!enabled)}
        aria-label={label}
      >
        <span></span>
      </button>
    </div>
  );
}

function InfoBox({ children, warning = false }) {
  return (
    <div className={`info-box ${warning ? "warning" : ""}`}>
      {children}
    </div>
  );
}

export default Settings;