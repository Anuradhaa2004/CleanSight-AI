import email
import os
import smtplib
import uuid
import importlib
import base64
import secrets
import urllib.parse
import urllib.request
from datetime import datetime, timedelta
from email.message import EmailMessage
from io import BytesIO
from pathlib import Path

# --- STEP 1: LOAD ENV IMMEDIATELY ---
def _load_simple_env(path: Path) -> None:
    if not path.exists():
        return
    try:
        for raw_line in path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value
    except OSError:
        pass

from fastapi import BackgroundTasks, Depends, FastAPI, File, Form, Request, UploadFile
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware
from PIL import Image
from sqlalchemy import text
from sqlalchemy.orm import Session
# try:
#     from dotenv import load_dotenv
# except Exception:
#     def load_dotenv(*args, **kwargs):  # type: ignore[override]
#         return False

import models
from database import SessionLocal, cleanup_old_user_history, engine, get_db

# Load environment variables as early as possible.
_EARLY_BASE_DIR = Path(__file__).resolve().parent
_EARLY_ROOT_DIR = _EARLY_BASE_DIR.parent
_load_simple_env(_EARLY_ROOT_DIR / ".env")
_load_simple_env(_EARLY_BASE_DIR / ".env")

# Optional Authlib imports via dynamic loading to avoid hard import errors in IDE.
OAuth = None  # type: ignore[assignment]
OAuthError = Exception
AUTHLIB_AVAILABLE = False
try:
    _authlib_starlette = importlib.import_module("authlib.integrations.starlette_client")
    _authlib_errors = importlib.import_module("authlib.integrations.base_client.errors")
    OAuth = getattr(_authlib_starlette, "OAuth")
    OAuthError = getattr(_authlib_errors, "OAuthError", Exception)
    AUTHLIB_AVAILABLE = True
except Exception:
    pass

# --- STEP 2: CONFIGURATION ---
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
TEMPLATES_DIR = BASE_DIR / "templates"
UPLOADS_DIR = STATIC_DIR / "uploads"

# Fetching keys safely
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
SESSION_SECRET_KEY = os.getenv("SESSION_SECRET_KEY", "CLEANSIGHT_DEFAULT_SECRET_123")

# Email Config
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "anuradhagupta1829@gmail.com")
APP_PASSWORD = os.getenv("APP_PASSWORD", "tmlm fsyq cuxq xixa")
AUTHORITY_EMAIL = os.getenv("AUTHORITY_EMAIL", "anuradhagupta4752@gmail.com")
DEFAULT_ASSIGNED_VEHICLE = os.getenv("DEFAULT_ASSIGNED_VEHICLE", "MP-04-GV-1022")
SUPERVISOR_MOBILE = os.getenv("SUPERVISOR_MOBILE", "9644089676").strip()
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "").strip()
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "").strip()
TWILIO_FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER", "").strip()
SMS_ALERT_COOLDOWN_MINUTES = int(os.getenv("SMS_ALERT_COOLDOWN_MINUTES", "60"))
APP_BASE_URL = os.getenv("APP_BASE_URL", "http://127.0.0.1:8001").rstrip("/")
DEBUG_AI_LABELS = os.getenv("DEBUG_AI_LABELS", "false").strip().lower() in {"1", "true", "yes", "on"}
YOLO_MODEL = None
YOLO = None
YOLO_LOAD_ERROR = None
LAST_SMS_ALERT_AT: dict[str, datetime] = {}

app = FastAPI()

# --- STEP 3: MIDDLEWARE ---
app.add_middleware(SessionMiddleware, secret_key=SESSION_SECRET_KEY)

# --- STEP 4: OAUTH SETUP ---
oauth = OAuth() if AUTHLIB_AVAILABLE else None
if oauth and GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET:
    oauth.register(
        name="google",
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )
else:
    print("CRITICAL WARNING: Google Credentials not found in .env file!")

