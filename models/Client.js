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
    logo: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "",
    },
    gwoken: {
      type: Boolean,
      default: false,
    },
    endtoend: {
      type: Boolean,
      default: false,
    },
    jiraCustomerId: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", ClientSchema);
