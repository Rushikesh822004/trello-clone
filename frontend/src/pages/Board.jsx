import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import API from "../api/api";
import bgImage from "../assets/wallpaper2.jpg";

export default function Board() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  const columns = ["todo", "doing", "done"];

  // ✅ TOKEN
  const token = localStorage.getItem("token");

  // ✅ LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // ✅ FIXED: API PATH + TOKEN
  const fetchTasks = useCallback(async () => {
    try 
    {
      const res = await API.get(`/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(res.data);
    } 
    catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }, [id, token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ✅ FIXED: API PATH + TOKEN
  const addTask = async () => {
    if (!newTask.trim()) return;

    try {
      await API.post(
        "/tasks",
        {
          title: newTask,
          status: "todo",
          boardId: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNewTask("");
      fetchTasks();
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // ✅ FIXED: API PATH + TOKEN
  const deleteTask = async (taskId) => {
    try {
      await API.delete(`/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // ✅ FIXED: API PATH + TOKEN
  const onDragEnd = async (result) => {
  const { source, destination, draggableId } = result;

  if (!destination) return;

  if (
    source.droppableId === destination.droppableId &&
    source.index === destination.index
  ) {
    return;
  }

  // Clone current tasks
  const updatedTasks = [...tasks];

  // Find dragged task
  const draggedTask = updatedTasks.find(
    (task) => task._id === draggableId
  );

  if (!draggedTask) return;

  // Remove dragged task
  const remainingTasks = updatedTasks.filter(
    (task) => task._id !== draggableId
  );

  // Update status if moved to another column
  draggedTask.status = destination.droppableId;

  // Tasks in destination column
  const destinationTasks = remainingTasks
    .filter((task) => task.status === destination.droppableId)
    .sort((a, b) => a.order - b.order);

  // Insert at dropped position
  destinationTasks.splice(destination.index, 0, draggedTask);

  // Recalculate order
  destinationTasks.forEach((task, index) => {
    task.order = index + 1;
  });

  // Merge all tasks
  const finalTasks = [
    ...remainingTasks.filter(
      (task) => task.status !== destination.droppableId
    ),
    ...destinationTasks,
  ];

  // Instant UI update
  setTasks(finalTasks);

  try {
    await API.put(
  "/tasks/reorder/all",
  {
    tasks: finalTasks.map((task) => ({
      _id: task._id,
      status: task.status,
      order: task.order,
    })),
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
  } catch (err) {
    console.error(err);

    // Rollback if API fails
    fetchTasks();
  }
};

  const getTasks = (status) => {
  return tasks
    .filter((task) => task.status === status)
    .sort((a, b) => a.order - b.order);
};

  return (
    <div
      className="min-h-screen p-6 bg-cover bg-center relative"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl text-white">Board</h2>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* ADD TASK */}
      <div className="mb-6 flex gap-3">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter task..."
          className="p-2 rounded w-80"
        />

        <button
          onClick={addTask}
          className="bg-white px-4 py-2 rounded"
        >
          Add Task
        </button>
      </div>

      {/* DRAG & DROP */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-3 gap-6">
          {columns.map((col) => (
            <Droppable droppableId={col} key={col}>
              {(provided) => (
                <div
                  className="bg-white/10 p-4 rounded-xl min-h-[400px]"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h3 className="text-white mb-4 capitalize">
                    {col}
                  </h3>

                  {getTasks(col).map((task, index) => (
                    <Draggable
                      key={task._id}
                      draggableId={task._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          className="bg-white/20 text-white p-3 rounded mb-2"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div className="flex justify-between items-center">
                            {task.title}

                            <button
                              onClick={() => deleteTask(task._id)}
                              className="text-red-300"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}