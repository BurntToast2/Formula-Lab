"use client";

import { useMemo, useRef, useState } from "react";
import { updateTask } from "@/app/actions/tasks";

type Task = {
    id: string;
    title: string;
    description: string | null;
    teamId: string;
    status: "todo" | "in_progress" | "completed" | "cancelled";
    priority: "low" | "medium" | "high";
    dueDate: Date | null;
};

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

type Team = {
    id: string;
    name: string;
};

function toDateInputValue(date: Date | null) {
    return date ? new Date(date).toISOString().split("T")[0] : "";
}

const inputClass =
    "w-full rounded-lg border border-[var(--color-gray-light)] bg-[var(--color-white)] px-3 py-2 text-sm text-[var(--color-navy)] outline-none transition focus:border-[var(--color-navy)] focus:ring-1 focus:ring-[var(--color-navy)]";

const labelClass =
    "text-sm font-medium text-[var(--color-slate)]";

export default function EditTaskForm({
    task,
    teams,
    assignees,
    users: allUsers,
    onCancel,
}: {
    task: Task;
    teams: Team[];
    assignees: Assignee[];
    users: User[];
    onCancel: () => void;
}) {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description ?? "");
    const [teamId, setTeamId] = useState(task.teamId);
    const [status, setStatus] = useState(task.status);
    const [priority, setPriority] = useState(task.priority);
    const [dueDate, setDueDate] = useState(toDateInputValue(task.dueDate));

    const [selectedAssignees, setSelectedAssignees] = useState<Assignee[]>(
        assignees
    );
    const [query, setQuery] = useState("");
    const [showResults, setShowResults] = useState(false);
    const searchWrapRef = useRef<HTMLDivElement>(null);

    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const selectedIds = useMemo(
        () => new Set(selectedAssignees.map((a) => a.id)),
        [selectedAssignees]
    );

    const filteredUsers = useMemo(() => {
        if (!query.trim()) return [];

        const q = query.toLowerCase();

        return allUsers
            .filter((user) => !selectedIds.has(user.id))
            .filter(
                (user) =>
                    user.name.toLowerCase().includes(q) ||
                    user.email.toLowerCase().includes(q)
            )
            .slice(0, 6);
    }, [allUsers, query, selectedIds]);

    function addAssignee(user: User) {
        setSelectedAssignees((current) => [
            ...current,
            {
                id: user.id,
                name: user.name,
                firstName: user.firstName,
                surname: user.surname,
            },
        ]);
        setQuery("");
        setShowResults(false);
    }

    function removeAssignee(userId: string) {
        setSelectedAssignees((current) =>
            current.filter((a) => a.id !== userId)
        );
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setSaving(true);
        setError("");

        const result = await updateTask({
            taskId: task.id,
            title,
            description,
            teamId,
            status,
            priority,
            dueDate,
            assigneeIds: selectedAssignees.map((a) => a.id),
        });

        if (!result.success) {
            setError(result.error ?? "Something went wrong.");
            setSaving(false);
            return;
        }

        window.location.reload();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-5 rounded-2xl bg-[var(--color-white)] p-8 shadow-[0_2px_24px_rgba(49,53,68,0.08)]"
        >
            <h2 className="m-0 text-xl font-semibold text-[var(--color-navy)]">
                Edit task
            </h2>

            <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Title</label>
                <input
                    className={inputClass}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Description</label>
                <textarea
                    className={`${inputClass} resize-none`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Team</label>
                <select
                    className={inputClass}
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                >
                    {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                            {team.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Assignees</label>

                {selectedAssignees.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {selectedAssignees.map((assignee) => (
                            <span
                                key={assignee.id}
                                className="flex items-center gap-2 rounded-full bg-[var(--color-gray-light)] py-1 pl-1 pr-2 text-xs"
                            >
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-navy)] text-[9px] font-semibold text-[var(--color-white)]">
                                    {assignee.firstName.charAt(0)}
                                    {assignee.surname.charAt(0)}
                                </span>
                                <span className="text-[var(--color-navy)]">
                                    {assignee.name}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeAssignee(assignee.id)}
                                    className="ml-0.5 text-[var(--color-slate)] hover:text-[var(--color-navy)]"
                                    aria-label={`Remove ${assignee.name}`}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                <div className="relative" ref={searchWrapRef}>
                    <input
                        className={inputClass}
                        placeholder="Search people by name or email..."
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setShowResults(true);
                        }}
                        onFocus={() => setShowResults(true)}
                        onBlur={() =>
                            // slight delay so the click on a result registers first
                            setTimeout(() => setShowResults(false), 120)
                        }
                    />

                    {showResults && query.trim() && (
                        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-[var(--color-gray-light)] bg-[var(--color-white)] shadow-[0_4px_16px_rgba(49,53,68,0.12)]">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => addAssignee(user)}
                                        className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[var(--color-gray-light)]"
                                    >
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-navy)] text-[10px] font-semibold text-[var(--color-white)]">
                                            {user.firstName.charAt(0)}
                                            {user.surname.charAt(0)}
                                        </span>
                                        <span className="flex flex-col">
                                            <span className="text-sm font-medium text-[var(--color-navy)]">
                                                {user.name}
                                            </span>
                                            <span className="text-xs text-[var(--color-slate)]">
                                                {user.email}
                                            </span>
                                        </span>
                                    </button>
                                ))
                            ) : (
                                <p className="m-0 px-3 py-2 text-sm text-[var(--color-slate)]">
                                    No matches found.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Status</label>
                <select
                    className={inputClass}
                    value={status}
                    onChange={(e) =>
                        setStatus(e.target.value as Task["status"])
                    }
                >
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Priority</label>
                <select
                    className={inputClass}
                    value={priority}
                    onChange={(e) =>
                        setPriority(e.target.value as Task["priority"])
                    }
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Due date</label>
                <input
                    type="date"
                    className={inputClass}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                />
            </div>

            {error && (
                <p className="m-0 text-sm text-[var(--color-error)]">
                    {error}
                </p>
            )}

            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="rounded-[10px] border border-[var(--color-gray-light)] px-5 py-2.5 text-[13.5px] font-semibold text-[var(--color-slate)] hover:bg-[var(--color-gray-light)] disabled:opacity-60"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={saving}
                    className="task-primary-btn rounded-[10px] px-5 py-2.5 text-[13.5px] font-semibold text-[var(--color-white)] disabled:opacity-60"
                >
                    {saving ? "Saving..." : "Save changes"}
                </button>
            </div>
        </form>
    );
}
