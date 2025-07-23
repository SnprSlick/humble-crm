import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const ToDoContext = createContext();

export const ToDoProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  // Fallback to localhost if VITE_API_URL is not defined
  const baseURL =
    import.meta.env.VITE_API_URL || "http://localhost:8000";

  const fetchTasks = () => {
    const url = `${baseURL}/api/todos`;
    console.log("Fetching todos from:", url);

    axios
      .get(url)
      .then((res) => {
        const parsed =
          typeof res.data === "string" ? JSON.parse(res.data) : res.data;
        setTasks(Array.isArray(parsed) ? parsed : []);
      })
      .catch((err) => console.error("Failed to fetch todos:", err));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (text) => {
    try {
      await axios.post(`${baseURL}/api/todos`, { text });
      fetchTasks();
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${baseURL}/api/todos/${id}`);
      fetchTasks();
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const toggleDone = async (task) => {
    try {
      await axios.put(`${baseURL}/api/todos/${task.id}`, null, {
        params: { done: !task.done },
      });
      fetchTasks();
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  return (
    <ToDoContext.Provider
      value={{ tasks, addTask, deleteTask, toggleDone, fetchTasks }}
    >
      {children}
    </ToDoContext.Provider>
  );
};

export const useToDo = () => useContext(ToDoContext);
