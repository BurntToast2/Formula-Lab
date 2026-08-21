# Formula Lab — AI Context

## Project Overview

**Formula Lab** is a university team and task management application being developed for SETU students.

The application is intended to support:

* Student accounts
* Team membership
* Team leadership
* Task creation and management
* Cross-team task responsibilities
* Invitation-based registration
* Role-based access
* Dashboard/task visibility

The project is being developed incrementally, with the application architecture and implementation decisions being understood and maintained throughout development.

---

## Working Rules for AI Assistance

The developer is responsible for writing and maintaining the application.

AI should primarily:

* Explain concepts.
* Explain why code works.
* Explain architectural decisions.
* Review code written by the developer.
* Debug errors.
* Suggest approaches.
* Guide implementation step-by-step.
* Relate unfamiliar concepts to existing project knowledge.

**Do not proactively provide application code unless the developer explicitly asks for code.**

When code is explicitly requested:

* Provide only the code necessary for the current step.
* Explain the important parts afterward.
* Avoid unnecessarily rewriting unrelated files.
* Avoid jumping ahead to future implementation details.

Do not discuss or infer the developer's skill level in project documentation or responses.

---

# Technology Stack

* Next.js
* React
* TypeScript
* PostgreSQL
* Neon
* Drizzle ORM
* Zod
* Git
* GitHub

Node.js built-in cryptography is currently used for secure invitation token generation.

Tailwind CSS and/or local CSS may be used for UI styling.

No additional UI component framework is currently required.

---

# Application Architecture

The project uses the Next.js App Router.

The general architecture is:

```text
React UI
   ↓
Server Actions
   ↓
Validation / business logic
   ↓
Drizzle ORM
   ↓
PostgreSQL / Neon
```

Client Components are used when browser-side React state or event handling is required.

Server Components are used where server-side data access can be performed directly.

Server Actions are used for operations that need to execute on the server, particularly mutations and protected database operations.

---

# Database

The database is PostgreSQL hosted on Neon.

Drizzle ORM is used as the TypeScript database layer.

## Teams

Teams currently contain:

* ID
* Name

Team names are unique.

Students can choose their own team during registration.

---

## Users

Users currently contain:

* ID
* Name
* Email
* Team
* Role

Users belong to a team.

Current roles:

* Team leader
* Member

There is a database constraint ensuring that only one team leader can exist per team.

---

## Tasks

Tasks currently contain:

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

---

## Task Responsibilities

A task can have multiple responsible users.

This is represented using a linking table between tasks and users.

This allows tasks to involve people from different teams while still having a primary team association.

The intended distinction is:

* The task belongs to a primary team.
* One or more users are responsible for carrying it out.
* Responsible users may belong to different teams.

---

## Invitations

The invitations table contains:

* ID
* Email
* Token
* Expiry timestamp
* Accepted timestamp
* Creation timestamp

Invitation tokens are generated securely on the server.

Invitations currently expire after seven days.

An invitation is considered valid only when:

* The token matches.
* `acceptedAt` is null.
* `expiresAt` is later than the current time.

---

# Invitation System

The current invitation flow is:

```text
Administrator
     ↓
Enter SETU email
     ↓
Zod validation
     ↓
Generate secure token
     ↓
Calculate 7-day expiry
     ↓
Insert invitation
     ↓
Invitation link
     ↓
Student signup
```

For now, only the administrator is intended to create invitations.

The university email domain is:

`setu.ie`

Invitation emails must belong to that domain.

Email delivery will be implemented after the invitation and signup mechanics are working.

---

# Invitation Server Actions

The invitation server-side logic currently includes functionality to:

### Create an invitation

The creation action:

1. Validates the email using Zod.
2. Requires the `@setu.ie` domain.
3. Generates a secure random token.
4. Creates an expiry date seven days in the future.
5. Inserts the invitation into PostgreSQL using Drizzle.
6. Returns a simple success/failure result.

The token is generated using Node's cryptographic random byte generation and converted to a hexadecimal string.

### Retrieve an invitation

A server-side lookup function retrieves an invitation by token.

The lookup checks:

* Matching token.
* `acceptedAt` is null.
* `expiresAt` is later than the current time.

This has been tested successfully against the real Neon database.

---

# Signup Flow

The next major feature is the student invitation/signup flow.

The intended flow is:

