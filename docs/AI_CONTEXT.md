# Formula Student Manager — AI Project Context

## Project

**Name:** Formula Lab

**Purpose:**
A full-stack web application for managing a Formula Student team's members,
teams, projects, tasks, deadlines, and eventually other team workflows.

The application should be accessible from anywhere by teammates without the
developer's personal computer being switched on.

---

# Developer

The developer already understands:

* SQL
* PostgreSQL
* relational database concepts
* primary keys
* foreign keys
* relationships
* database normalization
* React
* TypeScript
* Node.js
* Electron
* general web/desktop development concepts

The developer is learning:

* Next.js
* Next.js App Router
* modern full-stack web architecture
* browser/server boundaries
* Server Components
* Client Components
* Server Actions
* Route Handlers
* production web development
* Drizzle ORM syntax
* Drizzle schema design
* Better Auth
* authentication architecture
* Git/Neovim/terminal workflow

### Teaching preference

The developer wants to **write the code themselves**.

AI should act primarily as:

* teacher
* architect
* debugger
* reviewer
* technical discussion partner

AI should not turn the project into a copy/paste exercise.

When implementing features:

1. Explain the problem first.
2. Explain the architectural decision.
3. Explain important syntax when it is unfamiliar.
4. Let the developer implement the code.
5. Help diagnose errors.
6. Prefer small incremental changes.
7. Avoid dumping complete features unless explicitly requested.

The developer already understands SQL, so database explanations should focus on
how the concepts translate into Drizzle rather than re-teaching relational
database fundamentals.

The developer wants to understand decisions well enough to explain the
resulting architecture in interviews.

---

# Agreed Stack

## Core

* TypeScript
* React
* Next.js
* Next.js App Router
* PostgreSQL

## Database

* Drizzle ORM
* Neon PostgreSQL
* @neondatabase/serverless

## Authentication

* Better Auth
* Email/password authentication
* Invitation-only registration

## Validation

* Zod

## Forms

* React Hook Form

## Styling

* Tailwind CSS
* shadcn/ui

## Deployment

* Vercel
* Neon PostgreSQL

## Version control

* Git
* GitHub

## Testing

* Vitest
* Playwright

## Later / only when needed

* Sentry
* Cloudflare R2 or Supabase Storage
* Resend
* Realtime technology
* Inngest or Trigger.dev
* Advanced search technology

---

# Architecture

The application is intentionally **not** split into a separate React frontend
and Express backend.

The initial architecture is:

Browser → Next.js → Drizzle ORM → Neon PostgreSQL

Next.js will contain:

* React UI
* Server Components
* Client Components
* Server Actions
* Route Handlers where appropriate
* authentication
* authorization
* validation
* server-side database access

The application does not initially require a separate backend service.

The developer is specifically using this project to learn Next.js and modern
full-stack web architecture.

---

# Important Next.js Concepts

Next.js should not be described simply as an SSR framework.

The application can mix server and client code.

Important concepts being learned:

* Server Components
* Client Components
* Server Actions
* Route Handlers
* static rendering
* dynamic rendering
* caching
* authentication
* authorization
* browser/server boundaries

SSR is not required for SEO because Formula Lab is an internal team
application.

Next.js server-side capabilities are useful for:

* server-side logic
* database access
* security
* authentication
* authorization
* reducing unnecessary API boilerplate

---

# Database Architecture

The application uses:

Next.js → Drizzle ORM → @neondatabase/serverless → Neon PostgreSQL

### Drizzle responsibilities

Drizzle is responsible for:

* defining PostgreSQL schemas in TypeScript
* querying PostgreSQL
* providing type-safe database access
* managing schema changes through Drizzle Kit

### Neon responsibilities

Neon provides the hosted PostgreSQL database.

The database connection string is stored in `.env.local`.

The connection string must never be committed to Git or pasted into
conversation.

`.env.local` is ignored by Git.

---

# Database Files

Current database-related files include:

* `src/db/schema.ts`
* `src/db/index.ts`
* `drizzle.config.ts`

### `drizzle.config.ts`

Purpose:

