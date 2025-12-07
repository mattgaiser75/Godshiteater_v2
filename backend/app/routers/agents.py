from fastapi import APIRouter

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("")
async def list_agents():
    return {
        "platforms": [
            "OpenManus",
            "AgentLabUI",
            "CrewAI",
            "Autogen-style",
            "Custom HTTP tools",
        ]
    }
