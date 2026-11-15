module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: ['<rootDir>/tests/**/*.test.[jt]s?(x)'],
  moduleNameMapper: {
    '^lucide-react-native$':
      '<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js',
    '^@/(.*)$': '<rootDir>/$1',
    '\\.svg$': '<rootDir>/tests/mocks/svg.tsx',
    '\\.css$': '<rootDir>/tests/mocks/style.cjs',
  },
  clearMocks: true,
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|expo-.*|@expo/.*|@react-navigation/.*|react-native-.*|nativewind|react-native-css-interop|lucide-react-native)/)',
  ],
  collectCoverageFrom: [
    '{app,components,contexts,hooks,services,store,utils,validation}/**/*.{ts,tsx}',
    '!**/mock.ts',
    '!**/mock.tsx',
  ],
  coverageReporters: ['text', 'html', 'lcov', 'json-summary'],
  coverageThreshold: {
    global: { lines: 70, statements: 70, functions: 70, branches: 70 },
  },
};
