import { useState } from "react";
import Dashboard from "./components/Dashboard";
import Predictor from "./components/Predictor";
import Comparison from "./components/Comparison";
import "./App.css";

function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">
          ⚽ <span>Mercato</span>
        </div>
        <div className="nav-links">
          <button className={page === "dashboard" ? "nav-btn active" : "nav-btn"} onClick={() => setPage("dashboard")}>
            Dashboard
          </button>
          <button className={page === "predictor" ? "nav-btn active" : "nav-btn"} onClick={() => setPage("predictor")}>
            Predict Value
          </button>
          <button className={page === "comparison" ? "nav-btn active" : "nav-btn"} onClick={() => setPage("comparison")}>
            Compare Players
          </button>
        </div>
      </nav>

      <main className="main-content">
        {page === "dashboard"  && <Dashboard />}
        {page === "predictor"  && <Predictor />}
        {page === "comparison" && <Comparison />}
      </main>
    </div>
  );
}

export default App;