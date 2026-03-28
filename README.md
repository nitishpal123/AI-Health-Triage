# AI-Health-Triage Platform

AI-Health-Triage is a production-ready, multi-tenant AI Health Triage platform. It leverages advanced medical NLP and diagnostic analysis services to automate medical report analysis, suggest symptoms, and generate remedies, ensuring the system is fully equipped for scalable AI-driven clinical triage.

## Table of Contents
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation & Running the Application](#installation--running-the-application)
- [Environment Variables](#environment-variables)
- [How to Use the Application](#how-to-use-the-application)
- [Test Credentials](#test-credentials)

## Architecture

The application is containerized using Docker and is composed of three main services:
- **Frontend (Triage Dashboard):** React + Vite application running on `http://localhost:3000`
- **Backend (AI / API):** Node.js + Express application running on `http://localhost:5000`
- **Database:** MongoDB running on `localhost:27017`

## Prerequisites

Ensure you have the following installed on your local machine:
- [Docker & Docker Compose](https://www.docker.com/get-started)
- [Git](https://git-scm.com/)
- Node.js (Optional,. if running locally without Docker)

## Installation & Running the Application

A convenient setup script is provided to automate the environment configuration, build the Docker images, spin up the containers, and seed the local database.

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd AI-Health-Triage
   ```

2. **Run the setup script:**
   Mac/Linux:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
   Windows (Git Bash or WSL):
   ```bash
   bash setup.sh
   ```

3. **What the setup script does:**
   - Creates a default `.env` file if it doesn't already exist.
   - Uses `docker-compose up --build -d` to create and start all services.
   - Waits for MongoDB to initialize securely.
   - Automatically seeds the database with dummy test users (admins, doctors, patients, lab techs) and dummy triage records.

## Environment Variables

When the `setup.sh` script runs, it generates a `.env` file at the root level if it doesn't exist. To fully utilize the AI Medical Analyzer NLP features, you need to provide an API key.

Open the `.env` file and add your AI key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
# OR
OPENAI_API_KEY=your_openai_api_key_here
```
*Note: The backend is built to pull these to run the AI triage reasoning and medical NLP.*

If you modify the `.env` file, make sure to restart your docker containers:
```bash
docker-compose down
docker-compose up -d
```

## How to Use the Application

Once the setup is complete, you can access the system at the following URLs:

- **Frontend Application:** `http://localhost:3000`
- **Backend API Base:** `http://localhost:5000/api`

### Features
1. **Multi-Tenant System:** Role-based dashboards for Hospital Admins, Doctors, Pathologists, and Patients.
2. **AI-Driven Clinical Triage:** The backend automatically scores incoming patients, provides an estimated wait time, sets the triage level (Standard, Urgent, Critical), and adds AI reasoning based on symptoms and vitals.
3. **Medical Check and NLP:** Extracts insights seamlessly based on the configured AI models.

## Test Credentials

The database is pre-seeded with a comprehensive dummy hospital setup ("Cedars-Sinai Medical Center") with the following test accounts:

All accounts share the default password:
**Password:** `password123`

| Role | Name | Email | Additional Info |
| --- | --- | --- | --- |
| **Hospital Admin** | Admin Executive | `admin@hospital.com` | Full tenant management |
| **Doctor** | Dr. Gregory Smith | `dr.smith@hospital.com` | Cardiology Department |
| **Doctor** | Dr. Ananya Patel | `dr.patel@hospital.com` | Neurology Department |
| **Pathologist** | Sarah LabTech | `lab@hospital.com` | Assigned to Core Diagnostics Lab |
| **Patient** | John Doe | `patient@hospital.com` | Standard Patient Login |

---

**Tip for Development:** The Docker configuration uses volume bind-mounts for both the backend and frontend (`./triage-backend/src` and `./triage-frontend/src`). This means you can actively edit the code on your local system and the changes will hot-reload in the Docker containers automatically!