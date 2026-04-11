# CleanSight AI 🌍♻️
**AI-Powered Smart Waste Management System**

CleanSight AI is a modern solution designed to enhance urban cleanliness using Artificial Intelligence. It detects waste, categorizes it using Computer Vision, and automates reporting to municipal authorities.

## ✨ Features
* 🔍 **AI Detection:** Uses llama-3.2-11b-vision-preview (Groq Vision model) to identify and categorize different types of waste.
* 📱 **Seamless Reporting:** Multi-step reporting process for citizens to log cleanliness issues.
* ✉️ **Instant Notifications:** Integrated with **Twilio API** for automated SMS alerts to authorities.
* 📊 **Real-time Dashboard:** A professional, glassmorphism-themed UI to track cleanup progress.
* 🇮🇳 **Swachh Bharat Integration:** Dedicated section honoring the national mission for a cleaner India.

## 🛠️ Tech Stack
- **Frontend:** React.js, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express
- **AI/ML:** llama-3.2-11b-vision-preview
- **Communication:** Twilio REST API

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- Twilio Account (for SMS features)
- Groq API Key (for AI processing)

### Installation & Setup
1. Clone the repository:
   ```bash
   git clone [https://github.com/Anuradhaa2004/CleanSight-AI.git](https://github.com/Anuradhaa2004/CleanSight-AI.git)
   cd CleanSight-AI
2.Backend Setup:
   backend folder mein jayein:
   ```bash
   cd backend
  *Dependencies install karein:
  ```bash
  npm install
  *Ek .env file banayein aur usme apni API keys (Twilio, Groq, etc.) dalein:
 PORT=5000
 GROQ_API_KEY=your_key_here
 TWILIO_SID=your_sid
3.Frontend Setup:
  Root folder se frontend folder mein jayein:
  ```bash
  cd ../frontend
 *Dependencies install karein:
  ```bash
  npm install
4.Project Run karein:
Dono folders mein alag-alag terminal par ye command chalayein:
```ubash
npm run dev
