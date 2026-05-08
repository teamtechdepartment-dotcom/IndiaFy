const mongoose = require("mongoose");

const uri = "mongodb+srv://kishansingh:kishansingh@indify.ndjtbxo.mongodb.net/";

async function clearData() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;

    // List of collections to drop/clear
    const collections = [
      "sellers",
      "products",
      "sellernodes",
      "localstores",
      "wholesalestores",
      "orders"
    ];

    for (const name of collections) {
      try {
        await db.collection(name).deleteMany({});
        console.log(`Cleared collection: ${name}`);
      } catch (err) {
        console.log(`Failed to clear collection ${name}:`, err.message);
      }
    }

    console.log("Seller data successfully wiped.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

clearData();
