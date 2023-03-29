const mongoose = require("mongoose");

const ChatbotSchema = new mongoose.Schema(
  {
    chatbotKey: {
      type: String,
      required: true,
      unique: true,
    },
    openaiKey: {
      type: String,
      required: true,
      unique: true,
    },
    verifySign: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      max: 63,
      min: 3,
      unique: true,
      validate: {  // may contain only letters, numbers and no spaces
        validator: function(v) {
          return /^[a-z0-9]+$/.test(v);
        },
        message: props => `${props.value} is not a valid name! Please enter only lowercase letters, numbers and no spaces`
      }
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    public: {
      type: Boolean,
      default: true,
    },
    paid: {
      type: Boolean,
      default: false,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    promptTemplate: {
      type: String,
      required: true,
    },
    idEnroller: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chatbot", ChatbotSchema);
