import { useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

const CATEGORIES = [
  { min: 150, label: "Generational",  color: "#00ff87", bg: "rgba(0,255,135,0.08)",  border: "rgba(0,255,135,0.2)",  icon: "👑" },
  { min: 80,  label: "World Class",   color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", icon: "⭐" },
  { min: 40,  label: "Elite",         color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)", icon: "🔥" },
  { min: 15,  label: "Quality",       color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", icon: "💪" },
  { min: 0,   label: "Developing",    color: "#5a6480", bg: "rgba(90,100,128,0.08)", border: "rgba(90,100,128,0.2)", icon: "📈" },
];

function getCategory(value) {
  return CATEGORIES.find(c => value >= c.min) || CATEGORIES[CATEGORIES.length - 1];
}

export default function Predictor() {
  const [form, setForm] = useState({
    age:               23,
    goals:             10,
    assists:           5,
    penalties:         1,
    played_matches:    25,
    height_cm:         180,
    league_position:   5,
    league_tier:       1,
    in_champions_league: 0,
    foot_right:        1,
    position_encoded:  4,
  });

  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: Number(e.target.value) });
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await axios.post(`${API}/predict`, form);
      setResult(res.data);
    } catch {
      setError("Prediction failed. Make sure the backend is running.");
    }
    setLoading(false);
  };

  const cat = result ? getCategory(result.predicted_value_eur) : null;
  const barPct = result ? Math.min((result.predicted_value_eur / 200) * 100, 100) : 0;

  return (
    <div>
      <h1 className="page-title">PREDICT <span>MARKET VALUE</span></h1>
      <p className="page-subtitle">Enter player statistics to estimate market value using our trained Multiple Linear Regression model</p>

      <div className="predictor-container">

        {/* Form */}
        <div className="form-card">

          <div className="form-section-title">Performance Stats</div>
          <div className="form-row">
            <div className="form-group">
              <label>Goals</label>
              <input type="number" name="goals" value={form.goals} onChange={handleChange} min={0} max={50} />
            </div>
            <div className="form-group">
              <label>Assists</label>
              <input type="number" name="assists" value={form.assists} onChange={handleChange} min={0} max={30} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Penalties Scored</label>
              <input type="number" name="penalties" value={form.penalties} onChange={handleChange} min={0} max={15} />
            </div>
            <div className="form-group">
              <label>Matches Played</label>
              <input type="number" name="played_matches" value={form.played_matches} onChange={handleChange} min={1} max={60} />
            </div>
          </div>

          <div className="form-section-title">Player Profile</div>
          <div className="form-row">
            <div className="form-group">
              <label>Age</label>
              <input type="number" name="age" value={form.age} onChange={handleChange} min={16} max={40} />
            </div>
            <div className="form-group">
              <label>Height (cm)</label>
              <input type="number" name="height_cm" value={form.height_cm} onChange={handleChange} min={155} max={210} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Position</label>
              <select name="position_encoded" value={form.position_encoded} onChange={handleChange}>
                <option value={1}>Goalkeeper</option>
                <option value={2}>Defender</option>
                <option value={3}>Midfielder</option>
                <option value={4}>Forward</option>
              </select>
            </div>
            <div className="form-group">
              <label>Preferred Foot</label>
              <select name="foot_right" value={form.foot_right} onChange={handleChange}>
                <option value={1}>Right</option>
                <option value={0}>Left</option>
              </select>
            </div>
          </div>

          <div className="form-section-title">Club Context</div>
          <div className="form-row">
            <div className="form-group">
              <label>League</label>
              <select name="league_tier" value={form.league_tier} onChange={handleChange}>
                <option value={1}>Premier League</option>
                <option value={2}>La Liga</option>
                <option value={3}>Bundesliga</option>
                <option value={4}>Serie A</option>
                <option value={5}>Ligue 1</option>
              </select>
            </div>
            <div className="form-group">
              <label>Team League Position</label>
              <input type="number" name="league_position" value={form.league_position} onChange={handleChange} min={1} max={20} />
            </div>
          </div>

          <button className="predict-btn" onClick={handlePredict} disabled={loading}>
            {loading ? "CALCULATING..." : "PREDICT MARKET VALUE"}
          </button>
        </div>

        {/* Result */}
        <div className="result-card">
          {!result && !loading && !error && (
            <div className="result-placeholder">
              Fill in the player statistics on the left and click predict to see the estimated market value
            </div>
          )}

          {loading && <div className="loading-text">Calculating market value...</div>}
          {error   && <div className="error-text">{error}</div>}

          {result && cat && (
            <>
              <div className="result-label">Estimated Market Value</div>

              <div className="result-value" style={{ color: cat.color }}>
                {result.predicted_value_eur.toFixed(1)}
              </div>
              <div className="result-currency" style={{ color: cat.color }}>
                MILLION EUROS
              </div>

              <div className="result-bar">
                <div className="result-bar-fill" style={{ width: `${barPct}%`, background: cat.color }} />
              </div>

              <div className="result-category" style={{ background: cat.bg, border: `1px solid ${cat.border}`, color: cat.color }}>
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </div>

              <div className="result-meta">
                Predicted using <strong>Multiple Linear Regression</strong><br />
                trained on <strong>570 players</strong> across <strong>6 competitions</strong><br />
                Cross-validated R² of <strong>0.57</strong>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
