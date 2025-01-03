const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors"); // Import CORS middleware
const serverless = require("serverless-http");

const app = express();
const router = express.Router();

router.get("/", (req, res) => {
  res.send("App is running..");
});

// app.use("/.netlify/functions/app", router);
module.exports.handler = serverless(app);

const port = 5000;

// Middleware to parse JSON requests
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: "http://niena-backend-new-adov.vercel.app", // Allow requests from your frontend
  methods: "GET,POST,PUT,DELETE", // Allow these methods
  allowedHeaders: "Content-Type,Authorization", // Allow these headers
};
app.use(cors(corsOptions)); // Apply CORS middleware

// MongoDB connection setup
const uri =
  "mongodb+srv://prakharaawasthi41509:8mJqWh7VMiZKJTt7@cluster0.i7eit.mongodb.net/table?retryWrites=true&w=majority&appName=Cluster0";
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

// // 1. **Reservations**: Add a new document
// app.post("/api/reservations", async (req, res) => {
//   try {
//     const data = req.body;
//     const result = await collection.insertOne(data);
//     res.status(201).json({ message: "Document inserted", id: result.insertedId });
//   } catch (err) {
//     res.status(500).json({ error: "Error inserting document", details: err.message });
//   }
// });
// 1. **Reservations**: Add a new document with slot availability check
app.post("/api/reservations", async (req, res) => {
  try {
    const data = req.body;

    // Check if the slot is already booked
    const existingReservation = await collection.findOne({
      date: data.date,
      time: data.time,
    });

    if (existingReservation) {
      return res.status(400).json({
        error: "Slot is already booked. Please choose a different date or time.",
      });
    }

    // If slot is not booked, proceed to insert the new reservation
    const result = await collection.insertOne(data);
    res.status(201).json({ message: "Reservation successful", id: result.insertedId });
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
app.delete('/api/delete', async (req, res) => {
  const { name, date, time } = req.body; // Extract name, date, and time from the request body

  if (!name || !date || !time) {
    return res.status(400).json({ error: "Missing name, date, or time in request body." });
  }

  try {
    // Attempt to delete the document with the matching name, date, and time
    const result = await collection.deleteOne({ name, date, time });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error("Error deleting booking:", err);
    res.status(500).json({ error: "Failed to delete booking" });
  }
});





// Start the server
app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`);
});
