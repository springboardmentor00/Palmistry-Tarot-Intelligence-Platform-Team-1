import json
from fastapi import APIRouter, Depends, HTTPException
from database import db
from routers.auth import get_current_user
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/api/admin", tags=["Admin Dashboard"])

@router.get("/dashboard-overview")
async def get_dashboard_overview(raw_user=Depends(get_current_user)):
    user = raw_user.get("user", raw_user) if isinstance(raw_user, dict) else raw_user
    user_role = user.get("role", "").lower() if isinstance(user, dict) else getattr(user, "role", "").lower()
    
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized. Executive clearance required.")

    try:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        seven_days_ago = now - timedelta(days=7)

        # --- KPI STRIP METRICS ---
        total_users = await db.user.count()
        
        active_users_raw = await db.query_raw('''SELECT COUNT(DISTINCT "userId") as count FROM "ActivityLog" WHERE "createdAt" >= $1::timestamp''', seven_days_ago)
        active_7d = active_users_raw[0]["count"] if active_users_raw else 0
        total_ai_runs = await db.reading.count()

        consult_users_raw = await db.query_raw('''SELECT COUNT(DISTINCT "clientId") as count FROM "Consultation"''')
        consult_users = consult_users_raw[0]["count"] if consult_users_raw else 0
        conversion_rate = round((consult_users / max(total_users, 1)) * 100, 1)

        pending_sla = await db.consultation.count(where={"status": "Pending"})

        # --- FUNNEL DATA ---
        profiles_completed = await db.profile.count()
        first_readings_raw = await db.query_raw('''SELECT COUNT(DISTINCT "userId") as count FROM "Reading"''')
        first_readings = first_readings_raw[0]["count"] if first_readings_raw else 0

        # --- VELOCITY TRENDS ---
        trends_raw = await db.query_raw('''
            WITH dates AS (
                SELECT generate_series(date_trunc('day', NOW()::timestamp - INTERVAL '29 days'), date_trunc('day', NOW()::timestamp), '1 day'::interval)::date AS day
            )
            SELECT 
                d.day,
                COUNT(r.id) FILTER (WHERE r."readingType" ILIKE '%tarot%') AS tarot_count,
                COUNT(r.id) FILTER (WHERE r."readingType" ILIKE '%palm%') AS palm_count,
                COUNT(r.id) FILTER (WHERE r."readingType" ILIKE '%insight%' OR r."readingType" ILIKE '%spiritual%') AS ai_count
            FROM dates d
            LEFT JOIN "Reading" r ON date_trunc('day', r."createdAt")::date = d.day
            GROUP BY d.day
            ORDER BY d.day ASC;
        ''')
        tarot_trend = [row["tarot_count"] for row in trends_raw]
        palm_trend = [row["palm_count"] for row in trends_raw]
        ai_trend = [row["ai_count"] for row in trends_raw]

        # --- DEMOGRAPHICS (Ages & Goals) ---
        age_raw = await db.query_raw('''SELECT COALESCE("ageGroup", 'Unspecified') as age, COUNT(*) as count FROM "Profile" GROUP BY "ageGroup"''')
        total_ages = sum([a["count"] for a in age_raw]) or 1
        age_distribution = [{"label": a["age"], "pct": round((a["count"]/total_ages)*100)} for a in age_raw if a["age"] != "Unspecified"]

        goal_keys = ['Career Growth', 'Relationships', 'Personal Growth', 'Financial Stability', 'Emotional Wellbeing', 'Spiritual Development', 'Life Direction']
        goals_counts = {k: 0 for k in goal_keys}
        goals_raw = await db.query_raw('''SELECT "primaryGoal" as goal FROM "Profile"''')
        
        for g in goals_raw:
            goal_val = str(g.get("goal") or "").strip().lower()
            for k in goal_keys:
                if k.lower() in goal_val:
                    goals_counts[k] += 1
                    break
        
        total_profile_goals = sum(goals_counts.values()) or 1
        life_goals = [{"label": k, "pct": round((v / total_profile_goals) * 100)} for k, v in goals_counts.items()]
        life_goals.sort(key=lambda x: x["pct"], reverse=True)

        # --- EXACT TAROT DONUT DATA ---
        tarot_raw = await db.query_raw('''SELECT "rawData" FROM "Reading" WHERE "readingType" ILIKE '%tarot%' ''')
        spread_counts = {
            "Three Card Spread": 0,
            "Single Card": 0,
            "Mind · Body · Spirit": 0,
            "Situation/Action": 0,
            "Celtic Cross": 0
        }
        
        for r in tarot_raw:
            raw = r.get("rawData") or {}
            if isinstance(raw, str):
                try: raw = json.loads(raw)
                except: raw = {}
            
            raw_name = str(raw.get("spreadName") or raw.get("spread_name") or raw.get("spreadType") or raw.get("spread") or "Three Card Spread").strip().lower()
            
            if "single" in raw_name or "one" in raw_name: spread_counts["Single Card"] += 1
            elif "mind" in raw_name or "body" in raw_name or "spirit" in raw_name: spread_counts["Mind · Body · Spirit"] += 1
            elif "situation" in raw_name or "action" in raw_name: spread_counts["Situation/Action"] += 1
            elif "celtic" in raw_name or "cross" in raw_name: spread_counts["Celtic Cross"] += 1
            else: spread_counts["Three Card Spread"] += 1
        
        # 🚀 FIX: Removed the slice so it guarantees all 5 spreads are ALWAYS returned for the legend!
        sorted_spreads = sorted(spread_counts.items(), key=lambda x: x[1], reverse=True)
        total_tarot_reads = sum(spread_counts.values()) or 1
        tarot_colors = ["#fbbf24", "#6366f1", "#d946ef", "#10b981", "#f43f5e"]
        
        tarot_profile = []
        for idx, (k, v) in enumerate(sorted_spreads):
            tarot_profile.append({"label": k, "count": v, "pct": round((v/total_tarot_reads)*100), "colorCode": tarot_colors[idx%len(tarot_colors)]})

        # --- PALM UPLOAD QUALITY ---
        palm_logs = await db.query_raw('''SELECT metadata->>'resolution' as res FROM "ActivityLog" WHERE action ILIKE '%palm%' ''')
        res_counts = {"1080p": 0, "720p": 0, "480p": 0}
        for log in palm_logs:
            res = str(log.get("res", ""))
            if "1080" in res: res_counts["1080p"] += 1
            elif "720" in res: res_counts["720p"] += 1
            elif "480" in res: res_counts["480p"] += 1
        
        total_res = sum(res_counts.values()) or 1
        palm_quality = {
            "p1080": round((res_counts["1080p"]/total_res)*100) if sum(res_counts.values()) > 0 else 0,
            "p720": round((res_counts["720p"]/total_res)*100) if sum(res_counts.values()) > 0 else 0,
            "p480": round((res_counts["480p"]/total_res)*100) if sum(res_counts.values()) > 0 else 0
        }

        # --- REAL AI CORE TOKENS ---
        ai_logs = await db.query_raw('''SELECT metadata->>'tokens' as t, metadata->>'promptTokens' as pt, metadata->>'completionTokens' as ct FROM "ActivityLog" WHERE metadata->>'tokens' IS NOT NULL''')
        total_tokens = sum([int(log["t"]) for log in ai_logs if log.get("t")])
        total_prompt = sum([int(log["pt"]) for log in ai_logs if log.get("pt")])
        total_comp = sum([int(log["ct"]) for log in ai_logs if log.get("ct")])
        avg_tokens = round(total_tokens / max(len(ai_logs), 1))
        
        prompt_pct = round((total_prompt / total_tokens) * 100) if total_tokens > 0 and total_prompt > 0 else 0
        comp_pct = round((total_comp / total_tokens) * 100) if total_tokens > 0 and total_comp > 0 else 0

        # --- REAL SPECIALIST TRIAGE ---
        triage_raw = await db.query_raw('''
            SELECT r."readingType", COUNT(c.id) as count
            FROM "Consultation" c
            JOIN "Reading" r ON c."readingId" = r.id
            WHERE c.status ILIKE 'pending%'
            GROUP BY r."readingType"
        ''')
        triage_counts = {'Tarot': 0, 'Palm': 0, 'Spiritual Insight': 0}
        for t in triage_raw:
            rt = str(t["readingType"]).lower()
            if 'tarot' in rt: triage_counts['Tarot'] += t["count"]
            elif 'palm' in rt: triage_counts['Palm'] += t["count"]
            elif 'insight' in rt or 'spiritual' in rt: triage_counts['Spiritual Insight'] += t["count"]
        
        triage = [{"modality": k, "count": v} for k, v in triage_counts.items()]

        # --- LIVE PLATFORM EVENTS ---
        events_raw = await db.query_raw('''SELECT action, "createdAt" FROM "ActivityLog" ORDER BY "createdAt" DESC LIMIT 2''')
        recent_events = []
        for e in events_raw:
            cat = e.get("createdAt")
            if isinstance(cat, str):
                try: cat = datetime.fromisoformat(cat.replace("Z", ""))
                except: cat = now
            diff_mins = int((now - cat.replace(tzinfo=None)).total_seconds() / 60)
            time_str = f"{diff_mins}m ago" if diff_mins < 60 else f"{diff_mins//60}h ago"
            clean_action = str(e.get("action", "System Event")).replace("_", " ").title()
            recent_events.append({"action": clean_action, "time": time_str})

        latency_raw = await db.query_raw('''SELECT AVG((metadata->>'latency')::float) as avg_latency FROM "ActivityLog" WHERE action ILIKE '%palm%' AND metadata->>'latency' IS NOT NULL''')
        avg_latency = round(latency_raw[0]["avg_latency"], 1) if latency_raw and latency_raw[0]["avg_latency"] else 0.0

        return {
            "kpis": {"totalUsers": total_users, "active7d": active_7d, "totalAI": total_ai_runs, "conversionRate": conversion_rate, "slaBacklog": pending_sla, "avgLatency": avg_latency},
            "trends": {"tarot": tarot_trend, "palm": palm_trend, "ai": ai_trend},
            "funnel": [
                {"stage": "Registered", "count": total_users, "w": "100%"},
                {"stage": "Completed Profile", "count": profiles_completed, "w": f"{round((profiles_completed/max(total_users, 1))*100)}%"},
                {"stage": "First AI Reading", "count": first_readings, "w": f"{round((first_readings/max(total_users, 1))*100)}%"},
                {"stage": "Paid Human Consult", "count": consult_users, "w": f"{round((consult_users/max(total_users, 1))*100)}%"}
            ],
            "demographics": {"age": age_distribution, "goals": life_goals},
            "tarotProfile": tarot_profile,
            "palmQuality": palm_quality,
            "aiCore": {"totalTokens": total_tokens, "avgTokens": avg_tokens, "promptPct": prompt_pct, "compPct": comp_pct},
            "triage": triage,
            "recentEvents": recent_events
        }

    except Exception as e:
        print(f"Dashboard Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to aggregate telemetry data.")

