import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const demoUsers = [
  {
    role: "Admin",
    email: "admin@vitalflow.com",
    password: "admin123",
  },
  {
    role: "Doctor",
    email: "doctor@vitalflow.com",
    password: "doctor123",
  },
  {
    role: "Nurse",
    email: "nurse@vitalflow.com",
    password: "nurse123",
  },
  {
    role: "Reception",
    email: "reception@vitalflow.com",
    password: "reception123",
  },
];

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();
    setError("");

    const user = demoUsers.find(
      (item) =>
        item.email === email &&
        item.password === password
    );

    if (!user) {
      setError("Invalid demo credentials.");
      return;
    }

    localStorage.setItem(
      "vitalflow_user",
      JSON.stringify({
        role: user.role,
        email: user.email,
      })
    );

    navigate("/");
  };

  const loginAsDemo = (user) => {
    localStorage.setItem(
      "vitalflow_user",
      JSON.stringify({
        role: user.role,
        email: user.email,
      })
    );

    navigate("/");
  };

  return (
    <div className="login-page">
      <div className="login-brand-panel">
        <div className="login-brand">
          <div className="login-logo">V</div>

          <div>
            <h1>VitalFlow</h1>
            <p>Ward Manager</p>
          </div>
        </div>

        <div className="brand-content">
          <span className="eyebrow">
            HOSPITAL OPERATIONS PLATFORM
          </span>

          <h2>
            Smarter hospital operations.
            <br />
            Faster patient care.
          </h2>

          <p>
            A unified command center for patient
            prioritization, bed allocation, resource
            monitoring, and hospital intelligence.
          </p>

          <div className="feature-list">
            <div>
              <span>✓</span>
              Real-time bed management
            </div>

            <div>
              <span>✓</span>
              Priority-based emergency triage
            </div>

            <div>
              <span>✓</span>
              AI-assisted resource optimization
            </div>

            <div>
              <span>✓</span>
              FHIR / HL7 integration ready
            </div>
          </div>
        </div>

        <div className="login-warning">
          Simulation environment — not for clinical
          decision-making.
        </div>
      </div>

      <div className="login-form-panel">
        <div className="login-card">
          <div className="mobile-logo">
            <div className="login-logo">V</div>
            <div>
              <strong>VitalFlow</strong>
              <span>Ward Manager</span>
            </div>
          </div>

          <div className="login-heading">
            <h2>Welcome back</h2>
            <p>
              Sign in to access the hospital command
              center.
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="login-field">
              <label>Email</label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="login-field">
              <label>Password</label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
            >
              Sign In
            </button>
          </form>

          <div className="demo-section">
            <div className="divider">
              <span>DEMO ACCESS</span>
            </div>

            <p className="demo-description">
              Select a role to sign in instantly.
            </p>

            <div className="demo-users">
              {demoUsers.map((user) => (
                <button
                  key={user.role}
                  className="demo-user"
                  onClick={() => loginAsDemo(user)}
                >
                  <span className="demo-avatar">
                    {user.role.charAt(0)}
                  </span>

                  <span className="demo-user-info">
                    <strong>{user.role}</strong>
                    <small>{user.email}</small>
                  </span>

                  <span className="demo-arrow">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;