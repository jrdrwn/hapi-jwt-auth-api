const mongoose = require('mongoose');

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
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

tokenSchema.index({ expires: 1 }, { expireAfterSeconds: parseInt(process.env.TOKEN_EXPIRES) });

module.exports = mongoose.model('Token', tokenSchema);
