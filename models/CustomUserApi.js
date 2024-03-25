const mongoose = require("mongoose");


const CustomUserApiSchema = new mongoose.Schema(

  {
    collectionTag: {
      type: String,
    },
    clientNr: {
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
    },
    responseBodyType: {
      type: String,
      required: true,
    },
    parametersDescription: {
      type: mongoose.Schema.Types.Mixed, // Allow any type of objects in the array
      default: {}, // Default value is an empty object
    },
    chatbotKey: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      max: 50,
    },
  },
  { timestamps: true }
);

CustomUserApiSchema.index({ clientNr: 1, name: 1, chatbotKey: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("CustomUserApi", CustomUserApiSchema);