* tells Drizzle Kit where the schema is
* identifies PostgreSQL as the dialect
* loads `.env.local`
* provides `DATABASE_URL` to Drizzle Kit

### `src/db/index.ts`

Contains the application database client.

It is server-only.

It must not be imported into browser/client code because it provides database
access and depends on server-side environment variables.

The project uses `server-only` to prevent accidental client-side imports.

---

# Database Verification

The following have been successfully verified:

* Drizzle ORM is installed and working.
* Drizzle Kit is installed and working.
* Neon PostgreSQL connection works.
* `.env.local` is loaded correctly.
* `DATABASE_URL` is available without exposing its value.
* Drizzle Kit can push schema changes to Neon.
* Application database access works.
* TypeScript compilation has been successfully verified during development.
* Temporary database connection tests have successfully queried PostgreSQL.

The temporary database test files used during setup were removed afterward.

---

# Drizzle Kit Note

`drizzle-kit check` previously produced an unexpected AWS Data API error even
though the PostgreSQL/Neon configuration was valid.

The error referred to missing AWS Data API parameters.

This did not prevent the actual Neon workflow from working.

`drizzle-kit push` successfully uses the Neon serverless driver and applies
schema changes.

Do not spend additional time debugging `drizzle-kit check` unless it becomes
necessary for the migration workflow.

---

# Current Database Model

The real Formula Lab database model has now been designed and implemented in
Drizzle.

## Teams

A `teams` entity represents a Formula Lab team.

Initial teams:

* Chassis
* Drivetrain
* Suspension
* Brakes
* Electronics

Additional teams can be added later, for example:

* Business
* Media

Teams are intentionally data-driven rather than hard-coded so the application
can grow.

Each team has:

* unique ID
* unique name

---

# Users

The `users` table represents Formula Lab users.

Current conceptual fields:

* ID
* name
* email
* team
* role

The user's team is represented through a foreign key to `teams`.

The user's role is represented by a PostgreSQL enum.

Current roles:

* `team_leader`
* `member`

There is currently a database constraint ensuring that a team has at most one
team leader.

Authentication will eventually integrate Better Auth with the existing user
model rather than creating an unnecessary duplicate Formula Lab user table.

The exact Better Auth integration still needs to be designed and implemented.

---

# Tasks

Every task belongs to exactly one team.

A task has:

* title
* optional description
* team
* creator
* status
* priority
* optional due date
* creation timestamp

A task does **not** have a single primary assignee.

Instead, a task can have multiple responsible users.

This is necessary because Formula Lab has cross-team work.

For example:

A single task could involve:

* one Electronics member
* one Drivetrain member

Therefore task responsibility is represented using a many-to-many relationship.

---

# Task Responsibilities

The `task_responsibilities` table links:

* tasks
* users

It uses a composite primary key consisting of:

* task ID
* user ID

This prevents the same user from being assigned responsibility for the same
task more than once.

A task still belongs to one primary team through its own team foreign key.

The responsible users may belong to different teams.

This supports cross-team tasks.

---

# Task Status

Current task statuses:

* `todo`
* `in_progress`
* `completed`
* `cancelled`

---

# Task Priority

Current priorities:

* `low`
* `medium`
* `high`

---

# Dashboard Requirement

When a user views the dashboard, they should see the tasks that are still
pending for their team.

Because tasks can have responsible users from different teams, dashboard
queries will eventually need to account for both:

* the task's owning team
* users responsible for the task

The exact dashboard query logic will be designed when the dashboard is built.

---

# Invitations

Registration is **invitation-only**.

For the initial MVP:

* only the developer can create invitations
* team leaders cannot create invitations yet
* invitations are for SETU student email addresses
* the required email domain is `setu.ie`
* the student chooses their own team during registration
* the invitation does not contain a team
* new students initially receive the `member` role

The invitation controls whether an email address is authorized to register.

It does not determine the student's team.

---

# Invitation Entity

The `invitations` table has been designed and added to the Drizzle schema.

Conceptual fields:

* ID
* email
* token
* expiration timestamp
* accepted timestamp
* creation timestamp

### Invitation rules

* ID is a UUID primary key.
* Email is required.
* Token is required and unique.
* Expiration is required.
* Accepted timestamp is nullable.
* Creation timestamp is required and defaults to the current time.

