import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

const API = "http://127.0.0.1:8000";

const STAT_CONFIG = [
  { key: "market_value_eur", label: "Market Value",   unit: "€M", highlight: true,  lowerIsBetter: false },
  { key: "goals",            label: "Goals",          unit: "",   highlight: false, lowerIsBetter: false },
  { key: "assists",          label: "Assists",        unit: "",   highlight: false, lowerIsBetter: false },
  { key: "penalties",        label: "Penalties",      unit: "",   highlight: false, lowerIsBetter: false },
  { key: "played_matches",   label: "Matches Played", unit: "",   highlight: false, lowerIsBetter: false },
  { key: "age",              label: "Age",            unit: "yrs",highlight: false, lowerIsBetter: true  },
];

const selectStyles = (color) => ({
  control: (base, state) => ({
    ...base,
    background: "#080a0f",
    border: `1px solid ${state.isFocused ? color : "#1e2535"}`,
    borderRadius: 7,
    boxShadow: state.isFocused ? `0 0 0 3px ${color}15` : "none",
    color: "#e8eaf0",
    minHeight: 42,
    "&:hover": { borderColor: color },
  }),
  menu: (base) => ({
    ...base,
    background: "#0e1118",
    border: "1px solid #1e2535",
    borderRadius: 8,
    zIndex: 999,
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: 220,
    padding: 4,
  }),
  option: (base, state) => ({
    ...base,
    background: state.isFocused ? "#151b26" : "transparent",
    color: state.isFocused ? "#e8eaf0" : "#8b8fa8",
    borderRadius: 6,
    fontSize: "0.85rem",
    padding: "8px 12px",
    cursor: "pointer",
  }),
  singleValue: (base) => ({ ...base, color: "#e8eaf0", fontSize: "0.9rem" }),
  placeholder: (base) => ({ ...base, color: "#3a4255", fontSize: "0.85rem" }),
  input: (base) => ({ ...base, color: "#e8eaf0" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({ ...base, color: "#3a4255" }),
  clearIndicator: (base) => ({ ...base, color: "#3a4255" }),
  noOptionsMessage: (base) => ({ ...base, color: "#5a6480", fontSize: "0.82rem" }),
});

function StatBar({ label, unit, val1, val2, highlight, lowerIsBetter }) {
  const v1 = val1 ?? 0;
  const v2 = val2 ?? 0;
  const total = v1 + v2;
  const w1 = total === 0 ? 50 : (v1 / total) * 100;
  const w2 = total === 0 ? 50 : (v2 / total) * 100;
  const tied = v1 === v2;
  const p1Wins = !tied && (lowerIsBetter ? v1 < v2 : v1 > v2);
  const p2Wins = !tied && (lowerIsBetter ? v2 < v1 : v2 > v1);

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: highlight ? "1.1rem" : "0.9rem",
          fontWeight: 600,
          color: p1Wins ? "#00ff87" : "var(--text)",
          display: "flex", alignItems: "center", gap: 5
        }}>
          {p1Wins && <span style={{ fontSize: "0.6rem" }}>▲</span>}
          {highlight ? `€${v1}M` : `${v1}${unit}`}
        </div>
        <div style={{
          fontSize: "0.68rem", color: "var(--muted)",
          textTransform: "uppercase", letterSpacing: "1.2px",
          textAlign: "center", flex: 1, padding: "0 12px"
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: highlight ? "1.1rem" : "0.9rem",
          fontWeight: 600,
          color: p2Wins ? "#3b82f6" : "var(--text)",
          display: "flex", alignItems: "center", gap: 5
        }}>
          {highlight ? `€${v2}M` : `${v2}${unit}`}
          {p2Wins && <span style={{ fontSize: "0.6rem" }}>▲</span>}
        </div>
      </div>
      <div style={{
        height: highlight ? 10 : 6,
        background: "var(--border)", borderRadius: 4,
        overflow: "hidden", display: "flex", gap: 2
      }}>
        <div style={{ width: `${w1}%`, background: "#00ff87", borderRadius: "4px 0 0 4px", transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
        <div style={{ width: `${w2}%`, background: "#3b82f6", borderRadius: "0 4px 4px 0", transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
    </div>
  );
}

function PlayerSelector({ title, color, position, players, selected, onSelect }) {
  const options = players.map(p => ({
    value: p.player_name,
    label: `${p.player_name} — ${p.team}`,
    player: p
  }));

  return (
    <div className="form-card" style={{ borderTop: `3px solid ${color}` }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "1.1rem", letterSpacing: "2px",
        color, marginBottom: 20
      }}>
        {title}
      </div>

      <div className="form-group">
        <label>Search Player</label>
        <Select
          options={options}
          value={selected ? { value: selected.player_name, label: `${selected.player_name} — ${selected.team}` } : null}
          onChange={(opt) => onSelect(opt ? opt.player : null)}
          isDisabled={!position || players.length === 0}
          placeholder={!position ? "Select a position first" : "Type to search..."}
          isClearable
          isSearchable
          styles={selectStyles(color)}
          noOptionsMessage={() => "No players found"}
        />
      </div>

      {selected && (
        <div style={{
          marginTop: 16, padding: 16,
          background: "var(--bg)", borderRadius: 10,
          border: `1px solid ${color}25`
        }}>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "1.2rem", letterSpacing: "1.5px",
            color: "var(--text)", marginBottom: 4
          }}>
            {selected.player_name}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 14 }}>
            {selected.team} · {selected.competition} · {selected.position}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { label: "Market Value", value: `€${selected.market_value_eur}M`, full: true },
              { label: "Age",          value: `${selected.age} yrs` },
              { label: "Goals",        value: selected.goals },
              { label: "Assists",      value: selected.assists },
              { label: "Penalties",    value: selected.penalties },
              { label: "Matches",      value: selected.played_matches },
            ].map((item, i) => (
              <div key={i} style={{
                padding: "8px 10px",
                background: "var(--surface2)", borderRadius: 7,
                gridColumn: item.full ? "1 / -1" : "auto"
              }}>
                <div style={{ fontSize: "0.62rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 2 }}>
                  {item.label}
                </div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: item.full ? "1.15rem" : "0.9rem",
                  fontWeight: 600,
                  color: item.full ? color : "var(--text)"
                }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Comparison() {
  const [position, setPosition] = useState("");
  const [players, setPlayers]   = useState([]);
  const [player1, setPlayer1]   = useState(null);
  const [player2, setPlayer2]   = useState(null);
  const [compared, setCompared] = useState(false);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (!position) { setPlayers([]); setPlayer1(null); setPlayer2(null); setCompared(false); return; }
    setLoading(true);
    setPlayer1(null); setPlayer2(null); setCompared(false);
    axios.get(`${API}/data/players-by-position?position=${encodeURIComponent(position)}`)
      .then(res => { setPlayers(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [position]);

  const canCompare = player1 && player2 && player1.player_name !== player2.player_name;

  const p1Wins = compared && player1 && player2
    ? STAT_CONFIG.filter(s => {
        const v1 = player1[s.key] ?? 0;
        const v2 = player2[s.key] ?? 0;
        return s.lowerIsBetter ? v1 < v2 : v1 > v2;
      }).length : 0;

  const p2Wins = compared && player1 && player2
    ? STAT_CONFIG.filter(s => {
        const v1 = player1[s.key] ?? 0;
        const v2 = player2[s.key] ?? 0;
        return s.lowerIsBetter ? v2 < v1 : v2 > v1;
      }).length : 0;

  const winner = p1Wins > p2Wins ? 1 : p2Wins > p1Wins ? 2 : 0;

  return (
    <div>
      <h1 className="page-title">COMPARE <span>PLAYERS</span></h1>
      <p className="page-subtitle">
        Select a position then search and compare any two players from the full dataset
      </p>

      {/* Position Selector */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 12, padding: "22px 28px", marginBottom: 28,
        display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap"
      }}>
        <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "2px" }}>
          Position
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { label: "Forward",    icon: "⚡", color: "#00ff87" },
            { label: "Midfielder", icon: "🎯", color: "#f59e0b" },
            { label: "Defender",   icon: "🛡️", color: "#f43f5e" },
          ].map(({ label, icon, color }) => (
            <button
              key={label}
              onClick={() => setPosition(label)}
              style={{
                padding: "9px 22px", borderRadius: 8,
                border: `1px solid ${position === label ? color : "var(--border)"}`,
                background: position === label ? `${color}14` : "transparent",
                color: position === label ? color : "var(--muted)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.88rem", fontWeight: 600,
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {icon} {label}
            </button>
          ))}
        </div>
        {loading && <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Loading players...</div>}
        {position && !loading && (
          <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
            {players.length} players available — type to search
          </div>
        )}
      </div>

      {/* Player Selectors */}
      <div className="comparison-container" style={{ marginBottom: 28 }}>
        <PlayerSelector title="PLAYER 1" color="#00ff87" position={position} players={players} selected={player1} onSelect={setPlayer1} />
        <div className="vs-divider"><div className="vs-text">VS</div></div>
        <PlayerSelector title="PLAYER 2" color="#3b82f6" position={position} players={players} selected={player2} onSelect={setPlayer2} />
      </div>

      {/* Compare Button */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
        <button
          className="predict-btn"
          style={{ width: 320, opacity: canCompare ? 1 : 0.4 }}
          onClick={() => canCompare && setCompared(true)}
          disabled={!canCompare}
        >
          {!player1 || !player2 ? "SELECT TWO PLAYERS FIRST"
            : player1.player_name === player2.player_name ? "SELECT DIFFERENT PLAYERS"
            : "COMPARE PLAYERS"}
        </button>
      </div>

      {/* Results */}
      {compared && player1 && player2 && (
        <div className="comparison-result">
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid var(--border)"
          }}>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", letterSpacing: "2px", color: "#00ff87" }}>
                {player1.player_name}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{player1.team} · {player1.competition}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="comparison-result-title" style={{ marginBottom: 6 }}>HEAD TO HEAD</div>
              <div style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "#00ff87" }}>{p1Wins}</span>
                <span style={{ color: "var(--muted)" }}>–</span>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2rem", color: "#3b82f6" }}>{p2Wins}</span>
              </div>
              <div style={{ fontSize: "0.62rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Stats Won</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.3rem", letterSpacing: "2px", color: "#3b82f6" }}>
                {player2.player_name}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{player2.team} · {player2.competition}</div>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            {STAT_CONFIG.map(stat => (
              <StatBar
                key={stat.key}
                label={stat.label}
                unit={stat.unit}
                val1={player1[stat.key]}
                val2={player2[stat.key]}
                highlight={stat.highlight}
                lowerIsBetter={stat.lowerIsBetter}
              />
            ))}
          </div>

          {winner !== 0 ? (
            <div className="winner-banner" style={{
              background: winner === 1 ? "rgba(0,255,135,0.06)" : "rgba(59,130,246,0.06)",
              border: `1px solid ${winner === 1 ? "rgba(0,255,135,0.2)" : "rgba(59,130,246,0.2)"}`,
            }}>
              <div className="winner-icon">🏆</div>
              <div style={{ flex: 1 }}>
                <div className="winner-text" style={{ color: winner === 1 ? "#00ff87" : "#3b82f6" }}>
                  {winner === 1 ? player1.player_name : player2.player_name} wins {Math.max(p1Wins, p2Wins)}/{STAT_CONFIG.length} stats
                </div>
                <div className="winner-value">
                  Market value difference: €{Math.abs((player1.market_value_eur ?? 0) - (player2.market_value_eur ?? 0)).toFixed(1)}M
                </div>
              </div>
            </div>
          ) : (
            <div className="winner-banner" style={{ background: "rgba(90,100,128,0.06)", border: "1px solid rgba(90,100,128,0.2)" }}>
              <div className="winner-icon">🤝</div>
              <div className="winner-text" style={{ color: "var(--muted)" }}>It's a tie — evenly matched!</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
