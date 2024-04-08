const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();

// Connection URL
const url = process.env.MONGO_URL;

// Database name
const dbName = 'bots';

// Options for the MongoDB connection

// Connect to MongoDB using Mongoose
mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB');

    // Create a Mongoose model for the 'tasks' collection
    const Folder = mongoose.model('Folder', {
      explorerId: String,
    });

    // Specify the update operation - use $set to add a new string field
    const update = {
      $set: {
        explorerId: '1', // Specify the new string field and its value
      },
    };

    // Update all documents in the 'tasks' collection using updateMany with an empty filter
    Folder.updateMany({}, update, (updateErr, result) => {
      if (updateErr) {
        console.error('Error updating documents:', updateErr);
      } else {
        console.log(`${result.nModified} documents updated successfully`);
      }

      // Close the connection
      mongoose.connection.close();
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
