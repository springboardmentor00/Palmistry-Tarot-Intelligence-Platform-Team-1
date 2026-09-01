from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import our database instance and routers
from database import db
from routers import auth
from routers import profile
from routers import readings
from routers import insights
from routers import consultations

app = FastAPI(title="Palmistry & Tarot API Gateway")

# Allow Next.js frontend to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Connect/Disconnect Database on server start/stop
@app.on_event("startup")
async def startup():
    await db.connect()


@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()


# Plug in the auth routes
app.include_router(auth.router)

# Plug in the new profile route
app.include_router(profile.router)

# Plug in the new readings route
app.include_router(readings.router)

app.include_router(insights.router)

app.include_router(consultations.router)
