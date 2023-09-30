const mongoose = require("mongoose");


const ExplorerSchema = new mongoose.Schema(

  {
    clientNr: {
      type: String,
      required: true,
    },
    explorerId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      min: 3,
      max: 40,
    },
    description: {
      type: String,
      required: true,
    },
    apiEndpoint: {
      type: String,
      required: true,
    },
    apiKey: {
      type: String
    },
    apiToken: {
      type: String
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Explorer", ExplorerSchema);
