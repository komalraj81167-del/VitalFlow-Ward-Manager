import { useEffect, useMemo, useState } from "react";
import "./Integration.css";

const API = "http://127.0.0.1:8000";

const initialMessages = [
  {
    id: 1,
    time: "12:42:18",
    protocol: "FHIR",
    type: "Patient",
    direction: "INBOUND",
    resource: "Patient/PAT-001",
    status: "SUCCESS",
  },
  {
    id: 2,
    time: "12:40:52",
    protocol: "HL7",
    type: "ADT^A01",
    direction: "INBOUND",
    resource: "Patient Admission",
    status: "SUCCESS",
  },
  {
    id: 3,
    time: "12:38:21",
    protocol: "FHIR",
    type: "Observation",
    direction: "OUTBOUND",
    resource: "Observation/PAT-003",
    status: "SUCCESS",
  },
  {
    id: 4,
    time: "12:35:44",
    protocol: "HL7",
    type: "ORU^R01",
    direction: "OUTBOUND",
    resource: "Clinical Result",
    status: "PENDING",
  },
  {
    id: 5,
    time: "12:31:09",
    protocol: "FHIR",
    type: "Encounter",
    direction: "OUTBOUND",
    resource: "Encounter/PAT-DB-001",
    status: "SUCCESS",
  },
];

const fhirExamples = {
  Patient: {
    resourceType: "Patient",
    id: "PAT-001",
    status: "active",
    name: [
      {
        text: "Demo Patient",
      },
    ],
    gender: "unknown",
  },
  Observation: {
    resourceType: "Observation",
    id: "OBS-001",
    status: "final",
    code: {
      text: "Vital Signs",
    },
    subject: {
      reference: "Patient/PAT-001",
    },
    valueString: "SpO2: 94%",
  },
  Encounter: {
    resourceType: "Encounter",
    id: "ENC-001",
    status: "in-progress",
    subject: {
      reference: "Patient/PAT-001",
    },
    class: {
      code: "EMER",
      display: "Emergency",
    },
  },
  Location: {
    resourceType: "Location",
    id: "ICU-01",
    status: "active",
    name: "ICU Bed 01",
    physicalType: {
      text: "Bed",
    },
  },
};

