const { describe, expect, test, beforeEach } = require('@jest/globals');
const { default: mongoose, isValidObjectId } = require('mongoose');
const { tokenTypes } = require('../lib/config/tokens');
const Token = require('../lib/models/Token');
const Users = require('../lib/models/Users');
const { init } = require('../lib/server');
const emailService = require('../lib/services/email.service');

const fakeUser = {
  email: 'rpritchitt9@t.co',
  name: 'Roberto Pritchitt',
  password: 'z56Pj7',
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
  describe('POST /auth/send-verification-email', () => {
    beforeEach(() => {
      jest.spyOn(emailService.transport, 'sendMail').mockResolvedValue();
    });
    test('harus berhasil mengirim url untuk verifikasi ke email user', async () => {
      expect.assertions(3);
      const sendVerificationEmailSpy = jest.spyOn(emailService, 'sendVerificationEmail');
      const res = await server.inject({
        method: 'POST',
        url: '/auth/send-verification-email',
        payload: {
          userId: currentUser.userId,
        },
      });

      expect(res.result.success).toBeTruthy();
      expect(sendVerificationEmailSpy).toHaveBeenCalledWith(fakeUser.email, expect.any(String));
      const verifyEmailToken = sendVerificationEmailSpy.mock.calls[0][1];
      currentUser.verifyEmailToken = verifyEmailToken;
      const dbVerifyEmailToken = await Token.findOne({
        token: verifyEmailToken,
        user: currentUser.userId,
        type: tokenTypes.VERIFY_EMAIL,
      });

      expect(dbVerifyEmailToken).toBeDefined();
    });
  });
  describe('GET /auth/verify-email', () => {
    test('harus berhasil memverifikasi email user', async () => {
      expect.assertions(2);
      const res = await server.inject({
        method: 'GET',
        url: `/auth/verify-email?token=${currentUser.verifyEmailToken}`,
      });
      expect(res.result.verified).toBeTruthy();
      const user = await Users.findById(currentUser.userId);
      expect(user.isEmailVerified).toBeTruthy();
    });
  });
  describe('POST /auth/login', () => {
    const url = '/auth/login';
    const account = {
      email: fakeUser.email,
      password: fakeUser.password,
    };

    test('harus berhasil login', async () => {
      expect.assertions(3);
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
      });
      const authToken = await Token.findOne({ token: res.result.token, type: tokenTypes.AUTH });
      expect(authToken).toBeDefined();
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
  describe('POST /auth/forgot-password', () => {
    beforeEach(() => {
      jest.spyOn(emailService.transport, 'sendMail').mockResolvedValue();
    });
    test('harus berhasil mengirim token untuk mereset password ke email user', async () => {
      expect.assertions(3);
      const sendResetPasswordEmailSpy = jest.spyOn(emailService, 'sendResetPasswordEmail');
      const res = await server.inject({
        method: 'POST',
        url: '/auth/forgot-password',
        headers,
      });

      expect(res.result.success).toBeTruthy();
      expect(sendResetPasswordEmailSpy).toHaveBeenCalledWith(fakeUser.email, expect.any(String));
      const passwordResetToken = sendResetPasswordEmailSpy.mock.calls[0][1];
      currentUser.passwordResetToken = passwordResetToken;
      const dbResetPasswordToken = await Token.findOne({
        token: passwordResetToken,
        user: currentUser.userId,
        type: tokenTypes.RESET_PASSWORD,
      });

      expect(dbResetPasswordToken).toBeDefined();
    });
  });
  describe('PUT /auth/reset-password', () => {
    test('harus berhasil mereset password user', async () => {
      expect.assertions(2);
      const fakeUserNewPassword = 'new password';
      const res = await server.inject({
        method: 'PUT',
        url: `/auth/reset-password?token=${currentUser.passwordResetToken}`,
        payload: {
          password: fakeUserNewPassword,
        },
        headers,
      });
      expect(res.result.isReset).toBeTruthy();
      const user = await Users.findById(currentUser.userId);
      expect(user.isPasswordMatch(fakeUserNewPassword)).toBeTruthy();
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
