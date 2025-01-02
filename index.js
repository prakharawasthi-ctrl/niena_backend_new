const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = 5000;

// Middleware to parse JSON requests
app.use(express.json());

// MongoDB connection setup
const uri = "mongodb+srv://prakharaawasthi41509:8mJqWh7VMiZKJTt7@cluster0.i7eit.mongodb.net/table?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let collection;

// Connect to MongoDB and initialize collection
async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    const db = client.db("table");
    collection = db.collection("table");
  } catch (err) {
    console.error("Database connection error:", err);
  }
}
connectDB();

// CRUD API Endpoints

// 1. **Reservations**: Add a new document
app.post("/api/reservations", async (req, res) => {
  try {
    const data = req.body;
    const result = await collection.insertOne(data);
    res.status(201).json({ message: "Document inserted", id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: "Error inserting document", details: err.message });
  }
});

// 2. **Read**: Get documents
app.get("/api/read", async (req, res) => {
  try {
    const query = req.query; // Use query parameters for filtering
    const documents = await collection.find(query).toArray();
    if (documents.length === 0) {
      return res.status(404).json({ message: "No documents found" });
    }
    res.status(200).json(documents);
  } catch (err) {
    res.status(500).json({ error: "Error reading documents", details: err.message });
  }
});

// 3. **Update**: Modify an existing document
app.put("/api/update", async (req, res) => {
  try {
    const filter = req.body.filter; // Filter to find the document
    const update = { $set: req.body.update }; // Update data
    const result = await collection.updateOne(filter, update);
    res.status(200).json({ message: "Document updated", modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: "Error updating document", details: err.message });
  }
});

// 4. **Delete**: Remove a document
app.delete("/api/delete", async (req, res) => {
  try {
    const filter = req.body; // Filter to find the document to delete
    const result = await collection.deleteOne(filter);
    res.status(200).json({ message: "Document deleted", deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: "Error deleting document", details: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`);
});
