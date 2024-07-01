const mongoose = require("mongoose");


const ChatbotExplorerRelSchema = new mongoose.Schema(

  {
    clientNr: {
      type: String,
      required: true,
    },
    explorerId: {
      type: String,
      required: true,
    },
    chatbotKeyDesigner: {
      type: String,
      required: true,
    },
    chatbotKeyReader: {
      type: String,
      required: true,
    },
    publicInvite: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatbotExplorerRel", ChatbotExplorerRelSchema);