@router.get("/users")
async def get_admin_users(raw_user=Depends(get_current_user)):
    # 🛡️ CRASH-PROOF AUTHENTICATION
    user = raw_user.get("user", raw_user) if isinstance(raw_user, dict) else raw_user
    user_role = user.get("role", "").lower() if isinstance(user, dict) else getattr(user, "role", "").lower()
    
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")

    try:
        query = '''
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.role, 
                u."createdAt" as joined,
                MAX(a."createdAt") as last_active
            FROM "User" u
            LEFT JOIN "ActivityLog" a ON u.id = a."userId"
            GROUP BY u.id
            ORDER BY u."createdAt" DESC
        '''
        users_raw = await db.query_raw(query)

        formatted_users = []
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        
        for row in users_raw:
            last_active = row.get("last_active")
            joined = row.get("joined")
            active_dt = last_active if last_active else joined
            
            if isinstance(active_dt, str):
                try:
                    active_dt = datetime.fromisoformat(active_dt.replace("Z", ""))
                except:
                    active_dt = now
            
            if isinstance(joined, str):
                joined_str = joined[:10]
            else:
                joined_str = joined.strftime("%Y-%m-%d")

            days_since_active = (now - active_dt.replace(tzinfo=None)).days
            status = "Churn Risk" if days_since_active > 14 else "Active"
            color = "text-rose-400" if status == "Churn Risk" else "text-emerald-400"
            
            if days_since_active == 0:
                active_str = "Today"
            elif days_since_active == 1:
                active_str = "Yesterday"
            else:
                active_str = f"{days_since_active} days ago"

            # Fixed: Preserve "User" correctly instead of naming it "Standard"
            raw_role = row["role"].strip()
            if raw_role.lower() == "user":
                role_str = "User"
            else:
                role_str = raw_role.title()

            formatted_users.append({
                "id": row["id"][:8], 
                "full_id": row["id"],
                "name": row["name"],
                "email": row["email"],
                "role": role_str,
                "joined": joined_str,
                "active": active_str,
                "status": status,
                "color": color
            })
            
        return formatted_users

    except Exception as e:
        print(f"CRM Fetch Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch CRM users.")

