import express from "express";
import db from "#db/client";
import jwt from "jsonwebtoken";

const router = express.Router();


const SECRET = process.env.JWT_SECRET || "superdupersecret";

function requireUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const user = jwt.verify(token, SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

//GET /tasks
router.get("/", requireUser, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM tasks WHERE user_id = $1`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

//POST /tasks
router.post("/", requireUser, async (req, res) => {
  const { title, done } = req.body;

  if (typeof title !== "string" || typeof done !== "boolean") {
    return res.status(400).json({ error: "Title (string) and done (boolean) are required" });
  }

  try {
    const result = await db.query(
      `INSERT INTO tasks (title, done, user_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, done, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Could not create task" });
  }
});

//PUT /tasks/:id
router.put("/:id", requireUser, async (req, res) => {
  const { id } = req.params;
  const { title, done } = req.body;

  if (typeof title !== "string" || typeof done !== "boolean") {
    return res.status(400).json({ error: "Both title (string) and done (boolean) are required" });
  }

  try {
    const result = await db.query(
      `SELECT * FROM tasks WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: "You don't have permission to update this task" });
    }

    const updated = await db.query(
      `UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *`,
      [title, done, id]
    );

    res.json(updated.rows[0]);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Could not update task" });
  }
});

//DELETE /tasks/:id
router.delete("/:id", requireUser, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT * FROM tasks WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: "You don't have permission to delete this task" });
    }

    await db.query(`DELETE FROM tasks WHERE id = $1`, [id]);

    res.json({ message: `Task ${id} deleted successfully` });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Could not delete task" });
  }
});


export default router;
