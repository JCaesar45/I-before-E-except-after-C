from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import httpx
import time
from collections import defaultdict

app = FastAPI(title="Aether Vault Gateway", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://aethervault.io"],
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["Authorization", "Content-Type"],
)

class AuthRequest(BaseModel):
    clientId: str = Field(..., min_length=16, max_length=64)
    accessKey: str = Field(..., min_length=32, max_length=128)

class AuthResponse(BaseModel):
    sessionToken: str
    redirectUri: str
    expiresAt: int

rate_limit_store = defaultdict(list)

def check_rate_limit(request: Request):
    client_ip = request.client.host
    current_time = time.time()
    
    rate_limit_store[client_ip] = [
        t for t in rate_limit_store[client_ip] if current_time - t < 60
    ]
    
    if len(rate_limit_store[client_ip]) >= 5:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
        
    rate_limit_store[client_ip].append(current_time)

@app.post("/api/v1/authenticate", response_model=AuthResponse)
async def authenticate(
    auth_data: AuthRequest, 
    request: Request,
    _=Depends(check_rate_limit)
):
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            crypto_response = await client.post(
                "http://java-crypto-service:8080/verify",
                json={"clientId": auth_data.clientId, "signature": auth_data.accessKey}
            )
            
            if crypto_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid cryptographic signature")
                
            crypto_data = crypto_response.json()
            
            return AuthResponse(
                sessionToken=crypto_data["token"],
                redirectUri="/dashboard",
                expiresAt=int(time.time()) + 3600
            )
            
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Cryptographic service unavailable")

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )
