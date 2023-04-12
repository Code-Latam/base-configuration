const mongoose = require("mongoose");

const ChathistorySchema = new mongoose.Schema(

  {
    chatbotKey: {
      type: String,
      required: true,
    },
    chatRequestResult: {
      type: String, enum: ['FOUND', 'NOT FOUND'],
      require: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);



module.exports = mongoose.model("Chathistory", ChathistorySchema);
