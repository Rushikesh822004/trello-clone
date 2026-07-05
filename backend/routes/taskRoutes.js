import express from "express";
import Task from "../models/Task.js";

const router = express.Router();

// Create task
router.post("/", async (req, res) => {
  try {
    const lastTask = await Task.findOne({
      boardId: req.body.boardId,
      status: req.body.status,
    }).sort({ order: -1 });

    const task = new Task({
      ...req.body,
      order: lastTask ? lastTask.order + 1 : 1,
    });

    await task.save();

    res.json(task);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// Get tasks by board
router.get("/:boardId", async (req, res) => {
  try {
    console.log("GET TASKS:", req.params.boardId);

    const tasks = await Task.find({
      boardId: req.params.boardId,
    }).sort({
      status: 1,
      order: 1,
    });

    console.log("Tasks Found:", tasks.length);

    res.json(tasks);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
});
// Update task (drag)
// Save complete task order
router.put("/reorder/all", async (req, res) => {
  try {
    const { tasks } = req.body;

    const operations = tasks.map((task) => ({
      updateOne: {
        filter: { _id: task._id },
        update: {
          status: task.status,
          order: task.order,
        },
      },
    }));

    await Task.bulkWrite(operations);

    res.json({
      message: "Tasks reordered successfully",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
});

// Delete task
router.delete("/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

export default router;