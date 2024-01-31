const mongoose = require("mongoose");

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
      type: Array,
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
