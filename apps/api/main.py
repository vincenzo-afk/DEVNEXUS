from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import ai

app = FastAPI(title="DevNexus API", version="1.0.0")
app.include_router(ai.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "devnexus-api"}

@app.get("/")
def read_root():
    return {"message": "Welcome to DevNexus API. See /docs for Swagger UI."}
