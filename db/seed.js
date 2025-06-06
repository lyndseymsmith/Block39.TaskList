import db from "#db/client";

// import { createTask } from "#db/queries/tasks";
// import { createUser } from "#db/queries/users";

await db.connect();
await seed();
await db.end();

async function seed() {
  try {
    console.log("Cleaning up database...");
    await db.query("DELETE FROM tasks");
    await db.query("DELETE FROM users");
    console.log("Database cleaned.");

    const result = await db.query(
      `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id`,
      ["exampleUser", "superSecurePassword"]
    );
    const userId = result.rows[0].id;

    console.log("Creating tasks for user...");

    await db.query(
      `INSERT INTO tasks (title, done, user_id) VALUES 
        ($1, $2, $3), 
        ($4, $5, $6), 
        ($7, $8, $9)`,
      [
        "Buy groceries", false, userId,
        "Clean my room", false, userId,
        "Finish homework", false, userId,
      ]
    );

    console.log("🌱 Database seeded.");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
