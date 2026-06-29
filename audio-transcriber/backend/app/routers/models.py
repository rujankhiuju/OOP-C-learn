from fastapi import APIRouter, HTTPException
from app.schemas import ModelInfo, ModelLoadRequest
from app.services.transcriber import get_model_info, load_model

router = APIRouter(prefix="/api/models", tags=["models"])


@router.get("/", response_model=ModelInfo)
async def get_current_model():
    info = get_model_info()
    return ModelInfo(**info)


@router.post("/load", response_model=ModelInfo)
async def switch_model(req: ModelLoadRequest):
    valid = {"tiny", "base", "small", "medium", "large", "large-v3"}
    if req.model not in valid:
        raise HTTPException(400, f"Invalid model. Choose from: {', '.join(sorted(valid))}")
    try:
        info = load_model(req.model)
        return ModelInfo(**info)
    except Exception as e:
        raise HTTPException(500, f"Failed to load model: {e}")
