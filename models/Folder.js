const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  clientNr: {
    type: String,
    required: true
  },
  explorerId: {
    type: String,
    required: true
  },
  items: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
});

module.exports = mongoose.model('Folder', folderSchema);

