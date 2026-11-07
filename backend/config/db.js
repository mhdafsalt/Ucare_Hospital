const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is not defined. Please check your backend/.env file."
      );
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(` MongoDB Connected Successfully to ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(" MongoDB Connection Error:", error.message);

    if (error.message.includes("bad auth") || error.code === 8000) {
      console.error(" Hint: Authentication failed. Please verify your MongoDB Database User username and password in Atlas -> Database Access.");
    } else if (error.message.includes("querySrv") || error.name === "MongooseServerSelectionError") {
      console.error(" Hint: Could not connect to Atlas cluster. Ensure your IP address is whitelisted in Atlas (Network Access -> Add IP -> Allow 0.0.0.0/0).");
    }

    process.exit(1);
  }
};

module.exports = connectDB;