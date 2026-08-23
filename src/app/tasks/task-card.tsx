import Link from "next/link";

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-[var(--color-gray-light)] text-[var(--color-slate)]",
  medium: "bg-[var(--color-yellow)] text-[#5b4a16]",
  high: "bg-[#f6d4c9] text-[var(--color-error)]",
};

const STATUS_STYLES: Record<string, string> = {
  todo: "bg-[var(--color-gray-light)] text-[var(--color-slate)]",
  in_progress: "bg-[#dcecef] text-[var(--color-teal-dark)]",
  completed: "bg-[#dff0df] text-[#3d7040]",
  cancelled: "bg-[#f6d4d4] text-[var(--color-error)]",
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "completed" | "cancelled";
  dueDate: Date | string | null;
};

export default function TaskCard({ task }: { task: Task }) {
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="task-card block rounded-[12px] bg-[var(--color-white)] p-4 no-underline"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span
          className={`text-[10.5px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${STATUS_STYLES[task.status]}`}
        >
          {task.status.replace("_", " ")}
        </span>
        <span
          className={`text-[10.5px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${PRIORITY_STYLES[task.priority]}`}
        >
          {task.priority}
        </span>
      </div>

      <h3 className="m-0 text-[14.5px] font-semibold text-[var(--color-navy)] leading-snug">
        {task.title}
      </h3>

      {task.description && (
        <p className="m-0 mt-1.5 text-[13px] text-[var(--color-slate)] line-clamp-2">
          {task.description}
        </p>
      )}

      {dueDate && (
        <p className="m-0 mt-2.5 text-[12px] text-[var(--color-teal-dark)] font-medium">
          Due {dueDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </p>
      )}
    </Link>
  );
}