def ensure_ticket_columns() -> None:
    with engine.begin() as conn:
        cols = conn.execute(text("PRAGMA table_info(tickets)")).fetchall()
        column_names = {row[1] for row in cols}
        if "user_email" not in column_names:
            conn.execute(text("ALTER TABLE tickets ADD COLUMN user_email VARCHAR"))


models.Base.metadata.create_all(bind=engine)
ensure_ticket_columns()
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


try:
    ultralytics_module = importlib.import_module("ultralytics")
    YOLO = getattr(ultralytics_module, "YOLO", None)
    model_file = BASE_DIR / "yolov8n.pt"
    if YOLO is not None:
        YOLO_MODEL = YOLO(str(model_file if model_file.exists() else "yolov8n.pt"))
except Exception as exc:
    YOLO_MODEL = None
    YOLO_LOAD_ERROR = str(exc)
    print(f"YOLO load warning: {exc}")

app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
templates = Jinja2Templates(directory=str(TEMPLATES_DIR))


@app.on_event("startup")
async def startup_cleanup() -> None:
    cleanup_old_user_history(days=30, uploads_dir=UPLOADS_DIR)


def save_uploaded_image(file: UploadFile) -> tuple[str, Path, str]:
    extension = Path(file.filename or "").suffix or ".jpg"
    filename = f"{uuid.uuid4()}{extension}"
    file_path = UPLOADS_DIR / filename
    raw_bytes = file.file.read()
    with file_path.open("wb") as buffer:
        buffer.write(raw_bytes)
    image_base64 = base64.b64encode(raw_bytes).decode("utf-8")
    return f"/static/uploads/{filename}", file_path, image_base64

def categorize_waste(image_filename: str) -> str:
    """
    Filename/metadata based simulation category logic.
    Future mein isko stronger trained model logic se replace kiya ja sakta hai.
    """
    filename = (image_filename or "").lower()
    if "sewage" in filename or "drain" in filename:
        return "Sewage Waste"
    if "animal" in filename or "dead" in filename:
        return "Dead Animal"
    if "sewer" in filename or "damage" in filename or "pipe" in filename:
        return "Sewer Damage"
    return "General Waste"

def build_authority_email(
    new_ticket: models.Ticket,
    category: str,
    status: str,
    u_name: str,
    u_mobile: str,
    ward: int,
    u_address: str,
    lat: float,
    lon: float,
) -> tuple[str, str]:
    maps_link = f"http://google.com/maps?q={lat},{lon}"
    priority_label = "\U0001F6A8 [URGENT]" if status == "URGENT" else "\U0001F4E9 [NEW]"

    auth_body = f"""
{priority_label} WASTE COMPLAINT

Tracking ID: {new_ticket.tracking_id}
Category: {category}
Reporter: {u_name} ({u_mobile})
Ward No: {ward}

\U0001F4CD Address Provided: 
{u_address}

\U0001F5FA\ufe0f Exact Location: {maps_link}

Action Required...
"""
    subject = f"{priority_label} Report: Ward {ward}"
    return subject, auth_body


def _normalize_phone_for_sms(phone: str) -> str:
    raw = (phone or "").strip()
    if not raw:
        return ""
    if raw.startswith("+"):
        return "+" + "".join(ch for ch in raw[1:] if ch.isdigit())
    digits = "".join(ch for ch in raw if ch.isdigit())
    if len(digits) == 10:
        return f"+91{digits}"
    if len(digits) == 12 and digits.startswith("91"):
        return f"+{digits}"
    return f"+{digits}" if digits else ""