`acceptedAt` is used instead of a boolean such as `used`.

Therefore:

* `acceptedAt = NULL` means the invitation has not been accepted.
* a populated `acceptedAt` means the invitation was successfully used.

This preserves useful historical information.

Invitations are not automatically deleted when expired.

An invitation is valid only when it:

* has not been accepted
* has not expired

Only one active invitation should exist for a given email address.

The implementation of that business rule will be handled when the invitation
workflow is built.

---

# Invitation Security

Invitation tokens are temporary secrets.

They must be:

* cryptographically random
* sufficiently unpredictable
* single-use
* associated with the invitation record
* invalid after acceptance
* invalid after expiration

Tokens must not be predictable values such as sequential IDs, names, or email
addresses.

The invitation token is separate from the user's password.

The token proves:

> This email address was invited to register.

The password is later handled by Better Auth for authentication.

---

# Authentication Design

The application will use Better Auth.

Authentication method:

* email
* password

Registration is not publicly available.

A student must have a valid invitation before being allowed to create an
account.

The intended flow is:

1. Developer creates an invitation for a student's SETU email.
2. Student receives an invitation link.
3. Student opens the invitation link.
4. The application validates the invitation.
5. Student enters their name and password.
6. Student chooses their Formula Lab team.
7. The account is created.
8. The student becomes a `member`.
9. The invitation is marked as accepted.
10. The student receives an authenticated session.

The student's team is chosen during registration rather than being selected by
the person sending the invitation.

The invitation therefore establishes eligibility, while the student chooses
their team.

---

# Authentication vs Authorization

These are deliberately separate concepts.

### Authentication

Better Auth answers:

> Who is this person?

### Authorization

Formula Lab answers:

> What is this person allowed to do?

Examples:

* which team the user belongs to
* whether the user is a team leader
* which team data they can manage
* which tasks they can modify

Better Auth handles authentication infrastructure.

Formula Lab owns its application-specific authorization rules.

---

# Better Auth User Integration

The preferred architecture is to avoid maintaining two separate representations
of the same person.

The existing Formula Lab `users` model should be integrated with Better Auth's
user model where practical.

Better Auth needs additional authentication-related data such as:

* sessions
* authentication credentials
* potentially accounts/providers
* verification information

The exact Better Auth schema and integration have **not yet been implemented**.

Before modifying the user schema for Better Auth, explicitly discuss:

* Better Auth's required tables
* how its user table maps to the existing Formula Lab user
* additional user fields
* relationships between authentication data and Formula Lab data
* how invitations interact with registration

Do not blindly replace the existing user model.

---

# Signup Email Rule

The initial application is intended for SETU students.

The registration process should enforce the `@setu.ie` email domain.

The invitation should also be associated with the invited email address.

The registration flow should ensure that the email used for account creation
matches the email that was invited.

The student should not be able to use someone else's invitation token to create
an account for a different email address.

---

# Invitation Workflow

The intended future workflow is:

Developer
→ creates invitation
→ invitation is stored
→ invitation email is sent
→ student clicks secure link
→ invitation is validated
→ student registers
→ student chooses team
→ Better Auth creates/authenticates the account
→ invitation is marked accepted

Email delivery has not yet been implemented.

For the first implementation, invitation creation can be tested without
sending real email.

---

# Current Next.js Direction

Invitation functionality will eventually be implemented using server-side
Next.js logic.

A likely structure is:

* UI
* Server Action
* invitation validation/business logic
* Drizzle
* PostgreSQL

The developer is currently learning Server Actions and the browser/server
boundary.

Before implementing the invitation function, explain:

* what a Server Action is
* what `"use server"` means
* why invitation/database logic belongs on the server
* what data should cross the browser/server boundary

---

# Current Project Structure

The project currently includes:

* `src/app/`
* `src/app/actions/`
* `src/db/`
* `src/data/`
* `drizzle.config.ts`

The `src/app/actions/` directory has already been used for the seed-team
Server Action.

Seed teams have been successfully created in the database and are visible in
the application.

The initial seed functionality was only for development and database setup.

---

# Completed Development Milestones

