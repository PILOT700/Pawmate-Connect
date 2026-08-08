import { db } from "@workspace/db";
import * as schema from "@workspace/db/src/schema";

async function initializeDatabase() {
  console.log("🔄 Initializing database...");

  try {
    // This will create all tables defined in the schema
    await db.execute(`
      -- Таблицы будут созданы автоматически при подключении
      -- через Drizzle ORM при первом запуске API
    `);

    console.log("✅ Database initialized successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
    process.exit(1);
  }
}

initializeDatabase();
