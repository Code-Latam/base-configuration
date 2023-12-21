const mongoose = require("mongoose");


const WorkflowSchema = new mongoose.Schema(

  {
    clientNr: {
      type: String,
      required: true,
    },
      explorerId: {
        type: String,
        required: true,
      },
    productName: {
        type: String,
        required: true,
      },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    sequence: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

WorkflowSchema.index({ clientNr: 1, explorerId:1, productName:1, name: 1 }, { unique: true });
module.exports = mongoose.model("Workflow", WorkflowSchema);