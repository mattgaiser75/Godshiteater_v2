from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .config import settings
from .routers.health import router as health_router
from .routers.agents import router as agents_router
from .routers.crew import router as crew_router

app = FastAPI(title=settings.project_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health_router)
app.include_router(agents_router)
app.include_router(crew_router)

# Frontend
app.mount("/web", StaticFiles(directory="frontend", html=True), name="frontend")


@app.get("/")
async def root():
    return FileResponse("frontend/index.html")
