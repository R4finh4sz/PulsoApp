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
    require: name =>
      dependencies[name] ??
      (name === '@/services/mock'
        ? { isMockEnabled: false, mockTerms: { version: '1.0' } }
        : undefined),
    process,
    URL,
    FormData,
    Blob,
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

function registrationWith(api, mock = false) {
  return loadService('services/registration.ts', {
    axios: { create: () => api },
    '@/services/api': { baseURL: 'http://localhost/api' },
    '@/services/mock': { isMockEnabled: mock },
    'react-native': { Platform: { OS: 'web' } },
  }).registrationService;
}
test('school search loads all pages from the public route', async () => {
  const calls = [];
  const service = registrationWith({
    get: async (route, config) => {
      calls.push([route, config.params]);
      return {
        data: {
          content: [{ id: String(config.params.page + 1), name: 'School' }],
          totalPages: 2,
        },
      };
    },
  });
  const schools = await service.schools('Santos', 'SP');
  assert.equal(schools.length, 2);
  assert.equal(calls[0][0], '/schools/search');
  assert.equal(calls[1][1].page, 1);
  assert.equal(calls[0][1].city, 'Santos');
  assert.equal(calls[0][1].state, 'SP');
});
test('registration sends student multipart data and optional photo, returning the pending receipt', async () => {
  let sent;
  const receipt = { id: 12, status: 'PENDING' };
  const service = registrationWith({
    post: async (route, body) => {
      sent = { route, body };
      return { data: receipt };
    },
  });
  const result = await service.submit(
    {
      name: ' Student Name ',
      ra: '0012',
      birthDate: '03/02/2008',
      schoolId: '42',
      email: ' STUDENT@example.com ',
      password: 'Password1',
      cep: '12345-678',
      city: 'City',
      state: 'SP',
      termsAccepted: true,
    },
    '1.10',
    {
      uri: 'unused',
      file: new Blob(['photo'], { type: 'image/png' }),
      fileName: 'profile.png',
    },
  );
  assert.equal(result, receipt);
  assert.equal(sent.route, '/auth/register');
  const payload = JSON.parse(sent.body.get('data'));
  assert.equal(payload.schoolId, 42);
  assert.equal(payload.role, 'STUDENT');
  assert.equal(payload.birthDate, '2008-02-03');
  assert.equal(payload.email, 'student@example.com');
  assert.equal(payload.termsVersion, '1.10');
  assert.equal(sent.body.get('photo').name, 'profile.png');
});
test('school search propagates transport failure without demo fallback', async () => {
  const failure = new Error('offline');
  await assert.rejects(
    registrationWith({
      get: async () => {
        throw failure;
      },
    }).schools('Santos', 'SP'),
    error => error === failure,
  );
});
test('password change and deletion requests use the authenticated contracts', async () => {
  const calls = [];
  const api = {
    patch: async (...args) => {
      calls.push(args);
    },
    post: async (...args) => {
      calls.push(args);
      return { data: { status: 'PENDING' } };
    },
    get: async route => {
      calls.push([route]);
      return { data: [] };
    },
  };
  const { authService } = loadService('services/auth.ts', {
    '@/services/api': api,
  });
  const { accountService } = loadService('services/account.ts', {
    '@/services/api': api,
  });
  await authService.changePassword('old', 'NewPassword1');
  assert.equal(
    (await accountService.requestDeletion(' reason ')).status,
    'PENDING',
  );
  await accountService.deletionRequests();
  assert.equal(
    JSON.stringify(calls),
    JSON.stringify([
      [
        '/auth/password',
        { currentPassword: 'old', newPassword: 'NewPassword1' },
      ],
      ['/me/deletion-requests', { reason: 'reason' }],
      ['/me/deletion-requests'],
    ]),
  );
});