## Milestone 1 — Project Setup

Completed:

* Git repository
* Next.js project
* local development
* basic page
* initial Git workflow

## Milestone 2 — Database Foundation

Completed:

* PostgreSQL
* Neon
* Drizzle ORM
* Drizzle Kit
* database client
* initial schema
* database connectivity
* schema deployment
* teams
* users
* tasks
* task responsibilities
* enums
* constraints
* invitation table

## Milestone 3 — Initial Data

Completed:

* team seed functionality
* initial Formula Student teams inserted into Neon
* teams displayed by the application

## Milestone 4 — Authentication

Started.

Agreed:

* Better Auth
* email/password
* invitation-only registration
* SETU email domain
* developer-only invitation creation
* student chooses team
* new users default to member

Remaining:

* Better Auth architecture
* Better Auth schema
* Better Auth integration
* invitation creation
* invitation validation
* signup flow
* sessions
* protected routes
* authorization

---

# Current Immediate Next Task

The immediate next task is to begin implementing the invitation workflow.

First, understand Next.js Server Actions and the server/client boundary.

Then create the server-side invitation operation that will eventually:

* receive an email
* validate the SETU domain
* generate a secure invitation token
* calculate an expiration time
* create the invitation record
* eventually trigger invitation email delivery

Do not implement email delivery yet.

Do not implement the complete signup flow yet.

Build and verify the invitation creation mechanism first.

---

# Git / Terminal / Neovim Learning

The developer uses Neovim and the terminal and wants to become comfortable
with the complete terminal-based workflow.

Teach:

* `git status`
* `git add`
* `git commit`
* `git log`
* `git diff`
* `git branch`
* `git switch`
* `git merge`
* `git rebase` when appropriate
* `git push`
* `git pull`
* GitHub workflow
* useful terminal commands
* Neovim workflow

When giving commands:

1. Explain what each command does.
2. Explain important flags when relevant.
3. Prefer safe commands.
4. Warn before destructive commands.

Important Git concepts:

* working tree = changes not staged
* staging area = changes selected for the next commit
* commit = saved snapshot in local Git history
* push = sends commits to a remote repository

Never commit secrets.

---

# AI Usage Philosophy

AI is being used as a development and learning tool.

AI should help with:

* explaining concepts
* debugging
* comparing approaches
* researching unfamiliar APIs
* reviewing code
* architectural reasoning
* accelerating learning

AI should **not** turn Formula Lab into a black box.

The developer writes the implementation.

Architectural decisions should be explicitly discussed.

If an architectural decision changes, document it in `DECISIONS.md`.

AI should not assume that producing a complete code solution is the best way
to help.

When the developer asks what to do next, prefer:

1. explain the objective
2. explain why it matters
3. identify the relevant concepts
4. give the developer a small implementation task
5. review/debug the result

---

# Context / Handoff Files

Recommended project documentation:

* `docs/PROJECT.md`
* `docs/ARCHITECTURE.md`
* `docs/DECISIONS.md`
* `docs/DATABASE.md`
* `docs/PROGRESS.md`
* `docs/AI_CONTEXT.md`

`AI_CONTEXT.md` is the portable context for AI assistants.

It should document:

* architecture
* decisions
* project state
* data model
* development philosophy
* current task
* important constraints

It should **not** become a copy of the project's source code.

Source code belongs in the repository.

---

# Security Rules

Never commit:

* `.env.local`
* database connection strings
* passwords
* authentication secrets
* invitation tokens
* API keys

Invitation tokens are secrets and should not be exposed unnecessarily in logs,
UI, or source control.

Database access must remain server-side.

Client components must not directly import the database client.

---

# Current Checkpoint

The following are currently true:

* Neon is connected.
* Drizzle is working.
* The main database schema exists.
* Teams exist and have been seeded.
* Users, tasks, and task responsibility relationships are designed.
* Invitation schema exists and has been pushed to Neon.
* The project is ready to begin the invitation/authentication workflow.
* Better Auth has been selected but is not yet integrated.
* Email delivery has not yet been implemented.

The next work should focus on understanding and implementing the invitation
workflow before moving deeper into the authentication system.

