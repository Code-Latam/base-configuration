const mongoose = require('mongoose');

const publicemailSchema = new mongoose.Schema({
  clientNr: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('PublicEmail', publicemailSchema);

