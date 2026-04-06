UrbanPulse — Smart Transparent Public Grievance System

Tamper-Proof | AI-Verified | Blockchain-Secured | Citizen-Anonymous

UrbanPulse is a blockchain-backed, AI-powered public grievance system that allows verified citizens to submit complaints securely and transparently while protecting their identity. The system ensures complaints cannot be ignored, modified, or deleted without accountability.

🌐 Live Website:
https://urban-pulse-five.vercel.app

📂 GitHub Repository:
https://github.com/monishasundaram/UrbanPulse

Project Overview

Traditional grievance systems suffer from several problems:

Complaints get ignored
No transparency in action taken
Fake complaints can be submitted
Citizens fear identity exposure

UrbanPulse solves these issues using:

Aadhaar OTP verification
AI-based fake complaint detection
Blockchain hashing for tamper-proof storage
Anonymous citizen identity protection
Officer proof-of-action tracking
Key Features
Aadhaar OTP Verification

Only verified citizens can register and submit complaints.

12-digit Aadhaar number required
OTP verification mandatory
Identity stored encrypted
AI Fake Complaint Detection

Every complaint passes through AI validation:

Minimum description length check
Spam detection
Image authenticity validation
EXIF metadata verification
AI-generated image detection
Blockchain Hashing (SHA-256)

Each complaint receives a unique cryptographic hash to ensure:

No modification after submission
Permanent record integrity
Tamper-proof storage
Live GPS Location Validation

Complaint submission requires accurate location:

Under 100m → Accepted
Under 500m → Accepted
Above 500m → Rejected
Anonymous Citizen Identity

Citizen privacy is fully protected:

Public sees only Citizen ID
Real identity encrypted in database
No public exposure of Aadhaar or phone number
Officer Proof of Action Timeline

Government officers can:

Upload action images
Add status updates
Provide timestamps
Maintain transparent progress tracking
Email Notifications

Citizens receive notifications for:

Registration success
Complaint submission
Status updates
Tech Stack

Frontend
Next.js + Tailwind CSS

Backend
Node.js + Express.js

Database
PostgreSQL (Railway)

AI Service
Python + FastAPI

Blockchain Hashing
SHA-256

Authentication
JWT + Aadhaar OTP (Simulated)

Email Service
Resend API

Deployment
Frontend → Vercel
Backend → Render

System Architecture

Frontend (Next.js)

↓

Backend API (Node.js / Express)

↓

AI Verification Service (FastAPI)

↓

PostgreSQL Database

↓

Blockchain Hash Generation (SHA-256)

User Roles

Citizen

Register using Aadhaar OTP
Submit complaints
Track complaint progress

Public User

View complaints
View officer actions

Officer

View assigned complaints
Upload action proof
Update complaint status

Admin

Monitor system statistics
View complaint categories
Track platform activity
Complaint Submission Flow

1️⃣ Citizen registers with Aadhaar OTP
2️⃣ Logs into system
3️⃣ Submits complaint details
4️⃣ Location verified via GPS
5️⃣ AI validates complaint text
6️⃣ AI validates uploaded image
7️⃣ Complaint stored with blockchain hash
8️⃣ Complaint becomes publicly visible
9️⃣ Officer updates action timeline

Security Features
Aadhaar OTP verification
JWT authentication
AI fake complaint detection
Blockchain hashing (SHA-256)
Anonymous identity protection
GPS accuracy validation
File type validation
Helmet.js backend protection
CORS security configuration
Deployment Links

Frontend
https://urban-pulse-five.vercel.app

Backend
https://urbanpulse-backend-5ejl.onrender.com

Repository
https://github.com/monishasundaram/UrbanPulse

Future Improvements

Short Term

Real Aadhaar API integration
SMS OTP support
Google Maps integration
WhatsApp notifications

Medium Term

Mobile app (React Native / Flutter)
Polygon blockchain integration
Duplicate complaint detection
Multi-language support

Long Term

Government portal integration
Voice complaint submission
NGO / journalist analytics API
Real-time notifications

Developed By
Monisha Sundaram
April 2026

UrbanPulse — Smart Transparent Public Grievance System
