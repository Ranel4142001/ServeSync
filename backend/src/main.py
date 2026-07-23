from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
from src.features.auth.presentation.router import router as auth_router
from src.features.organizations.presentation.router import router as org_router
from src.features.tickets.presentation.router import router as ticket_router
from src.features.billing.presentation.router import router as billing_router
from src.features.ai.presentation.router import router as ai_router
from src.features.storage.presentation.router import router as storage_router
from src.features.tickets.presentation.gateway import sio

# Initialize FastAPI Application
app = FastAPI(
    title="ServeSync API",
    description="Python FastAPI backend for ServeSync helpdesk platform",
    version="1.0.0"
)

# Configure CORS
# React frontend runs on http://localhost:5173 or similar, allow it
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Feature Routers
app.include_router(auth_router)
app.include_router(org_router)
app.include_router(ticket_router)
app.include_router(billing_router)
app.include_router(ai_router)
app.include_router(storage_router)

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "servesync-python-backend"}

# Wrap the FastAPI application with the Socket.IO ASGI app container
# Client requests for WebSockets will route through socket.io automatically
asgi_app = socketio.ASGIApp(sio, other_asgi_app=app)
