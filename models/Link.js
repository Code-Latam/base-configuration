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
  },
  type: {
    type: String,
    required: true
  },
  passLinkParameters: {
    type: Boolean,
    default: false,
  },
  sequence: {
    type: Number,
    default: 1,
  },
  pathParameters: {
    type: mongoose.Schema.Types.Mixed, 
    default: {}, // Default value is an empty object
  },
  pathOrder: {
    type: mongoose.Schema.Types.Mixed,
    default: [], // Default value is an empty object
  },
  queryParameters: {
    type: mongoose.Schema.Types.Mixed, // Define requestBody as an object
    default: {}, // Default value is an empty object
  },
  requestbodyParameters: {
    type: mongoose.Schema.Types.Mixed, // Define requestBody as an object
    default: {}, // Default value is an empty object
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
    // Add the links field as an array of linkObjectSchema
    links: [linkObjectSchema]
  },
  { timestamps: true }
);

LinkSchema.index(
  { clientNr: 1, explorerId: 1, workflowName: 1 },
  { unique: true }
);
module.exports = mongoose.model("Link", LinkSchema);