@router.get("/tarot-analytics")
async def get_tarot_analytics(raw_user=Depends(get_current_user)):
    user = raw_user.get("user", raw_user) if isinstance(raw_user, dict) else raw_user
    user_role = user.get("role", "").lower() if isinstance(user, dict) else getattr(user, "role", "").lower()
    
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")

    try:
        # 1. Total tarot readings count
        total_tarot_raw = await db.query_raw(
            'SELECT COUNT(*) as count FROM "Reading" WHERE "readingType" = \'tarot\''
        )
        total_tarot = total_tarot_raw[0]["count"] if total_tarot_raw else 0

        # 2. Fetch all tarot readings to dynamically group ALL unique spread names
        readings_raw = await db.query_raw(
            'SELECT id, "rawData", "createdAt" FROM "Reading" WHERE "readingType" = \'tarot\''
        )

        spread_counts = {
            "Three Card Spread": 0,
            "Single Card": 0,
            "Situation/Action": 0,
            "Mind · Body · Spirit": 0,
            "Celtic Cross": 0
        }

        now = datetime.now(timezone.utc).replace(tzinfo=None)
        thirty_days_ago = now - timedelta(days=29)
        momentum_buckets = {k: [0] * 30 for k in spread_counts}

        for r in readings_raw:
            raw = r.get("rawData") or {}
            spread_name = (
                raw.get("spreadName") or 
                raw.get("spread_name") or 
                raw.get("spreadType") or 
                raw.get("spread") or 
                "Custom Spread"
            ).strip()
            
            if spread_name not in spread_counts:
                spread_counts[spread_name] = 0
                momentum_buckets[spread_name] = [0] * 30

            spread_counts[spread_name] += 1

            created_at = r.get("createdAt")
            if isinstance(created_at, str):
                try: created_at = datetime.fromisoformat(created_at.replace("Z", ""))
                except: created_at = now
            
            if created_at:
                day_diff = (created_at.replace(tzinfo=None) - thirty_days_ago).days
                if 0 <= day_diff < 30:
                    momentum_buckets[spread_name][day_diff] += 1

        total_vol = sum(spread_counts.values()) or total_tarot

        sorted_spreads = sorted(spread_counts.items(), key=lambda x: x[1], reverse=True)
        colors_pool = ["text-amber-400", "text-indigo-400", "text-fuchsia-400", "text-purple-400", "text-rose-400", "text-emerald-400"]
        
        matrix_data = []
        for idx, (name, vol) in enumerate(sorted_spreads):
            pct = f"{round((vol / max(total_vol, 1)) * 100)}%" if total_vol > 0 else "0%"
            matrix_data.append({
                "name": name, 
                "vol": f"{vol:,}", 
                "pct": pct, 
                "color": colors_pool[idx % len(colors_pool)]
            })

        dominant_spread = sorted_spreads[0][0] if sorted_spreads and sorted_spreads[0][1] > 0 else "None"

        # 3. Real Upsell Conversion Metric
        upsell_raw = await db.query_raw(
            '''
            SELECT COUNT(DISTINCT c."readingId") as count 
            FROM "Consultation" c
            JOIN "Reading" r ON c."readingId" = r.id
            WHERE r."readingType" = 'tarot'
            '''
        )
        consultation_linked_count = upsell_raw[0]["count"] if upsell_raw else 0
        real_upsell_pct = round((consultation_linked_count / max(total_tarot, 1)) * 100, 1) if total_tarot > 0 else 0.0

        # 4. Find the single most used reading depth from the Preference table
        depth_raw = await db.query_raw(
            '''
            SELECT LOWER(COALESCE("readingDepth", 'standard')) as depth, COUNT(*) as count
            FROM "Preference"
            GROUP BY depth
            ORDER BY count DESC
            LIMIT 1
            '''
        )
        dominant_depth = depth_raw[0]["depth"].title() if depth_raw and depth_raw[0]["count"] > 0 else "Standard"

        # 5. 30-day consultation trend
        trends_raw = await db.query_raw(
            '''
            WITH dates AS (
                SELECT generate_series(date_trunc('day', NOW()::timestamp - INTERVAL '29 days'), date_trunc('day', NOW()::timestamp), '1 day'::interval)::date AS day
            )
            SELECT 
                d.day,
                COUNT(c.id) AS consult_count
            FROM dates d
            LEFT JOIN "Consultation" c ON date_trunc('day', c."createdAt")::date = d.day
            GROUP BY d.day
            ORDER BY d.day ASC;
            '''
        )
        conversion_trend = [int(row["consult_count"]) for row in trends_raw] if trends_raw else [0]*30

        return {
            "kpis": {
                "totalSpreads": f"{total_tarot:,}",
                "dominantSpread": dominant_spread,
                "synthesisDepth": dominant_depth,
                "depthSub": "Most Used",
                "upsellConversion": f"{real_upsell_pct}%"
            },
            "matrix": matrix_data,
            "conversionTrend": conversion_trend,
            "spreadTrends": momentum_buckets
        }
    except Exception as e:
        print(f"Tarot Analytics Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch tarot analytics.")

