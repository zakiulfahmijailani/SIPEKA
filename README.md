<p align="center">
  <strong>SIPEKA</strong><br/>
  <em>Sistem Informasi Pengelola Kurikulum &amp; Asesmen</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Neon-PostgreSQL-00E5BF?style=flat-square&logo=neon&logoColor=white" />
  <img src="https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=black" />
  <img src="https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel" />
</p>

<p align="center">
  <a href="https://sipeka-ubakrie.vercel.app/"><strong>🚀 Live Demo → sipeka-ubakrie.vercel.app</strong></a>
</p>

---

## What Is SIPEKA?

SIPEKA is a web-based curriculum and assessment management system designed for **lecturers and study programs** at higher education institutions. It centralizes the full academic planning cycle — from curriculum design and course mapping to assessment instruments and accreditation reporting — into a single, integrated platform.

Built for Bakrie University's Information Systems program, SIPEKA replaces fragmented spreadsheet workflows with a structured, role-aware system that supports OBE (Outcome-Based Education) standards and Indonesian accreditation requirements (BAN-PT / LAM).

---

## Key Features

- **Curriculum Management** — Define and version program learning outcomes (CPL), courses (MK), and curriculum structures per academic year
- **Course Planning (RPS)** — Build and manage Rencana Pembelajaran Semester with weekly topic mapping, assessment schemes, and learning outcome alignment
- **Assessment Instruments** — Create, organize, and link assessment rubrics to CLOs (CPMK) and PLOs (CPL)
- **AI-Assisted Drafting** — Powered by Anthropic Claude API for auto-generating RPS drafts, rubric suggestions, and curriculum gap analysis
- **Export & Reporting** — Generate PDF, DOCX, and Excel reports for accreditation submissions
- **Role-Based Access** — Separate views and permissions for lecturers, program coordinators, and administrators
- **Dark Mode** — Full theme support via `next-themes`

---

## Tech Stack

| Layer | Technology |
|:---|:---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Neon (PostgreSQL, serverless) |
| ORM | Drizzle ORM |
| Auth | NextAuth v5 |
| AI | Anthropic Claude API (`@anthropic-ai/sdk`) |
| Charts | Recharts |
| Export | `@react-pdf/renderer`, `docx`, `exceljs` |
| Forms | React Hook Form + Zod |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database
- An [Anthropic](https://console.anthropic.com) API key

### Installation

```bash
# Clone the repository
git clone https://github.com/zakiulfahmijailani/SIPEKA.git
cd SIPEKA

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your database URL, Anthropic API key, and NextAuth secret

# Push database schema
npm run db:push

# (Optional) Seed initial data
npm run db:seed

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Database Management

```bash
npm run db:generate   # Generate migrations
npm run db:migrate    # Run migrations
npm run db:push       # Push schema directly (dev)
npm run db:studio     # Open Drizzle Studio (visual DB browser)
```

---

## Project Context

SIPEKA is developed at **Bakrie University**, South Jakarta, as part of an educational technology initiative to improve curriculum governance and accreditation readiness for the Information Systems study program.

The system is designed in alignment with:
- **OBE (Outcome-Based Education)** principles
- **Permendikbudristek No. 53 Tahun 2023** on higher education quality assurance
- **BAN-PT / LAM-Infokom** accreditation criteria

---

## Contributing

Contributions are welcome from educators, developers, and educational technology researchers.

- 🐛 Report bugs or suggest features via [Issues](https://github.com/zakiulfahmijailani/SIPEKA/issues)
- 💬 For collaboration or institutional adoption inquiries: [zakiul.jailani@bakrie.ac.id](mailto:zakiul.jailani@bakrie.ac.id)

---

<p align="center">
  <sub>Built for educators. Designed for accreditation. Oriented toward quality.</sub>
</p>
