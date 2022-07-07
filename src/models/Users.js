const mongoose = require('mongoose');
const bcrypt = require('../config/bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      index: true,
    },
    photo: {
      type: String,
      index: true,
    },
    title: {
      type: String,
      required: true,
      index: true,
    },
  },
  { versionKey: false }
);

userSchema.pre('save', function (next) {
  const user = this;

  if (this.isModified('password') || this.isNew) {
    try {
      bcrypt.hash(user.password).then((res) => {
        user.password = res;
        next();
      });
    } catch (e) {
      next(e);
    }
  } else {
    return next();
  }
});

module.exports = mongoose.model('Users', userSchema);