@router.get("/palm-analytics")
async def get_palm_analytics(raw_user=Depends(get_current_user)):
    user = raw_user.get("user", raw_user) if isinstance(raw_user, dict) else raw_user
    user_role = user.get("role", "").lower() if isinstance(user, dict) else getattr(user, "role", "").lower()
    
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")

    try:
        # 1. Total Scans (Strictly successful Palm Readings)
        total_palm_raw = await db.query_raw(
            'SELECT COUNT(*) as count FROM "Reading" WHERE "readingType" = \'palm\' AND "createdAt" >= NOW() - INTERVAL \'30 days\''
        )
        total_scans = total_palm_raw[0]["count"] if total_palm_raw else 0

        # 2. Extract Real Telemetry from ActivityLog (STRICTLY PALM ACTIONS NOW)
        activity_raw = await db.query_raw('''
            SELECT 
                "createdAt",
                action,
                metadata->>'latency' as latency,
                metadata->>'resolution' as resolution,
                metadata->>'tokens' as tokens
            FROM "ActivityLog"
            WHERE "createdAt" >= NOW() - INTERVAL '30 days'
            AND action ILIKE '%palm%' 
        ''')
        # ^^^ Added 'AND action ILIKE '%palm%'' so it doesn't count tarot or profile image uploads!
        
        latencies = []
        tokens_list = []
        resolutions = {"1080p": 0, "720p": 0, "480p": 0}
        
        fails = 0
        fail_types = {"Blurry": 0, "No Hand": 0, "Lighting": 0, "Other": 0}
        
        daily_latency = {} 
        daily_high_res = [0] * 30
        
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        thirty_days_ago = now - timedelta(days=29)

        for act in activity_raw:
            action = str(act.get("action", "")).lower()
            if "fail" in action or "error" in action:
                fails += 1
                if "blur" in action: fail_types["Blurry"] += 1
                elif "hand" in action: fail_types["No Hand"] += 1
                elif "light" in action: fail_types["Lighting"] += 1
                else: fail_types["Other"] += 1
                
            created_at = act.get("createdAt")
            if isinstance(created_at, str):
                try: created_at = datetime.fromisoformat(created_at.replace("Z", ""))
                except: created_at = now
            day_diff = -1
            if created_at:
                day_diff = (created_at.replace(tzinfo=None) - thirty_days_ago).days

            lat = act.get("latency")
            if lat:
                try:
                    lat_val = float(lat)
                    latencies.append(lat_val)
                    if 0 <= day_diff < 30:
                        if day_diff not in daily_latency: daily_latency[day_diff] = []
                        daily_latency[day_diff].append(lat_val)
                except: pass
            
            tok = act.get("tokens")
            if tok:
                try: tokens_list.append(int(tok))
                except: pass
                
            res = act.get("resolution")
            if res:
                if "1080" in res:
                    resolutions["1080p"] += 1
                    if 0 <= day_diff < 30: daily_high_res[day_diff] += 1
                elif "720" in res: resolutions["720p"] += 1
                elif "480" in res: resolutions["480p"] += 1
                        
        avg_lat = sum(latencies)/len(latencies) if latencies else 0
        avg_tok = int(sum(tokens_list)/len(tokens_list)) if tokens_list else 0
        
        latency_trend = []
        for i in range(30):
            if i in daily_latency and daily_latency[i]:
                latency_trend.append(round(sum(daily_latency[i])/len(daily_latency[i]), 2))
            else:
                latency_trend.append(0) 
                
        total_res = sum(resolutions.values()) or 1
        res_metrics = {
            "p1080": round((resolutions["1080p"]/total_res)*100) if sum(resolutions.values()) > 0 else 0,
            "p720": round((resolutions["720p"]/total_res)*100) if sum(resolutions.values()) > 0 else 0,
            "p480": round((resolutions["480p"]/total_res)*100) if sum(resolutions.values()) > 0 else 0
        }
        
        error_donut = []
        err_colors = ["#f43f5e", "#f59e0b", "#6366f1", "#a855f7"]
        if fails > 0:
            idx = 0
            for k, v in fail_types.items():
                if v > 0:
                    error_donut.append({"label": k, "count": v, "pct": (v/fails)*100, "color": err_colors[idx%len(err_colors)]})
                    idx += 1
        
        # 3. Guidance Intent Composition (Pulls from User Profiles)
        profiles_raw = await db.query_raw('SELECT "guidanceAreas", "preferredTopics" FROM "Profile"')
        
        # EXACT match to your frontend ProfileOptions
        topic_counts = {
            "Personality": 0, 
            "Relationships": 0, 
            "Career": 0, 
            "Finance": 0, 
            "Wellness": 0, 
            "Personal Growth": 0, 
            "Life Opportunities": 0
        }
        
        for p in profiles_raw:
            # Combine both lists and ensure we handle None values safely
            areas = (p.get("guidanceAreas") or []) + (p.get("preferredTopics") or [])
            
            # Deduplicate so a user isn't counted twice if they picked "Career" in both arrays
            unique_areas = set([str(a).lower().strip() for a in areas])
            
            for t in topic_counts:
                if t.lower() in unique_areas:
                    topic_counts[t] += 1

        total_topics = sum(topic_counts.values()) or 1
        composition = []
        
        # 7 Colors for 7 Topics
        comp_colors = [
            'bg-amber-500', 'bg-rose-500', 'bg-emerald-500', 
            'bg-purple-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-sky-400'
        ]
        
        idx = 0
        for label, count in topic_counts.items():
            pct = round((count / total_topics) * 100) if sum(topic_counts.values()) > 0 else 0
            composition.append({
                "label": label,
                "pct": pct,
                "color": comp_colors[idx % len(comp_colors)],
                "trend": "Live Data"
            })
            idx += 1

        return {
            "kpis": {
                "totalScans": f"{total_scans:,}",
                "avgTokens": f"{avg_tok:,}",
                "avgLatency": f"{avg_lat:.2f}s",
                "failedScans": str(fails)
            },
            "latencyTrend": latency_trend,
            "resolutionMetrics": res_metrics,
            "resolutionTrend": daily_high_res,
            "errors": error_donut,
            "composition": composition # Now sending exactly 7 mapped options!
        }
    except Exception as e:
        print(f"Palm Analytics Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch palm analytics.")

