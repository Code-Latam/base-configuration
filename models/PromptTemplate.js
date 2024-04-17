const mongoose = require("mongoose");


const PromptTemplateSchema = new mongoose.Schema(

  {
    promptId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    promptTemplate: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PromptTemplate", PromptTemplateSchema);
