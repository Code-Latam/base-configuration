const mongoose = require("mongoose");


const ApiSchema = new mongoose.Schema(

  {
    collectionTag: {
      type: String,
    },
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
    },
    thirdparty: {
      type: String,
      default: "none",
    },
    description: {
      type: String,
      required: true,
    },
    urlRoute: {
      type: String,
    required: true,
    },
    resourcePath: {
      type: String,
    },
    headers: {
      type: [String],
    },
    method: {
      type: String,
      required: true,
    },
    requestBody: {
      type: mongoose.Schema.Types.Mixed, // Define requestBody as an object
      default: {}, // Default value is an empty object
    },
    requestBodyType: {
      type: String,
      required: true,
      default: "JSON",
    },
    responseBodyType: {
      type: String,
      required: true,
      default: "JSON",
    },
    parametersDescription: {
      type: mongoose.Schema.Types.Mixed, // Allow any type of objects in the array
      default: {}, // Default value is an empty object
    },
  },
  { timestamps: true }
);

ApiSchema.index({ clientNr: 1, explorerId: 1 ,name: 1 }, { unique: true });

module.exports = mongoose.model("Api", ApiSchema);