@router.get("/ai-analytics")
async def get_ai_analytics(raw_user=Depends(get_current_user)):
    user = raw_user.get("user", raw_user) if isinstance(raw_user, dict) else raw_user
    user_role = user.get("role", "").lower() if isinstance(user, dict) else getattr(user, "role", "").lower()
    
    if user_role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")

    try:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        thirty_days_ago = now - timedelta(days=29)

        # 1. AI Logs
        activity_raw = await db.query_raw('''
            SELECT 
                "createdAt",
                action,
                metadata->>'tokens' as tokens
            FROM "ActivityLog"
            WHERE "createdAt" >= NOW() - INTERVAL '30 days'
            AND metadata->>'tokens' IS NOT NULL
        ''')
        
        total_runs = len(activity_raw)
        daily_runs = [0] * 30
        daily_tokens = [0] * 30
        total_tokens = 0
        
        # 🚀 Strictly 3 Modalities!
        task_counts = {"Tarot Synthesis": 0, "Palm Analysis": 0, "Spiritual Insight": 0}
        task_tokens = {"Tarot Synthesis": 0, "Palm Analysis": 0, "Spiritual Insight": 0}

        for act in activity_raw:
            created_at = act.get("createdAt")
            if isinstance(created_at, str):
                try: created_at = datetime.fromisoformat(created_at.replace("Z", ""))
                except: created_at = now
                
            day_diff = -1
            if created_at:
                day_diff = (created_at.replace(tzinfo=None) - thirty_days_ago).days
                if 0 <= day_diff < 30:
                    daily_runs[day_diff] += 1
            
            action_str = str(act.get("action", "")).lower()
            task_category = None
            
            if "tarot" in action_str:
                task_category = "Tarot Synthesis"
            elif "palm" in action_str:
                task_category = "Palm Analysis"
            elif "insight" in action_str or "spiritual" in action_str:
                task_category = "Spiritual Insight"
                
            if task_category:
                task_counts[task_category] += 1
            
            t = act.get("tokens")
            if t:
                try:
                    tok_val = int(t)
                    total_tokens += tok_val
                    if task_category:
                        task_tokens[task_category] += tok_val
                    if 0 <= day_diff < 30: 
                        daily_tokens[day_diff] += tok_val
                except: pass

        avg_tokens = int(total_tokens / total_runs) if total_runs > 0 else 0
        dominant_task = max(task_counts, key=task_counts.get) if sum(task_counts.values()) > 0 else "None"

        # Prepare Real Donut Chart Data (Math adjusted for exactly 3)
        task_distribution = []
        task_colors = ["#a855f7", "#10b981", "#0ea5e9"]
        total_tracked_runs = sum(task_counts.values()) or 1
        
        idx = 0
        for k, v in task_counts.items():
            pct = round((v / total_tracked_runs) * 100) if sum(task_counts.values()) > 0 else 0
            task_distribution.append({
                "label": k, 
                "count": v, 
                "pct": pct, 
                "color": task_colors[idx]
            })
            idx += 1

        # Prepare Real Token Expenditure Split (Math adjusted for exactly 3)
        token_split = []
        split_colors = ["bg-purple-500", "bg-emerald-500", "bg-sky-500"]
        total_tracked_tokens = sum(task_tokens.values()) or 1
        
        idx = 0
        for k, v in task_tokens.items():
            pct = round((v / total_tracked_tokens) * 100) if sum(task_tokens.values()) > 0 else 0
            token_split.append({
                "label": k,
                "tokens": v,
                "pct": pct,
                "color": split_colors[idx]
            })
            idx += 1

        # 2. Spiritual Interest Clustering
        profiles_raw = await db.query_raw('SELECT "spiritualInterests" FROM "Profile"')
        spiritual_keys = ['Tarot', 'Palmistry', 'Astrology', 'Meditation', 'Spirituality', 'Self Growth', 'Mindfulness', 'Numerology']
        spiritual_counts = {k: 0 for k in spiritual_keys}

        for p in profiles_raw:
            interests = p.get("spiritualInterests") or []
            unique_interests = set([str(i).strip() for i in interests])
            for k in spiritual_keys:
                if k in unique_interests:
                    spiritual_counts[k] += 1

        total_interests = sum(spiritual_counts.values()) or 1
        clustering = []
        colors = ['bg-indigo-500', 'bg-fuchsia-500', 'bg-purple-500', 'bg-rose-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 'bg-blue-500']
        
        idx = 0
        for label, count in spiritual_counts.items():
            pct = round((count / total_interests) * 100) if sum(spiritual_counts.values()) > 0 else 0
            clustering.append({"label": label, "pct": pct, "color": colors[idx % len(colors)]})
            idx += 1

        clustering.sort(key=lambda x: x["pct"], reverse=True)

        return {
            "kpis": {
                "totalSynthesis": f"{total_runs:,}",
                "avgTokens": f"{avg_tokens:,}",
                "dominantTask": dominant_task
            },
            "synthesisTrend": daily_runs,
            "tokenTrend": daily_tokens,
            "taskDistribution": task_distribution,
            "tokenSplit": token_split,
            "clustering": clustering
        }
    except Exception as e:
        print(f"AI Analytics Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch AI analytics.")