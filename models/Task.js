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
    taskType: {
      type: String,
      default: "normal",
    },
    description: {
      type: String,
      required: true,
    },
    complianceDescription: {
      type: String,
      default: "",
    },
    apiName: {
      type: String,
      default:""
    },
    symbolType: {
      type: String,
      default:"circle"
    },
    x: {
      type: Number,
      required: false,
    },
    y: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true }
);

TaskSchema.index({ clientNr: 1, explorerId:1, workflowName: 1 ,taskId: 1 }, { unique: true });
module.exports = mongoose.model("Task", TaskSchema);
