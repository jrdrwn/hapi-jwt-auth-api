const Users = require('../models/Users');

const createUser = async (userPayload) => {
  const user = await Users.create(userPayload);
  return { created: Boolean(user.id), userId: user.id, email: user.email };
};

const updateUserById = async (userId, userPayload) => {
  const user = await Users.findById(userId);
  Object.assign(user, userPayload);
  await user.save();
  return { updated: true };
};

const getUserById = async (userId) => {
  const user = await Users.findById(userId).select('-password -_id');
  return user;
};

const getUserByEmail = async (email) => {
  const user = await Users.findOne({ email });
  return user;
};

const deleteUserById = async (userId) => {
  const user = await Users.deleteOne({ _id: userId });
  return { deleted: Boolean(user.deletedCount) };
};

module.exports = { createUser, updateUserById, getUserById, getUserByEmail, deleteUserById };
