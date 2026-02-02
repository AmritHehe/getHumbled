# SkillUp - Competitive Quiz Platform

A real-time competitive quiz platform where users can participate in live MCQ contests, practice with AI-generated quizzes, and track their progress on leaderboards.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)

## Features

### Live Contests
- **Real-time competitions** with WebSocket-powered live updates
- **Live leaderboard** that updates as participants answer questions
- **Timed questions** with points based on speed and accuracy
- **Admin-controlled** contest scheduling and management

### AI Practice Mode
- **AI-generated quizzes** - Describe a topic and get instant MCQ questions
- **Unlimited practice** - Create personalized quizzes on any subject
- **Re-attempt support** - Practice until you master the topic
- **Progress tracking** - See your score and correct answers

### Leaderboard & Stats
- **Global leaderboard** ranking all participants
- **Per-contest rankings** with real-time updates
- **User dashboards** with contest history

### Authentication & Roles
- **JWT-based authentication** with secure password hashing
- **Role-based access** - User and Admin roles
- **Protected routes** for admin functionality

## Architecture

```
skillup/
├── apps/
│   ├── web/              # Next.js 15 frontend
│   ├── api/              # Express.js REST API
│   └── liveContest/      # WebSocket server for real-time features
├── packages/
│   ├── database/         # Prisma ORM & schema
│   ├── ui/               # Shared UI components
│   ├── eslint-config/    # ESLint configurations
│   ├── tailwind-config/  # Tailwind configurations
│   └── typescript-config/# TypeScript configurations
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS |
| **Backend API** | Express.js, TypeScript, Zod validation |
| **Real-time** | WebSocket (ws), Redis for state management |
| **Database** | PostgreSQL with Prisma ORM |
| **AI** | Google Gemini API for question generation |
| **Auth** | JWT tokens, bcrypt password hashing |
| **Monorepo** | Turborepo with Bun package manager |

## Database Schema

```prisma
User          → Contests, Submissions
Contests      → MCQs, Leaderboard, Submissions
MCQ           → Submissions
LeaderBoard   → Scores
```

### Key Models
- **User**: Authentication, roles (USER/ADMIN)
- **Contests**: Title, description, type (DEV/DSA), status (UPCOMING/LIVE/CLOSED), mode (real/practice)
- **MCQ**: Questions with 4 options (A/B/C/D), points, solution
- **Submissions**: User answers with correctness tracking
- **LeaderBoard**: Real-time contest rankings

##  Getting Started

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL database
- Redis (for live contests)
- Docker (optional, for local database)

### 1. Clone & Install

```bash
git clone https://github.com/AmritHehe/getHumbled.git
cd getHumbled
bun install
```

### 2. Environment Setup

Copy `.env.example` to `.env` in root and configure:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/skillup"
JWT_SECRET="your-secret-key"
GEMINI_API_KEY="your-gemini-api-key"
REDIS_URL="redis://localhost:6379"
```

Also copy to `packages/database/.env` and `apps/web/.env`.

### 3. Database Setup

```bash
# Start local PostgreSQL with Docker (optional)
docker-compose up -d

# Run migrations
bun run db:migrate:dev

# Seed database (optional)
bun run db:seed
```

### 4. Start Development

```bash
# Start all services
bun run dev
```

This starts:
- **Web**: http://localhost:3000
- **API**: http://localhost:3004
- **WebSocket**: ws://localhost:8080

## 📁 Project Structure

### Frontend (`apps/web`)
```
app/
├── page.tsx              # Landing page
├── auth/                 # Sign in/up pages
├── contests/             # Contest browser & live contest UI
│   └── [id]/
│       ├── live/         # Real-time contest participation
│       └── practice/     # Practice mode
├── practice/             # AI quiz creation
│   ├── new/              # Create new practice quiz
│   └── [id]/generate/    # AI question generation
├── dashboard/            # User dashboard
├── leaderboard/          # Global rankings
└── admin/                # Admin panel
    ├── contests/         # Contest management
    ├── questions/        # Question bank
    └── users/            # User management
```

### Backend API (`apps/api`)
```
src/
├── controllers/
│   ├── contest.controller.ts  # Contest CRUD, AI generation
│   └── user.controller.ts     # Auth, user management
├── routes/                    # Express route definitions
├── services/
│   ├── generateAIres.ts       # Gemini AI integration
│   ├── getRandomQuestion.ts   # Question selection logic
│   └── getContestState.ts     # Contest state management
├── validators/                # Zod schemas
└── middlewares/               # Auth middleware
```

### WebSocket Server (`apps/liveContest`)
```
src/
├── index.ts            # WebSocket server, message handlers
├── middleware.ts       # JWT verification
├── redisClient.ts      # Redis connection
├── fetchContest.ts     # Contest data fetching
└── submissionCron.ts   # Periodic DB sync
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/signin` | Login user |
| GET | `/api/auth/me` | Get current user |

### Contests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contests` | List all contests |
| GET | `/api/contests/:id` | Get contest details |
| POST | `/api/contests` | Create contest (Admin) |
| POST | `/api/contests/generate` | AI question generation |
| POST | `/api/contests/:id/join` | Join practice contest |
| POST | `/api/contests/:id/submit` | Submit answer |
| POST | `/api/contests/:id/reattempt` | Re-attempt practice |

## 🔄 WebSocket Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `init_contest` | `{ contestId }` | Initialize contest (Admin) |
| `join_contest` | `{ contestId }` | Join live contest |
| `submit_answer` | `{ questionId, answer }` | Submit MCQ answer |
| `request_question` | `{ questionNumber }` | Request specific question |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `contest_started` | `{ contestId, totalQuestions }` | Contest initialization |
| `question` | `{ question, options, questionNumber }` | Current question |
| `answer_result` | `{ correct, points, solution }` | Answer feedback |
| `leaderboard_update` | `{ rankings }` | Live leaderboard |
| `contest_ended` | `{ finalRankings }` | Contest completion |

## 🎨 UI Features

- **Dark/Light mode** with system preference detection
- **Responsive design** for all screen sizes
- **Smooth animations** using CSS transitions
- **Glass morphism** UI elements
- **Real-time updates** without page refresh
- **Toast notifications** for user feedback

## 🔒 Security

- JWT tokens for stateless authentication
- Password hashing with bcrypt
- Role-based route protection
- Input validation with Zod
- SQL injection prevention via Prisma ORM

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

> **Note**: Direct pushes to `main` are disabled. All changes must go through pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Turborepo](https://turbo.build/) for monorepo tooling
- [Prisma](https://prisma.io/) for database ORM
- [Google Gemini](https://ai.google.dev/) for AI question generation
- [Lucide](https://lucide.dev/) for icons

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/AmritHehe">Amrit</a>
</p>
