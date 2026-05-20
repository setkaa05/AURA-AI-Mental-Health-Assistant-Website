"""AURA — Analytics Router"""

import json
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Optional

import aiosqlite
from fastapi import APIRouter

router = APIRouter()


@router.get("/weekly")
async def weekly_analytics(session_id: Optional[str] = None):
    since = (datetime.utcnow() - timedelta(days=7)).isoformat()
    async with aiosqlite.connect("aura.db") as db:
        db.row_factory = aiosqlite.Row
        if session_id:
            cursor = await db.execute(
                "SELECT * FROM emotion_logs WHERE timestamp >= ? AND session_id = ? ORDER BY timestamp ASC",
                (since, session_id)
            )
        else:
            cursor = await db.execute(
                "SELECT * FROM emotion_logs WHERE timestamp >= ? ORDER BY timestamp ASC", (since,)
            )
        rows = await cursor.fetchall()

    records = []
    for row in rows:
        r = dict(row)
        r["scores"] = json.loads(r["scores"]) if r["scores"] else {}
        records.append(r)

    # Aggregate by day
    daily = defaultdict(list)
    for r in records:
        day = r["timestamp"][:10]
        daily[day].append(r)

    daily_summary = []
    for day, entries in sorted(daily.items()):
        emotions_count = defaultdict(int)
        avg_confidence = 0.0
        for e in entries:
            emotions_count[e["primary_emotion"]] += 1
            avg_confidence += e["confidence"]
        dominant = max(emotions_count, key=emotions_count.get) if emotions_count else "neutral"
        daily_summary.append({
            "date": day,
            "total_entries": len(entries),
            "dominant_emotion": dominant,
            "emotion_counts": dict(emotions_count),
            "avg_confidence": round(avg_confidence / len(entries), 4) if entries else 0,
        })

    # Overall stats
    emotion_totals = defaultdict(int)
    for r in records:
        emotion_totals[r["primary_emotion"]] += 1

    return {
        "period": "7_days",
        "total_interactions": len(records),
        "daily_summary": daily_summary,
        "emotion_totals": dict(emotion_totals),
        "most_frequent_emotion": max(emotion_totals, key=emotion_totals.get) if emotion_totals else "neutral",
    }


@router.get("/trends")
async def emotion_trends(days: int = 30, session_id: Optional[str] = None):
    since = (datetime.utcnow() - timedelta(days=days)).isoformat()
    async with aiosqlite.connect("aura.db") as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT primary_emotion, confidence, sentiment, timestamp FROM emotion_logs WHERE timestamp >= ? ORDER BY timestamp ASC",
            (since,)
        )
        rows = await cursor.fetchall()

    records = [dict(row) for row in rows]
    timeline = [
        {
            "timestamp": r["timestamp"],
            "emotion": r["primary_emotion"],
            "confidence": r["confidence"],
            "sentiment": r["sentiment"],
        }
        for r in records
    ]
    return {"days": days, "timeline": timeline, "total": len(timeline)}


@router.get("/radar")
async def emotion_radar(session_id: Optional[str] = None, limit: int = 50):
    """Returns average emotion scores for radar chart."""
    async with aiosqlite.connect("aura.db") as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT scores FROM emotion_logs ORDER BY timestamp DESC LIMIT ?", (limit,)
        )
        rows = await cursor.fetchall()

    all_scores = defaultdict(list)
    for row in rows:
        scores = json.loads(row["scores"]) if row["scores"] else {}
        for emotion, score in scores.items():
            all_scores[emotion].append(score)

    avg_scores = {
        emotion: round(sum(vals) / len(vals), 4) if vals else 0.0
        for emotion, vals in all_scores.items()
    }
    return {"radar_data": avg_scores, "samples": len(rows)}


@router.get("/insights")
async def ai_insights(session_id: Optional[str] = None):
    """Generate text insights from emotion patterns."""
    async with aiosqlite.connect("aura.db") as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT primary_emotion, sentiment, confidence, timestamp FROM emotion_logs ORDER BY timestamp DESC LIMIT 100"
        )
        rows = await cursor.fetchall()

    records = [dict(r) for r in rows]
    if not records:
        return {"insights": ["Start chatting with AURA to generate personalized insights!"], "total_sessions": 0}

    emotion_counts = defaultdict(int)
    pos_count = neg_count = 0
    for r in records:
        emotion_counts[r["primary_emotion"]] += 1
        if r.get("sentiment") == "positive":
            pos_count += 1
        elif r.get("sentiment") == "negative":
            neg_count += 1

    total = len(records)
    dominant = max(emotion_counts, key=emotion_counts.get)
    pos_ratio = round(pos_count / total * 100, 1)
    neg_ratio = round(neg_count / total * 100, 1)

    insights = []
    if dominant == "sadness":
        insights.append(f"Sadness has been your most frequent emotion ({emotion_counts['sadness']} times). Consider a wellness routine.")
    elif dominant == "joy":
        insights.append(f"Joy dominates your emotional landscape ({emotion_counts['joy']} times) — keep nurturing this!")
    elif dominant == "anger":
        insights.append("Anger has been frequent. Breathing exercises and journaling can help regulate this.")
    elif dominant == "fear":
        insights.append("Fear patterns detected. Grounding techniques may help reduce anxiety.")
    else:
        insights.append(f"Your dominant emotion is {dominant}. Continue reflecting with AURA.")

    if pos_ratio > 60:
        insights.append(f"{pos_ratio}% of your messages carry positive sentiment — excellent emotional health!")
    elif neg_ratio > 60:
        insights.append(f"{neg_ratio}% negative sentiment detected. Consider reaching out to a support network.")

    insights.append(f"You've had {total} emotional check-ins with AURA. Consistency builds self-awareness.")

    return {
        "insights": insights,
        "emotion_distribution": dict(emotion_counts),
        "positive_ratio": pos_ratio,
        "negative_ratio": neg_ratio,
        "total_sessions": total,
    }