function Integration() {
  const [patients, setPatients] = useState([]);
  const [beds, setBeds] = useState([]);
  const [messages, setMessages] = useState(initialMessages);
  const [resourceType, setResourceType] = useState("Patient");
  const [activeTab, setActiveTab] = useState("FHIR");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = async () => {
    try {
      const [patientsResponse, bedsResponse] = await Promise.all([
        fetch(`${API}/patients`),
        fetch(`${API}/beds`),
      ]);

      const patientsData = await patientsResponse.json();
      const bedsData = await bedsResponse.json();

      setPatients(
        Array.isArray(patientsData)
          ? patientsData
          : patientsData.patients || []
      );

      setBeds(
        Array.isArray(bedsData)
          ? bedsData
          : bedsData.beds || []
      );

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Integration data loading failed:", error);
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 15000);

    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const success = messages.filter(
      (message) => message.status === "SUCCESS"
    ).length;

    const pending = messages.filter(
      (message) => message.status === "PENDING"
    ).length;

    const errors = messages.filter(
      (message) => message.status === "ERROR"
    ).length;

    return {
      total: messages.length,
      success,
      pending,
      errors,
    };
  }, [messages]);

  const fhirResource = fhirExamples[resourceType];

  const generateMessage = () => {
    const newMessage = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      protocol: activeTab,
      type: activeTab === "FHIR" ? resourceType : "ADT^A01",
      direction: "OUTBOUND",
      resource:
        activeTab === "FHIR"
          ? `${resourceType}/DEMO-001`
          : "Demo HL7 Message",
      status: "SUCCESS",
    };

    setMessages((previous) => [
      newMessage,
      ...previous,
    ]);
  };

  return (
    <div className="integration-page">
      {/* HEADER */}
      <div className="integration-header">
        <div>
          <div className="integration-eyebrow">
            VITALFLOW INTEROPERABILITY
          </div>

          <h1>FHIR / HL7 Integration</h1>

          <p>
            Healthcare data exchange and interoperability center
          </p>
        </div>

        <div className="integration-status">
          <span></span>
          INTEGRATION MONITOR
        </div>
      </div>

      {/* CONNECTION CARDS */}
      <div className="integration-connections">
        <div className="connection-card">
          <div className="connection-top">
            <div className="protocol-icon fhir">
              F
            </div>

            <div>
              <h2>FHIR API</h2>
              <span>Fast Healthcare Interoperability Resources</span>
            </div>

            <div className="connected-badge">
              <span></span>
              PROTOTYPE
            </div>
          </div>

          <div className="connection-details">
            <div>
              <span>Endpoint</span>
              <strong>/fhir</strong>
            </div>

            <div>
              <span>Version</span>
              <strong>R4</strong>
            </div>

            <div>
              <span>Resources</span>
              <strong>4</strong>
            </div>
          </div>
        </div>

        <div className="connection-card">
          <div className="connection-top">
            <div className="protocol-icon hl7">
              H7
            </div>

            <div>
              <h2>HL7 Gateway</h2>
              <span>Health Level Seven messaging interface</span>
            </div>

            <div className="connected-badge simulated">
              <span></span>
              SIMULATED
            </div>
          </div>

          <div className="connection-details">
            <div>
              <span>Transport</span>
              <strong>MLLP</strong>
            </div>

            <div>
              <span>Message Types</span>
              <strong>ADT / ORU</strong>
            </div>

            <div>
              <span>Queue</span>
              <strong>{stats.pending}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="integration-stats">
        <div>
          <span>Total Messages</span>
          <strong>{stats.total}</strong>
          <small>Integration events</small>
        </div>

        <div>
          <span>Successful</span>
          <strong className="success-number">
            {stats.success}
          </strong>
          <small>Processed successfully</small>
        </div>

        <div>
          <span>Pending</span>
          <strong className="pending-number">
            {stats.pending}
          </strong>
          <small>Awaiting processing</small>
        </div>

        <div>
          <span>Errors</span>
          <strong className="error-number">
            {stats.errors}
          </strong>
          <small>Requires attention</small>
        </div>
      </div>

      {/* MAIN */}
      <div className="integration-grid">
        {/* RESOURCE EXPLORER */}
        <section className="integration-card resource-card">
          <div className="integration-card-header">
            <div>
              <h2>FHIR Resource Explorer</h2>
              <p>
                Preview standardized healthcare resources
              </p>
            </div>

            <select
              value={resourceType}
              onChange={(event) =>
                setResourceType(event.target.value)
              }
            >
              <option value="Patient">Patient</option>
              <option value="Observation">
                Observation
              </option>
              <option value="Encounter">Encounter</option>
              <option value="Location">Location</option>
            </select>
          </div>

          <div className="resource-preview">
            <div className="resource-preview-header">
              <span>FHIR R4 JSON</span>

              <button onClick={generateMessage}>
                Send Resource
              </button>
            </div>

            <pre>
              {JSON.stringify(fhirResource, null, 2)}
            </pre>
          </div>

          <div className="resource-actions">
            <div>
              <span>Patients available</span>
              <strong>{patients.length}</strong>
            </div>

            <div>
              <span>Hospital beds</span>
              <strong>{beds.length}</strong>
            </div>
          </div>
        </section>

        {/* HL7 PANEL */}
        <section className="integration-card">
          <div className="integration-card-header">
            <div>
              <h2>HL7 Message Gateway</h2>
              <p>
                Simulated hospital messaging interface
              </p>
            </div>
          </div>

          <div className="hl7-message">
            <div className="hl7-line">
              <span>MSH</span>
              <strong>
                ADT^A01 | Patient Admission
              </strong>
            </div>

            <div className="hl7-line">
              <span>PID</span>
              <strong>
                PAT-001 | Demo Patient
              </strong>
            </div>

            <div className="hl7-line">
              <span>PV1</span>
              <strong>
                Emergency | ICU
              </strong>
            </div>

            <div className="hl7-line">
              <span>OBX</span>
              <strong>
                SpO2 | 94 | %
              </strong>
            </div>
          </div>

          <button
            className="generate-hl7"
            onClick={generateMessage}
          >
            Generate HL7 Message
          </button>

          <div className="hl7-note">
            Prototype message only — no external hospital
            gateway is connected.
          </div>
        </section>
      </div>

      {/* MESSAGE TABLE */}
      <section className="integration-card message-card">
        <div className="integration-card-header">
          <div>
            <h2>Integration Message Monitor</h2>
            <p>
              Recent FHIR and HL7 interoperability events
            </p>
          </div>

          <button
            className="refresh-integration"
            onClick={loadData}
          >
            ↻ Refresh
          </button>
        </div>

        <div className="integration-tabs">
          <button
            className={activeTab === "FHIR" ? "active" : ""}
            onClick={() => setActiveTab("FHIR")}
          >
            FHIR
          </button>

          <button
            className={activeTab === "HL7" ? "active" : ""}
            onClick={() => setActiveTab("HL7")}
          >
            HL7
          </button>

          <button
            className={activeTab === "ALL" ? "active" : ""}
            onClick={() => setActiveTab("ALL")}
          >
            All Messages
          </button>
        </div>

        <div className="integration-table-wrapper">
          <table className="integration-table">
            <thead>
              <tr>
                <th>TIME</th>
                <th>PROTOCOL</th>
                <th>TYPE</th>
                <th>DIRECTION</th>
                <th>RESOURCE</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {messages
                .filter(
                  (message) =>
                    activeTab === "ALL" ||
                    message.protocol === activeTab
                )
                .map((message) => (
                  <tr key={message.id}>
                    <td>{message.time}</td>

                    <td>
                      <span
                        className={`protocol-badge ${message.protocol.toLowerCase()}`}
                      >
                        {message.protocol}
                      </span>
                    </td>

                    <td>
                      <strong>{message.type}</strong>
                    </td>

                    <td>
                      <span
                        className={`direction ${message.direction.toLowerCase()}`}
                      >
                        {message.direction}
                      </span>
                    </td>

                    <td>{message.resource}</td>

                    <td>
                      <span
                        className={`message-status ${message.status.toLowerCase()}`}
                      >
                        {message.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="message-view"
                        onClick={() =>
                          setSelectedMessage(message)
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section className="integration-card architecture-card">
        <div className="integration-card-header">
          <div>
            <h2>Interoperability Architecture</h2>
            <p>
              Intended integration flow for future hospital deployment
            </p>
          </div>
        </div>

        <div className="architecture-flow">
          <ArchitectureNode
            title="VitalFlow"
            subtitle="Hospital Operations"
          />

          <div className="architecture-arrow">→</div>

          <ArchitectureNode
            title="FHIR API"
            subtitle="R4 Resources"
          />

          <div className="architecture-arrow">→</div>

          <ArchitectureNode
            title="Integration Gateway"
            subtitle="Validation / Routing"
          />

          <div className="architecture-arrow">→</div>

          <ArchitectureNode
            title="Hospital EHR"
            subtitle="External System"
          />
        </div>
      </section>

      {/* NOTICE */}
      <div className="integration-notice">
        <strong>Interoperability Prototype:</strong>{" "}
        The FHIR and HL7 interfaces shown here are simulated.
        A production deployment would require authenticated endpoints,
        real FHIR/HL7 servers, message validation, encryption,
        access control, audit logging and healthcare-specific governance.
      </div>

      {/* MODAL */}
      {selectedMessage && (
        <div
          className="integration-modal-overlay"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="integration-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="integration-modal-header">
              <div>
                <span>Integration Event</span>
                <h2>{selectedMessage.type}</h2>
              </div>

              <button
                onClick={() => setSelectedMessage(null)}
              >
                ×
              </button>
            </div>

            <div className="message-detail-grid">
              <div>
                <span>Protocol</span>
                <strong>{selectedMessage.protocol}</strong>
              </div>

              <div>
                <span>Direction</span>
                <strong>{selectedMessage.direction}</strong>
              </div>

              <div>
                <span>Resource</span>
                <strong>{selectedMessage.resource}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{selectedMessage.status}</strong>
              </div>

              <div>
                <span>Time</span>
                <strong>{selectedMessage.time}</strong>
              </div>
            </div>

            <div className="modal-message-preview">
              <span>Message Preview</span>

              <pre>
                {selectedMessage.protocol === "FHIR"
                  ? JSON.stringify(
                      fhirExamples[
                        selectedMessage.type
                      ] || fhirExamples.Patient,
                      null,
                      2
                    )
                  : "MSH|^~\\&|VITALFLOW|HOSPITAL|EHR|HOSPITAL|202609301200||ADT^A01|DEMO001|P|2.5"}
              </pre>
            </div>

            <button
              className="integration-close-button"
              onClick={() => setSelectedMessage(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="integration-footer">
        Last data refresh:{" "}
        {lastUpdated
          ? lastUpdated.toLocaleTimeString()
          : "Waiting for connection"}
      </div>
    </div>
  );
}

function ArchitectureNode({ title, subtitle }) {
  return (
    <div className="architecture-node">
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </div>
  );
}

export default Integration;