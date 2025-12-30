# AlumniHub --- Centralized Digital Alumni Management Platform

## Overview

**AlumniHub** is a **scalable MERN + FastAPI platform** designed to
streamline alumni engagement, analytics, and communication.\
It provides **Superadmin, College Admin, Student, Alumni, and Faculty**
with dynamic role-based dashboards to manage data, events, donations,
and mentorship activities efficiently.

------------------------------------------------------------------------

## How It Works

AlumniHub is a **cloud-deployable** digital dashboard enabling
centralized alumni management across institutions.\
It offers an integrated platform with **real-time communication,
AI-powered recommendations, and ATS resume analysis**.

------------------------------------------------------------------------

### **Tech Stack**

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React.js, Tailwind CSS |
| **Backend (Core API)** | Node.js, Express.js |
| **Database** | MongoDB (via Mongoose / PyMongo) |
| **Authentication** | JWT (Role-based Access Control) |
| **State Management** | Redux / Context API |
| **Email Integration** | Nodemailer |
| **AI & ML Layer (Microservice)** | FastAPI, Uvicorn, Pydantic, PyMongo, Sentence-Transformers, Scikit-Learn, Requests, PyPDF2, DOCX2TXT, Python-Multipart |
| **Deployment** | Vercel / Netlify / Render / AWS / MongoDB Atlas |

------------------------------------------------------------------------

## Project Structure

``` bash
alumnihub/
├── frontend/        # React + Tailwind client application
├── backend/         # Node.js + Express REST API
└── python/          # FastAPI microservice for ATS & AI recommendations
```

------------------------------------------------------------------------

### **Core User Roles**

| Role | Description | Key Functionalities |
| :--- | :--- | :--- |
| **Superadmin** | Global controller for all colleges. | Manage colleges, analytics, and notifications. |
| **College Admin** | Manages users for a specific college. | Approve users, manage events/donations, send communications. |
| **Student** | Current learners with dashboard access. | Edit profile, request mentorship, view ATS score, apply for jobs. |
| **Alumni** | Graduated users engaged in mentorship and donations. | Post jobs, use ATS tool, donate, mentor students. |
| **Faculty** | Teaching staff users. | Manage events and donations, view directories. |

------------------------------------------------------------------------

## Functional Workflows

### College Onboarding

1.  Dean/college officer registers.
2.  Superadmin reviews & approves.
3.  College code is generated and emailed.

### User Registration & Approval

1.  Students, Alumni, Faculty sign up using the college code.
2.  College Admin approves or denies users.

### Role-Based Dashboards

Each user role has customized access, analytics, and workflows.

------------------------------------------------------------------------

## AI Integrations (FastAPI Microservice)

###  ATS Resume Score Checker

-   Uses **Sentence-Transformers + Scikit-Learn**.
-   Extracts keywords and computes similarity.
-   Returns ATS score (0--100).


### Mentor Recommendation System

-   Uses **semantic similarity** to match students with mentors.
-   Returns **Top 10 recommended alumni mentors**.


------------------------------------------------------------------------

## Donation Module

-   Alumni can pledge donations to specific causes.
-   Faculty and Admins can track donations.
-   Data stored in MongoDB for analytics and reporting.

------------------------------------------------------------------------

## Database Overview

  Collection           Description
  -------------------- -------------------------------
  Colleges             Registered colleges and codes
  Users                All users under colleges
  Jobs                 Job postings
  Events               Event data
  Donations            Donation pledges
  MentorshipRequests   Pending mentorships
  Notifications        Alerts to users
  ATSData              Stored resumes and scores
  Queries              Support tickets

------------------------------------------------------------------------

## Authentication

JWT-based middleware storing role and collegeCode.

------------------------------------------------------------------------

## Email Workflows

-   **Superadmin → College Admin** for approval and codes.\
-   **College Admin → Users** for account activation.\
-   **System Notifications** for events, jobs, and mentorships.

------------------------------------------------------------------------

## Frontend Structure

``` bash
src/
├── components/
│   ├── Dashboard/
│   ├── Donation/
│   ├── ATSResumeChecker/
│   ├── MentorRecommendation/
│   ├── Layout/
│   ├── Charts/
│   └── Tables/
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── StudentDashboard.jsx
│   ├── AlumniDashboard.jsx
│   ├── FacultyDashboard.jsx
│   ├── AdminDashboard.jsx
│   ├── SuperAdminDashboard.jsx
│   ├── Jobs.jsx
│   ├── Events.jsx
│   ├── Donations.jsx
│   └── MentorFinder.jsx
└── utils/, context/, redux/
```

------------------------------------------------------------------------

## Deployment Workflow

  Component         Suggested Platform
  ----------------- ----------------------------------
  React Frontend    Vercel / Netlify
  Node Backend      Render / AWS / Railway
  FastAPI Service   Dockerized EC2 / Railway / Azure
  Database          MongoDB Atlas

**Environment Variables:**
### Frontend ENV :
```bash
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=
```

### Backend ENV : 
``` bash
NODE_ENV=development
PORT=5000

BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=

# JWT
JWT_SECRET=
JWT_EXPIRE=7d

# Email (Update with your actual email credentials)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=Alumni Connect <noreply@alumniconnect.com>

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx

# Admin
SUPER_ADMIN_EMAIL=
SUPER_ADMIN_PASSWORD=

# Google OAuth 
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Session Secret (Generate a random string)
SESSION_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Python ENV : 
```bash
MONGODB_URI= 
DBNAME= 
```

------------------------------------------------------------------------

## Setup & Run Instructions

### Clone Repository

``` bash
git clone https://github.com/Manideepchopperla/alumni-connect
cd alumnihub
```

### Frontend Setup

``` bash
cd frontend
npm install
npm run dev
```

### Backend Setup

``` bash
cd backend
npm install
npm run dev
```

### Python Microservice Setup

``` bash
cd python

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # (Windows)
source venv/bin/activate  # (Mac/Linux)

# Install dependencies
pip install -r requirements.txt

# Run FastAPI service
uvicorn app:app --reload --port 8001
```

------------------------------------------------------------------------

## Analytics & Insights

-   **Superadmin:** National analytics, college growth.
-   **Admin:** Year-wise stats, donations, and events.
-   **AI Metrics:** ATS score averages, top skill trends.

------------------------------------------------------------------------

## Workflow Summary

  Step   Action                   Result
  ------ ------------------------ ------------------------
  1      Dean registers college   Request pending
  2      Superadmin approves      Code generated
  3      Users register           Admin review required
  4      Admin approves           Dashboard unlocked
  5      Alumni post jobs         ATS analysis done
  6      Students check ATS       Resume improved
  7      Mentorship cycle         Alumni accepts/rejects
  8      Donations tracked        Reports generated

------------------------------------------------------------------------

## In Short

**AlumniHub** enables: - Dynamic multi-college onboarding\
- Role-based dashboards\
- Email-driven approval workflows\
- AI-powered ATS and mentor recommendations\
- Centralized donation and event management

------------------------------------------------------------------------

© 2025 AlumniHub \| MERN + FastAPI \| Developed for Scalable
Institutional Alumni Management
