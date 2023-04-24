const mongoose = require("mongoose");


const ClientSchema = new mongoose.Schema(

  {
    clientNr: {
      type: String,
      unique: true,
      required: true,
    },
    clientToken: {
      type: String,
      unique: true,
      required: true,
    },
    clientname: {
      type: String,
      required: true,
      min: 3,
      max: 40,
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
    plan: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", ClientSchema);
