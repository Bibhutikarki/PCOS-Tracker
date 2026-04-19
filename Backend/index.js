// initialization
import app from "./app.js";
import mongoose from "mongoose";
const port = process.env.PORT || 5050;

const uri = process.env.MONGODB_URI;
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await mongoose.disconnect();
  }
}
run().catch(console.dir);

//Routes
app.get('/test', (req, res) => {
  res.json({ message: "Test route is working" });
});

app.get('/', (_req, res) => {
  res.send("This is the Homepage");
});

//Starting the server in a port
app.listen(port, "0.0.0.0", () => {
  console.log(`Server started at port ${port}`);
});
