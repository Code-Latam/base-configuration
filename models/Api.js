const mongoose = require("mongoose");


const ApiSchema = new mongoose.Schema(

  {
    clientNr: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    urlRoute: {
      type: String,
    required: true,
    },
    headers: {
      type: String,
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
    },
    responseBodyType: {
      type: String,
      required: true,
    },
    parametersDescription: {
      type: [mongoose.Schema.Types.Mixed], // Allow any type of objects in the array
      default: [], // Default value is an empty array
    },
  },
  { timestamps: true }
);

ApiSchema.index({ clientNr: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Api", ApiSchema);
