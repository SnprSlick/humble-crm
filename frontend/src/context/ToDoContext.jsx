import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const ToDoContext = createContext();

export const ToDoProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = () => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/todos`)
      .then((res) => setTasks(res.data))
      .catch((err) => console.error("Failed to fetch todos:", err));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (text) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/todos`, { text });
      fetchTasks();
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/todos/${id}`);
      fetchTasks();
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const toggleDone = async (task) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/todos/${task.id}`, null, {
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