```text
Student receives invitation
        ↓
/signup?token=...
        ↓
Extract token
        ↓
Verify invitation server-side
        ↓
Valid invitation?
   ┌────┴────┐
  No        Yes
   ↓          ↓
Reject     Signup form
             ↓
       Enter registration data
             ↓
       Server-side validation
             ↓
       Create user
             ↓
       Mark invitation accepted
             ↓
       Authentication/session
```

The signup process should use the email stored on the invitation as the trusted email identity.

The student should not be able to use an invitation for one email address to register another email address.

The student chooses their own team.

---

# Signup Route

The signup route is:

`src/app/signup/page.tsx`

The route is:

`/signup`

An invitation link will use a query parameter:

`/signup?token=...`

URL query parameter syntax:

* `?` starts query parameters.
* `=` separates a parameter name from its value.
* `&` separates multiple query parameters.

The signup page receives query parameters through Next.js `searchParams`.

The intended page flow is:

```text
/signup?token=abc123
        ↓
searchParams
        ↓
token
        ↓
getInvitationByToken(token)
        ↓
database
        ↓
valid invitation?
```

A plain `/signup` URL should eventually be rejected because no invitation token is supplied.

An invalid, expired, or already-accepted invitation should also be rejected.

---

# Signup Form

The signup form is located at:

`src/app/signup/signup-form.tsx`

It is a Client Component because it requires React state and browser event handling.

The current form contains:

* First name
* Surname
* Email
* Password
* Create account button

The form currently uses React state for:

* `firstName`
* `surname`
* `password`

A team selection still needs to be added.

The email should eventually be supplied by the validated invitation rather than freely entered or modified by the student.

The intended data flow is:

```text
/signup?token=...
        ↓
page.tsx
        ↓
getInvitationByToken()
        ↓
invitation.email
        ↓
SignUpForm
```

The form's visual design is being developed separately from the backend logic.

---

# React Form Submission

The form should use `onSubmit` on the `<form>` element rather than placing the main submission logic on the submit button's `onClick`.

Reason:

* Clicking the submit button triggers form submission.
* Pressing Enter can also submit the form.
* `onSubmit` represents the semantic form operation.

The intended flow is:

```text
User submits form
       ↓
handleSubmit
       ↓
preventDefault()
       ↓
collect React state
       ↓
Server Action
```

`event.preventDefault()` prevents the browser's default form navigation/submission behaviour so the application can control the submission.

A `handleSubmit` function has been introduced and is intended to call the server-side validation function.

---

# Signup Validation

A Zod schema called `signUpSchema` has been created.

Current validation rules:

* `firstName`

  * string
  * minimum 2 characters
  * maximum 30 characters

* `surname`

  * string
  * minimum 2 characters
  * maximum 30 characters

* `password`

  * string
  * minimum 7 characters
  * maximum 30 characters

* `teamId`

  * number

The current password minimum is seven characters and may be strengthened later.

Email is deliberately excluded from the signup schema because the trusted email should come from the invitation record.

The conceptual structure is:

```text
Signup form
    ↓
firstName
surname
password
teamId
    ↓
signUpSchema.safeParse(...)
    ↓
success / validation errors
```

Zod can provide field-specific validation errors even when validating the entire signup object.

`safeParse()` is currently preferred because it returns a result that can be checked through `result.success` rather than throwing an exception for normal validation failures.

Zod's error information can be transformed into form-friendly errors using its error utilities such as `flatten()`.

---

# Server Actions and Async Behaviour

The invitation logic is located in:

`src/app/actions/invitations.ts`

The file uses:

`"use server";`

Exports from this file are treated as Server Actions by Next.js and therefore need to be asynchronous.

Zod's `safeParse()` itself is synchronous.

The `async` requirement is related to the Server Action boundary, not because Zod validation inherently requires asynchronous execution.

General pattern:

```text
async Server Action
       ↓
await database / server operation
       ↓
return result
```

The client receives a Promise when calling an async Server Action, which is why `await` is used when the returned result is needed.

---

# Drizzle ORM

The project uses Drizzle rather than raw SQL strings for normal database operations.

Important syntax already in use:

* `db.insert(table)`
* `.values(...)`
* `db.select()`
* `.from(table)`
* `.where(...)`
* `.limit(...)`
* `eq(...)`
* `and(...)`
* `isNull(...)`
* `gt(...)`

When explaining Drizzle, relate the operation to its SQL equivalent where useful.

For example:

