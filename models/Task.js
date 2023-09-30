const mongoose = require("mongoose");


const TaskSchema = new mongoose.Schema(

  {
    clientNr: {
      type: String,
      required: true,
    },
      explorerId: {
        type: String,
        required: true,
      },
      workflowName: {
        type: String,
        required: true,
      },
    taskId: {
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
    apiName: {
      type: String,
      default:""
    },
  },
  { timestamps: true }
);

TaskSchema.index({ clientNr: 1, explorerId:1, workflowName: 1 ,taskId: 1 }, { unique: true });
module.exports = mongoose.model("Task", TaskSchema);
