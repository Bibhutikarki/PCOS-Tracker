// index.js
import app from "./app.js";
import mongoose from "mongoose";

const port = process.env.PORT || 5001;
const uri = "mongodb+srv://bibhuti:12345@professionals.norpuqw.mongodb.net/?appName=Professionals";

async function run() {
  try {
    await mongoose.connect(uri, {
      serverApi: { version: '1', strict: true, deprecationErrors: true }
    });
    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

run();

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${port}`);
});
