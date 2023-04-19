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
      default: 'FOUND',
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
