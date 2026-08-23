"use server";

import { headers } from "next/headers";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { tasks, taskResponsibilities, teams, users } from "@/db/schema";


const createTaskSchema = z.object({
    title: z.string().min(1, "Task title is required").max(100),
    description: z.string().max(1000).optional(),
    teamId: z.string().uuid("Please select a valid team"),
    priority: z.enum(["low", "medium", "high"]),
    dueDate: z.string().optional(),
    assigneeIds: z.array(z.string().uuid()).optional(),
});

export async function createTask(input: {
    title: string;
    description?: string;
    teamId: string;
    priority: "low" | "medium" | "high";
    dueDate?: string;
    assigneeIds?: string[];
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return {
            success: false as const,
            error: "You must be logged in to create a task.",
        };
    }

    const result = createTaskSchema.safeParse(input);

    if (!result.success) {
        return {
            success: false as const,
            error: "Please check the task details and try again.",
        };
    }

    const {
        title, 
        description,
        teamId,
        priority,
        dueDate,
        assigneeIds = [],
    } = result.data;

    const [team] = await db
        .select({ id: teams.id })
        .from(teams)
        .where(eq(teams.id, teamId))
        .limit(1);

    if (!team) {
        return {
            success: false as const,
            errors: {
                teamId: ["Team not found"],
            },
        };
    }

    if (assigneeIds.length > 0) {
        const assignedUsers = await db
            .select({ id: users.id })
            .from(users)
            .where(inArray(users.id, assigneeIds));

        if (assignedUsers.length !== assigneeIds.length) {
            return {
                success: false as const,
                errors: {
                    assigneeIds: ["One or more selected users could not be found"],
                },
            };
        }
    }
    try {
        const [createdTask] = await db
        .insert(tasks)
        .values({
            title,
            description: description || null,
            teamId,
            createdById: session.user.id,
            priority,
            dueDate: dueDate ? new Date(dueDate) : null,
        })
        .returning({
            id: tasks.id,
        });

        if (assigneeIds.length > 0) {
            await db.insert(taskResponsibilities).values(
                assigneeIds.map((userId) => ({
                    taskId: createdTask.id,
                    userId,
                }))
            );
        }

        return {
            success: true as const,
            taskId: createdTask.id,
        };
    } catch (error) {
        console.error("createTask failed:", error);

        return {
            success: false as const,
            error: "Something went wrong creating the task.",
        };
    }
}
