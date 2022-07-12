const { describe, expect, test } = require('@jest/globals');
const { default: mongoose, isValidObjectId } = require('mongoose');
const Users = require('../lib/models/Users');
const { init } = require('../lib/server');

const fakeUser = {
  email: 'rpritchitt9@t.co',
  name: 'Roberto Pritchitt',
  password: 'z56Pj7',
  photo: 'http://dummyimage.com/204x118.png/cc0000/ffffff',
  role: 'Research Assistant II',
};
const currentUser = {};
const headers = {
  authorization: '',
};

let server;

beforeAll(async () => {
  server = await init();
});

afterAll(async () => {
  await Users.deleteOne({ _id: currentUser.userId });
  await server.stop();
  await mongoose.disconnect();
});

describe('/auth', () => {
  describe('PUT /auth/register', () => {
    const url = '/auth/register';

    test('harus berhasil membuat akun baru', async () => {
      expect.assertions(2);
      const res = await server.inject({
        method: 'PUT',
        url,
        payload: fakeUser,
      });
      currentUser.userId = res.result.userId;
      expect(res.result.created).toBeTruthy();
      expect(isValidObjectId(res.result.userId)).toBeTruthy();
    });
    test('harus gagal ketika membuat lebih dari 1 akun yang sama', async () => {
      expect.assertions(1);
      const res = await server.inject({
        method: 'PUT',
        url,
        payload: fakeUser,
      });
      expect(res.statusCode).toEqual(422);
    });
    test('harus gagal ketika penulisan email tidak benar', async () => {
      expect.assertions(1);
      const failedFakeUser = { ...fakeUser };
      failedFakeUser.email = 'failed';
      const res = await server.inject({
        method: 'PUT',
        url,
        payload: failedFakeUser,
      });
      expect(res.statusCode).toEqual(400);
    });
    test('harus gagal ketika password kosong', async () => {
      expect.assertions(1);
      const failedFakeUser = { ...fakeUser };
      failedFakeUser.password = '';
      const res = await server.inject({
        method: 'PUT',
        url,
        payload: failedFakeUser,
      });
      expect(res.statusCode).toEqual(400);
    });
    test('harus gagal ketika penulisan URL photo tidak benar', async () => {
      expect.assertions(1);
      const failedFakeUser = { ...fakeUser };
      failedFakeUser.photo = 'failed';
      const res = await server.inject({
        method: 'PUT',
        url,
        payload: failedFakeUser,
      });
      expect(res.statusCode).toEqual(400);
    });
    test('harus gagal ketika mengirim array yang isinya data user', async () => {
      expect.assertions(1);
      const failedFakeUser = [fakeUser];
      const res = await server.inject({
        method: 'PUT',
        url,
        payload: failedFakeUser,
      });
      expect(res.statusCode).toEqual(400);
    });
    test('harus gagal ketika mengirim data kosong', async () => {
      expect.assertions(1);
      const failedFakeUser = {};
      const res = await server.inject({
        method: 'PUT',
        url,
        payload: failedFakeUser,
      });
      expect(res.statusCode).toEqual(400);
    });
  });
  describe('POST /auth/login', () => {
    const url = '/auth/login';
    const account = {
      email: fakeUser.email,
      password: fakeUser.password,
    };

    test('harus berhasil login', async () => {
      expect.assertions(2);
      const res = await server.inject({
        method: 'POST',
        url,
        payload: account,
      });
      headers.authorization = `Bearer ${res.result.token}`;
      expect(res.result.token).not.toBeUndefined();
      expect(res.result.user).toMatchObject({
        email: fakeUser.email,
        name: fakeUser.name,
        photo: fakeUser.photo,
        role: fakeUser.role,
      });
    });
    test('harus gagal login ketika penulisan email tidak benar', async () => {
      expect.assertions(1);
      const failedAccount = { ...account };
      failedAccount.email = 'failed';
      const res = await server.inject({
        method: 'POST',
        url,
        payload: failedAccount,
      });
      expect(res.statusCode).toEqual(400);
    });
    test('harus gagal login ketika password salah', async () => {
      expect.assertions(1);
      const failedAccount = { ...account };
      failedAccount.password = 'failed';
      const res = await server.inject({
        method: 'POST',
        url,
        payload: failedAccount,
      });
      expect(res.statusCode).toEqual(401);
    });
    test('harus gagal login ketika mengirim data yang tidak ada di database', async () => {
      expect.assertions(1);
      const failedAccount = { email: 'failed@failed.com', password: 'failed' };
      const res = await server.inject({
        method: 'POST',
        url,
        payload: failedAccount,
      });
      expect(res.statusCode).toEqual(401);
    });
    test('harus gagal login ketika mengirim data kosong', async () => {
      expect.assertions(1);
      const failedAccount = {};
      const res = await server.inject({
        method: 'POST',
        url,
        payload: failedAccount,
      });
      expect(res.statusCode).toEqual(400);
    });
  });
});
describe('/users', () => {
  const url = '/users';
  describe('GET /users', () => {
    test('harus berhasil mengambil data user', async () => {
      expect.assertions(2);
      const res = await server.inject({
        method: 'GET',
        url,
        headers,
      });
      expect(res.statusCode).toEqual(200);
      expect(res.result).toMatchObject({
        email: fakeUser.email,
        name: fakeUser.name,
        photo: fakeUser.photo,
        role: fakeUser.role,
      });
    });
    test('harus gagal ketika authorization header tidak ada', async () => {
      expect.assertions(1);
      const res = await server.inject({
        method: 'GET',
        url,
      });
      expect(res.statusCode).toEqual(401);
    });
    test('harus gagal ketika authorization header tanpa kunci `Bearer`', async () => {
      expect.assertions(1);
      const res = await server.inject({
        method: 'GET',
        url,
        headers: {
          authorization: headers.authorization.replace('Bearer '),
        },
      });
      expect(res.statusCode).toEqual(401);
    });
    test('harus gagal ketika authorization header salah', async () => {
      expect.assertions(1);
      const res = await server.inject({
        method: 'GET',
        url,
        headers: {
          authorization: 'Bearer failed',
        },
      });
      expect(res.statusCode).toEqual(401);
    });
  });
  describe('PUT /users', () => {
    const url = '/users';
    const newFakeUser = {
      email: 'updaterpritchitt9@t.co',
      name: 'update Roberto Pritchitt',
      photo: 'http://dummyimage.com/204x118.png/cc0000/ffffff/update',
      role: 'update Research Assistant II',
    };
    test('harus berhasil memperbarui semua data field user kecuali password', async () => {
      expect.assertions(1);
      const res = await server.inject({
        method: 'PUT',
        url,
        payload: newFakeUser,
        headers,
      });
      expect(res.result.updated).toBeTruthy();
    });
    test('harus berhasil ketika membanding data user yang baru di perbarui', async () => {
      expect.assertions(1);
      const res = await server.inject({
        method: 'GET',
        url,
        headers,
      });
      expect(res.result).toMatchObject(newFakeUser);
    });
    test('harus gagal ketika memperbarui user tanpa authorization', async () => {
      expect.assertions(1);
      const res = await server.inject({
        method: 'GET',
        url,
        headers: {
          authorization: '',
        },
      });
      expect(res.statusCode).toEqual(401);
    });
  });
});
