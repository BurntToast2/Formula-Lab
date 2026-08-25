import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, tasks, teams, taskResponsibilities } from "@/db/schema";
import TaskView from "./task-view";

export default async function TaskPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    const { id } = await params;

    const [task] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, id))
        .limit(1);

    if (!task) {
        return (
            <main className="min-h-screen bg-[var(--color-gray-light)] p-6">
                <p className="text-[var(--color-slate)]">
                    Task not found.
                </p>
            </main>
        );
    }

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);

    if (!user) {
        throw new Error("Authenticated user not found.");
    }

    const assignees = await db
        .select({
            id: users.id,
            name: users.name,
            firstName: users.firstName,
            surname: users.surname,
        })
        .from(taskResponsibilities)
        .innerJoin(
            users,
            eq(taskResponsibilities.userId, users.id)
        )
        .where(eq(taskResponsibilities.taskId, task.id));

    const allTeams = await db
        .select()
        .from(teams);

    const allUsers = await db
        .select({
            id: users.id,
            name: users.name,
            firstName: users.firstName,
            surname: users.surname,
            email: users.email,
            teamId: users.teamId,
        })
        .from(users);

    const canEdit =
        user.role === "team_leader" ||
        task.createdById === user.id;

    return (
        <main className="min-h-screen bg-[var(--color-gray-light)] p-6">
            <div className="mx-auto max-w-[560px]">
                <TaskView
                    task={task}
                    teams={allTeams}
                    assignees={assignees}
                    users={allUsers}
                    canEdit={canEdit}
                />
            </div>
        </main>
    );
}
