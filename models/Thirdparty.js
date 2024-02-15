const mongoose = require("mongoose");


const ThirdpartySchema = new mongoose.Schema(

  {
    clientNr: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      min: 3,
      max: 40,
    },
    description: {
      type: String,
      required: true,
    },
    yaml: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Thirdparty", ThirdpartySchema);
