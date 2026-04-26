import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

const API = "http://127.0.0.1:8000";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#0e1118", border: "1px solid #1e2535",
        borderRadius: 8, padding: "10px 14px", fontSize: "0.82rem"
      }}>
        <div style={{ color: "#5a6480", marginBottom: 6, fontSize: "0.75rem" }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, display: "flex", gap: 8, justifyContent: "space-between" }}>
            <span>{p.name}</span>
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 600 }}>
              €{p.value}M
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CountTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#0e1118", border: "1px solid #1e2535",
        borderRadius: 8, padding: "10px 14px", fontSize: "0.82rem"
      }}>
        <div style={{ color: "#5a6480", marginBottom: 4, fontSize: "0.75rem" }}>{label}</div>
        <div style={{ color: "#8b5cf6" }}>{payload[0].value} players</div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [leagueData, setLeagueData]     = useState([]);
  const [positionData, setPositionData] = useState([]);
  const [topPlayers, setTopPlayers]     = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/data/league-summary`),
      axios.get(`${API}/data/position-summary`),
      axios.get(`${API}/data/top-players`),
    ]).then(([league, position, players]) => {
      setLeagueData(league.data);
      setPositionData(position.data);
      setTopPlayers(players.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="loading-text">Loading dashboard data...</div>;

  const totalPlayers = leagueData.reduce((a, b) => a + b.count, 0);
  const avgValue     = (leagueData.reduce((a, b) => a + b.mean * b.count, 0) / totalPlayers).toFixed(1);
  const topLeague    = [...leagueData].sort((a, b) => b.median - a.median)[0]?.competition;
  const topPlayer    = topPlayers[0];

  return (
    <div>
      <h1 className="page-title">MARKET VALUE <span>DASHBOARD</span></h1>
      <p className="page-subtitle">Exploratory analysis of player market values across Europe's top leagues & Champions League</p>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalPlayers}</div>
          <div className="stat-label">Players Analysed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">€{avgValue}M</div>
          <div className="stat-label">Average Market Value</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{topLeague}</div>
          <div className="stat-label">Highest Median League</div>
        </div>
      </div>

      <div className="charts-grid">

        {/* League Median */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title">Median Market Value by League</div>
            <div className="chart-subtitle">Median player value in €M per competition</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={leagueData} margin={{ top: 4, right: 8, left: -10, bottom: 55 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" vertical={false} />
              <XAxis dataKey="competition" tick={{ fill: "#5a6480", fontSize: 11 }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fill: "#5a6480", fontSize: 11 }} tickFormatter={(v) => `€${v}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="median" name="Median" fill="#00ff87" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Position Value */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title">Market Value by Position Group</div>
            <div className="chart-subtitle">Median vs mean value by position</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={positionData} margin={{ top: 4, right: 8, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" vertical={false} />
              <XAxis dataKey="position_grouped" tick={{ fill: "#5a6480", fontSize: 11 }} />
              <YAxis tick={{ fill: "#5a6480", fontSize: 11 }} tickFormatter={(v) => `€${v}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "#5a6480", fontSize: "0.78rem", paddingTop: 8 }} />
              <Bar dataKey="median" name="Median" fill="#00ff87" radius={[4, 4, 0, 0]} />
              <Bar dataKey="mean"   name="Mean"   fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mean vs Median */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title">Mean vs Median Value by League</div>
            <div className="chart-subtitle">Gap indicates skew from high-value outliers</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={leagueData} margin={{ top: 4, right: 8, left: -10, bottom: 55 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" vertical={false} />
              <XAxis dataKey="competition" tick={{ fill: "#5a6480", fontSize: 11 }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fill: "#5a6480", fontSize: 11 }} tickFormatter={(v) => `€${v}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "#5a6480", fontSize: "0.78rem", paddingTop: 8 }} />
              <Bar dataKey="median" name="Median" fill="#00ff87" radius={[4, 4, 0, 0]} />
              <Bar dataKey="mean"   name="Mean"   fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Player Count */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title">Players Analysed per League</div>
            <div className="chart-subtitle">Number of top scorers collected per competition</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={leagueData} margin={{ top: 4, right: 8, left: -10, bottom: 55 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" vertical={false} />
              <XAxis dataKey="competition" tick={{ fill: "#5a6480", fontSize: 11 }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fill: "#5a6480", fontSize: 11 }} />
              <Tooltip content={<CountTooltip />} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Players Table */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <div className="chart-title">Players by Market Value</div>
            <div className="chart-subtitle">Highest valued players in the dataset</div>
          </div>
          <table className="top-players-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Team</th>
                <th>Position</th>
                <th>Competition</th>
                <th>Goals</th>
                <th>Assists</th>
                <th>Market Value</th>
              </tr>
            </thead>
            <tbody>
              {topPlayers.map((p, i) => (
                <tr key={i}>
                  <td><span className="rank-num">{String(i + 1).padStart(2, "0")}</span></td>
                  <td><span className="player-name-cell">{p.player_name}</span></td>
                  <td style={{ color: "#5a6480" }}>{p.team}</td>
                  <td style={{ color: "#5a6480" }}>{p.position}</td>
                  <td><span className="badge">{p.competition}</span></td>
                  <td style={{ fontFamily: "JetBrains Mono, monospace" }}>{p.goals}</td>
                  <td style={{ fontFamily: "JetBrains Mono, monospace" }}>{p.assists}</td>
                  <td><span className="value-cell">€{p.market_value_eur}M</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
