import { useState } from "react";
import { useToDo } from "../context/ToDoContext";
import { Trash2 } from "lucide-react";

export default function ToDoPage() {
  const [newTask, setNewTask] = useState("");
  const { tasks, addTask, deleteTask, toggleDone } = useToDo();

  const handleAdd = () => {
    const trimmed = newTask.trim();
    if (trimmed) {
      addTask(trimmed);
      setNewTask("");
    }
  };

  const activeTasks = tasks.filter((t) => !t.done);
  const completedTasks = tasks.filter((t) => t.done);

  return (
    <div className="p-6 w-full max-w-2xl mx-auto text-white">
      <h1 className="text-3xl font-bold text-accent mb-6">🧩 Task Tracker</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Enter a new task..."
          className="flex-1 p-2 rounded bg-neutral-800 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 rounded bg-accent text-white font-bold hover:bg-red-600"
        >
          Add
        </button>
      </div>

      {/* Active Tasks */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-accent mb-2">🔧 In Progress</h2>
        {activeTasks.length === 0 ? (
          <p className="text-sm text-muted">Nothing to do — all caught up!</p>
        ) : (
          <ul className="space-y-2">
            {activeTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between p-3 rounded bg-neutral-900 border border-neutral-700"
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleDone(task)}
                    className="form-checkbox h-5 w-5 accent-accent"
                  />
                  <span className="text-base">{task.text}</span>
                </label>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-neutral-400 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Completed Tasks */}
      <div>
        <h2 className="text-lg font-semibold text-accent mb-2">✅ Completed</h2>
        {completedTasks.length === 0 ? (
          <p className="text-sm text-muted">No tasks completed yet.</p>
        ) : (
          <ul className="space-y-2 opacity-60">
            {completedTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between p-3 rounded bg-neutral-900 border border-neutral-700 line-through"
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleDone(task)}
                    className="form-checkbox h-5 w-5 accent-accent"
                  />
                  <span className="text-base">{task.text}</span>
                </label>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-neutral-400 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
