const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

// Exercise the actual services without starting React Native or contacting accounts.
function loadService(file, dependencies) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const exports = {};
  vm.runInNewContext(output, {
    exports,
    require: name => dependencies[name],
    process,
    URL,
  });
  return exports;
}

test('login uses the backend email/password contract and keeps the 2FA challenge', async () => {
  const calls = [];
  const response = { accessToken: 'test-token', twoFactorRequired: true };
  const { authService } = loadService('services/auth.ts', {
    '@/services/api': {
      post: async (...args) => {
        calls.push(args);
        return { data: response };
      },
    },
  });
  const result = await authService.login({
    email: ' Student@Pulso.app ',
    password: 'secret',
    rememberMe: true,
  });
  assert.equal(result, response);
  assert.equal(calls[0][0], '/auth/login');
  assert.equal(
    JSON.stringify(calls[0][1]),
    JSON.stringify({ email: 'student@pulso.app', password: 'secret' }),
  );
});

test('verification, resend, logout and versioned acceptance use the real routes', async () => {
  const calls = [];
  const api = {
    post: async (...args) => {
      calls.push(args);
      return { data: { resendAvailableAt: 'later' } };
    },
  };
  const { authService } = loadService('services/auth.ts', {
    '@/services/api': api,
  });
  const { termsService } = loadService('services/terms.ts', {
    '@/services/api': api,
  });
  await authService.verify('012345');
  assert.equal((await authService.resend()).resendAvailableAt, 'later');
  await termsService.accept('1.10');
  await authService.logout();
  assert.equal(
    JSON.stringify(calls),
    JSON.stringify([
      ['/auth/2fa/verify', { code: '012345' }],
      ['/auth/2fa/resend'],
      ['/terms/accept', { version: '1.10', termsAccepted: true }],
      ['/auth/logout'],
    ]),
  );
});

test('profile rejects non-students and propagates invalid sessions', async () => {
  const { authService } = loadService('services/auth.ts', {
    '@/services/api': { get: async () => ({ data: { role: 'TEACHER' } }) },
  });
  await assert.rejects(authService.fetchUser(), /conta de aluno/);
  const failure = new Error('Unauthorized');
  const invalid = loadService('services/auth.ts', {
    '@/services/api': {
      get: async () => {
        throw failure;
      },
    },
  });
  await assert.rejects(
    invalid.authService.fetchUser(),
    error => error === failure,
  );
});

test('API attaches and removes Bearer tokens without Basic credentials', () => {
  const client = { defaults: { headers: { common: {} } } };
  const { setApiToken } = loadService('services/api.ts', {
    axios: { create: () => client },
    'react-native': { Platform: { OS: 'android' } },
  });
  setApiToken('test-token');
  assert.equal(
    client.defaults.headers.common.Authorization,
    'Bearer test-token',
  );
  assert.equal(client.defaults.auth, undefined);
  setApiToken(null);
  assert.equal(client.defaults.headers.common.Authorization, undefined);
});
