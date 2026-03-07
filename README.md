# 🌍 CleanSight AI: Smart Waste Management System

**CleanSight AI** is a next-generation waste management platform that uses Artificial Intelligence and automated 
accountability to keep our cities clean.

### 🚀 The Problem
Traditional waste reporting systems are slow and lack transparency. Complaints often go ignored, and citizens have no 
way to track progress or feel rewarded for their contribution.

### ✨ Our Solution
- **AI Detection:** Uses **YOLOv8** to automatically identify waste from photos.
- **Proactive Accountability:** Integrated with **Twilio REST API** to send SMS alerts to supervisors if work is delayed.
- **Instant Confirmation:** Automated emails sent via **SMTP** with a unique Complaint ID.
- **Gamified Rewards:** Citizens earn points for every verified report.

### 🛠️ Tech Stack
- **Backend:** FastAPI (Python)
- **AI Model:** YOLOv8
- **Communication:** Twilio API, SMTPlib
- **Database:** SQLite
- **Frontend:** HTML5, CSS3(Bootstrap), JavaScript

### To Run the Server
python -m uvicorn main:app --reload --port 8001
example., 
path..../CleanIndia>> cd CleanIndia
path..../CleanIndia/CleanIndia>> python -m uvicorn main:app --reload --port 8001
