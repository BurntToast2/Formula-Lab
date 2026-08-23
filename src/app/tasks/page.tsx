import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, tasks, teams } from "@/db/schema";
import TaskCard from "./task-card";
import "./page.css";

export default async function TasksPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

    if (!currentUser) {
        throw new Error("Authenticated user not found in database.");
    }

    const allTeams = await db.select().from(teams);
    const allTasks = await db.select().from(tasks);

    const orderedTeams = [...allTeams].sort((a, b) => {
        if (a.id === currentUser?.teamId) return -1;
        if (b.id === currentUser?.teamId) return 1;
        return 0;
    });

    const tasksByTeam = new Map<string, typeof allTasks>();
    for (const task of allTasks) {
        const existing = tasksByTeam.get(task.teamId) ?? [];
        existing.push(task);
        tasksByTeam.set(task.teamId, existing);
    }

    return (
        <main className="min-h-screen bg-[var(--color-gray-light)] p-6 md:p-10">
        <div className="max-w-[960px] mx-auto">
        <h1 className="m-0 mb-8 text-2xl font-semibold text-[var(--color-navy)] tracking-tight">
            All Tasks
        </h1>

        <div className="flex flex-col gap-8">
            {orderedTeams.map((team) => {
                const teamTasks = tasksByTeam.get(team.id) ?? [];
                const isOwnTeam = team.id === currentUser?.teamId;

                return (
                    <section key={team.id}>
                    <h2 className="m-0 mb-3 text-[15px] font-semibold text-[var(--color-navy)]">
                        {isOwnTeam ? "Your Team" : team.name}
                        {isOwnTeam && (
                            <span className="ml-2 text-[12px] font-medium text-[var(--color-slate)]">
                                ({team.name})
                            </span>
                        )}
                        </h2>

                    {teamTasks.length === 0 ? (
                        <p className="m-0 text-[13px] text-[var(--color-slate)]">
                            No tasks yet.
                            </p>
                    ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {teamTasks.map((task) => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                        </div>
                    )}
                    </section>
                );
            })}
            </div>
        </div>
        </main>
    );
}
