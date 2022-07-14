const Users = require('../models/Users');

exports.createUser = async (userPayload) => {
  const user = await Users.create(userPayload);
  return { created: true, userId: user.id };
};

exports.updateUserById = async (userId, userPayload) => {
  const user = await Users.updateOne({ _id: userId }, userPayload);
  return { updated: Boolean(user.modifiedCount) };
};

exports.getUserById = async (userId) => {
  const user = await Users.findById(userId).select('-password -_id');
  return user;
};

exports.getUserByEmail = async (email) => {
  const user = await Users.findOne({ email });
  return user;
};

exports.deleteUserById = async (userId) => {
  const user = await Users.deleteOne({ _id: userId });
  return { deleted: Boolean(user.deletedCount) };
};
