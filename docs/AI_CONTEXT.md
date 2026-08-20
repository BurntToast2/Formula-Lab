# Formula Lab — AI Context

## Project

Formula Lab is a university team/task management application being developed for SETU students.

The developer is building the application personally and wants to understand the code and architecture rather than have AI write the application for them.

**Important working rule:** AI should teach, explain, review, debug, and guide the developer. Do not proactively write application code unless the developer explicitly asks for code.

The developer already understands SQL and database concepts well. The main learning areas are TypeScript, React, Next.js, Server Actions, Drizzle ORM syntax, and related application architecture.

---

## Current Stack

* Next.js
* TypeScript
* React
* PostgreSQL hosted on Neon
* Drizzle ORM
* Zod
* Git/GitHub

---

## Database

The database currently contains these core entities:

### Teams

Teams have:

* ID
* Name

Team names are unique.

### Users

Users have:

* ID
* Name
* Email
* Team
* Role

Users belong to a team.

Current roles:

* Team leader
* Member

There is a database constraint ensuring only one team leader can exist per team.

### Tasks

Tasks have:

* ID
* Title
* Description
* Team
* Creator
* Status
* Priority
* Due date
* Creation timestamp

Current statuses:

* Todo
* In progress
* Completed
* Cancelled

Current priorities:

* Low
* Medium
* High

### Task Responsibilities

Tasks can have multiple responsible users.

This is represented through a linking table between tasks and users.

This supports cross-team work because a task can involve people from different teams while remaining associated with its primary team.

### Invitations

An invitations table has been added.

It stores:

* ID
* Email
* Invitation token
* Expiry timestamp
* Accepted timestamp
* Creation timestamp

Invitation tokens are generated securely on the server.

Invitations currently expire after seven days.

An invitation is considered valid only when:

* The token matches
* The invitation has not been accepted
* The invitation has not expired

---

## Invitation System

The intended authentication flow is:

1. Only the administrator can create invitations for now.
2. The administrator enters a student's SETU email address.
3. The email must belong to the `setu.ie` domain.
4. The server validates the email using Zod.
5. The server generates a secure random invitation token.
6. The server calculates a seven-day expiry.
7. The invitation is stored in PostgreSQL.
8. The student will eventually receive an invitation link.
9. The student follows the link.
10. The server validates the invitation token.
11. The student signs up using:

* Name
* Email
* Password
* Team selection

12. The student chooses their own team.
13. The invitation email must correspond to the email used during registration.
14. Once registration succeeds, the invitation will be marked as accepted.

The university domain is:

`setu.ie`

Students must be able to choose their own team rather than having the administrator assign teams manually.

---

## Current Server-Side Invitation Logic

A Server Action has been created for invitation creation.

It currently:

* Validates the email using Zod.
* Restricts invitations to `@setu.ie`.
* Generates a secure random token.
* Creates an expiry date seven days in the future.
* Inserts the invitation into PostgreSQL using Drizzle.
* Returns a simple success/failure result.

A second server-side function has been created to retrieve an invitation by token.

It checks:

* Matching token
* `acceptedAt` is null
* `expiresAt` is later than the current time

The invitation lookup has been tested successfully against the real Neon database.

---

## React / Next.js Learning

The developer has refreshed basic React concepts including:

* Client Components
* `useState`
* Event handlers
* Inputs
* Buttons
* Calling Server Actions
* `async` functions
* `await`
* Promises

A temporary client-side testing component was created to test invitation creation and invitation lookup.

That testing component has now been removed because its purpose was completed.

Do not reintroduce temporary testing UI unless it is genuinely useful for debugging.

---

## Database / Drizzle Learning

The developer understands the underlying SQL concepts.

When explaining Drizzle, relate syntax to SQL where useful.

Important Drizzle concepts already covered:

* `db.insert(table)`
* `.values(...)`
* `db.select()`
* `.from(table)`
* `.where(...)`
* `and(...)`
* `eq(...)`
* `isNull(...)`
* `gt(...)`
* `.limit(...)`

The developer understands that Drizzle provides a TypeScript representation of SQL rather than requiring SQL strings for normal queries.

---

## Git

The project is now connected to GitHub.

The local repository uses the `master` branch.

The GitHub repository is Formula Lab.

The developer has successfully completed their first push to GitHub.

Useful Git concepts already covered:

* Working tree
* Staging
* Commits
* Remotes
* `git push`
* Upstream branches

The developer understands that commits represent meaningful checkpoints and that GitHub receives those commits when pushed.

---

## Dashboard Requirement

When a user views the dashboard, tasks that are still pending for that user's team should be displayed.

The system should support cross-team responsibilities.

A task may have multiple responsible users from different teams through the task responsibilities linking table.

The person responsible for a task carries out the task, while the task can involve multiple teams.

---

## Current Development Stage

Database foundations are working.

Team seeding is working.

Invitation creation is working end-to-end.

Invitation verification is working end-to-end.

GitHub backup is working.

The next major feature is the **student invitation/signup flow**.

The expected sequence is:

1. Build the invitation signup URL.
2. Read the invitation token from the URL.
3. Verify the invitation server-side.
4. Show the signup form for valid invitations.
5. Allow the student to enter their name, email, and password.
6. Allow the student to choose their own team.
7. Validate the signup server-side.
8. Create the user.
9. Mark the invitation as accepted.
10. Establish authentication/session handling.
11. Restrict invitation creation to the administrator.

Email delivery should come after the invitation/signup mechanics are working.

---

## Development Style

The developer prefers to build the system themselves and understand what each part does.

When helping:

* Explain concepts before or alongside implementation.
* Relate unfamiliar Drizzle syntax to SQL.
* Avoid unnecessary abstractions.
* Work incrementally.
* Let the developer attempt small pieces when practical.
* If the developer explicitly asks for code, provide the code and explain the important parts.
* Do not dump large amounts of application code without being asked.
* Do not assume the developer is unfamiliar with databases or SQL.
* Do not over-explain basic SQL concepts unless needed.

The developer wants AI to function primarily as a technical guide and teacher, while the developer remains the person writing the application.
