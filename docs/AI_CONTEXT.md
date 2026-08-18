# Formula Student Manager — AI Project Context


## Project


**Name:** Formula Lab


**Purpose:**
A full-stack web application for managing a Formula Student team's members,
teams, tasks, deadlines, and eventually other team workflows.


The application should be accessible from anywhere by teammates without the
developer's personal computer being switched on.


---


## Developer background


The developer is already familiar with:


* React
* TypeScript
* Node.js
* Electron
* PostgreSQL
* Desktop/web app development concepts


The developer is learning:


* Next.js
* Modern web application architecture
* Browser/server boundaries
* Web deployment
* Production web development
* Using Neovim and the terminal as the primary development environment
* Using Git from the terminal/Neovim workflow
* Drizzle ORM
* Database schema design and migrations


### Teaching preferences


* Explain code that is provided.
* Do not dump large amounts of unexplained code.
* Explain what a piece of code does, why it is needed, and important syntax.
* Prefer incremental implementation and debugging over generating the entire app.
* The developer wants to understand architectural decisions and be able to
  explain the resulting code in interviews.
* When suggesting technologies, explain the problem first, then possible
  solutions, then why the chosen solution is appropriate.
* Prefer understanding and verifying each step over blindly following commands.
* Explain important Git commands and distinguish the working tree, staging
  area, and commits.
* Explain unfamiliar programming concepts and syntax when they are introduced.
* Prefer teaching the reasoning behind database design rather than simply
  generating schemas.


---


## Agreed initial stack


### Core


* TypeScript
* React
* Next.js
* Next.js App Router
* PostgreSQL


### Database


* Drizzle ORM
* Neon PostgreSQL


### Authentication
Reason

The developer wants to learn Next.js, and the application does not initially
need a separate backend service.

Keeping the frontend and server-side logic in one Next.js application reduces
unnecessary complexity.

Important Next.js concepts

Do not describe Next.js simply as "an SSR framework."

The application can mix server and client code.

Important concepts to learn:

Server Components
Client Components
Server Actions
Route Handlers
static rendering
dynamic rendering
caching
authentication
authorization
browser/server boundaries

SSR is not required because of SEO. This is an internal team application.

Next.js server-side capabilities are useful for:

server-side logic
database access
security
authentication
authorization
reducing unnecessary API boilerplate
Database architecture

The application uses:

Next.js
   |
   v
Drizzle ORM
   |
   v
@neondatabase/serverless
   |
   v
Neon PostgreSQL
Drizzle responsibilities

Drizzle is responsible for:

defining database schemas in TypeScript
querying PostgreSQL
providing type-safe database access
working with database schema changes through Drizzle Kit
Neon responsibilities

Neon provides the hosted PostgreSQL database.

The database connection string is stored in:

.env.local

The connection string must never be committed to Git or pasted into
conversation.

.env.local has been verified as ignored by Git.

Current database files

The project currently contains:

src/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
└── db/
    ├── index.ts
    └── schema.ts


drizzle.config.ts
drizzle.config.ts

Purpose:

tells Drizzle Kit where the schema is located
tells Drizzle Kit that the database is PostgreSQL
loads .env.local
provides the DATABASE_URL to Drizzle Kit

Current configuration:

import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";


config({ path: ".env.local" });


