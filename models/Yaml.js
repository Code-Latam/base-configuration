const mongoose = require("mongoose");


const YamlSchema = new mongoose.Schema(

  {
    yamlId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    yaml: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Yaml", YamlSchema);
