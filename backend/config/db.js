const mongoose = require("mongoose");

let cachedPromise = null;

const connectDB = async () => {
  // 1 = connected, 2 = connecting
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2 && cachedPromise) {
    return cachedPromise;
  }

  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is not defined. Please check your Vercel Environment Variables or backend/.env file."
      );
    }

    cachedPromise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    const conn = await cachedPromise;

    console.log(
      `MongoDB Connected Successfully to ${conn.connection.host}/${conn.connection.name}`
    );

    // Synchronize all staff into the single unified "users" collection
    try {
      const syncCollectionsToSingleUsers = require("./migrateUsers");
      await syncCollectionsToSingleUsers();
    } catch (syncErr) {
      console.warn("Single Collection Sync Note:", syncErr.message);
    }

    return conn;
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    cachedPromise = null;

    if (error.message && (error.message.includes("bad auth") || error.code === 8000)) {
      console.error(
        "Hint: Authentication failed. Please verify your MongoDB Database User username and password in Atlas -> Database Access."
      );
    } else if (
      error.message &&
      (error.message.includes("querySrv") || error.name === "MongooseServerSelectionError")
    ) {
      console.error(
        "Hint: Could not connect to Atlas cluster. Ensure your IP address is whitelisted in Atlas (Network Access -> Add IP -> Allow 0.0.0.0/0)."
      );
    }

    // In serverless, do not call process.exit(1) as it kills the serverless worker
    if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
