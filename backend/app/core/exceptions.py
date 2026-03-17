from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse
from loguru import logger


class EchoMindError(Exception):
    """Base application error."""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class NotFoundError(EchoMindError):
    def __init__(self, resource: str, id: str | int):
        super().__init__(f"{resource} '{id}' not found", status_code=404)


class ForbiddenError(EchoMindError):
    def __init__(self, message: str = "Access denied"):
        super().__init__(message, status_code=403)


class AIServiceError(EchoMindError):
    def __init__(self, service: str, detail: str):
        super().__init__(f"{service} error: {detail}", status_code=502)


def _cors_headers(request: Request) -> dict:
    """
    Return CORS headers matching the incoming origin.

    FastAPI's CORSMiddleware only adds CORS headers to responses that flow
    through it normally. When a dependency (e.g. HTTPBearer auth) raises an
    HTTPException *before* the CORS middleware processes the response, the
    browser receives a response with NO Access-Control-Allow-Origin header
    and reports it as a CORS error — hiding the real 401/403.

    By adding these headers in every exception handler we ensure the browser
    always sees the actual error status, not a misleading CORS block.
    """
    origin = request.headers.get("origin", "*")
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "*",
    }


def register_exception_handlers(app: FastAPI) -> None:

    @app.exception_handler(EchoMindError)
    async def echomind_handler(request: Request, exc: EchoMindError):
        if exc.status_code >= 500:
            logger.error(f"Server error: {exc.message} | path={request.url.path}")
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "error": exc.message},
            headers=_cors_headers(request),
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        # 401 from HTTPBearer / auth dependency — add CORS so browser sees the real error
        return JSONResponse(
            status_code=exc.status_code,
            content={"success": False, "error": exc.detail},
            headers=_cors_headers(request),
        )

    @app.exception_handler(Exception)
    async def unhandled_handler(request: Request, exc: Exception):
        logger.exception(f"Unhandled exception at {request.url.path}: {exc}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"success": False, "error": "Internal server error"},
            headers=_cors_headers(request),
        )
