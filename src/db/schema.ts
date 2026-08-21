import { sql } from "drizzle-orm";
import {
    pgEnum,
    pgTable,
    primaryKey,
    text,
    timestamp,
    uuid,
    uniqueIndex,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", [
    "team_leader",
    "member",
]);

export const taskStatus = pgEnum("task_status", [
    "todo",
    "in_progress",
    "completed",
    "cancelled",
]);

export const taskPriority = pgEnum("task_priority", [
    "low",
    "medium",
    "high",
]);


export const invitations = pgTable("invitations", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    acceptedAt: timestamp("accepted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const teams = pgTable("teams", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
});

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    firstName: text("first_name").notNull(),
    surname: text("surname").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    teamId: uuid("team_id").notNull().references(() => teams.id),
    role: userRole("role").notNull(),
    },
    (table) => [
        uniqueIndex("one_team_leader_per_team")
            .on(table.teamId)
            .where(sql`${table.role} = 'team_leader'`),
    ],
);

export const tasks = pgTable("tasks", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    teamId:  uuid("team_id").notNull().references(() => teams.id),
    createdById: uuid("created_by_id").notNull().references(() => users.id),
    status: taskStatus("status").notNull().default("todo"),
    priority: taskPriority("priority").notNull().default("medium"),
    dueDate: timestamp("due_date"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(), 
});

export const taskResponsibilities = pgTable("task_responsibilities", {
    taskId: uuid("task_id").notNull().references(() => tasks.id),
    userId: uuid("user_id").notNull().references(() => users.id),
},
    (table) => [
        primaryKey({
            columns: [table.taskId, table.userId],
        }),
    ],
);
