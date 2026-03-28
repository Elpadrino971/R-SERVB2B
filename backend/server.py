from fastapi import FastAPI, APIRouter, HTTPException, Depends, Body, Query, Request, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
import shutil
import aiofiles
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import asyncio
import resend
from enum import Enum
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Resend setup
resend.api_key = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'adl-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

# Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

app = FastAPI(title="Auto Discount Location B2B API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

# ========== ENUMS ==========
class UserRole(str, Enum):
    ADMIN = "admin"
    AGENT = "agent"
    COMPANY = "company"
    INFLUENCER = "influencer"

class ReservationStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPAID = "prepaid"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"

class ChallengeStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    UPCOMING = "upcoming"

# ========== MODELS ==========
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    role: UserRole
    language: str = "fr"

class UserCreate(UserBase):
    password: str
    # Onboarding fields
    company_name: Optional[str] = None
    siret: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = "France"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    is_active: bool = True
    commission_rate: Optional[float] = None  # For agents
    company_id: Optional[str] = None  # For company users
    network_id: Optional[str] = None  # For agents in networks

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class AgentProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    agency_name: str
    agency_address: Optional[str] = None
    agency_city: Optional[str] = None
    agency_country: Optional[str] = None
    license_number: Optional[str] = None
    commission_rate: float = 10.0  # Default 10%
    network_id: Optional[str] = None
    total_sales: float = 0.0
    total_commission: float = 0.0
    documents: List[str] = []
    is_verified: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CompanyProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    company_name: str
    siret: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    payment_type: str = "on_site"  # on_site, prepaid, invoice
    discount_rate: float = 0.0
    documents: List[str] = []
    authorized_drivers: List[Dict] = []
    is_verified: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class InfluencerProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    social_handles: Dict[str, str] = {}
    promo_codes: List[str] = []
    total_bookings: int = 0
    total_revenue: float = 0.0
    commission_rate: float = 5.0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class VehicleCategory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name_fr: str
    name_en: str
    code: str
    description_fr: Optional[str] = None
    description_en: Optional[str] = None
    is_active: bool = True

class Vehicle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category_id: str
    brand: str
    model: str
    name: str  # Nom commercial (ex: "Renault Clio")
    year: int
    passengers: int
    luggage: int
    doors: int
    transmission: str  # manual, automatic
    fuel_type: str  # petrol, diesel, electric, hybrid, gpl
    motorization: Optional[str] = None  # Alias de fuel_type pour compatibilité frontend
    image_url: Optional[str] = None
    images: List[Dict[str, Any]] = []  # [{url, name, size, provider}]
    description: Optional[str] = None
    features: List[str] = []  # Équipements (GPS, Climatisation, etc.)
    technical_specs: Dict[str, Any] = {}  # {engine, power, fuel_consumption, co2_emissions}
    tags: List[str] = []  # electric, hybrid, favorite, new, recommended, premium, familial
    stock_by_agency: List[Dict[str, Any]] = []  # [{agency_id, agency_name, quantity, status}]
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Agency(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    code: str
    address: str
    city: str
    country: str
    phone: Optional[str] = None
    email: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    opening_hours: Dict[str, Dict[str, str]] = {}
    image_url: Optional[str] = None
    is_active: bool = True

class Season(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    code: str
    start_date: str
    end_date: str
    multiplier: float = 1.0
    is_active: bool = True

class Pricing(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category_id: str
    agency_id: str
    season_id: Optional[str] = None
    daily_rate: float
    weekly_rate: Optional[float] = None
    monthly_rate: Optional[float] = None
    is_active: bool = True

class Option(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name_fr: str
    name_en: str
    code: str
    price_per_day: float
    price_per_rental: Optional[float] = None
    is_mandatory: bool = False
    is_active: bool = True

class Insurance(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name_fr: str
    name_en: str
    code: str
    price_per_day: float
    coverage_details_fr: Optional[str] = None
    coverage_details_en: Optional[str] = None
    is_active: bool = True

class Reservation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reference: str = Field(default_factory=lambda: f"ADL-{uuid.uuid4().hex[:8].upper()}")
    user_id: str
    agent_id: Optional[str] = None
    company_id: Optional[str] = None
    influencer_code: Optional[str] = None
    vehicle_category_id: str
    pickup_agency_id: str
    return_agency_id: str
    pickup_date: str
    return_date: str
    pickup_time: str
    return_time: str
    driver_info: Dict[str, Any]
    options: List[str] = []
    insurance_id: Optional[str] = None
    total_price: float
    commission_amount: float = 0.0
    status: ReservationStatus = ReservationStatus.PENDING
    payment_status: str = "pending"  # pending, prepaid, paid, refunded
    payment_method: str = "on_site"  # on_site, link, online
    payment_link_sent_at: Optional[str] = None
    deposit_status: str = "pending"  # pending, secured, released
    deposit_amount: float = 0.0
    swikly_id: Optional[str] = None
    stripe_session_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Challenge(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title_fr: str
    title_en: str
    description_fr: Optional[str] = None
    description_en: Optional[str] = None
    start_date: str
    end_date: str
    booking_period_start: Optional[str] = None
    booking_period_end: Optional[str] = None
    rental_period_start: Optional[str] = None
    rental_period_end: Optional[str] = None
    target_categories: List[str] = []
    reward_type: str  # bonus_commission, prize, both
    bonus_commission_rate: Optional[float] = None
    prize_description: Optional[str] = None
    tiers: List[Dict] = []  # [{min_bookings: 10, bonus: 2%}, ...]
    status: ChallengeStatus = ChallengeStatus.UPCOMING
    participants: List[str] = []
    leaderboard: List[Dict] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class BlogPost(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    author_id: str
    title_fr: str
    title_en: str
    content_fr: str
    content_en: str
    excerpt_fr: Optional[str] = None
    excerpt_en: Optional[str] = None
    image_url: Optional[str] = None
    tags: List[str] = []
    destination: Optional[str] = None
    status: str = "draft"  # draft, pending, published
    likes: int = 0
    shares: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    published_at: Optional[str] = None

class Event(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title_fr: str
    title_en: str
    description_fr: Optional[str] = None
    description_en: Optional[str] = None
    event_type: str  # webinar, workshop, meeting
    date: str
    time: str
    duration_minutes: int
    meeting_link: Optional[str] = None
    max_participants: Optional[int] = None
    registered_users: List[str] = []
    image_url: Optional[str] = None
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_id: str
    role: str  # user, assistant, agent
    content: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class FAQ(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question_fr: str
    question_en: str
    answer_fr: str
    answer_en: str
    category: str
    order: int = 0
    is_active: bool = True

class Network(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    is_active: bool = True

class AuditLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    action: str
    entity_type: str
    entity_id: str
    details: Dict = {}
    ip_address: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reservation_id: str
    amount: float
    currency: str = "EUR"
    payment_type: str  # prepayment, deposit
    stripe_session_id: Optional[str] = None
    status: str = "pending"  # pending, completed, failed, refunded
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ========== AUTH HELPERS ==========
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_admin(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ========== LOGGING ==========
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ========== AUTH ROUTES ==========
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_dict = user_data.model_dump()
    user_dict["password"] = hash_password(user_data.password)
    user_dict["id"] = str(uuid.uuid4())
    user_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    user_dict["is_active"] = True
    # Onboarding / email verification fields
    verification_token = secrets.token_urlsafe(32)
    user_dict["email_verified"] = False
    user_dict["verification_token"] = verification_token
    user_dict["verification_token_expires"] = (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()
    user_dict["onboarding_status"] = "pending_email"  # pending_email → pending_kbis → pending_review → approved
    user_dict["kbis_url"] = None
    user_dict["kbis_filename"] = None

    await db.users.insert_one(user_dict)

    # Send verification email
    await send_verification_email(user_dict["email"], user_dict["first_name"], verification_token)

    token = create_token(user_dict["id"], user_dict["role"])
    user_response = {k: v for k, v in user_dict.items() if k not in ["password", "_id", "verification_token"]}

    return TokenResponse(access_token=token, user=user_response)


@api_router.get("/auth/verify-email")
async def verify_email(token: str = Query(...)):
    user = await db.users.find_one({"verification_token": token})
    if not user:
        raise HTTPException(status_code=400, detail="Token invalide ou expiré")

    expires = datetime.fromisoformat(user["verification_token_expires"])
    if datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="Token expiré. Demandez un nouveau lien.")

    onboarding_status = user.get("onboarding_status", "pending_email")
    new_status = "pending_kbis" if onboarding_status == "pending_email" else onboarding_status

    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "email_verified": True,
            "verification_token": None,
            "onboarding_status": new_status
        }}
    )
    return {"message": "Email vérifié avec succès", "onboarding_status": new_status}


@api_router.post("/auth/resend-verification")
async def resend_verification(user: dict = Depends(get_current_user)):
    if user.get("email_verified"):
        raise HTTPException(status_code=400, detail="Email déjà vérifié")

    verification_token = secrets.token_urlsafe(32)
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "verification_token": verification_token,
            "verification_token_expires": (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()
        }}
    )
    await send_verification_email(user["email"], user["first_name"], verification_token)
    return {"message": "Email de vérification renvoyé"}


@api_router.post("/auth/upload-kbis")
async def upload_kbis(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    allowed_ext = {".pdf", ".jpg", ".jpeg", ".png"}
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in allowed_ext:
        raise HTTPException(status_code=400, detail="Format non accepté. Utilisez PDF, JPG ou PNG.")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Fichier trop grand (max 10 Mo)")

    file_id = str(uuid.uuid4())
    filename = f"{file_id}{file_ext}"
    kbis_dir = ROOT_DIR / "uploads" / "kbis"
    kbis_dir.mkdir(parents=True, exist_ok=True)

    async with aiofiles.open(kbis_dir / filename, 'wb') as f:
        await f.write(contents)

    kbis_url = f"/uploads/kbis/{filename}"
    new_status = "pending_review" if user.get("email_verified") else "pending_email"

    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "kbis_url": kbis_url,
            "kbis_filename": file.filename,
            "onboarding_status": new_status
        }}
    )
    return {"url": kbis_url, "filename": file.filename, "onboarding_status": new_status}


async def send_verification_email(email: str, first_name: str, token: str):
    if not resend.api_key:
        logger.warning("Resend API key not set — verification email not sent")
        return
    verify_url = f"{FRONTEND_URL}/verify-email?token={token}"
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [email],
            "subject": "Vérifiez votre adresse email — Auto Discount Location",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #3D3A6B; padding: 24px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Auto Discount Location</h1>
                </div>
                <div style="padding: 32px; background: #f9fafb;">
                    <h2 style="color: #3D3A6B;">Bonjour {first_name},</h2>
                    <p>Merci de vous être inscrit sur la plateforme B2B d'Auto Discount Location.</p>
                    <p>Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="{verify_url}"
                           style="background: #F5A623; color: white; padding: 14px 28px;
                                  border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                            Vérifier mon email
                        </a>
                    </div>
                    <p style="color: #666; font-size: 14px;">Ce lien expire dans 24 heures.</p>
                    <p style="color: #666; font-size: 14px;">Si vous n'avez pas créé de compte, ignorez cet email.</p>
                </div>
                <div style="padding: 16px; text-align: center; color: #999; font-size: 12px;">
                    © Auto Discount Location — Guadeloupe, Martinique, Guyane, Saint-Martin
                </div>
            </div>
            """
        }
        await asyncio.to_thread(resend.Emails.send, params)
    except Exception as e:
        logger.error(f"Failed to send verification email: {e}")

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token = create_token(user["id"], user["role"])
    user_response = {k: v for k, v in user.items() if k not in ["password", "_id", "verification_token"]}

    return TokenResponse(access_token=token, user=user_response)

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user

@api_router.put("/auth/profile")
async def update_profile(updates: Dict[str, Any], user: dict = Depends(get_current_user)):
    allowed_fields = ["first_name", "last_name", "phone", "language"]
    update_data = {k: v for k, v in updates.items() if k in allowed_fields}
    
    if update_data:
        await db.users.update_one({"id": user["id"]}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    return updated_user

# ========== AGENT ROUTES ==========
@api_router.post("/agents/profile")
async def create_agent_profile(profile: AgentProfile, user: dict = Depends(get_current_user)):
    if user["role"] != "agent":
        raise HTTPException(status_code=403, detail="Only agents can create agent profiles")
    
    profile_dict = profile.model_dump()
    profile_dict["user_id"] = user["id"]
    await db.agent_profiles.insert_one(profile_dict)
    return {"id": profile_dict["id"], "_id": 0}

@api_router.get("/agents/profile")
async def get_agent_profile(user: dict = Depends(get_current_user)):
    profile = await db.agent_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@api_router.get("/agents/dashboard")
async def get_agent_dashboard(user: dict = Depends(get_current_user)):
    if user["role"] != "agent":
        raise HTTPException(status_code=403, detail="Agent access required")
    
    profile = await db.agent_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    reservations = await db.reservations.find({"agent_id": user["id"]}, {"_id": 0}).to_list(100)
    
    # Calculate stats
    total_bookings = len(reservations)
    pending_bookings = len([r for r in reservations if r["status"] == "pending"])
    completed_bookings = len([r for r in reservations if r["status"] == "completed"])
    total_revenue = sum(r.get("total_price", 0) for r in reservations if r["status"] == "completed")
    total_commission = sum(r.get("commission_amount", 0) for r in reservations if r["status"] == "completed")
    
    # Active challenges
    active_challenges = await db.challenges.find(
        {"status": "active", "participants": user["id"]}, {"_id": 0}
    ).to_list(10)
    
    return {
        "profile": profile,
        "stats": {
            "total_bookings": total_bookings,
            "pending_bookings": pending_bookings,
            "completed_bookings": completed_bookings,
            "total_revenue": total_revenue,
            "total_commission": total_commission
        },
        "recent_reservations": reservations[:10],
        "active_challenges": active_challenges
    }

@api_router.get("/agents/commissions")
async def get_agent_commissions(
    month: Optional[int] = None,
    year: Optional[int] = None,
    user: dict = Depends(get_current_user)
):
    if user["role"] != "agent":
        raise HTTPException(status_code=403, detail="Agent access required")
    
    query = {"agent_id": user["id"], "status": "completed"}
    reservations = await db.reservations.find(query, {"_id": 0}).to_list(1000)
    
    # Filter by month/year if provided
    if month and year:
        reservations = [
            r for r in reservations 
            if r["created_at"].startswith(f"{year}-{str(month).zfill(2)}")
        ]
    
    total_commission = sum(r.get("commission_amount", 0) for r in reservations)
    
    return {
        "reservations": reservations,
        "total_commission": total_commission,
        "count": len(reservations)
    }

# ========== COMPANY ROUTES ==========
@api_router.post("/companies/profile")
async def create_company_profile(profile: CompanyProfile, user: dict = Depends(get_current_user)):
    if user["role"] != "company":
        raise HTTPException(status_code=403, detail="Only companies can create company profiles")
    
    profile_dict = profile.model_dump()
    profile_dict["user_id"] = user["id"]
    await db.company_profiles.insert_one(profile_dict)
    return {"id": profile_dict["id"]}

@api_router.get("/companies/profile")
async def get_company_profile(user: dict = Depends(get_current_user)):
    profile = await db.company_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@api_router.post("/companies/drivers")
async def add_authorized_driver(driver: Dict[str, Any], user: dict = Depends(get_current_user)):
    if user["role"] != "company":
        raise HTTPException(status_code=403, detail="Company access required")
    
    driver["id"] = str(uuid.uuid4())
    await db.company_profiles.update_one(
        {"user_id": user["id"]},
        {"$push": {"authorized_drivers": driver}}
    )
    return driver

@api_router.get("/companies/drivers")
async def get_authorized_drivers(user: dict = Depends(get_current_user)):
    profile = await db.company_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    return profile.get("authorized_drivers", []) if profile else []

# ========== INFLUENCER ROUTES ==========
@api_router.post("/influencers/profile")
async def create_influencer_profile(profile: InfluencerProfile, user: dict = Depends(get_current_user)):
    if user["role"] != "influencer":
        raise HTTPException(status_code=403, detail="Only influencers can create profiles")
    
    profile_dict = profile.model_dump()
    profile_dict["user_id"] = user["id"]
    await db.influencer_profiles.insert_one(profile_dict)
    return {"id": profile_dict["id"]}

@api_router.get("/influencers/dashboard")
async def get_influencer_dashboard(user: dict = Depends(get_current_user)):
    if user["role"] != "influencer":
        raise HTTPException(status_code=403, detail="Influencer access required")
    
    profile = await db.influencer_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    
    # Get reservations with influencer codes
    codes = profile.get("promo_codes", []) if profile else []
    reservations = await db.reservations.find(
        {"influencer_code": {"$in": codes}}, {"_id": 0}
    ).to_list(100)
    
    return {
        "profile": profile,
        "stats": {
            "total_bookings": len(reservations),
            "total_revenue": sum(r.get("total_price", 0) for r in reservations),
            "codes_count": len(codes)
        },
        "code_performance": {
            code: len([r for r in reservations if r.get("influencer_code") == code])
            for code in codes
        }
    }

# ========== VEHICLE ROUTES ==========
@api_router.get("/vehicles/categories")
async def get_categories():
    categories = await db.vehicle_categories.find({"is_active": True}, {"_id": 0}).to_list(100)
    return categories

@api_router.get("/vehicles")
async def get_vehicles(
    category_id: Optional[str] = None,
    fuel_type: Optional[str] = None,
    transmission: Optional[str] = None,
    passengers: Optional[int] = None
):
    query = {"is_active": True}
    if category_id:
        query["category_id"] = category_id
    if fuel_type:
        query["fuel_type"] = fuel_type
    if transmission:
        query["transmission"] = transmission
    if passengers:
        query["passengers"] = {"$gte": passengers}
    
    vehicles = await db.vehicles.find(query, {"_id": 0}).to_list(100)
    return vehicles

@api_router.get("/vehicles/{vehicle_id}")
async def get_vehicle(vehicle_id: str):
    vehicle = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

# ========== AGENCY ROUTES ==========
@api_router.get("/agencies")
async def get_agencies(city: Optional[str] = None, country: Optional[str] = None):
    query = {"is_active": True}
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    if country:
        query["country"] = {"$regex": country, "$options": "i"}
    
    agencies = await db.agencies.find(query, {"_id": 0}).to_list(100)
    return agencies

@api_router.get("/agencies/{agency_id}")
async def get_agency(agency_id: str):
    agency = await db.agencies.find_one({"id": agency_id}, {"_id": 0})
    if not agency:
        raise HTTPException(status_code=404, detail="Agency not found")
    return agency

@api_router.get("/agencies/{agency_id}/hours")
async def get_agency_hours(agency_id: str, user: dict = Depends(get_current_user)):
    """Get opening hours and holidays for an agency"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    agency = await db.agencies.find_one({"id": agency_id}, {"_id": 0})
    if not agency:
        raise HTTPException(status_code=404, detail="Agency not found")

    # Return hours and holidays, or defaults if not set
    return {
        "hours": agency.get("hours", {}),
        "holidays": agency.get("holidays", [])
    }

@api_router.put("/agencies/{agency_id}/hours")
async def update_agency_hours(
    agency_id: str,
    hours: dict = Body(...),
    holidays: list = Body(...),
    user: dict = Depends(get_current_user)
):
    """Update opening hours and holidays for an agency"""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    result = await db.agencies.update_one(
        {"id": agency_id},
        {"$set": {
            "hours": hours,
            "holidays": holidays,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Agency not found")

    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "action": "agency_hours_updated",
        "resource_type": "agency",
        "resource_id": agency_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "details": {"hours_count": len(hours), "holidays_count": len(holidays)}
    })

    return {"success": True, "message": "Hours updated successfully"}

# ========== PRICING ROUTES ==========
@api_router.get("/pricing")
async def get_pricing(
    category_id: str,
    agency_id: str,
    pickup_date: str,
    return_date: str
):
    # Find applicable season
    season = await db.seasons.find_one({
        "is_active": True,
        "start_date": {"$lte": pickup_date},
        "end_date": {"$gte": pickup_date}
    }, {"_id": 0})
    
    # Find base pricing
    query = {"category_id": category_id, "agency_id": agency_id, "is_active": True}
    if season:
        query["season_id"] = season["id"]
    
    pricing = await db.pricing.find_one(query, {"_id": 0})
    if not pricing:
        # Fallback to default pricing
        pricing = await db.pricing.find_one(
            {"category_id": category_id, "agency_id": agency_id, "season_id": None, "is_active": True},
            {"_id": 0}
        )
    
    if not pricing:
        raise HTTPException(status_code=404, detail="Pricing not found")
    
    # Calculate number of days
    from datetime import datetime as dt
    pickup = dt.fromisoformat(pickup_date)
    return_dt = dt.fromisoformat(return_date)
    days = (return_dt - pickup).days or 1
    
    # Apply season multiplier
    multiplier = season.get("multiplier", 1.0) if season else 1.0
    daily_rate = pricing["daily_rate"] * multiplier
    
    total = daily_rate * days
    
    return {
        "daily_rate": daily_rate,
        "days": days,
        "subtotal": total,
        "season": season,
        "pricing_id": pricing["id"]
    }

@api_router.get("/options")
async def get_options():
    options = await db.options.find({"is_active": True}, {"_id": 0}).to_list(100)
    return options

@api_router.get("/insurances")
async def get_insurances():
    insurances = await db.insurances.find({"is_active": True}, {"_id": 0}).to_list(100)
    return insurances

# ========== RESERVATION ROUTES ==========
@api_router.post("/reservations")
async def create_reservation(reservation: Reservation, user: dict = Depends(get_current_user)):
    reservation_dict = reservation.model_dump()
    reservation_dict["user_id"] = user["id"]
    
    # Set agent/company based on role
    if user["role"] == "agent":
        reservation_dict["agent_id"] = user["id"]
        profile = await db.agent_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
        if profile:
            commission_rate = profile.get("commission_rate", 10.0) / 100
            reservation_dict["commission_amount"] = reservation_dict["total_price"] * commission_rate
    elif user["role"] == "company":
        profile = await db.company_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
        if profile:
            reservation_dict["company_id"] = profile["id"]
    
    await db.reservations.insert_one(reservation_dict)
    
    # Log action
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "action": "CREATE",
        "entity_type": "reservation",
        "entity_id": reservation_dict["id"],
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"id": reservation_dict["id"], "reference": reservation_dict["reference"]}

@api_router.get("/reservations")
async def get_reservations(
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    user: dict = Depends(get_current_user)
):
    query = {}
    
    if user["role"] == "agent":
        query["agent_id"] = user["id"]
    elif user["role"] == "company":
        profile = await db.company_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
        if profile:
            query["company_id"] = profile["id"]
    elif user["role"] != "admin":
        query["user_id"] = user["id"]
    
    if status:
        query["status"] = status
    
    skip = (page - 1) * limit
    reservations = await db.reservations.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.reservations.count_documents(query)
    
    return {
        "reservations": reservations,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@api_router.get("/reservations/{reservation_id}")
async def get_reservation(reservation_id: str, user: dict = Depends(get_current_user)):
    reservation = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    # Check access
    if user["role"] != "admin" and reservation.get("user_id") != user["id"] and reservation.get("agent_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return reservation

@api_router.put("/reservations/{reservation_id}")
async def update_reservation(
    reservation_id: str,
    updates: Dict[str, Any],
    user: dict = Depends(get_current_user)
):
    reservation = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    # Check access
    if user["role"] != "admin" and reservation.get("user_id") != user["id"] and reservation.get("agent_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.reservations.update_one({"id": reservation_id}, {"$set": updates})
    
    # Log action
    await db.audit_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "action": "UPDATE",
        "entity_type": "reservation",
        "entity_id": reservation_id,
        "details": updates,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"success": True}

@api_router.post("/reservations/{reservation_id}/cancel")
async def cancel_reservation(reservation_id: str, user: dict = Depends(get_current_user)):
    reservation = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    # Check 24h rule
    from datetime import datetime as dt
    pickup = dt.fromisoformat(reservation["pickup_date"])
    now = dt.now(timezone.utc)
    hours_until_pickup = (pickup - now).total_seconds() / 3600
    
    cancellation_fee = 0
    if hours_until_pickup < 24:
        # Apply cancellation fee
        cancellation_fee = 25  # Default fee
    
    await db.reservations.update_one(
        {"id": reservation_id},
        {"$set": {
            "status": "cancelled",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Adjust commission if late cancellation
    if cancellation_fee > 0 and reservation.get("agent_id"):
        await db.agent_profiles.update_one(
            {"user_id": reservation["agent_id"]},
            {"$inc": {"total_commission": -cancellation_fee}}
        )
    
    return {"success": True, "cancellation_fee": cancellation_fee}

@api_router.post("/reservations/{reservation_id}/duplicate")
async def duplicate_reservation(reservation_id: str, user: dict = Depends(get_current_user)):
    reservation = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    # Create new reservation
    new_reservation = reservation.copy()
    new_reservation["id"] = str(uuid.uuid4())
    new_reservation["reference"] = f"ADL-{uuid.uuid4().hex[:8].upper()}"
    new_reservation["status"] = "pending"
    new_reservation["created_at"] = datetime.now(timezone.utc).isoformat()
    new_reservation["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.reservations.insert_one(new_reservation)

    return {"id": new_reservation["id"], "reference": new_reservation["reference"]}

@api_router.post("/reservations/{reservation_id}/send-payment-link")
async def send_payment_link(
    reservation_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Envoie un lien de paiement au client par email
    """
    # Check permissions (admin or agent who created the reservation)
    if user["role"] not in ["admin", "agent"]:
        raise HTTPException(status_code=403, detail="Only admins and agents can send payment links")

    reservation = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    # Vérifier que c'est l'agent qui a créé la réservation
    if user["role"] == "agent" and reservation.get("agent_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    # Générer le lien de paiement (URL vers une page de paiement)
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    payment_url = f"{frontend_url}/payment/{reservation_id}"

    # Récupérer les infos du client
    customer = await db.users.find_one({"id": reservation["user_id"]}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Envoyer l'email avec le lien de paiement
    await send_payment_link_email(
        email=customer["email"],
        reservation_reference=reservation["reference"],
        amount=reservation["total_price"],
        payment_url=payment_url
    )

    # Mettre à jour la réservation
    await db.reservations.update_one(
        {"id": reservation_id},
        {
            "$set": {
                "payment_method": "link",
                "payment_link_sent_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )

    return {
        "success": True,
        "message": "Lien de paiement envoyé",
        "payment_url": payment_url
    }

@api_router.post("/reservations/{reservation_id}/confirm-payment-method")
async def confirm_payment_method(
    reservation_id: str,
    payment_method: str = Body(...)
):
    """
    Confirme le choix de mode de paiement du client
    Accessible sans authentification (lien public)
    """
    reservation = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    # Mettre à jour le mode de paiement
    await db.reservations.update_one(
        {"id": reservation_id},
        {
            "$set": {
                "payment_method": payment_method,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )

    return {"success": True, "payment_method": payment_method}

@api_router.post("/payments/create-checkout-session")
async def create_checkout_session(
    reservation_id: str = Body(...)
):
    """
    Crée une session Stripe pour le paiement en ligne
    Accessible sans authentification (lien public)
    """
    reservation = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    # Vérifier que la réservation n'est pas déjà payée
    if reservation.get("payment_status") in ["paid", "prepaid"]:
        raise HTTPException(status_code=400, detail="Reservation already paid")

    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest

        stripe_key = os.environ.get('STRIPE_SECRET_KEY')
        if not stripe_key:
            raise HTTPException(status_code=500, detail="Stripe not configured")

        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        webhook_url = f"{os.environ.get('BACKEND_URL', 'http://localhost:8000')}/api/webhook/stripe"

        stripe_checkout = StripeCheckout(api_key=stripe_key, webhook_url=webhook_url)

        # Créer la session de paiement
        checkout_request = CheckoutSessionRequest(
            amount=int(reservation["total_price"] * 100),  # Convertir en centimes
            currency="eur",
            success_url=f"{frontend_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_url}/payment/{reservation_id}",
            metadata={
                "reservation_id": reservation_id,
                "reservation_reference": reservation["reference"]
            }
        )

        session = await stripe_checkout.create_checkout_session(checkout_request)

        # Sauvegarder la session Stripe dans la réservation
        await db.reservations.update_one(
            {"id": reservation_id},
            {
                "$set": {
                    "stripe_session_id": session.session_id,
                    "payment_method": "online",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )

        return {
            "checkout_url": session.checkout_url,
            "session_id": session.session_id
        }

    except Exception as e:
        logger.error(f"Error creating Stripe checkout session: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating payment session: {str(e)}")

# ========== CHALLENGES ROUTES ==========
@api_router.get("/challenges")
async def get_challenges(status: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    
    challenges = await db.challenges.find(query, {"_id": 0}).to_list(100)
    return challenges

@api_router.get("/challenges/{challenge_id}")
async def get_challenge(challenge_id: str):
    challenge = await db.challenges.find_one({"id": challenge_id}, {"_id": 0})
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return challenge

@api_router.post("/challenges/{challenge_id}/join")
async def join_challenge(challenge_id: str, user: dict = Depends(get_current_user)):
    if user["role"] != "agent":
        raise HTTPException(status_code=403, detail="Only agents can join challenges")
    
    await db.challenges.update_one(
        {"id": challenge_id},
        {"$addToSet": {"participants": user["id"]}}
    )
    return {"success": True}

# ========== BLOG ROUTES ==========
@api_router.get("/blog/posts")
async def get_blog_posts(
    status: str = "published",
    tag: Optional[str] = None,
    destination: Optional[str] = None,
    page: int = 1,
    limit: int = 10
):
    query = {"status": status}
    if tag:
        query["tags"] = tag
    if destination:
        query["destination"] = destination
    
    skip = (page - 1) * limit
    posts = await db.blog_posts.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.blog_posts.count_documents(query)
    
    return {"posts": posts, "total": total, "page": page, "pages": (total + limit - 1) // limit}

@api_router.get("/blog/posts/{post_id}")
async def get_blog_post(post_id: str):
    post = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@api_router.post("/blog/posts")
async def create_blog_post(post: BlogPost, user: dict = Depends(get_current_user)):
    post_dict = post.model_dump()
    post_dict["author_id"] = user["id"]
    post_dict["status"] = "pending" if user["role"] != "admin" else "published"
    
    await db.blog_posts.insert_one(post_dict)
    return {"id": post_dict["id"]}

# ========== EVENTS ROUTES ==========
@api_router.get("/events")
async def get_events(upcoming_only: bool = True):
    query = {"is_active": True}
    if upcoming_only:
        query["date"] = {"$gte": datetime.now(timezone.utc).isoformat()[:10]}
    
    events = await db.events.find(query, {"_id": 0}).to_list(100)
    return events

@api_router.post("/events/{event_id}/register")
async def register_for_event(event_id: str, user: dict = Depends(get_current_user)):
    event = await db.events.find_one({"id": event_id}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event.get("max_participants") and len(event.get("registered_users", [])) >= event["max_participants"]:
        raise HTTPException(status_code=400, detail="Event is full")
    
    await db.events.update_one(
        {"id": event_id},
        {"$addToSet": {"registered_users": user["id"]}}
    )
    
    return {"success": True}

# ========== FAQ ROUTES ==========
@api_router.get("/faq")
async def get_faq(category: Optional[str] = None):
    query = {"is_active": True}
    if category:
        query["category"] = category
    
    faqs = await db.faqs.find(query, {"_id": 0}).sort("order", 1).to_list(100)
    return faqs

# ========== CHAT ROUTES ==========
@api_router.post("/chat/message")
async def send_chat_message(
    message: str = Body(...),
    session_id: str = Body(...),
    user: dict = Depends(get_current_user)
):
    # Save user message
    user_msg = {
        "id": str(uuid.uuid4()),
        "session_id": session_id,
        "user_id": user["id"],
        "role": "user",
        "content": message,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.chat_messages.insert_one(user_msg)
    
    # Get AI response using Emergent LLM
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        # Get conversation history
        history = await db.chat_messages.find(
            {"session_id": session_id}, {"_id": 0}
        ).sort("created_at", 1).to_list(20)
        
        # Build system message
        system_message = """Tu es l'assistant virtuel d'Auto Discount Location, spécialisé dans la location de véhicules.
Tu aides les agents de voyage, les entreprises et les influenceurs avec leurs réservations et questions.
Réponds de manière professionnelle, concise et utile. Tu parles français et anglais.
Si tu ne connais pas la réponse, suggère de contacter l'équipe support."""
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system_message
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=message)
        response = await chat.send_message(user_message)
        
        # Save AI response
        ai_msg = {
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "user_id": "system",
            "role": "assistant",
            "content": response,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.chat_messages.insert_one(ai_msg)
        
        return {"response": response, "message_id": ai_msg["id"]}
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return {"response": "Je suis désolé, je rencontre un problème technique. Veuillez réessayer ou contacter notre équipe.", "error": True}

@api_router.get("/chat/history/{session_id}")
async def get_chat_history(session_id: str, user: dict = Depends(get_current_user)):
    messages = await db.chat_messages.find(
        {"session_id": session_id}, {"_id": 0}
    ).sort("created_at", 1).to_list(100)
    return messages

# ========== INTRANET ROUTES ==========
@api_router.get("/intranet/announcements")
async def get_intranet_announcements(user: dict = Depends(get_current_user)):
    """
    Récupère les actualités de l'intranet pour les partenaires
    """
    # Récupérer les annonces selon le rôle de l'utilisateur
    query = {
        "$or": [
            {"target_roles": user["role"]},
            {"target_roles": "all"}
        ],
        "is_active": True
    }

    announcements = await db.intranet_announcements.find(
        query, {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)

    return {"announcements": announcements}

@api_router.get("/intranet/documents")
async def get_intranet_documents(
    category: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    """
    Récupère les documents de l'intranet (guides, contrats, etc.)
    """
    query = {
        "$or": [
            {"target_roles": user["role"]},
            {"target_roles": "all"}
        ],
        "is_active": True
    }

    if category:
        query["category"] = category

    documents = await db.intranet_documents.find(
        query, {"_id": 0}
    ).sort("created_at", -1).to_list(100)

    return {"documents": documents}

@api_router.get("/intranet/documents/{document_id}/download")
async def download_intranet_document(
    document_id: str,
    user: dict = Depends(get_current_user)
):
    """
    Télécharge un document de l'intranet
    """
    document = await db.intranet_documents.find_one({"id": document_id}, {"_id": 0})
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Vérifier les permissions
    if user["role"] not in document.get("target_roles", []) and "all" not in document.get("target_roles", []):
        raise HTTPException(status_code=403, detail="Access denied")

    # TODO: Implémenter le téléchargement réel du fichier
    # Pour l'instant, retourner l'URL du document
    return {
        "url": document.get("file_url", ""),
        "filename": document.get("filename", "document.pdf")
    }

@api_router.get("/intranet/trainings")
async def get_intranet_trainings(user: dict = Depends(get_current_user)):
    """
    Récupère les formations disponibles pour le partenaire
    """
    query = {
        "$or": [
            {"target_roles": user["role"]},
            {"target_roles": "all"}
        ],
        "is_active": True
    }

    trainings = await db.intranet_trainings.find(
        query, {"_id": 0}
    ).sort("order", 1).to_list(50)

    # Récupérer la progression de l'utilisateur
    user_progress = await db.training_progress.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).to_list(100)

    # Associer la progression aux formations
    progress_dict = {p["training_id"]: p.get("progress", 0) for p in user_progress}
    for training in trainings:
        training["progress"] = progress_dict.get(training["id"], 0)

    return {"trainings": trainings}

@api_router.post("/intranet/trainings/{training_id}/progress")
async def update_training_progress(
    training_id: str,
    progress: int = Body(...),
    user: dict = Depends(get_current_user)
):
    """
    Met à jour la progression d'une formation
    """
    await db.training_progress.update_one(
        {"user_id": user["id"], "training_id": training_id},
        {
            "$set": {
                "progress": progress,
                "updated_at": datetime.now(timezone.utc).isoformat()
            },
            "$setOnInsert": {
                "id": str(uuid.uuid4()),
                "user_id": user["id"],
                "training_id": training_id,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        },
        upsert=True
    )

    return {"success": True, "progress": progress}

# ========== ADMIN ROUTES ==========
@api_router.get("/admin/users")
async def admin_get_users(
    role: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    admin: dict = Depends(require_admin)
):
    query = {}
    if role:
        query["role"] = role
    
    skip = (page - 1) * limit
    users = await db.users.find(query, {"_id": 0, "password": 0}).skip(skip).limit(limit).to_list(limit)
    total = await db.users.count_documents(query)
    
    return {"users": users, "total": total, "page": page, "pages": (total + limit - 1) // limit}

@api_router.put("/admin/users/{user_id}")
async def admin_update_user(user_id: str, updates: Dict[str, Any], admin: dict = Depends(require_admin)):
    await db.users.update_one({"id": user_id}, {"$set": updates})
    return {"success": True}

@api_router.post("/admin/users/{user_id}/approve")
async def admin_approve_user(user_id: str, admin: dict = Depends(require_admin)):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"onboarding_status": "approved", "is_active": True, "approved_by": admin["id"], "approved_at": datetime.now(timezone.utc).isoformat()}}
    )
    # Send approval email
    if resend.api_key and user.get("email"):
        try:
            params = {
                "from": SENDER_EMAIL,
                "to": [user["email"]],
                "subject": "Votre compte partenaire est approuvé — Auto Discount Location",
                "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #3D3A6B; padding: 24px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Auto Discount Location</h1>
                    </div>
                    <div style="padding: 32px; background: #f9fafb;">
                        <h2 style="color: #3D3A6B;">Bonjour {user.get('first_name', '')},</h2>
                        <p>Bonne nouvelle ! Votre dossier partenaire a été <strong style="color: #22c55e;">approuvé</strong>.</p>
                        <p>Vous pouvez maintenant vous connecter à la plateforme et commencer à effectuer des réservations.</p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="{FRONTEND_URL}/login"
                               style="background: #F5A623; color: white; padding: 14px 28px;
                                      border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                                Accéder à la plateforme
                            </a>
                        </div>
                    </div>
                    <div style="padding: 16px; text-align: center; color: #999; font-size: 12px;">
                        © Auto Discount Location — Guadeloupe, Martinique, Guyane, Saint-Martin
                    </div>
                </div>
                """
            }
            await asyncio.to_thread(resend.Emails.send, params)
        except Exception as e:
            logger.error(f"Failed to send approval email: {e}")
    return {"success": True, "message": "Partenaire approuvé"}

@api_router.post("/admin/users/{user_id}/reject")
async def admin_reject_user(user_id: str, reason: str = Body(..., embed=True), admin: dict = Depends(require_admin)):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"onboarding_status": "rejected", "is_active": False, "rejection_reason": reason, "rejected_by": admin["id"], "rejected_at": datetime.now(timezone.utc).isoformat()}}
    )
    if resend.api_key and user.get("email"):
        try:
            params = {
                "from": SENDER_EMAIL,
                "to": [user["email"]],
                "subject": "Mise à jour de votre dossier partenaire — Auto Discount Location",
                "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #3D3A6B; padding: 24px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Auto Discount Location</h1>
                    </div>
                    <div style="padding: 32px; background: #f9fafb;">
                        <h2 style="color: #3D3A6B;">Bonjour {user.get('first_name', '')},</h2>
                        <p>Après examen de votre dossier, nous ne pouvons pas l'approuver pour le motif suivant :</p>
                        <div style="background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; margin: 16px 0;">
                            <p style="color: #dc2626; margin: 0;">{reason}</p>
                        </div>
                        <p>Pour toute question, contactez notre équipe.</p>
                    </div>
                </div>
                """
            }
            await asyncio.to_thread(resend.Emails.send, params)
        except Exception as e:
            logger.error(f"Failed to send rejection email: {e}")
    return {"success": True, "message": "Partenaire rejeté"}

@api_router.post("/admin/vehicles/categories")
async def admin_create_category(category: VehicleCategory, admin: dict = Depends(require_admin)):
    cat_dict = category.model_dump()
    await db.vehicle_categories.insert_one(cat_dict)
    return {"id": cat_dict["id"]}

@api_router.post("/admin/vehicles")
async def admin_create_vehicle(vehicle: Vehicle, admin: dict = Depends(require_admin)):
    veh_dict = vehicle.model_dump()
    await db.vehicles.insert_one(veh_dict)
    return {"id": veh_dict["id"]}

@api_router.put("/admin/vehicles/{vehicle_id}")
async def admin_update_vehicle(vehicle_id: str, updates: Dict[str, Any], admin: dict = Depends(require_admin)):
    await db.vehicles.update_one({"id": vehicle_id}, {"$set": updates})
    return {"success": True}

@api_router.post("/admin/agencies")
async def admin_create_agency(agency: Agency, admin: dict = Depends(require_admin)):
    agency_dict = agency.model_dump()
    await db.agencies.insert_one(agency_dict)
    return {"id": agency_dict["id"]}

@api_router.put("/admin/agencies/{agency_id}")
async def admin_update_agency(agency_id: str, updates: Dict[str, Any], admin: dict = Depends(require_admin)):
    await db.agencies.update_one({"id": agency_id}, {"$set": updates})
    return {"success": True}

@api_router.post("/admin/seasons")
async def admin_create_season(season: Season, admin: dict = Depends(require_admin)):
    season_dict = season.model_dump()
    await db.seasons.insert_one(season_dict)
    return {"id": season_dict["id"]}

@api_router.post("/admin/pricing")
async def admin_create_pricing(pricing: Pricing, admin: dict = Depends(require_admin)):
    pricing_dict = pricing.model_dump()
    await db.pricing.insert_one(pricing_dict)
    return {"id": pricing_dict["id"]}

@api_router.post("/admin/options")
async def admin_create_option(option: Option, admin: dict = Depends(require_admin)):
    opt_dict = option.model_dump()
    await db.options.insert_one(opt_dict)
    return {"id": opt_dict["id"]}

@api_router.post("/admin/insurances")
async def admin_create_insurance(insurance: Insurance, admin: dict = Depends(require_admin)):
    ins_dict = insurance.model_dump()
    await db.insurances.insert_one(ins_dict)
    return {"id": ins_dict["id"]}

@api_router.post("/admin/challenges")
async def admin_create_challenge(challenge: Challenge, admin: dict = Depends(require_admin)):
    ch_dict = challenge.model_dump()
    await db.challenges.insert_one(ch_dict)
    return {"id": ch_dict["id"]}

@api_router.put("/admin/challenges/{challenge_id}")
async def admin_update_challenge(challenge_id: str, updates: Dict[str, Any], admin: dict = Depends(require_admin)):
    await db.challenges.update_one({"id": challenge_id}, {"$set": updates})
    return {"success": True}

@api_router.post("/admin/events")
async def admin_create_event(event: Event, admin: dict = Depends(require_admin)):
    ev_dict = event.model_dump()
    await db.events.insert_one(ev_dict)
    return {"id": ev_dict["id"]}

@api_router.post("/admin/faq")
async def admin_create_faq(faq: FAQ, admin: dict = Depends(require_admin)):
    faq_dict = faq.model_dump()
    await db.faqs.insert_one(faq_dict)
    return {"id": faq_dict["id"]}

@api_router.get("/admin/audit-logs")
async def admin_get_audit_logs(
    entity_type: Optional[str] = None,
    user_id: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
    admin: dict = Depends(require_admin)
):
    query = {}
    if entity_type:
        query["entity_type"] = entity_type
    if user_id:
        query["user_id"] = user_id
    
    skip = (page - 1) * limit
    logs = await db.audit_logs.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.audit_logs.count_documents(query)
    
    return {"logs": logs, "total": total, "page": page, "pages": (total + limit - 1) // limit}

@api_router.get("/admin/stats")
async def admin_get_stats(admin: dict = Depends(require_admin)):
    total_users = await db.users.count_documents({})
    total_agents = await db.users.count_documents({"role": "agent"})
    total_companies = await db.users.count_documents({"role": "company"})
    total_reservations = await db.reservations.count_documents({})
    pending_reservations = await db.reservations.count_documents({"status": "pending"})
    completed_reservations = await db.reservations.count_documents({"status": "completed"})
    
    # Revenue calculation
    completed = await db.reservations.find({"status": "completed"}, {"_id": 0}).to_list(10000)
    total_revenue = sum(r.get("total_price", 0) for r in completed)
    
    return {
        "users": {
            "total": total_users,
            "agents": total_agents,
            "companies": total_companies
        },
        "reservations": {
            "total": total_reservations,
            "pending": pending_reservations,
            "completed": completed_reservations
        },
        "revenue": {
            "total": total_revenue
        }
    }

@api_router.get("/admin/reservations")
async def admin_get_all_reservations(
    status: Optional[str] = None,
    agent_id: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    admin: dict = Depends(require_admin)
):
    query = {}
    if status:
        query["status"] = status
    if agent_id:
        query["agent_id"] = agent_id
    
    skip = (page - 1) * limit
    reservations = await db.reservations.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.reservations.count_documents(query)
    
    return {"reservations": reservations, "total": total, "page": page, "pages": (total + limit - 1) // limit}

@api_router.put("/admin/reservations/{reservation_id}/status")
async def admin_update_reservation_status(
    reservation_id: str,
    status: str = Body(...),
    admin: dict = Depends(require_admin)
):
    await db.reservations.update_one(
        {"id": reservation_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True}

@api_router.put("/admin/blog/posts/{post_id}/status")
async def admin_update_post_status(
    post_id: str,
    status: str = Body(...),
    admin: dict = Depends(require_admin)
):
    update_data = {"status": status}
    if status == "published":
        update_data["published_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.blog_posts.update_one({"id": post_id}, {"$set": update_data})
    return {"success": True}

# ========== EXPORT ROUTES ==========
@api_router.get("/admin/export/reservations")
async def export_reservations(admin: dict = Depends(require_admin)):
    reservations = await db.reservations.find({}, {"_id": 0}).to_list(10000)
    return {"data": reservations, "count": len(reservations)}

@api_router.get("/admin/export/users")
async def export_users(admin: dict = Depends(require_admin)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(10000)
    return {"data": users, "count": len(users)}

@api_router.get("/admin/export/commissions")
async def export_commissions(
    month: Optional[int] = None,
    year: Optional[int] = None,
    admin: dict = Depends(require_admin)
):
    query = {"status": "completed", "agent_id": {"$exists": True, "$ne": None}}
    reservations = await db.reservations.find(query, {"_id": 0}).to_list(10000)
    
    if month and year:
        reservations = [
            r for r in reservations 
            if r["created_at"].startswith(f"{year}-{str(month).zfill(2)}")
        ]
    
    # Group by agent
    agent_commissions = {}
    for r in reservations:
        agent_id = r.get("agent_id")
        if agent_id not in agent_commissions:
            agent_commissions[agent_id] = {"total": 0, "count": 0}
        agent_commissions[agent_id]["total"] += r.get("commission_amount", 0)
        agent_commissions[agent_id]["count"] += 1
    
    return {"data": agent_commissions, "reservations": reservations}

# ========== NETWORKS ROUTES ==========
@api_router.get("/networks")
async def get_networks():
    networks = await db.networks.find({"is_active": True}, {"_id": 0}).to_list(100)
    return networks

@api_router.get("/networks/{network_id}/leaderboard")
async def get_network_leaderboard(network_id: str):
    # Get all agents in network
    agents = await db.agent_profiles.find({"network_id": network_id}, {"_id": 0}).to_list(100)
    
    # Sort by total sales
    leaderboard = sorted(agents, key=lambda x: x.get("total_sales", 0), reverse=True)
    
    return leaderboard

# ========== STRIPE PAYMENT ROUTES ==========
@api_router.post("/payments/create-link")
async def create_payment_link(
    request: Request,
    reservation_id: str = Body(...),
    amount: float = Body(...),
    payment_type: str = Body(...),  # prepayment or deposit
    user: dict = Depends(get_current_user)
):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
    
    stripe_key = os.environ.get('STRIPE_API_KEY')
    if not stripe_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=stripe_key, webhook_url=webhook_url)
    
    # Get frontend URL from request origin
    origin = request.headers.get("origin", host_url)
    success_url = f"{origin}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/payment/cancel"
    
    checkout_request = CheckoutSessionRequest(
        amount=float(amount),
        currency="eur",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "reservation_id": reservation_id,
            "payment_type": payment_type,
            "user_id": user["id"]
        }
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Save transaction
    transaction = {
        "id": str(uuid.uuid4()),
        "reservation_id": reservation_id,
        "amount": amount,
        "currency": "EUR",
        "payment_type": payment_type,
        "stripe_session_id": session.session_id,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(transaction)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    stripe_key = os.environ.get('STRIPE_API_KEY')
    if not stripe_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    stripe_checkout = StripeCheckout(api_key=stripe_key, webhook_url="")
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction and reservation if paid
    if status.payment_status == "paid":
        transaction = await db.payment_transactions.find_one({"stripe_session_id": session_id}, {"_id": 0})
        if transaction and transaction.get("status") != "completed":
            await db.payment_transactions.update_one(
                {"stripe_session_id": session_id},
                {"$set": {"status": "completed"}}
            )
            
            # Update reservation
            if transaction.get("payment_type") == "prepayment":
                await db.reservations.update_one(
                    {"id": transaction["reservation_id"]},
                    {"$set": {"payment_status": "prepaid", "status": "prepaid"}}
                )
            elif transaction.get("payment_type") == "deposit":
                await db.reservations.update_one(
                    {"id": transaction["reservation_id"]},
                    {"$set": {"deposit_status": "secured"}}
                )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount": status.amount_total / 100
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    stripe_key = os.environ.get('STRIPE_API_KEY')
    stripe_checkout = StripeCheckout(api_key=stripe_key, webhook_url="")
    
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            await db.payment_transactions.update_one(
                {"stripe_session_id": webhook_response.session_id},
                {"$set": {"status": "completed"}}
            )
        
        return {"received": True}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"received": True, "error": str(e)}

# ========== SWIKLY CAUTION ROUTES ==========
@api_router.post("/swikly/create-deposit")
async def create_swikly_deposit(
    reservation_id: str = Body(...),
    amount: float = Body(...),
    customer_email: str = Body(...),
    customer_name: str = Body(...),
    user: dict = Depends(get_current_user)
):
    """Create a Swikly deposit request for a reservation"""
    if user["role"] not in ["admin", "agent"]:
        raise HTTPException(status_code=403, detail="Only admin and agents can create deposits")

    # Get reservation
    reservation = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    swikly_api_key = os.environ.get('SWIKLY_API_KEY')
    if not swikly_api_key:
        raise HTTPException(status_code=500, detail="Swikly not configured")

    try:
        # In a real implementation, we would call the Swikly API here
        # For now, we'll simulate the API call
        swikly_id = f"SWK-{uuid.uuid4().hex[:12].upper()}"

        # Update reservation with Swikly deposit info
        await db.reservations.update_one(
            {"id": reservation_id},
            {
                "$set": {
                    "deposit_amount": amount,
                    "deposit_status": "pending",
                    "swikly_id": swikly_id,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )

        # Log action
        await db.audit_logs.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "action": "swikly_deposit_created",
            "resource_type": "reservation",
            "resource_id": reservation_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "details": {
                "amount": amount,
                "swikly_id": swikly_id,
                "customer_email": customer_email
            }
        })

        # Send email to customer
        if resend.api_key:
            frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
            # In production, this would be the actual Swikly link
            swikly_link = f"{frontend_url}/swikly/{swikly_id}"

            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3D3A6B;">Auto Discount Location - Caution Swikly</h2>
                <p>Bonjour {customer_name},</p>
                <p>Pour finaliser votre réservation <strong>{reservation.get('reference', '')}</strong>, nous vous demandons de sécuriser une caution de <strong>{amount:.2f} €</strong> via Swikly.</p>
                <p>Swikly est un service sécurisé qui bloque temporairement le montant de la caution sur votre carte bancaire, sans débit.</p>
                <p style="margin: 30px 0;">
                    <a href="{swikly_link}" style="background-color: #3D3A6B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Sécuriser ma caution</a>
                </p>
                <p style="font-size: 12px; color: #666;">
                    Note: La caution sera libérée automatiquement après restitution du véhicule, sauf en cas de dommages ou de frais supplémentaires.
                </p>
                <p>Cordialement,<br>L'équipe Auto Discount Location</p>
            </div>
            """

            try:
                email_params = {
                    "from": SENDER_EMAIL,
                    "to": [customer_email],
                    "subject": f"Caution Swikly - Réservation {reservation.get('reference', '')}",
                    "html": html_content
                }
                await asyncio.to_thread(resend.Emails.send, email_params)
            except Exception as e:
                logger.error(f"Failed to send Swikly email: {e}")

        return {
            "success": True,
            "swikly_id": swikly_id,
            "message": "Swikly deposit request created and email sent"
        }

    except Exception as e:
        logger.error(f"Swikly deposit creation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create deposit: {str(e)}")

@api_router.post("/swikly/release-deposit")
async def release_swikly_deposit(
    reservation_id: str = Body(...),
    user: dict = Depends(get_current_user)
):
    """Release a Swikly deposit"""
    if user["role"] not in ["admin", "agent"]:
        raise HTTPException(status_code=403, detail="Only admin and agents can release deposits")

    # Get reservation
    reservation = await db.reservations.find_one({"id": reservation_id}, {"_id": 0})
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    if not reservation.get("swikly_id"):
        raise HTTPException(status_code=400, detail="No Swikly deposit found for this reservation")

    swikly_api_key = os.environ.get('SWIKLY_API_KEY')
    if not swikly_api_key:
        raise HTTPException(status_code=500, detail="Swikly not configured")

    try:
        # In a real implementation, we would call the Swikly API here to release the deposit
        # For now, we'll simulate the release

        # Update reservation
        await db.reservations.update_one(
            {"id": reservation_id},
            {
                "$set": {
                    "deposit_status": "released",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )

        # Log action
        await db.audit_logs.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "action": "swikly_deposit_released",
            "resource_type": "reservation",
            "resource_id": reservation_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "details": {
                "swikly_id": reservation.get("swikly_id"),
                "amount": reservation.get("deposit_amount", 0)
            }
        })

        # Send confirmation email to customer
        if resend.api_key and reservation.get("driver_info", {}).get("email"):
            customer_email = reservation["driver_info"]["email"]
            customer_name = f"{reservation['driver_info'].get('first_name', '')} {reservation['driver_info'].get('last_name', '')}"

            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #10B981;">Auto Discount Location - Caution libérée</h2>
                <p>Bonjour {customer_name},</p>
                <p>Nous avons le plaisir de vous informer que la caution de <strong>{reservation.get('deposit_amount', 0):.2f} €</strong> pour votre réservation <strong>{reservation.get('reference', '')}</strong> a été libérée.</p>
                <p>Le montant sera débloqué sur votre carte bancaire sous 3 à 5 jours ouvrés selon votre banque.</p>
                <p>Merci d'avoir choisi Auto Discount Location !</p>
                <p>Cordialement,<br>L'équipe Auto Discount Location</p>
            </div>
            """

            try:
                email_params = {
                    "from": SENDER_EMAIL,
                    "to": [customer_email],
                    "subject": f"Caution libérée - Réservation {reservation.get('reference', '')}",
                    "html": html_content
                }
                await asyncio.to_thread(resend.Emails.send, email_params)
            except Exception as e:
                logger.error(f"Failed to send release email: {e}")

        return {
            "success": True,
            "message": "Deposit released successfully"
        }

    except Exception as e:
        logger.error(f"Swikly deposit release error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to release deposit: {str(e)}")

@api_router.post("/swikly/webhook")
async def swikly_webhook(request: Request):
    """Handle Swikly webhook callbacks"""
    # In production, this would handle callbacks from Swikly when deposits are secured or released
    body = await request.json()

    # Example webhook handling
    swikly_id = body.get("transaction_id")
    status = body.get("status")  # 'secured', 'released', 'expired', etc.

    if swikly_id:
        # Update reservation based on status
        update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}

        if status == "secured":
            update_data["deposit_status"] = "secured"
        elif status == "released":
            update_data["deposit_status"] = "released"
        elif status in ["expired", "cancelled"]:
            update_data["deposit_status"] = "pending"

        await db.reservations.update_one(
            {"swikly_id": swikly_id},
            {"$set": update_data}
        )

    return {"received": True}

# ========== EMAIL ROUTES ==========
@api_router.post("/email/send-payment-link")
async def send_payment_link_email(
    email: EmailStr = Body(...),
    payment_url: str = Body(...),
    reservation_reference: str = Body(...),
    amount: float = Body(...),
    user: dict = Depends(get_current_user)
):
    if not resend.api_key:
        raise HTTPException(status_code=500, detail="Email service not configured")
    
    html_content = f"""
    <h2>Auto Discount Location - Lien de paiement</h2>
    <p>Bonjour,</p>
    <p>Voici votre lien de paiement pour la réservation <strong>{reservation_reference}</strong>.</p>
    <p>Montant: <strong>{amount:.2f} €</strong></p>
    <p><a href="{payment_url}" style="background-color: #F5A623; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Payer maintenant</a></p>
    <p>Cordialement,<br>L'équipe Auto Discount Location</p>
    """
    
    params = {
        "from": SENDER_EMAIL,
        "to": [email],
        "subject": f"Lien de paiement - Réservation {reservation_reference}",
        "html": html_content
    }
    
    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        return {"success": True, "email_id": result.get("id")}
    except Exception as e:
        logger.error(f"Email error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

# ========== FILE UPLOAD ==========
# Configuration
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

@api_router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    folder: str = Body("vehicles"),
    user: dict = Depends(get_current_user)
):
    """
    Upload a file to the backend storage
    Returns: {url, name, size, provider}
    """
    # Validation
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")

    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Read file content to check size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5 MB)")

    # Generate unique filename
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{file_ext}"

    # Create folder structure
    folder_path = UPLOAD_DIR / folder
    folder_path.mkdir(parents=True, exist_ok=True)

    # Save file
    file_path = folder_path / filename
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(contents)

    # Return URL (relative to backend)
    file_url = f"/uploads/{folder}/{filename}"

    return {
        "url": file_url,
        "name": file.filename,
        "size": len(contents),
        "provider": "backend"
    }

@api_router.post("/upload/signed-url")
async def get_cloudflare_signed_url(
    filename: str = Body(...),
    folder: str = Body("vehicles"),
    contentType: str = Body("image/jpeg"),
    user: dict = Depends(get_current_user)
):
    """
    Get a signed URL for direct upload to CloudFlare R2
    Note: Requires CloudFlare R2 credentials in .env
    """
    # TODO: Implement CloudFlare R2 integration
    # For now, return mock response
    raise HTTPException(
        status_code=501,
        detail="CloudFlare R2 integration not yet implemented. Use 'backend' provider instead."
    )

    # Example implementation:
    # import boto3
    # s3_client = boto3.client(
    #     's3',
    #     endpoint_url=os.getenv('CLOUDFLARE_R2_ENDPOINT'),
    #     aws_access_key_id=os.getenv('CLOUDFLARE_R2_ACCESS_KEY_ID'),
    #     aws_secret_access_key=os.getenv('CLOUDFLARE_R2_SECRET_ACCESS_KEY')
    # )
    #
    # file_key = f"{folder}/{uuid.uuid4()}{Path(filename).suffix}"
    # signed_url = s3_client.generate_presigned_url(
    #     'put_object',
    #     Params={'Bucket': os.getenv('CLOUDFLARE_R2_BUCKET'), 'Key': file_key, 'ContentType': contentType},
    #     ExpiresIn=3600
    # )
    # public_url = f"{os.getenv('CLOUDFLARE_R2_PUBLIC_URL')}/{file_key}"
    #
    # return {"signedUrl": signed_url, "publicUrl": public_url}

@api_router.post("/upload/s3-signed-url")
async def get_aws_s3_signed_url(
    filename: str = Body(...),
    folder: str = Body("vehicles"),
    contentType: str = Body("image/jpeg"),
    user: dict = Depends(get_current_user)
):
    """
    Get a signed URL for direct upload to AWS S3
    Note: Requires AWS S3 credentials in .env
    """
    # TODO: Implement AWS S3 integration
    raise HTTPException(
        status_code=501,
        detail="AWS S3 integration not yet implemented. Use 'backend' provider instead."
    )

    # Example implementation:
    # import boto3
    # s3_client = boto3.client(
    #     's3',
    #     region_name=os.getenv('AWS_REGION'),
    #     aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    #     aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
    # )
    #
    # file_key = f"{folder}/{uuid.uuid4()}{Path(filename).suffix}"
    # signed_url = s3_client.generate_presigned_url(
    #     'put_object',
    #     Params={'Bucket': os.getenv('AWS_S3_BUCKET'), 'Key': file_key, 'ContentType': contentType},
    #     ExpiresIn=3600
    # )
    # public_url = f"https://{os.getenv('AWS_S3_BUCKET')}.s3.amazonaws.com/{file_key}"
    #
    # return {"signedUrl": signed_url, "publicUrl": public_url}

@api_router.post("/upload/supabase")
async def get_supabase_upload_url(
    filename: str = Body(...),
    folder: str = Body("vehicles"),
    user: dict = Depends(get_current_user)
):
    """
    Get upload URL for Supabase Storage
    Note: Requires Supabase credentials in .env
    """
    # TODO: Implement Supabase Storage integration
    raise HTTPException(
        status_code=501,
        detail="Supabase integration not yet implemented. Use 'backend' provider instead."
    )

    # Example implementation:
    # from supabase import create_client
    # supabase = create_client(
    #     os.getenv('SUPABASE_URL'),
    #     os.getenv('SUPABASE_KEY')
    # )
    #
    # file_path = f"{folder}/{uuid.uuid4()}{Path(filename).suffix}"
    # upload_url = supabase.storage.from_('images').create_signed_upload_url(file_path)
    # public_url = supabase.storage.from_('images').get_public_url(file_path)
    #
    # return {"uploadUrl": upload_url, "publicUrl": public_url}

@api_router.delete("/upload")
async def delete_file(
    url: str = Body(...),
    user: dict = Depends(get_current_user)
):
    """
    Delete an uploaded file
    """
    try:
        # Extract file path from URL
        # Example URL: /uploads/vehicles/abc123.jpg
        if url.startswith("/uploads/"):
            file_path = UPLOAD_DIR / url.replace("/uploads/", "")
            if file_path.exists():
                file_path.unlink()
                return {"success": True, "message": "File deleted"}
            else:
                raise HTTPException(status_code=404, detail="File not found")
        else:
            # External URL (CloudFlare, S3, etc.) - would need provider-specific deletion
            raise HTTPException(
                status_code=400,
                detail="Can only delete files stored on backend"
            )
    except Exception as e:
        logger.error(f"Error deleting file: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")

# ========== SEED DATA ==========
@api_router.post("/admin/seed")
async def seed_database(admin: dict = Depends(require_admin)):
    """Seed database with test data"""
    
    # Categories
    categories = [
        {"id": "cat-eco", "name_fr": "Économique", "name_en": "Economy", "code": "ECO", "is_active": True},
        {"id": "cat-compact", "name_fr": "Compacte", "name_en": "Compact", "code": "CMP", "is_active": True},
        {"id": "cat-suv", "name_fr": "SUV", "name_en": "SUV", "code": "SUV", "is_active": True},
        {"id": "cat-premium", "name_fr": "Premium", "name_en": "Premium", "code": "PRM", "is_active": True},
        {"id": "cat-utility", "name_fr": "Utilitaire", "name_en": "Utility", "code": "UTL", "is_active": True},
    ]
    
    for cat in categories:
        await db.vehicle_categories.update_one({"id": cat["id"]}, {"$set": cat}, upsert=True)
    
    # Vehicles
    vehicles = [
        {"id": "veh-1", "category_id": "cat-eco", "brand": "Renault", "model": "Clio", "year": 2024, "passengers": 5, "luggage": 2, "doors": 5, "transmission": "manual", "fuel_type": "petrol", "tags": ["new"], "is_active": True, "image_url": "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800"},
        {"id": "veh-2", "category_id": "cat-compact", "brand": "Peugeot", "model": "308", "year": 2024, "passengers": 5, "luggage": 3, "doors": 5, "transmission": "automatic", "fuel_type": "diesel", "tags": ["recommended"], "is_active": True, "image_url": "https://images.pexels.com/photos/1035108/pexels-photo-1035108.jpeg?auto=compress&cs=tinysrgb&w=800"},
        {"id": "veh-3", "category_id": "cat-suv", "brand": "Dacia", "model": "Duster", "year": 2024, "passengers": 5, "luggage": 4, "doors": 5, "transmission": "manual", "fuel_type": "diesel", "tags": ["favorite"], "is_active": True, "image_url": "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=800"},
        {"id": "veh-4", "category_id": "cat-premium", "brand": "Mercedes", "model": "Classe C", "year": 2024, "passengers": 5, "luggage": 3, "doors": 4, "transmission": "automatic", "fuel_type": "hybrid", "tags": ["hybrid", "premium"], "is_active": True, "image_url": "https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=800"},
        {"id": "veh-5", "category_id": "cat-eco", "brand": "Tesla", "model": "Model 3", "year": 2024, "passengers": 5, "luggage": 2, "doors": 4, "transmission": "automatic", "fuel_type": "electric", "tags": ["electric", "new"], "is_active": True, "image_url": "https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800"},
        {"id": "veh-6", "category_id": "cat-utility", "brand": "Renault", "model": "Master", "year": 2024, "passengers": 3, "luggage": 10, "doors": 3, "transmission": "manual", "fuel_type": "diesel", "tags": [], "is_active": True, "image_url": "https://images.pexels.com/photos/2533092/pexels-photo-2533092.jpeg?auto=compress&cs=tinysrgb&w=800"},
    ]
    
    for veh in vehicles:
        await db.vehicles.update_one({"id": veh["id"]}, {"$set": veh}, upsert=True)
    
    # Agencies
    agencies = [
        {"id": "ag-gdp", "name": "Guadeloupe - Pointe-à-Pitre Aéroport", "code": "GDP", "address": "Aéroport Pôle Caraïbes", "city": "Pointe-à-Pitre", "country": "Guadeloupe", "phone": "+590 590 XX XX XX", "is_active": True, "image_url": "https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg?auto=compress&cs=tinysrgb&w=800"},
        {"id": "ag-mtq", "name": "Martinique - Fort-de-France Aéroport", "code": "MTQ", "address": "Aéroport Aimé Césaire", "city": "Fort-de-France", "country": "Martinique", "phone": "+596 596 XX XX XX", "is_active": True, "image_url": "https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg?auto=compress&cs=tinysrgb&w=800"},
        {"id": "ag-sxm", "name": "Saint-Martin - Aéroport", "code": "SXM", "address": "Aéroport Princess Juliana", "city": "Saint-Martin", "country": "Saint-Martin", "phone": "+590 590 XX XX XX", "is_active": True, "image_url": "https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg?auto=compress&cs=tinysrgb&w=800"},
    ]
    
    for ag in agencies:
        await db.agencies.update_one({"id": ag["id"]}, {"$set": ag}, upsert=True)
    
    # Seasons
    seasons = [
        {"id": "sea-low", "name": "Basse saison", "code": "LOW", "start_date": "2025-05-01", "end_date": "2025-11-14", "multiplier": 0.9, "is_active": True},
        {"id": "sea-mid", "name": "Moyenne saison", "code": "MID", "start_date": "2025-11-15", "end_date": "2025-12-14", "multiplier": 1.0, "is_active": True},
        {"id": "sea-high", "name": "Haute saison", "code": "HIGH", "start_date": "2025-12-15", "end_date": "2026-04-30", "multiplier": 1.3, "is_active": True},
    ]
    
    for sea in seasons:
        await db.seasons.update_one({"id": sea["id"]}, {"$set": sea}, upsert=True)
    
    # Pricing
    pricing_data = []
    for cat in categories:
        for ag in agencies:
            base_rate = {"cat-eco": 35, "cat-compact": 45, "cat-suv": 65, "cat-premium": 95, "cat-utility": 75}[cat["id"]]
            pricing_data.append({
                "id": f"price-{cat['id']}-{ag['id']}",
                "category_id": cat["id"],
                "agency_id": ag["id"],
                "daily_rate": base_rate,
                "weekly_rate": base_rate * 6,
                "is_active": True
            })
    
    for pr in pricing_data:
        await db.pricing.update_one({"id": pr["id"]}, {"$set": pr}, upsert=True)
    
    # Options
    options = [
        {"id": "opt-gps", "name_fr": "GPS", "name_en": "GPS", "code": "GPS", "price_per_day": 8, "is_active": True},
        {"id": "opt-child", "name_fr": "Siège enfant", "name_en": "Child seat", "code": "CHILD", "price_per_day": 5, "is_active": True},
        {"id": "opt-driver", "name_fr": "Conducteur additionnel", "name_en": "Additional driver", "code": "ADD", "price_per_rental": 30, "is_active": True},
    ]
    
    for opt in options:
        await db.options.update_one({"id": opt["id"]}, {"$set": opt}, upsert=True)
    
    # Insurances
    insurances = [
        {"id": "ins-basic", "name_fr": "Assurance de base", "name_en": "Basic insurance", "code": "BASIC", "price_per_day": 0, "coverage_details_fr": "Responsabilité civile incluse", "is_active": True},
        {"id": "ins-cdw", "name_fr": "CDW - Rachat de franchise", "name_en": "CDW - Collision Damage Waiver", "code": "CDW", "price_per_day": 12, "coverage_details_fr": "Réduction de la franchise à 300€", "is_active": True},
        {"id": "ins-full", "name_fr": "Protection totale", "name_en": "Full protection", "code": "FULL", "price_per_day": 18, "coverage_details_fr": "Franchise réduite à 0€", "is_active": True},
    ]
    
    for ins in insurances:
        await db.insurances.update_one({"id": ins["id"]}, {"$set": ins}, upsert=True)
    
    # FAQs
    faqs = [
        {"id": "faq-1", "question_fr": "Quels documents sont nécessaires pour louer un véhicule ?", "question_en": "What documents are required to rent a vehicle?", "answer_fr": "Permis de conduire valide, carte d'identité ou passeport, carte de crédit au nom du conducteur.", "answer_en": "Valid driver's license, ID card or passport, credit card in the driver's name.", "category": "rental", "order": 1, "is_active": True},
        {"id": "faq-2", "question_fr": "Quelle est la politique d'annulation ?", "question_en": "What is the cancellation policy?", "answer_fr": "Annulation gratuite jusqu'à 24h avant le départ. Au-delà, des frais de 25€ s'appliquent.", "answer_en": "Free cancellation up to 24 hours before pickup. After that, a €25 fee applies.", "category": "booking", "order": 2, "is_active": True},
        {"id": "faq-3", "question_fr": "Comment fonctionne la commission agent ?", "question_en": "How does the agent commission work?", "answer_fr": "La commission (10-17%) est calculée sur le montant HT et versée le mois suivant la clôture du contrat.", "answer_en": "Commission (10-17%) is calculated on the net amount and paid the month after contract closure.", "category": "agent", "order": 3, "is_active": True},
    ]
    
    for faq in faqs:
        await db.faqs.update_one({"id": faq["id"]}, {"$set": faq}, upsert=True)
    
    # Challenges
    challenges = [
        {
            "id": "chal-1",
            "title_fr": "Challenge Été 2025",
            "title_en": "Summer 2025 Challenge",
            "description_fr": "Réservez le plus de véhicules SUV pendant l'été et gagnez des bonus !",
            "description_en": "Book the most SUV vehicles during summer and win bonuses!",
            "start_date": "2025-06-01",
            "end_date": "2025-08-31",
            "target_categories": ["cat-suv"],
            "reward_type": "bonus_commission",
            "bonus_commission_rate": 2.0,
            "tiers": [
                {"min_bookings": 5, "bonus": 1.0},
                {"min_bookings": 10, "bonus": 2.0},
                {"min_bookings": 20, "bonus": 3.0}
            ],
            "status": "upcoming",
            "participants": [],
            "leaderboard": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    for ch in challenges:
        await db.challenges.update_one({"id": ch["id"]}, {"$set": ch}, upsert=True)
    
    return {"success": True, "message": "Database seeded successfully"}

# ========== HEALTH CHECK ==========
@api_router.get("/")
async def root():
    return {"message": "Auto Discount Location B2B API", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include router
app.include_router(api_router)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# CORS - Accepte toutes les origines localhost (développement)
cors_origins_env = os.environ.get('CORS_ORIGINS', '')
if cors_origins_env:
    cors_origins = cors_origins_env.split(',')
else:
    cors_origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:2000",
        "http://localhost:2001",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:2000",
        "http://0.0.0.0:3000",
        "http://0.0.0.0:2000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
