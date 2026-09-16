require("dotenv").config();

const connectDB = require("./src/config/database");
const app = require("./src/app");

const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Resumix backend running at http://localhost:${PORT}`));
  } catch (error) {
    console.error("Failed to start backend:", error.message);
    process.exit(1);
  }
}

startServer();
