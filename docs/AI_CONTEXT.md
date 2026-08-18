# Formula Student Manager — AI Project Context

## Project

Name: Formula Lab 

Purpose:
A full-stack web application for managing a Formula Student team's members,
subteams, projects, tasks, deadlines, and eventually other team workflows.

The application should be accessible from anywhere by teammates without the
developer's personal computer being switched on.

## Developer background

The developer is already familiar with:
- React
- TypeScript
- Node.js
- Electron
- PostgreSQL
- Desktop/web app development concepts

The developer is learning:
- Next.js
- Modern web application architecture
- Browser/server boundaries
- Web deployment
- Production web development
- Using Neovim and the terminal as the primary development environment
- Using Git from the terminal/Neovim workflow

Important teaching preferences:
- Explain code that is provided.
- Do not dump large amounts of unexplained code.
- Explain what a piece of code does, why it is needed, and important syntax.
- Prefer incremental implementation and debugging over generating the entire app.
- The developer wants to understand architectural decisions and be able to
  explain the resulting code in interviews.
- When suggesting technologies, explain the problem first, then possible
  solutions, then why the chosen solution is appropriate.

## Agreed initial stack

Core:
- TypeScript
- React
- Next.js
- Next.js App Router
- PostgreSQL

Database:
- Drizzle ORM

Authentication:
- Better Auth

Validation:
- Zod

Forms:
- React Hook Form

Styling:
- Tailwind CSS
- shadcn/ui

Deployment:
- Vercel
- Neon or Supabase PostgreSQL

Version control:
- Git
- GitHub

Testing:
- Vitest
- Playwright

Later / only when needed:
- Sentry
- Cloudflare R2 or Supabase Storage
- Resend
- Realtime technology
- Inngest or Trigger.dev
- Advanced search technology

## Architecture

We are intentionally NOT starting with a separate React frontend and
Express backend.

Initial architecture:

Browser
  |
  v
Next.js
  - React UI
  - Server Components
  - Client Components
  - Server Actions
  - Route Handlers where appropriate
  - Authentication
  - Authorization
  - Validation
  |
  v
Drizzle
  |
  v
PostgreSQL

Reason:
The developer wants to learn Next.js, and the application does not initially
need a separate backend service. Keeping the frontend and server-side logic in
one Next.js application reduces unnecessary complexity.

## Important Next.js concepts

Do NOT describe Next.js simply as "an SSR framework".

The application can mix server and client code.

Important concepts to learn:
- Server Components
- Client Components
- Server Actions
- Route Handlers
- static rendering
- dynamic rendering
- caching
- authentication
- authorization
- browser/server boundaries

SSR is not required because of SEO. This is an internal team application.
Next.js server-side capabilities are useful for server-side logic, database
access, security, authentication, and reducing unnecessary API boilerplate.

## Initial MVP

### Authentication
- Login
- Logout
- User/session handling
- Eventually team invitations

### Users
- Name
- Email
- Role
- Team/subteam

### Teams/subteams
- Brakes
- Electrical
- Suspension 
- Chassis
- Drivetrain

### Projects
Potential examples:
- 2026 Car
- Accumulator
- Suspension
- Telemetry
- Driverless

### Tasks
- Title
- Description
- Status
- Priority
- Assignee
- Project
- Due date
- Created by

### Dashboard
- Overdue tasks
- Active tasks
- Completed tasks
- User's tasks
- Basic project/team progress

## Development milestones

### Milestone 1
- Git repository
- Next.js project
- Runs locally
- Basic page
- Basic Git workflow

### Milestone 2
- PostgreSQL
- Drizzle
- Database schema
- Read/write data

### Milestone 3
- Authentication
- Users
- Sessions

Then:
- Teams
- Projects
- Tasks
- Dashboard
- Authorization/RBAC
- Testing
- Deployment

## Git / Neovim / terminal learning goal

The developer uses Neovim and terminal and wants to become comfortable with
the complete terminal-based workflow.

Teach:
- git status
- git add
- git commit
- git log
- git diff
- git branch
- git switch
- git merge/rebase when appropriate
- git push
- git pull
- GitHub workflow
- useful terminal commands
- Neovim workflow

Do not assume GUI Git tooling.

When giving shell commands:
1. Explain what each command does.
2. Explain important flags/options when they matter.
3. Prefer safe and understandable commands.
4. Warn before destructive commands.

When giving code:
1. Explain its purpose.
2. Explain important syntax.
3. Explain where the file belongs.
4. Explain how it connects to the application.
5. Avoid unexplained boilerplate.

## AI usage philosophy

AI is being used responsibly as a development and learning tool.

AI should help with:
- explaining concepts
- debugging
- comparing approaches
- researching unfamiliar APIs
- reviewing code
- accelerating implementation

AI should NOT turn the project into a black box.

Architectural decisions should be explicitly discussed.

If an architectural decision changes, document it in DECISIONS.md.

## Context / handoff files

Recommended files:
- docs/PROJECT.md
- docs/ARCHITECTURE.md
- docs/DECISIONS.md
- docs/DATABASE.md
- docs/PROGRESS.md
- docs/AI_CONTEXT.md

This file is the portable context for AI assistants.

## Current status

The application has NOT started being implemented yet.

The next tasks are:
1. Confirm the operating system.
2. Create/confirm the Git repository.
3. Clone it locally.
4. Create the Next.js project from the terminal.
5. Run it locally.
6. Make the first Git commit.
7. Learn the basic terminal + Git + Neovim workflow.

## Current immediate task

Help the developer set up the project using Neovim and the terminal.

The developer wants to understand what each command and piece of code does.

## Important constraints

- Explain every significant piece of code supplied.
- Prefer teaching over code dumping.
- Keep architecture simple.
- Use the agreed stack unless there is a reason to reconsider it.
- Discuss alternatives when making meaningful technical decisions.
- Do not assume SSR is mandatory.
- Do not introduce infrastructure without a concrete reason.

