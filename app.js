import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import usersRouter from "./routes/users.js";
import tasksRouter from "./routes/tasks.js";
dotenv.config();

const app = express();
const SECRET = process.env.JWT_SECRET || "superdupersecret";

app.use(express.json());
app.use("/users", usersRouter);
app.use("/tasks", tasksRouter);

function requireUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header is required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const user = jwt.verify(token, SECRET);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}


app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Sorry! Something went wrong.");
});

export default app;