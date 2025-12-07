from fastapi import APIRouter
from ..crew_flow import build_sample_crew

router = APIRouter(prefix="/crew", tags=["crew"])


@router.get("/template")
async def get_template():
    return build_sample_crew()
