const mongoose = require("mongoose");

const InvitationSchema = new mongoose.Schema(

  {
    chatbotKey: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      max: 50,
    },
    groups: {
      type: Array,
      default: [],
    },
    explorers: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

InvitationSchema.index({chatbotKey: 1, email: 1}, {unique: true});

module.exports = mongoose.model("Invitation", InvitationSchema);
