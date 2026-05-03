# Library Hall Booking System

A full-stack DevOps demonstration project: a booking platform for library halls, study rooms, and conference rooms. Built with **React**, **Node.js/Express**, **PostgreSQL**, **Docker**, **Terraform**, **Ansible**, **GitHub Actions**, **Prometheus**, and **Grafana**.

> **One-command local run:** `docker compose up --build` — then open http://localhost:5173.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Tech Stack](#tech-stack)
5. [Local Setup](#local-setup)
6. [Docker Setup](#docker-setup)
7. [CI/CD Flow](#cicd-flow)
8. [AWS Deployment (Terraform + Ansible)](#aws-deployment-terraform--ansible)
9. [Monitoring Setup](#monitoring-setup)
10. [Default Credentials](#default-credentials)
11. [Screenshots](#screenshots)
12. [Troubleshooting](#troubleshooting)

---

## Project Overview

A small but complete web application that libraries, colleges, or offices can use to manage hall and room reservations. The repo also doubles as a DevOps reference covering containerization, CI/CD, IaC, configuration management, and observability — without resorting to Kubernetes or microservices.

## Features

**Users**
- Register and log in (JWT auth)
- Browse rooms with filters: date, time, capacity, room type
- Book a room (with overlap/past-date validation)
- Cancel their own bookings
- View booking history

**Admins**
- Manage rooms (add, edit, delete, mark maintenance)
- View and approve/reject all bookings
- View basic usage stats (total users/rooms/bookings, top rooms)

**Business rules enforced server-side**
- No double-booking on overlapping times
- Cannot book in the past
- End time must be after start time
- Rooms in `maintenance` cannot be booked
- Only admins can manage rooms

## Architecture

```
                      ┌────────────────────────────┐
   Browser ─────────► │  Frontend (React + Vite)   │  http://localhost:5173 (dev)
                      │  Served by Nginx in prod   │  http://server (port 80)
                      └────────────┬───────────────┘
                                   │ /api proxy
                                   ▼
                      ┌────────────────────────────┐
                      │  Backend (Node + Express)  │  :5000
                      │  /api, /health, /metrics   │
                      └────────┬─────────┬─────────┘
                               │         │
                       ┌───────▼──┐   ┌──▼─────────┐
                       │ Postgres │   │ Prometheus │ scrapes /metrics
                       │   :5432  │   │   :9090    │
                       └──────────┘   └─────┬──────┘
                                            │
                                       ┌────▼────┐
                                       │ Grafana │  :3000
                                       └─────────┘
```

All services run in Docker via `docker-compose.yml` (dev) and `docker-compose.prod.yml` (prod).

## Tech Stack

| Layer            | Tech                                             |
| ---------------- | ------------------------------------------------ |
| Frontend         | React 18, Vite 5, Tailwind CSS 3, React Router 6 |
| Backend          | Node.js 20, Express 4, JWT, bcrypt, express-validator |
| Database         | PostgreSQL 16                                    |
| Containers       | Docker, Docker Compose                           |
| CI/CD            | GitHub Actions (GHCR image publish)              |
| Infrastructure   | Terraform (AWS provider, default VPC, EC2)       |
| Configuration    | Ansible (Docker install + compose deploy)        |
| Metrics          | Prometheus + prom-client                         |
| Dashboards       | Grafana with provisioned datasource + dashboard  |

## Local Setup

### Option A — Docker (recommended)

Prereqs: Docker Desktop / Docker Engine with the Compose plugin.

```bash
git clone <your-repo-url> library-room-booking
cd library-room-booking
cp .env.example .env
docker compose up --build
```

Then open:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5050/api (host port 5050 → container 5000; macOS AirPlay uses 5000)
- Health: http://localhost:5050/health
- Metrics: http://localhost:5050/metrics
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin)

The first time the backend starts it will auto-seed the admin user and sample rooms.

### Option B — Run locally without Docker

```bash
# 1. Postgres
docker run --name lb-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=library_booking -p 5432:5432 -d postgres:16-alpine
psql postgresql://postgres:postgres@localhost:5432/library_booking -f database/init.sql

# 2. Backend
cd backend
cp .env.example .env   # edit DB_HOST=localhost
npm install
npm run seed
npm run dev            # http://localhost:5000

# 3. Frontend
cd ../frontend
npm install
npm run dev            # http://localhost:5173
```

## Docker Setup

| Compose file              | Use for                                  |
| ------------------------- | ---------------------------------------- |
| `docker-compose.yml`      | Local development (hot reload + volumes) |
| `docker-compose.prod.yml` | Production-style deployment              |

Common commands:

```bash
docker compose up --build              # start everything
docker compose logs -f backend         # tail backend logs
docker compose logs -f frontend        # tail frontend logs
docker compose exec backend npm run seed   # re-seed DB
docker compose down                    # stop
docker compose down -v                 # stop + wipe volumes
```

## CI/CD Flow

GitHub Actions workflow `.github/workflows/ci.yml` runs on every push to `main` and pull request:

1. **Backend job**: install deps → lint → test
2. **Frontend job**: install deps → lint → build → upload `dist` artifact
3. **Docker job** (only on push to `main`): build backend + frontend images and push to GitHub Container Registry (`ghcr.io`)

### Required secrets

Only `GITHUB_TOKEN` is needed by default — GitHub provides it automatically.

If you'd rather publish to Docker Hub instead of GHCR, uncomment the `docker-hub` job in the workflow and add:

| Secret              | Description                          |
| ------------------- | ------------------------------------ |
| `DOCKERHUB_USERNAME` | Docker Hub username                  |
| `DOCKERHUB_TOKEN`   | Docker Hub access token              |

Optionally, for SSH-based deployments:

| Secret           | Description                                 |
| ---------------- | ------------------------------------------- |
| `SSH_PRIVATE_KEY`| Private key matching the EC2 key pair       |
| `SSH_HOST`       | EC2 public IP/DNS                           |

## AWS Deployment (Terraform + Ansible)

### 1. Terraform — provision infrastructure

```bash
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars   # set key_pair_name, region, etc.
terraform init
terraform plan
terraform apply
```

Outputs include the EC2 public IP, DNS, app URL, Prometheus URL, and Grafana URL.

Resources created:
- Default VPC (looked up, not created)
- Security group opening ports 22, 80, 5000, 9090, 3000
- One EC2 instance (Ubuntu 22.04) with Docker pre-installed via user-data

### 2. Ansible — deploy the app

```bash
cd infrastructure/ansible
cp inventory.ini.example inventory.ini
# Edit inventory.ini and replace EC2_PUBLIC_IP and key file path

cp files/prod.env.example files/prod.env
# Edit files/prod.env with production secrets

# Also edit deploy.yml: set project_repo to your GitHub repo URL.

ansible-playbook deploy.yml
```

The playbook installs Docker (idempotent), clones your repo, copies the prod env file, and runs `docker compose -f docker-compose.prod.yml up -d --build`.

Re-running the playbook will pull latest code and rebuild containers — that is your "redeploy" step.

## Monitoring Setup

- The backend exposes Prometheus metrics at `/metrics` (default counters, histograms, plus custom HTTP and booking counters).
- Prometheus is preconfigured in `monitoring/prometheus/prometheus.yml` to scrape `backend:5000`.
- Grafana is provisioned with:
  - The Prometheus datasource (`monitoring/grafana/provisioning/datasources/datasource.yml`)
  - A "Library Booking — Overview" dashboard (`monitoring/grafana/dashboards/library-booking.json`)

After `docker compose up`, open Grafana at http://localhost:3000 and the dashboard appears automatically.

### Viewing logs

```bash
docker compose logs -f                # all services
docker compose logs -f backend        # backend only
docker compose logs --since 1h backend
docker logs library-backend           # by container name
```

## Default Credentials

| Service  | Email / Username        | Password   |
| -------- | ----------------------- | ---------- |
| Admin    | `admin@library.com`     | `admin123` |
| Grafana  | `admin`                 | `admin`    |

Change both for any non-local deployment. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `GRAFANA_ADMIN_PASSWORD` in your `.env`.

## Screenshots

Add screenshots here once you run the app locally:

- `docs/screenshots/landing.png`
- `docs/screenshots/dashboard.png`
- `docs/screenshots/rooms.png`
- `docs/screenshots/admin.png`
- `docs/screenshots/grafana.png`

## Troubleshooting

| Symptom                                   | Fix                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------- |
| `backend` keeps restarting                | Check `docker compose logs backend`. Usually Postgres still booting; the backend retries for ~30s. |
| `npm: not found` inside container         | Rebuild: `docker compose build --no-cache backend frontend`         |
| Cannot log in as admin                    | Run `docker compose exec backend npm run seed`                      |
| Port 5173/5000/3000/9090/5432 already used | Change the host port mapping in `docker-compose.yml`                |
| Vite can't reach API                      | Confirm `frontend/.env` or `VITE_API_URL` is `/api` (relative)      |
| Prometheus shows target DOWN              | Check `backend` is healthy; Prometheus scrapes `backend:5000`       |
| Wrong timezone in bookings                | Browsers send local time; backend stores UTC — display uses local TZ |

## License

MIT — see `LICENSE` (add one if publishing publicly).
