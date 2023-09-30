const mongoose = require("mongoose");

// Define a sub-schema for the link objects
const linkObjectSchema = new mongoose.Schema({
  source: {
    type: String,
    required: true
  },
  target: {
    type: String,
    required: true
  }
});

const LinkSchema = new mongoose.Schema(
  {
    clientNr: {
      type: String,
      required: true
    },
    explorerId: {
      type: String,
      required: true
    },
    workflowName: {
      type: String,
      required: true
    },
    linkId: {
      type: String,
      required: true
    },
    // Add the links field as an array of linkObjectSchema
    links: [linkObjectSchema]
  },
  { timestamps: true }
);

LinkSchema.index(
  { clientNr: 1, explorerId: 1, workflowName: 1, linkId: 1 },
  { unique: true }
);
module.exports = mongoose.model("Link", LinkSchema);
