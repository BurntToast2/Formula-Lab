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
        <main className="tasks-page">
            <div className="tasks-page__container">
                <h1 className="tasks-page__title">All Tasks</h1>

                <div className="tasks-page__teams">
                    {orderedTeams.map((team, i) => {
                        const teamTasks = tasksByTeam.get(team.id) ?? [];
                        const isOwnTeam = team.id === currentUser?.teamId;

                        return (
                            <section
                                key={team.id}
                                className="tasks-page__team"
                                style={{ animationDelay: `${i * 0.06}s` }}
                            >
                                <div className="tasks-page__team-header">
                                    <h2 className="tasks-page__team-name">
                                        {isOwnTeam ? "Your Team" : team.name}
                                    </h2>
                                    {isOwnTeam && (
                                        <span className="tasks-page__badge">
                                            {team.name}
                                        </span>
                                    )}
                                </div>

                                {teamTasks.length === 0 ? (
                                    <p className="tasks-page__empty">
                                        No tasks yet.
                                    </p>
                                ) : (
                                    <div className="tasks-page__grid">
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
