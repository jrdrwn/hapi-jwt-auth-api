const bcrypt = require('bcrypt');

const saltRounds = 10;

module.exports = {
  async hash(password) {
    const res = await bcrypt.hash(password, saltRounds);
    return res;
  },
  async compare(data, encrypted) {
    const res = await bcrypt.compare(data, encrypted);
    return res;
  },
};
