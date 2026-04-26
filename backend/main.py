from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import numpy as np
import pandas as pd

app = FastAPI()

# Allow React frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and scaler
with open("mlr_model.pkl", "rb") as f:
    model = pickle.load(f)

with open("scaler.pkl", "rb") as f:
    scaler = pickle.load(f)

# Load dataset
df = pd.read_csv("football_integrated_clean.xls")

# Feature order must match training
FEATURES = [
    "age", "goals", "assists", "penalties", "played_matches",
    "goals_per_match", "assists_per_match", "height_cm",
    "league_position", "league_tier", "in_champions_league",
    "foot_right", "position_encoded"
]

# ── Prediction input schema ──
class PlayerInput(BaseModel):
    age: float
    goals: int
    assists: int
    penalties: int
    played_matches: int
    height_cm: float
    league_position: int
    league_tier: int
    in_champions_league: int
    foot_right: int
    position_encoded: int

@app.post("/predict")
def predict(player: PlayerInput):
    # Calculate derived features
    goals_per_match   = player.goals / player.played_matches if player.played_matches > 0 else 0
    assists_per_match = player.assists / player.played_matches if player.played_matches > 0 else 0

    features = np.array([[
        player.age,
        player.goals,
        player.assists,
        player.penalties,
        player.played_matches,
        goals_per_match,
        assists_per_match,
        player.height_cm,
        player.league_position,
        player.league_tier,
        player.in_champions_league,
        player.foot_right,
        player.position_encoded,
    ]])

    scaled   = scaler.transform(features)
    log_pred = model.predict(scaled)[0]
    value_eur = np.expm1(log_pred)

    return {
        "predicted_value_eur": round(float(value_eur), 2),
        "predicted_value_str": f"€{value_eur:.2f}M"
    }

@app.get("/data/league-summary")
def league_summary():
    summary = df.groupby("competition")["market_value_eur"].agg(
        median="median",
        mean="mean",
        count="count"
    ).reset_index().dropna()
    return summary.round(2).to_dict(orient="records")

@app.get("/data/position-summary")
def position_summary():
    position_groups = {
        "Right Winger": "Forward", "Left Winger": "Forward",
        "Centre-Forward": "Forward", "Offence": "Forward",
        "Attacking Midfield": "Midfielder", "Central Midfield": "Midfielder",
        "Defensive Midfield": "Midfielder", "Midfield": "Midfielder",
        "Right Midfield": "Midfielder", "Left Midfield": "Midfielder",
        "Centre-Back": "Defender", "Left-Back": "Defender",
        "Right-Back": "Defender", "Defence": "Defender",
    }
    df["position_grouped"] = df["position"].map(position_groups).fillna("Other")
    df_filtered = df[df["position_grouped"] != "Other"]
    summary = df_filtered.groupby("position_grouped")["market_value_eur"].agg(
        median="median",
        mean="mean",
        count="count"
    ).reset_index().dropna()
    return summary.round(2).to_dict(orient="records")

@app.get("/data/top-players")
def top_players():
    top = df.nlargest(20, "market_value_eur")[
        ["player_name", "team", "competition", "market_value_eur", "goals", "assists", "position"]
    ].dropna()
    return top.round(2).to_dict(orient="records")

@app.get("/data/players-by-position")
def players_by_position(position: str):
    from datetime import date
    import math

    position_groups = {
        "Right Winger": "Forward", "Left Winger": "Forward",
        "Centre-Forward": "Forward", "Offence": "Forward",
        "Attacking Midfield": "Midfielder", "Central Midfield": "Midfielder",
        "Defensive Midfield": "Midfielder", "Midfield": "Midfielder",
        "Right Midfield": "Midfielder", "Left Midfield": "Midfielder",
        "Centre-Back": "Defender", "Left-Back": "Defender",
        "Right-Back": "Defender", "Defence": "Defender",
    }

    df["position_grouped"] = df["position"].map(position_groups).fillna("Other")

    def compute_age(dob_str):
        if pd.isnull(dob_str):
            return None
        try:
            dob = pd.to_datetime(dob_str).date()
            return round((date.today() - dob).days / 365.25, 1)
        except:
            return None

    def clean(val):
        if val is None:
            return None
        if isinstance(val, float) and math.isnan(val):
            return None
        return val

    df["age"] = df["date_of_birth"].apply(compute_age)

    filtered = df[df["position_grouped"] == position].copy()
    filtered = filtered[filtered["market_value_eur"].notna()]
    filtered = filtered.drop_duplicates(subset="player_name")
    filtered = filtered.sort_values("market_value_eur", ascending=False)

    records = []
    for _, row in filtered.iterrows():
        records.append({
            "player_name":      clean(row.get("player_name")),
            "team":             clean(row.get("team")),
            "competition":      clean(row.get("competition")),
            "position":         clean(row.get("position")),
            "market_value_eur": clean(row.get("market_value_eur")),
            "goals":            clean(row.get("goals")),
            "assists":          clean(row.get("assists")),
            "penalties":        clean(row.get("penalties")),
            "played_matches":   clean(row.get("played_matches")),
            "age":              clean(row.get("age")),
        })

    return records