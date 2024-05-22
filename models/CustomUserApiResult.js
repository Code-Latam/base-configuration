const mongoose = require("mongoose");


const CustomUserApiResultSchema = new mongoose.Schema(

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
    },
    
    result: {
      type: mongoose.Schema.Types.Mixed, // Define requestBody as an object
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

CustomUserApiResultSchema.index({ clientNr: 1, explorerId: 1 ,name: 1, chatbotKey: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("CustomUserApiResult", CustomUserApiResultSchema);