def send_supervisor_sms(location: str, open_count: int, time_elapsed_hours: float) -> bool:
    target_number = _normalize_phone_for_sms(SUPERVISOR_MOBILE)
    message = (
        f"[SYSTEM ALERT] CRITICAL in {location}. "
        f"Open complaints: {open_count}. "
        f"Oldest open: {time_elapsed_hours} hours."
    )

    if not target_number:
        print("[SYSTEM ALERT] SMS not sent: invalid supervisor mobile number.")
        return False

    if not (TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER):
        print(
            f"[SYSTEM ALERT] SMS not sent (Twilio not configured). "
            f"Target: {target_number}. Message: {message}"
        )
        return False

    twilio_url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json"
    payload = urllib.parse.urlencode(
        {
            "To": target_number,
            "From": TWILIO_FROM_NUMBER,
            "Body": message,
        }
    ).encode("utf-8")
    auth_header = base64.b64encode(
        f"{TWILIO_ACCOUNT_SID}:{TWILIO_AUTH_TOKEN}".encode("utf-8")
    ).decode("ascii")

    request_obj = urllib.request.Request(twilio_url, data=payload, method="POST")
    request_obj.add_header("Authorization", f"Basic {auth_header}")
    request_obj.add_header("Content-Type", "application/x-www-form-urlencoded")

    try:
        with urllib.request.urlopen(request_obj, timeout=12) as response:
            if 200 <= response.status < 300:
                print(f"[SYSTEM ALERT] SMS sent to Supervisor: {target_number}")
                return True
    except Exception as exc:
        print(f"[SYSTEM ALERT] SMS sending failed for {target_number}: {exc}")

    return False


def check_escalation_status(pincode: int | str, db: Session) -> dict[str, object]:
    area = str(pincode).strip()
    if not area:
        return {"location": "N/A", "open_count": 0, "time_elapsed_hours": 0.0, "priority": "NORMAL"}

    area_number = None
    try:
        area_number = int(area)
    except ValueError:
        area_number = None

    if area_number is None:
        return {
            "location": f"Ward/Pincode {area}",
            "open_count": 0,
            "time_elapsed_hours": 0.0,
            "priority": "NORMAL",
        }

    area_tickets = db.query(models.Ticket).filter(models.Ticket.ward_no == area_number).all()
    open_tickets = [
        ticket
        for ticket in area_tickets
        if (ticket.status or "").strip().upper() != "CLOSED"
    ]
    open_count = len(open_tickets)

    oldest_open = min((ticket.created_at for ticket in open_tickets if ticket.created_at), default=None)
    if oldest_open is None:
        time_elapsed_hours = 0.0
    else:
        time_elapsed_hours = max(0.0, round((datetime.utcnow() - oldest_open).total_seconds() / 3600, 2))

    priority = "CRITICAL" if (open_count >= 3 or time_elapsed_hours > 24) else "NORMAL"
    location = f"Ward/Pincode {area_number}"

    if priority == "CRITICAL":
        print(
            f"[SYSTEM ALERT] Sending SMS to Supervisor for Area: {location}. "
            f"Mobile: {SUPERVISOR_MOBILE}"
        )
        now_utc = datetime.utcnow()
        last_sent_at = LAST_SMS_ALERT_AT.get(location)
        cooldown_active = (
            last_sent_at is not None
            and (now_utc - last_sent_at) < timedelta(minutes=SMS_ALERT_COOLDOWN_MINUTES)
        )
        if not cooldown_active:
            if send_supervisor_sms(location, open_count, time_elapsed_hours):
                LAST_SMS_ALERT_AT[location] = now_utc

    return {
        "location": location,
        "open_count": open_count,
        "time_elapsed_hours": time_elapsed_hours,
        "priority": priority,
    }


def trigger_escalation_for_area(pincode: int | str) -> None:
    db = SessionLocal()
    try:
        check_escalation_status(pincode, db)
    except Exception as exc:
        print(f"[SYSTEM ALERT] Escalation background check failed for area {pincode}: {exc}")
    finally:
        db.close()


