import { useToDo } from "../context/ToDoContext";

export default function RightSidebar() {
  const { tasks } = useToDo();

  return (
    <div className="w-full h-fit bg-surface border border-border shadow-panel rounded-md p-4 space-y-6 text-text">
      {/* Calendar Section */}
      <div>
        <h2 className="text-xs font-header font-bold uppercase text-accent mb-2 tracking-wide">
          📅 Calendar
        </h2>
        <p className="text-sm text-muted">No upcoming events</p>
      </div>

      <div className="border-t border-border" />

      {/* To-Do Section */}
      <div>
        <h2 className="text-xs font-header font-bold uppercase text-accent mb-2 tracking-wide">
          ✅ To-Do List
        </h2>
        {tasks.filter((t) => !t.done).length === 0 ? (
          <p className="text-sm text-muted">All caught up</p>
        ) : (
          <ul className="list-disc pl-5 text-sm text-text space-y-1">
            {tasks
              .filter((task) => !task.done)
              .slice(0, 5)
              .map((task) => (
                <li key={task.id}>{task.text}</li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
