const mongoose = require('mongoose');
const { tokenTypes } = require('../config/tokens');

const tokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Users',
      required: true,
    },
    expires: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: [tokenTypes.AUTH, tokenTypes.VERIFY_EMAIL, tokenTypes.RESET_PASSWORD],
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model('Token', tokenSchema);