def detect_category_from_ai(image_base64: str) -> str:
    if YOLO_MODEL is None:
        return "General Waste (AI Offline)"

    try:
        payload = image_base64.split(",", 1)[1] if "," in image_base64 else image_base64
        image_bytes = base64.b64decode(payload)
        image_obj = Image.open(BytesIO(image_bytes)).convert("RGB")

        def collect_labels(confidence: float) -> set[str]:
            results = YOLO_MODEL(image_obj, conf=confidence, verbose=False)
            labels: set[str] = set()
            for box in results[0].boxes:
                class_id = int(box.cls.item() if hasattr(box.cls, "item") else box.cls)
                label = str(YOLO_MODEL.names[class_id]).lower()
                labels.add(label)
            return labels

        detected_labels = collect_labels(0.45)
        if DEBUG_AI_LABELS:
            print(f"AI labels @0.45: {sorted(detected_labels)}")

        sewage_labels = {"bundle of waste"}
        infra_labels = {
            "bench",
            "fire hydrant",
            "skateboard",
            "pipe",
            "tube",
            "sewer",
            "drain",
            "manhole",
            "leak",
            "leakage",
            "broken pipe",
            "sewer line",
            "sewerline",
            "water pipe",
        }
        dead_animal_labels = {"dog", "cat", "bird"}
        organic_labels = {"food", "apple", "orange", "broccoli", "carrot", "potted plant", "banana"}
        plastic_labels = {"bottle", "cup", "plastic", "handbag", "suitcase", "backpack", "frisbee"}
        metallic_labels = {"fork", "knife", "spoon", "can", "cell phone", "laptop", "tv"}

        def has_match(targets: set[str]) -> bool:
            return any(
                any((target in found_label) or (found_label in target) for target in targets)
                for found_label in detected_labels
            )
        if has_match(infra_labels):
            return "Infrastructure/Pipe Leakage"
        
        if has_match(sewage_labels):
            return "Sewage Waste"

        if has_match(dead_animal_labels):
            return "Dead Animal"

        if has_match(organic_labels):
            return "Organic Waste"

        if has_match(plastic_labels):
            return "Plastic Waste"

        if has_match(metallic_labels):
            return "Metallic Waste"

        # Broken pipe/sewer damage often has weak detections in generic YOLO.
        # Retry at lower confidence and only apply this as infrastructure fallback.
        low_conf_labels = collect_labels(0.25)
        if DEBUG_AI_LABELS:
            print(f"AI labels @0.25: {sorted(low_conf_labels)}")
        if any(
            any((target in found_label) or (found_label in target) for target in infra_labels)
            for found_label in low_conf_labels
        ):
            return "Infrastructure/Pipe Leakage"

        return "General Waste (AI Scanned)"

    except Exception as e:
        print(f"AI Classification Error: {e}")
        return "General Waste"

def send_email(to_email: str, subject: str, body: str) -> None:
    if not (SENDER_EMAIL and APP_PASSWORD and to_email):
        print("Email skipped: configure SENDER_EMAIL, APP_PASSWORD and target email.")
        return

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = SENDER_EMAIL
    msg["To"] = to_email
    msg.set_content(body)

    try:
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as smtp:
            smtp.login(SENDER_EMAIL, APP_PASSWORD)
            smtp.send_message(msg)
    except Exception as exc:
        print(f"Mail Error: {exc}")


def send_acceptance_email(ticket: models.Ticket) -> None:
    user_email = (ticket.user_email or "").strip()
    if not user_email:
        print(f"Acceptance email skipped: missing user_email for ticket {ticket.tracking_id}")
        return

    vehicle_number = ticket.vehicle_no or DEFAULT_ASSIGNED_VEHICLE
    subject = f"Action Taken: Complaint {ticket.tracking_id} Accepted"
    body = f"""Dear {ticket.user_name},

\u2705 Your complaint #{ticket.tracking_id} regarding {ticket.category} has been ACCEPTED.

Status: ASSIGNED
Assigned Vehicle: {vehicle_number}
Estimated Resolution: Within 12 Hours

Thank you for helping us keep our city clean!"""
    send_email(user_email, subject, body)


