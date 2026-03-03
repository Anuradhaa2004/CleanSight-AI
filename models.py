from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base
from datetime import datetime

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    tracking_id = Column(String)
    user_name = Column(String)
    user_email = Column(String)
    user_mobile = Column(String)
    ward_no = Column(Integer)
    latitude = Column(Float)
    longitude = Column(Float)
    category = Column(String, default="General Waste")
    aqi_level = Column(String)
    image_url = Column(String)
    status = Column(String, default="Pending")
    vehicle_no = Column(String)
    estimated_time = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserHistory(Base):
    __tablename__ = "user_history"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True, nullable=False)
    complaint = Column(String, nullable=False)
    category = Column(String, default="General Waste")
    image_path = Column(String, nullable=False)
    status = Column(String, default="Pending")
    location = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
