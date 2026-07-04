import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import bgImage from "../assets/bg.jpg";

export default function Dashboard() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [newBoard, setNewBoard] = useState("");

  const token = localStorage.getItem("token");

  // ✅ LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // ✅ FIX: useCallback added
  const fetchBoards = useCallback(async () => {
    try {
      const res = await API.get("/boards", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBoards(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [token]);

  // ✅ useEffect now correct
  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const addBoard = async () => {
    if (!newBoard.trim()) return;

    try {
      await API.post(
        "/boards",
        { title: newBoard },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewBoard("");
      fetchBoards();
    } catch (err) {
      console.error("Add error:", err);
    }
  };
  const deleteBoard = async (id) => {
    try {
      await API.delete(`/boards/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchBoards();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div
      className="min-h-screen p-8 bg-cover bg-center"
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : "none",
      }}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl text-white font-bold">
          Your Boards
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* ADD BOARD */}
      <div className="mb-6 flex gap-3">
        <input
          value={newBoard}
          onChange={(e) => setNewBoard(e.target.value)}
          placeholder="New board name"
          className="p-2 rounded w-80"
        />

        <button
          onClick={addBoard}
          className="bg-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* BOARD LIST */}
      <div className="grid grid-cols-3 gap-6">
        {boards.map((board) => (
          <div
            key={board._id}
            className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl relative cursor-pointer hover:scale-105 transition"
          >
            <h2
              onClick={() => navigate(`/board/${board._id}`)}
              className="text-white"
            >
              {board.title}
            </h2>

            <button
              onClick={() => deleteBoard(board._id)}
              className="absolute top-2 right-2 text-red-400"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}