def send_verification_email(ticket: models.Ticket) -> None:
    user_email = (ticket.user_email or "").strip()
    if not user_email:
        print(f"Verification email skipped: missing user_email for ticket {ticket.tracking_id}")
        return

    verify_url = f"{APP_BASE_URL}/ai-report/{ticket.tracking_id}"
    subject = f"Verification Needed: Complaint {ticket.tracking_id}"

    plain_text = f"""Dear {ticket.user_name},

The authority has marked your complaint {ticket.tracking_id} as completed.
Please verify the cleanup from your Citizen Desk:
{verify_url}

If cleaned properly, confirm resolution.
If not cleaned, reopen the complaint.
"""

    html_body = f"""\
<html>
  <body style="margin:0;padding:0;background:#f6f8fb;font-family:Arial,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f8fb;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="620" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="background:#ff9800;padding:18px 24px;">
                <h2 style="margin:0;color:#ffffff;font-size:20px;line-height:1.3;">Citizen Verification Required</h2>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 12px;font-size:15px;">Hello {ticket.user_name},</p>
                <p style="margin:0 0 12px;font-size:15px;line-height:1.6;">
                  The authority has marked your complaint as completed.
                </p>
                <p style="margin:0 0 14px;font-size:15px;line-height:1.6;">
                  <strong>Tracking ID:</strong> {ticket.tracking_id}<br/>
                  <strong>Category:</strong> {ticket.category}
                </p>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">
                  Please verify whether the area was cleaned properly.
                </p>
                <a href="{verify_url}" style="display:inline-block;background:#ff9800;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:700;">
                  Verify Now
                </a>
                <p style="margin:20px 0 0;color:#6b7280;font-size:13px;">
                  If the issue is not resolved, you can reopen the complaint from your Citizen Desk.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
"""

    if not (SENDER_EMAIL and APP_PASSWORD and user_email):
        print("Verification email skipped: configure SENDER_EMAIL, APP_PASSWORD and target email.")
        return

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = SENDER_EMAIL
    msg["To"] = user_email
    msg.set_content(plain_text)
    msg.add_alternative(html_body, subtype="html")

    try:
        with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as smtp:
            smtp.login(SENDER_EMAIL, APP_PASSWORD)
            smtp.send_message(msg)
    except Exception as exc:
        print(f"Verification Mail Error: {exc}")
    
@app.get("/", response_class=HTMLResponse, name="home")
@app.get("/home", response_class=HTMLResponse, name="home")
async def get_home(request: Request, db: Session = Depends(get_db)):
    total_count = db.query(models.Ticket).count()
    return templates.TemplateResponse("home.html", {"request": request, "total": total_count})


@app.get("/report", response_class=HTMLResponse, name="report_form")
async def get_report_form(request: Request):
    if not request.cookies.get("cs_user_name"):
        return RedirectResponse(url="/login?mode=login&next=/report", status_code=303)
    return templates.TemplateResponse("report_form.html", {"request": request})

