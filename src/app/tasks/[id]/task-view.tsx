"use client";

import { useState } from "react";
import type { InferSelectModel } from "drizzle-orm";

import { tasks, teams } from "@/db/schema";
import EditTaskForm from "./edit-task-form";

type Task = InferSelectModel<typeof tasks>;
type Team = InferSelectModel<typeof teams>;

type User = {
    id: string;
    name: string;
    firstName: string;
    surname: string;
    email: string;
    teamId: string;
};

type Assignee = {
    id: string;
    name: string;
    firstName: string;
    surname: string;
};

export default function TaskView({
    task,
    teams: allTeams,
    assignees,
    users: allUsers,
    canEdit,
}: {
    task: Task;
    teams: Team[];
    assignees: Assignee[];
    users: User[];
    canEdit: boolean;
}) {
    const [editing, setEditing] = useState(false);

    if (editing) {
        return (
            <EditTaskForm
                task={task}
                teams={allTeams}
                assignees={assignees}
                users={allUsers}
                onCancel={() => setEditing(false)}
            />
        );
    }

    const teamName =
        allTeams.find((team) => team.id === task.teamId)?.name ??
        "Unknown";

    return (
        <div className="w-full rounded-2xl bg-[var(--color-white)] p-8 shadow-[0_2px_24px_rgba(49,53,68,0.08)]">
            <div className="flex items-center gap-2">
                <span className="rounded-full bg-[var(--color-gray-light)] px-2 py-1 text-xs">
                    {task.status.replace("_", " ")}
                </span>

                <span className="rounded-full bg-[var(--color-yellow)] px-2 py-1 text-xs">
                    {task.priority}
                </span>

                <span className="rounded-full bg-[var(--color-navy)]/10 px-2 py-1 text-xs font-medium text-[var(--color-navy)]">
                    {teamName}
                </span>
            </div>

            <h1 className="mt-4 text-xl font-semibold text-[var(--color-navy)]">
                {task.title}
            </h1>

            {task.description && (
                <p className="mt-3 whitespace-pre-wrap text-sm text-[var(--color-slate)]">
                    {task.description}
                </p>
            )}

            <div className="mt-6 space-y-2 border-t border-[var(--color-gray-light)] pt-6 text-sm">
                <p>
                    <strong>Team:</strong> {teamName}
                </p>

                <p>
                    <strong>Status:</strong>{" "}
                    {task.status.replace("_", " ")}
                </p>

                <p>
                    <strong>Priority:</strong> {task.priority}
                </p>

                <p>
                    <strong>Due date:</strong>{" "}
                    {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "No due date"}
                </p>
            </div>

            <div className="mt-6 border-t border-[var(--color-gray-light)] pt-6">
                <p className="text-sm font-semibold text-[var(--color-navy)]">
                    Assignees
                </p>

                {assignees.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {assignees.map((assignee) => (
                            <div
                                key={assignee.id}
                                className="flex items-center gap-2 rounded-full bg-[var(--color-gray-light)] py-1 pl-1 pr-3"
                            >
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-navy)] text-[10px] font-semibold text-[var(--color-white)]">
                                    {assignee.firstName.charAt(0)}
                                    {assignee.surname.charAt(0)}
                                </span>

                                <span className="text-xs text-[var(--color-slate)]">
                                    {assignee.name}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="mt-2 text-sm text-[var(--color-slate)]">
                        No one assigned
                    </p>
                )}
            </div>

            {canEdit && (
                <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="task-primary-btn mt-7 rounded-[10px] px-5 py-2.5 text-[13.5px] font-semibold text-[var(--color-white)]"
                >
                    Edit task
                </button>
            )}
        </div>
    );
}
