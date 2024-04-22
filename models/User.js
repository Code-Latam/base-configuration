const mongoose = require("mongoose");

// Define the Explorer sub-schema
const ExplorerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designer: { type: Boolean, default: false },
  owner: { type: Boolean, default: false },
  reader: { type: Boolean, default: false }
});

const UserSchema = new mongoose.Schema(
  {
    chatbotKey: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      min: 3,
      max: 20,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      max: 50,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    groups: {
      type: Array,
      default: [],
    },
    explorers: {
      type: [ExplorerSchema], // Update this line
      default: [],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

UserSchema.index({chatbotKey: 1, email: 1}, {unique: true});

module.exports = mongoose.model("User", UserSchema);

