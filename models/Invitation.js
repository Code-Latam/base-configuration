const mongoose = require("mongoose");

// Define the Explorer sub-schema
const ExplorerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designer: { type: Boolean, default: false },
  owner: { type: Boolean, default: false },
  reader: { type: Boolean, default: false }
});

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
    explorers: {
      type: [ExplorerSchema], // Update this line
      default: [],
    },
  },
  { timestamps: true }
);

InvitationSchema.index({chatbotKey: 1, email: 1}, {unique: true});

module.exports = mongoose.model("Invitation", InvitationSchema);
