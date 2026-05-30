from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import ai, todos, notes, hackathons, github
from middleware.auth import RateLimitMiddleware

app = FastAPI(title="DevNexus API", version="1.0.0")

# Register CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register auth / rate-limiting middleware
app.add_middleware(RateLimitMiddleware)

app.include_router(ai.router)
app.include_router(todos.router)
app.include_router(notes.router)
app.include_router(hackathons.router)
app.include_router(github.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "devnexus-api"}

@app.get("/")
def read_root():
    return {"message": "Welcome to DevNexus API. See /docs for Swagger UI."}