```text
Drizzle
db.select().from(users).where(eq(users.id, id))
```

corresponds conceptually to:

```sql
SELECT *
FROM users
WHERE id = ...
```

The project uses Drizzle's TypeScript representation rather than manually constructing SQL strings for normal queries.

---

# Database Validation vs Zod Validation

Keep the distinction clear.

## Zod

Used for validating the **shape and basic rules of input**.

Examples:

* Required strings
* String lengths
* Email format
* Password format
* Numeric IDs

## Database

Used for validating **database state and relationships**.

Examples:

* Does the selected team actually exist?
* Does the invitation exist?
* Has the invitation already been accepted?
* Has the invitation expired?
* Does the email already belong to a user?
* Does a team already have a leader?

The intended signup process therefore uses both:

```text
Form input
    ↓
Zod
    ↓
basic validity
    ↓
Database checks
    ↓
business rules
    ↓
database mutation
```

---

# Authentication

Authentication/session handling has not yet been implemented.

The intended order is:

1. Invitation validation.
2. Signup form.
3. Server-side signup validation.
4. User creation.
5. Invitation acceptance.
6. Authentication/session handling.
7. Protected routes/dashboard.

Do not introduce a full authentication system prematurely unless it becomes necessary for the current step.

---

# Dashboard

The dashboard should display tasks relevant to the current user's team.

The system must also support cross-team responsibilities.

The intended model is:

```text
Task
 ├── primary team
 └── responsible users
          ├── user from Team A
          ├── user from Team B
          └── user from Team C
```

A user's dashboard should account for both their team's tasks and their responsibilities where appropriate.

The exact dashboard query and visibility rules will be defined later.

---

# Git / GitHub

The project is connected to GitHub.

The repository is named:

**Formula Lab**

The local repository currently uses the `master` branch.

The first successful push to GitHub has been completed.

Relevant Git concepts already established:

* Working tree
* Staging
* Commits
* Remotes
* Upstream branches
* `git push`
* GitHub commit history

Git commits should be used as meaningful checkpoints during development.

---

# Current Development Status

Completed:

* Next.js project foundation
* PostgreSQL/Neon database connection
* Drizzle ORM setup
* Team schema
* User schema
* Task schema
* Task responsibility linking table
* Invitation schema
* Team seeding
* Invitation creation
* Secure invitation token generation
* Seven-day invitation expiry
* Invitation lookup/verification
* Zod invitation email validation
* Signup route
* Initial signup form UI
* Signup Zod schema
* Initial React form submission handling
* Git/GitHub repository connection
* Initial GitHub push

Currently being implemented:

**Student invitation/signup flow**

Current immediate sequence:

```text
Signup form
    ↓
Add team selection
    ↓
Submit form
    ↓
Server-side Zod validation
    ↓
Return field-specific errors
    ↓
Verify invitation
    ↓
Check selected team
    ↓
Create user
    ↓
Mark invitation accepted
```

---

# Immediate Next Step

The signup form currently has no `teamId` state.

The next task is to add team selection to the React form.

The intended flow is:

```text
Team selector
     ↓
React state
     ↓
teamId
     ↓
handleSubmit()
     ↓
validateSignUpCredentials()
```

Initially, temporary team options can be used to establish the React flow.

After that, the team options should be loaded from the real `teams` table.

---

# Future Development Order

After the signup flow is working:

1. Complete signup validation.
2. Verify invitation during signup.
3. Verify the selected team exists.
4. Create the user.
5. Mark the invitation as accepted.
6. Add authentication/session handling.
7. Protect application routes.
8. Implement dashboard access.
9. Implement role-based permissions.
10. Add administrator-only invitation creation.
11. Add invitation email delivery.
12. Continue building task management functionality.

Email delivery should remain separate from the core invitation/signup mechanics until the registration flow is reliable.

---

# Development Principles

Keep the implementation:

* Incremental
* Explicit
* Easy to understand
* Consistent with the existing architecture
* Free of unnecessary abstractions
* Server-side secure where appropriate
* Validated at trust boundaries
* Backed by database constraints where appropriate

Prefer understanding the flow over prematurely optimizing or abstracting it.

When introducing new functionality, explain:

1. What problem it solves.
2. Where it belongs.
3. How data moves through the system.
4. Why the chosen approach is appropriate.
5. What the next step will be.

Do not provide large implementation dumps unless explicitly requested.

