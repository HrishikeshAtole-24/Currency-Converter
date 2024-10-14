require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

async function testConnection() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas!");
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    await client.close();
  }
}

testConnection();