@app.post("/submit-ticket")
@app.post("/upload-and-detect/")
async def submit_ticket(
    background_tasks: BackgroundTasks,
    request: Request,
    ward: int = Form(...),
    u_name: str = Form(...),
    u_email: str = Form(...),
    u_mobile: str = Form(...),
    u_address: str = Form(...),
    lat: float = Form(...),
    lon: float = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not request.cookies.get("cs_user_name"):
        return RedirectResponse(url="/login?mode=login&next=/report", status_code=303)

    image_url, image_path, image_b64 = save_uploaded_image(file)
    detected_category = detect_category_from_ai(image_b64)
    status = "Pending"

    new_ticket = models.Ticket(
        tracking_id=f"CS-{uuid.uuid4().hex[:6].upper()}",
        user_name=u_name,
        user_email=u_email,
        user_mobile=u_mobile,
        ward_no=ward,
        latitude=lat,
        longitude=lon,
        category=detected_category,
        aqi_level="72 (Fair)",
        image_url=image_url,
        status=status,
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    history_record = models.UserHistory(
        user_email=u_email,
        complaint=u_address,
        category=detected_category,
        image_path=image_url,
        status=status,
        location=f"{lat},{lon}",
    )
    db.add(history_record)
    db.commit()

    subject, auth_body = build_authority_email(
        new_ticket=new_ticket,
        category=detected_category,
        status=status,
        u_name=u_name,
        u_mobile=u_mobile,
        ward=ward,
        u_address=u_address,
        lat=lat,
        lon=lon,
    )
    background_tasks.add_task(send_email, AUTHORITY_EMAIL, subject, auth_body)
    background_tasks.add_task(trigger_escalation_for_area, ward)

    # Send submission confirmation to the reporting citizen using dynamic form email.
    reporter_email = (u_email or "").strip()
    if reporter_email:
        reporter_subject = f"Complaint Submitted Successfully - {new_ticket.tracking_id}"
        reporter_body = f"""Dear {u_name},

Your complaint has been submitted successfully.

Tracking ID: {new_ticket.tracking_id}
Category: {detected_category}
Status: {status}
Location: https://www.google.com/maps?q={lat},{lon}

You can monitor updates from your Citizen Desk.
Thank you for helping keep the city clean.
"""
        background_tasks.add_task(send_email, reporter_email, reporter_subject, reporter_body)

    return templates.TemplateResponse(
        "success.html",
        {
            "request": request,
            "tracking_id": new_ticket.tracking_id,
            "category": detected_category,
            "image_url": image_url,
            "lat": lat,
            "lon": lon,
        },
    )


@app.get("/ai-report/{tracking_id}", response_class=HTMLResponse)
async def get_ai_report_page(tracking_id: str, request: Request, db: Session = Depends(get_db)):
    normalized_tracking_id = (tracking_id or "").strip().upper()
    ticket = (
        db.query(models.Ticket)
        .filter(models.Ticket.tracking_id == normalized_tracking_id)
        .first()
    )
    if not ticket:
        return RedirectResponse(url="/citizen-desk", status_code=303)

    return templates.TemplateResponse(
        "citizen_desk.html",
        {
            "request": request,
            "ticket": ticket,
        },
    )


@app.get("/citizen-desk", name="citizen_desk_redirect")
async def citizen_desk_redirect(request: Request, db: Session = Depends(get_db)):
    user_email = (request.cookies.get("cs_user_email") or "").strip()
    if not user_email:
        return RedirectResponse(url="/login?mode=login&next=/report", status_code=303)

    latest_ticket = (
        db.query(models.Ticket)
        .filter(models.Ticket.user_email == user_email)
        .order_by(models.Ticket.id.desc())
        .first()
    )
    if not latest_ticket or not latest_ticket.tracking_id:
        return RedirectResponse(url="/report", status_code=303)

    return RedirectResponse(url=f"/ai-report/{latest_ticket.tracking_id}", status_code=303)


@app.get("/dashboard", response_class=HTMLResponse)
async def get_dashboard(request: Request, db: Session = Depends(get_db)):
    tickets = db.query(models.Ticket).order_by(models.Ticket.id.desc()).all()
    open_tickets = [ticket for ticket in tickets if (ticket.status or "").strip().upper() != "CLOSED"]

    area_counts: dict[int, int] = {}
    for ticket in open_tickets:
        if ticket.ward_no is not None:
            area_counts[ticket.ward_no] = area_counts.get(ticket.ward_no, 0) + 1

    area_for_check: int | str = max(area_counts, key=area_counts.get) if area_counts else "N/A"
    escalation_data = (
        check_escalation_status(area_for_check, db)
        if area_for_check != "N/A"
        else {"location": "N/A", "open_count": 0, "time_elapsed_hours": 0.0, "priority": "NORMAL"}
    )

    tickets_data = [
        {
            "id": t.id,
            "tracking_id": t.tracking_id,
            "user_name": t.user_name,
            "ward_no": t.ward_no,
            "latitude": t.latitude,
            "longitude": t.longitude,
            "category": t.category,
            "status": t.status,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        }
        for t in tickets
    ]
    return templates.TemplateResponse(
        "admin_console.html",
        {
            "request": request,
            "tickets": tickets,
            "tickets_data": tickets_data,
            "total": len(tickets),
            "escalation_data": escalation_data,
        },
    )


@app.get("/api/history/{user_email}")
async def get_history(user_email: str, db: Session = Depends(get_db)):
    cutoff = datetime.utcnow() - timedelta(days=30)
    complaints = (
        db.query(models.UserHistory)
        .filter(models.UserHistory.user_email == user_email)
        .filter(models.UserHistory.timestamp >= cutoff)
        .order_by(models.UserHistory.timestamp.desc())
        .all()
    )
    return {
        "complaints": [
            {
                "id": row.id,
                "user_email": row.user_email,
                "complaint": row.complaint,
                "category": row.category,
                "image_path": row.image_path,
                "status": row.status,
                "location": row.location,
                "timestamp": row.timestamp.isoformat() if row.timestamp else None,
            }
            for row in complaints
        ]
    }


@app.post("/assign-ticket/{ticket_id}")
@app.post("/accept-ticket/{ticket_id}")
async def assign_ticket(ticket_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        return RedirectResponse(url="/dashboard", status_code=303)

    previous_status = (ticket.status or "").upper()
    if previous_status == "PENDING":
        ticket.status = "Assigned"
        ticket.vehicle_no = ticket.vehicle_no or DEFAULT_ASSIGNED_VEHICLE
        ticket.estimated_time = ticket.estimated_time or "Within 12 Hours"
        db.commit()
        db.refresh(ticket)
        background_tasks.add_task(send_acceptance_email, ticket)

    return RedirectResponse(url="/dashboard", status_code=303)


@app.post("/resolve-ticket/{ticket_id}")
async def resolve_ticket(ticket_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if ticket and (ticket.status or "").upper() == "ASSIGNED":
        ticket.status = "Verification Pending"
        db.commit()
        db.refresh(ticket)
        background_tasks.add_task(send_verification_email, ticket)
    return RedirectResponse(url="/dashboard", status_code=303)


@app.post("/confirm-resolve/{tracking_id}")
async def confirm_resolve(tracking_id: str, db: Session = Depends(get_db)):
    normalized_tracking_id = (tracking_id or "").strip().upper()
    ticket = (
        db.query(models.Ticket)
        .filter(models.Ticket.tracking_id == normalized_tracking_id)
        .first()
    )
    if ticket and (ticket.status or "").upper() == "VERIFICATION PENDING":
        ticket.status = "Closed"
        db.commit()
    return RedirectResponse(url=f"/ai-report/{normalized_tracking_id}", status_code=303)


@app.post("/reopen-complaint/{tracking_id}")
async def reopen_complaint(tracking_id: str, db: Session = Depends(get_db)):
    normalized_tracking_id = (tracking_id or "").strip().upper()
    ticket = (
        db.query(models.Ticket)
        .filter(models.Ticket.tracking_id == normalized_tracking_id)
        .first()
    )
    if ticket and (ticket.status or "").upper() == "VERIFICATION PENDING":
        ticket.status = "Pending"
        db.commit()
    return RedirectResponse(url=f"/ai-report/{normalized_tracking_id}", status_code=303)


@app.get("/login/google")
async def login_google(request: Request):
    if not oauth:
        return RedirectResponse(url="/login?error=authlib_not_installed")
    google_client = oauth.create_client("google")
    if not google_client:
        return RedirectResponse(url="/login?error=oauth_not_configured")

    redirect_uri = f"{APP_BASE_URL}/auth/callback"
    return await google_client.authorize_redirect(request, redirect_uri)

@app.get("/auth/callback", name="auth_callback")
async def auth_callback(request: Request):
    if not oauth:
        return RedirectResponse(url="/login?error=authlib_not_installed")
    google_client = oauth.create_client("google")
    if not google_client:
        return RedirectResponse(url="/login?error=client_not_found")

    try:
        # Token extraction
        token = await google_client.authorize_access_token(request)
    except OAuthError as error:
        print(f"OAuth Error Details: {error.error}")
        return RedirectResponse(url=f"/login?error={error.error}", status_code=303)

    user_info = token.get("userinfo")
    if not user_info:
        user_info = await google_client.parse_id_token(request, token)

    if not user_info:
        return RedirectResponse(url="/login?mode=login&error=no_user_info")

    user_name = str(user_info.get("name") or "Citizen")
    user_email = str(user_info.get("email") or "")
    user_picture = str(user_info.get("picture") or "")

    # Save to Session
    request.session["user"] = {
        "name": user_name,
        "email": user_email,
        "picture": user_picture,
    }

    # Redirect to Home with Cookies
    response = RedirectResponse(url="/home", status_code=303)
    response.set_cookie(key="cs_user_name", value=user_name, max_age=2592000, path="/", httponly=False)
    response.set_cookie(key="cs_user_email", value=user_email, max_age=2592000, path="/", httponly=False)
    response.set_cookie(key="cs_user_profile", value=user_picture, max_age=2592000, path="/", httponly=False)
    return response

@app.get("/login", response_class=HTMLResponse)
async def get_login(request: Request):
    return templates.TemplateResponse("L&S.html", {"request": request})


@app.get("/signup", response_class=HTMLResponse)
async def get_signup(request: Request):
    return templates.TemplateResponse("signup.html", {"request": request})


@app.post("/login-submit")
async def login_submit(
    username: str = Form(...),
    email: str = Form(""),
    profile_url: str = Form(""),
    next_url: str = Form("/home"),
):
    safe_next = next_url if next_url.startswith("/") else "/home"
    response = RedirectResponse(url=safe_next, status_code=303)
    response.set_cookie(key="cs_user_name", value=username, max_age=60 * 60 * 24 * 30, httponly=False)
    response.set_cookie(key="cs_user_email", value=email, max_age=60 * 60 * 24 * 30, httponly=False)
    response.set_cookie(key="cs_user_profile", value=profile_url, max_age=60 * 60 * 24 * 30, httponly=False)
    return response


@app.post("/signup-submit")
async def signup_submit(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...),
    profile_url: str = Form(""),
    next_url: str = Form("/home"),
):
    if password != confirm_password:
        return RedirectResponse(url="/signup?error=password_mismatch", status_code=303)

    safe_next = next_url if next_url.startswith("/") else "/home"
    response = RedirectResponse(url=safe_next, status_code=303)
    response.set_cookie(key="cs_user_name", value=username, max_age=60 * 60 * 24 * 30, httponly=False)
    response.set_cookie(key="cs_user_email", value=email, max_age=60 * 60 * 24 * 30, httponly=False)
    response.set_cookie(key="cs_user_profile", value=profile_url, max_age=60 * 60 * 24 * 30, httponly=False)
    return response


@app.get("/logout")
async def logout(request: Request):
    request.session.clear()
    response = RedirectResponse(url="/home", status_code=303)
    response.delete_cookie("cs_user_name")
    response.delete_cookie("cs_user_email")
    response.delete_cookie("cs_user_profile")
    return response

if __name__ == "__main__":
    import uvicorn
    # Matching your terminal port 8001
    uvicorn.run(app, host="0.0.0.0", port=8001)