export default defineConfig({
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
src/db/index.ts

This contains the application database client:

import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";


const sql = neon(process.env.DATABASE_URL!);


export const db = drizzle(sql);

Important architectural point:

src/db/index.ts is server-only.

It must not be imported into browser/client code because it provides access
to the database and relies on server-side environment variables.

server-only is used to make accidental client-side imports fail during the
Next.js build/development process.

Current Formula Lab database model

The initial database model has now been agreed upon.

The MVP focuses on:

Team
User
Task
Task Responsibility

Projects are not part of the initial database model.

They may be introduced later if the team's workflow requires them.

Teams

The teams table represents Formula Student subteams/departments.

Initial teams:

Chassis
Drivetrain
Suspension
Brakes
Electronics

Additional teams can be added later without changing the database schema.

Examples:

Business
Media
Marketing
etc.

Important design decision:

Teams are data, not hard-coded database structure.

The schema only defines what a team looks like:

teams
----------------
id
name

The actual team names are stored as rows in the table.

Team requirements
A team has a unique name.
A team can have many users.
A team can have many tasks.
Each user belongs to one team.
Each task belongs to one team.
Each team has exactly one team leader.
Users

Users represent Formula Lab members.

Initial conceptual fields:

users
----------------
id
name
email
team_id
role
User requirements
A user belongs to exactly one team.
A user has one role.
Roles are:
team_leader
member
Each team should have exactly one team leader.

Better Auth will eventually manage authentication and session-related data.

The application user model should be designed to work alongside Better Auth
rather than attempting to recreate authentication manually.

User roles

The user role is represented using a PostgreSQL enum.

Current allowed values:

team_leader
member

In Drizzle:

export const userRole = pgEnum("user_role", [
  "team_leader",
  "member",
]);

The enum is then used by the users table:

role: userRole("role").notNull(),

Important teaching point:

pgEnum(...) defines a PostgreSQL enum type.

Calling:

userRole("role")

uses that enum as the type of the role column.

The enum prevents arbitrary values from being stored in the role column.

The database should eventually enforce the additional business rule that
each team has exactly one team leader.

Tasks

Tasks are the primary workflow object in the MVP.

Every task:

belongs to exactly one team
has a creator
can have multiple responsible users
has a status
has a priority
has a due date
has creation/update timestamps

There is no primary assignee.

The application deliberately uses responsible users instead.

For example:

Task:
  Design brake pedal mount


Team:
  Brakes


Created by:
  Alice


Responsible:
  Bob
  Charlie

The distinction is:

team_id = which team owns the task
created_by_id = who created the task
task_responsibilities = which users are responsible for completing it
Task status

Task status is represented using a PostgreSQL enum.

Current planned values:

todo
in_progress
completed
cancelled

Conceptually:

todo
  |
  v
in_progress
  |
  v
completed

cancelled allows a task to be closed without pretending it was completed.

The exact workflow may be expanded later if required.

Task priority

Task priority is represented using a PostgreSQL enum.

Current values:

low
medium
high

New tasks default to:

medium
Task table

The conceptual structure is:

tasks
----------------
id
title
description
team_id
created_by_id
status
priority
due_date
created_at
updated_at

Important relationships:

tasks.team_id
      |
      v
teams.id

and:

tasks.created_by_id
      |
      v
users.id

Therefore:

Task ──────► Team
Task ──────► User (creator)
Task responsibilities

A task can have multiple responsible users.

A user can be responsible for multiple tasks.

This is a many-to-many relationship.

It is represented using a junction table:

task_responsibilities
----------------------
task_id
user_id

Relationships:

task_responsibilities.task_id
        |
        v
     tasks.id

and:

task_responsibilities.user_id
        |
        v
     users.id

Conceptually:

User ──────────────┐
                   │
                   ▼
              Task Responsibility
                   ▲
                   │
Task ──────────────┘

The junction table should use a composite primary key:

(task_id, user_id)

This prevents the same user from being added as responsible for the same task
more than once.

Current Drizzle schema progress

The real Formula Lab schema is currently being implemented incrementally.

The temporary test schema has been replaced by the beginning of the actual
Formula Lab model.

The current schema includes:

teams
user_role enum
users
task_status enum
task_priority enum
tasks

The task_responsibilities junction table is the next major table to add.

The task date/time fields are also being reviewed so that proper PostgreSQL
date/time types are used rather than storing dates/times as arbitrary text.

Current schema design principles
IDs

The project uses UUIDs rather than sequential integer IDs.

Example:

id: uuid("id").primaryKey().defaultRandom(),

Reasons:

IDs are not predictable/sequential.
UUIDs work well in distributed/web applications.
PostgreSQL supports UUIDs natively.
Drizzle provides straightforward UUID support.
Foreign keys

Relationships are enforced using PostgreSQL foreign keys.

Example:

teamId: uuid("team_id")
  .notNull()
  .references(() => teams.id),

This means:

the user must have a team
the stored team_id must refer to an existing team

The database therefore enforces data integrity rather than relying only on
application code.

Nullable vs required fields

Fields should only be nullable when the application has a meaningful reason
for allowing them to be absent.

For example:

title: text("title").notNull(),

because every task needs a title.

Whereas:

description: text("description"),

allows a task to exist without a description.

Nullability should be deliberately discussed rather than added or removed
arbitrarily.

Database verification completed

The following have been successfully verified.

Drizzle Kit installation

Installed:

drizzle-orm@0.45.2
@neondatabase/serverless@1.1.0
drizzle-kit@0.31.10
dotenv
Configuration

Drizzle Kit successfully loads:

.env.local

and can access:

DATABASE_URL

without exposing the value.

Schema deployment

This command successfully connected to Neon and applied the schema:

npx drizzle-kit push

Output included:

Using '@neondatabase/serverless' driver for database querying
[✓] Pulling schema from database...
[✓] Changes applied

Therefore Drizzle Kit and the Neon database connection are working.

Application connection

A temporary TypeScript connection test successfully executed:

SELECT 1 AS connected

and returned:

[ { connected: 1 } ]

The temporary test file was deleted afterward.

Type checking

The following command completed without errors:

npx tsc --noEmit

This is being used regularly while building the schema.

Drizzle Kit note

drizzle-kit check produced an unexpected AWS Data API error despite the
PostgreSQL configuration being valid and the Neon connection working through
drizzle-kit push.

The error was:

Please provide required params for AWS Data API driver:
database: undefined
secretArn: 'postgresql'

This did not prevent the actual Neon workflow from working.

drizzle-kit push successfully used the Neon serverless driver and applied
the schema.

Do not spend further time debugging drizzle-kit check unless it becomes
necessary for the project's migration workflow.

Initial MVP
Authentication
Login
Logout
User/session handling
Eventually team invitations

Authentication will be implemented using Better Auth.

Users
Name
Email
Team
Role

Roles:

team_leader
member
Teams

Initial teams:

Chassis
Drivetrain
Suspension
Brakes
Electronics

Teams can be added later, for example:

Business
Media
Marketing
Tasks
Title
Description
Team
Creator
Responsible users
Status
Priority
Due date
Created timestamp
Updated timestamp

There is intentionally no primary assignee.

Dashboard

Potential features:

Overdue tasks
Active tasks
Completed tasks
Tasks for the user's team
Tasks a user is responsible for
Basic team progress
Projects

Projects are not currently part of the MVP database model.

Earlier planning included projects such as:

2026 Car
Accumulator
Suspension
Telemetry
Driverless

These may be introduced later if the application needs project-level
organisation.

Do not add a projects table simply because it appeared in earlier planning.

Development milestones
Milestone 1
Git repository
Next.js project
Runs locally
Basic page
Basic Git workflow

Status: substantially complete

Milestone 2
PostgreSQL
Drizzle
Database schema
Read/write data

Status: in progress

Completed:

Neon PostgreSQL database
Drizzle ORM installation
Drizzle Kit installation
Database configuration
Neon connection
Server-side database client
Initial schema deployment
UUID-based schema design
Teams table
Users table
User role enum
Tasks table
Task status enum
Task priority enum

Remaining:

finalize task date/time types
add task_responsibilities
enforce the one-team-leader-per-team rule
seed initial teams
establish the preferred migration workflow
implement application database queries
Milestone 3
Authentication
Users
Sessions

Then:

Teams
Tasks
Dashboard
Authorization/RBAC
Testing
Deployment

Projects may be introduced later if required.

Git / Neovim / terminal learning goal

The developer uses Neovim and terminal and wants to become comfortable with
the complete terminal-based workflow.

Teach:

git status
git add
git commit
git log
git diff
git branch
git switch
git merge / rebase when appropriate
git push
git pull
GitHub workflow
useful terminal commands
Neovim workflow

When giving shell commands:

Explain what each command does.
Explain important flags/options when they matter.
Prefer safe and understandable commands.
Warn before destructive commands.

Important Git principle:

working tree = changes not staged
staging area = changes selected for the next commit
commit = saved snapshot in local Git history
push = sends commits to a remote such as GitHub

Avoid committing secrets.

AI usage philosophy

AI is being used responsibly as a development and learning tool.

AI should help with:

explaining concepts
debugging
comparing approaches
researching unfamiliar APIs
reviewing code
accelerating implementation

AI should NOT turn the project into a black box.

Architectural decisions should be explicitly discussed.

If an architectural decision changes, document it in DECISIONS.md.

Context / handoff files

Recommended files:

docs/PROJECT.md
docs/ARCHITECTURE.md
docs/DECISIONS.md
docs/DATABASE.md
docs/PROGRESS.md
docs/AI_CONTEXT.md

This file is the portable context for AI assistants.

Current Git / security rules

Important:

.env.local is ignored by Git.
.env.local must remain untracked.
Never commit the database connection string.
Never paste the database connection string into AI conversations.
Never add .env.local to Git.
Review git status before committing.
Review staged changes when a significant dependency or schema change is
being committed.
Current immediate next task

Continue implementing the agreed Formula Lab database schema incrementally.

The next steps are:

Finalize proper PostgreSQL date/time types for tasks.
Add the task_responsibilities many-to-many junction table.
Add the database constraint needed to enforce exactly one team leader per
team.
Type-check the complete schema.
Review the schema before applying it to Neon.
Add initial team data.
Establish the preferred Drizzle migration workflow.
Begin implementing database queries through the server-side database
client.

Do not immediately generate large amounts of application code.

Continue explaining each significant database concept and architectural
decision before implementing it.
